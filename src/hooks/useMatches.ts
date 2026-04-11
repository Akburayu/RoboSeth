import { useState, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

export type StepState = {
  status: 'pending' | 'completed';
  date?: string;
  fileName?: string;
  details?: string;
  deadline?: string;
};

export type ChatMessage = {
  id: string;
  senderRole: 'firma' | 'entegrator';
  text: string;
  timestamp: string;
};

export type Match = {
  id: string;
  firmaId: string;
  entegratorId: string;
  entegratorName: string;
  projectName: string;
  currentStep: number;
  steps: {
    1: StepState; // Şartname
    2: StepState; // RFQ
    3: StepState; // Teklif
    4: StepState; // BenchMark
    5: StepState; // Gann Chart
  };
  messages: ChatMessage[];
};

// Initial empty steps helper
export const createInitialSteps = () => ({
  1: { status: 'pending' as const },
  2: { status: 'pending' as const },
  3: { status: 'pending' as const },
  4: { status: 'pending' as const },
  5: { status: 'pending' as const },
});

export function useMatches(userId: string | undefined, userRole: 'firma' | 'entegrator' | null) {
  const [matches, setMatches] = useState<Match[]>([]);

  // Load from local storage
  useEffect(() => {
    if (!userId) return;
    
    const stored = localStorage.getItem('roboseth_matches');
    if (stored) {
      try {
        const allMatches: Match[] = JSON.parse(stored);
        // Filter based on role
        if (userRole === 'firma') {
          setMatches(allMatches.filter(m => m.firmaId === userId));
        } else if (userRole === 'entegrator') {
          setMatches(allMatches.filter(m => m.entegratorId === userId));
        }
      } catch (e) {
        console.error("Failed to parse matches from localStorage", e);
      }
    }
  }, [userId, userRole]);

  // General persistence helper
  const saveToStorage = (updatedList: Match[]) => {
    const stored = localStorage.getItem('roboseth_matches');
    let allMatches: Match[] = stored ? JSON.parse(stored) : [];
    
    // Replace matching items or append
    updatedList.forEach(updated => {
      const idx = allMatches.findIndex(old => old.id === updated.id);
      if (idx !== -1) {
        allMatches[idx] = updated;
      } else {
        allMatches.push(updated);
      }
    });

    localStorage.setItem('roboseth_matches', JSON.stringify(allMatches));
  };

  // 1. Create Match (Firma initiates)
  const createMatch = (entegratorId: string, entegratorName: string) => {
    if (!userId || userRole !== 'firma') return;

    const newMatch: Match = {
      id: crypto.randomUUID(),
      firmaId: userId,
      entegratorId,
      entegratorName,
      projectName: 'Ana Proje 1', // Mock project
      currentStep: 1,
      steps: createInitialSteps(),
      messages: [],
    };

    const newMatches = [...matches, newMatch];
    setMatches(newMatches);
    saveToStorage([newMatch]);
    
    toast({
      title: 'Eşleşme Sağlandı',
      description: `${entegratorName} entegratörü projeye dahil edildi.`
    });
  };

  // 2. Update Step Data (Both roles can update depending on the step)
  const updateStep = (matchId: string, stepNumber: 1|2|3|4|5, updates: Partial<StepState>) => {
    setMatches(prev => {
      const newMatches = prev.map(m => {
        if (m.id === matchId) {
          return {
            ...m,
            steps: {
              ...m.steps,
              [stepNumber]: { ...m.steps[stepNumber], ...updates }
            }
          };
        }
        return m;
      });
      // Synchronize back to storage
      const updatedMatch = newMatches.find(m => m.id === matchId);
      if (updatedMatch) saveToStorage([updatedMatch]);
      return newMatches;
    });
    
    toast({
      title: 'Güncellendi',
      description: `Adım ${stepNumber} verileri kaydedildi.`
    });
  };

  const advanceStep = (matchId: string) => {
    setMatches(prev => {
      const newMatches = prev.map(m => {
        if (m.id === matchId && m.currentStep < 6) {
          return { ...m, currentStep: m.currentStep + 1 };
        }
        return m;
      });
      const updatedMatch = newMatches.find(m => m.id === matchId);
      if (updatedMatch) saveToStorage([updatedMatch]);
      return newMatches;
    });
  };

  // 4. In-Context Chat
  const sendMessage = (matchId: string, text: string) => {
    if (!userRole) return;
    
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      senderRole: userRole,
      text,
      timestamp: new Date().toISOString()
    };

    setMatches(prev => {
      const newMatches = prev.map(m => {
        if (m.id === matchId) {
          return { ...m, messages: [...(m.messages || []), newMessage] };
        }
        return m;
      });
      const updatedMatch = newMatches.find(m => m.id === matchId);
      if (updatedMatch) saveToStorage([updatedMatch]);
      return newMatches;
    });
  };

  return { matches, createMatch, updateStep, advanceStep, sendMessage };
}
