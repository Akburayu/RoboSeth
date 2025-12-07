import { useState, useEffect, useRef } from 'react';
import { X, Bot, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: number;
  content: string;
  isTyping?: boolean;
}

interface YetkinlikChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_MESSAGES = [
  "Yetkinlik doğrulayıcıya hoş geldiniz.",
  "Ben bu alanda kişiselleştirilmiş bir yapay zekayım ve sizi doğrulamak için buradayım.",
  "Hazırsanız başlıyoruz.",
  `*Temel Robot Bakım Bilgisi (Markadan Bağımsız)*

Bir endüstriyel robotta 'preventive bakım' ile 'corrective bakım' arasındaki farkı açıklayın.
Gerçek bir örnekle anlatın.`
];

export const YetkinlikChatbot = ({ isOpen, onClose }: YetkinlikChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && currentMessageIndex < PRESET_MESSAGES.length) {
      // Start typing effect
      setIsTyping(true);
      
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
        
        // Add the message
        setMessages(prev => [
          ...prev,
          { id: currentMessageIndex, content: PRESET_MESSAGES[currentMessageIndex] }
        ]);
        
        // Move to next message after delay
        const nextMessageTimeout = setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
        }, 1200); // 1.2 second delay between messages
        
        return () => clearTimeout(nextMessageTimeout);
      }, 700); // 0.7 second typing effect
      
      return () => clearTimeout(typingTimeout);
    }
  }, [isOpen, currentMessageIndex]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setCurrentMessageIndex(0);
      setIsTyping(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={cn(
          "relative w-full max-w-2xl max-h-[80vh] flex flex-col",
          "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900",
          "rounded-[20px] overflow-hidden",
          "border border-cyan-500/30",
          "shadow-[0_0_60px_rgba(6,182,212,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]",
          "animate-in fade-in zoom-in-95 duration-300"
        )}
      >
        {/* Neon glow effect */}
        <div className="absolute inset-0 rounded-[20px] pointer-events-none">
          <div className="absolute inset-0 rounded-[20px] bg-gradient-to-r from-cyan-500/10 via-transparent to-cyan-500/10" />
          <div className="absolute -inset-[1px] rounded-[20px] bg-gradient-to-r from-cyan-400/20 via-cyan-500/10 to-cyan-400/20 blur-sm" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-slate-900 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Yetkinlik Doğrulayıcı
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </h2>
              <p className="text-xs text-cyan-400/70">AI Powered Verification</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              "bg-slate-800/50 border border-slate-700/50",
              "text-slate-400 hover:text-white hover:bg-slate-700/50",
              "transition-all duration-200",
              "hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="relative flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] scrollbar-thin scrollbar-thumb-cyan-500/20 scrollbar-track-transparent">
          {/* Scan lines effect */}
          <div className="absolute inset-0 pointer-events-none opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(6,182,212,0.1) 2px, rgba(6,182,212,0.1) 4px)'
            }} />
          </div>

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "relative max-w-[85%] p-4 rounded-2xl",
                "bg-gradient-to-br from-cyan-500/10 to-cyan-600/5",
                "border border-cyan-500/20",
                "text-slate-100 text-sm leading-relaxed",
                "animate-in slide-in-from-left-5 fade-in duration-300",
                "shadow-[0_0_20px_rgba(6,182,212,0.1)]"
              )}
            >
              <div className="absolute -left-1 top-4 w-2 h-2 rotate-45 bg-cyan-500/20 border-l border-b border-cyan-500/20" />
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className={cn(
              "max-w-[85%] p-4 rounded-2xl",
              "bg-gradient-to-br from-cyan-500/10 to-cyan-600/5",
              "border border-cyan-500/20",
              "animate-in slide-in-from-left-5 fade-in duration-300"
            )}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-cyan-400/70 text-xs">yazıyor...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar (Visual only) */}
        <div className="relative px-6 py-4 border-t border-cyan-500/20 bg-slate-900/50">
          <div className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl",
            "bg-slate-800/50 border border-slate-700/50",
            "focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.2)]",
            "transition-all duration-200"
          )}>
            <input
              type="text"
              placeholder="Cevabınızı yazın..."
              className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-500 outline-none text-sm"
              disabled
            />
            <button
              className={cn(
                "px-4 py-2 rounded-lg",
                "bg-gradient-to-r from-cyan-500 to-cyan-600",
                "text-white text-sm font-medium",
                "opacity-50 cursor-not-allowed"
              )}
              disabled
            >
              Gönder
            </button>
          </div>
          <p className="text-xs text-center text-slate-500 mt-2">
            AI doğrulama modülü demo modunda çalışmaktadır
          </p>
        </div>
      </div>
    </div>
  );
};

// Futuristic Verify Button Component
export const FuturisticVerifyButton = ({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) => {
  return (
    <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-cyan-500/20">
      <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-cyan-400" />
        Yetkinliğini Doğrula
      </h3>
      
      <button
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "group relative w-full py-4 px-8 rounded-xl",
          "bg-gradient-to-r from-cyan-500 via-cyan-400 to-cyan-500 bg-[length:200%_100%]",
          "text-slate-900 font-bold text-lg",
          "transition-all duration-500 ease-out",
          "hover:bg-[position:100%_0] hover:shadow-[0_0_40px_rgba(6,182,212,0.5)]",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none",
          "overflow-hidden",
          "animate-[shimmer_3s_infinite]"
        )}
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 3s infinite linear'
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-xl group-hover:bg-cyan-400/40 transition-all duration-500" />
        
        {/* Border glow */}
        <div className="absolute inset-0 rounded-xl border-2 border-cyan-300/50 group-hover:border-cyan-200/80 transition-all duration-300" />
        
        {/* Content */}
        <span className="relative flex items-center justify-center gap-3">
          <Bot className="w-6 h-6" />
          AI ile Yetkinliğimi Doğrula
          <Sparkles className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </span>
        
        {/* Scan line effect on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none overflow-hidden rounded-xl">
          <div 
            className="absolute inset-0 bg-gradient-to-b from-transparent via-white/10 to-transparent"
            style={{
              animation: 'scan 2s infinite linear',
              transform: 'translateY(-100%)'
            }}
          />
        </div>
      </button>
      
      <p className="text-sm text-muted-foreground mt-3 text-center">
        Seçtiğiniz marka ve faaliyet alanlarına göre kişiselleştirilmiş AI doğrulaması
      </p>
      
      {/* Add keyframes via style tag */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes scan {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
      `}</style>
    </div>
  );
};
