import { useAuth } from '@/hooks/useAuth';
import { useMatches } from '@/hooks/useMatches';
import { WorkflowStepper } from './WorkflowStepper';
import { ProjectChat } from './ProjectChat';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Users2, Building2 } from 'lucide-react';

export function FirmaEslesmeler() {
  const { user, userRole } = useAuth();
  const { matches, updateStep, advanceStep, sendMessage } = useMatches(user?.id, userRole as any);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(matches[0]?.id || null);

  useEffect(() => {
    if (matches.length > 0 && !selectedMatchId) {
      setSelectedMatchId(matches[0].id);
    }
  }, [matches, selectedMatchId]);

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
          <Users2 size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Henüz Eşleşmeniz Yok</h2>
        <p className="text-muted-foreground mt-2 max-w-md">
          Dashboard havuzundan entegratörleri inceleyerek projenize dahil etmek için "Eşleş" butonunu kullanabilirsiniz.
        </p>
      </div>
    );
  }

  const selectedMatch = matches.find(m => m.id === selectedMatchId);

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Yan Liste - Entegratör Sekmeleri */}
      <div className="w-full md:w-64 shrink-0 space-y-2">
        <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
          Bağlı Entegratörler
        </h3>
        {matches.map(m => (
          <Button
            key={m.id}
            variant={selectedMatchId === m.id ? 'default' : 'outline'}
            className={`w-full justify-start ${selectedMatchId === m.id ? 'bg-primary text-primary-foreground' : ''}`}
            onClick={() => setSelectedMatchId(m.id)}
          >
            <Building2 className="mr-2" size={16} />
            {m.entegratorName}
          </Button>
        ))}
      </div>

      {/* Seçili Entegratör - İş Akışı */}
      <div className="flex-1 bg-card rounded-lg border shadow-sm p-6 max-w-4xl">
        {selectedMatch ? (
          <>
            <div className="mb-8 border-b pb-4">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Building2 className="text-primary" /> {selectedMatch.entegratorName}
              </h2>
              <p className="text-muted-foreground">Proje: {selectedMatch.projectName}</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WorkflowStepper match={selectedMatch} updateStep={updateStep} advanceStep={advanceStep} />
              </div>
              <div className="lg:col-span-1">
                <ProjectChat match={selectedMatch} sendMessage={sendMessage} />
              </div>
            </div>
          </>
        ) : (
          <p>Lütfen bir entegratör seçin.</p>
        )}
      </div>
    </div>
  );
}
