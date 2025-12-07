import { useState, useEffect, useRef } from 'react';
import { X, Bot, Zap, ArrowRight } from 'lucide-react';
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
const PRESET_MESSAGES = ["TechVerify'a hoş geldiniz.", "Ben bu alanda kişiselleştirilmiş bir yapay zekayım ve sizi doğrulamak için buradayım.", "Hazırsanız başlıyoruz.", `*Temel Robot Bakım Bilgisi (Markadan Bağımsız)*

Bir endüstriyel robotta 'preventive bakım' ile 'corrective bakım' arasındaki farkı açıklayın.
Gerçek bir örnekle anlatın.`];
export const YetkinlikChatbot = ({
  isOpen,
  onClose
}: YetkinlikChatbotProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    if (isOpen && currentMessageIndex < PRESET_MESSAGES.length) {
      setIsTyping(true);
      const typingTimeout = setTimeout(() => {
        setIsTyping(false);
        setMessages(prev => [...prev, {
          id: currentMessageIndex,
          content: PRESET_MESSAGES[currentMessageIndex]
        }]);
        const nextMessageTimeout = setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
        }, 1200);
        return () => clearTimeout(nextMessageTimeout);
      }, 700);
      return () => clearTimeout(typingTimeout);
    }
  }, [isOpen, currentMessageIndex]);
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  useEffect(() => {
    if (!isOpen) {
      setMessages([]);
      setCurrentMessageIndex(0);
      setIsTyping(false);
    }
  }, [isOpen]);
  if (!isOpen) return null;
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal */}
      <div className={cn("relative w-full max-w-2xl max-h-[80vh] flex flex-col", "bg-card rounded-2xl overflow-hidden", "border border-border shadow-2xl", "animate-in fade-in zoom-in-95 duration-300")}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-card" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">TechVerify</h2>
              <p className="text-xs text-muted-foreground">AI Destekli Doğrulama</p>
            </div>
          </div>
          
          <button onClick={onClose} className={cn("w-8 h-8 rounded-lg flex items-center justify-center", "bg-muted/50 hover:bg-muted", "text-muted-foreground hover:text-foreground", "transition-all duration-200")}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="relative flex-1 overflow-y-auto p-6 space-y-4 min-h-[300px] bg-gradient-to-b from-muted/10 to-transparent">
          {messages.map(message => <div key={message.id} className={cn("max-w-[85%] p-4 rounded-2xl rounded-tl-md", "bg-primary/10 border border-primary/20", "text-foreground text-sm leading-relaxed", "animate-in slide-in-from-left-3 fade-in duration-300")}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>)}

          {/* Typing indicator */}
          {isTyping && <div className={cn("max-w-[85%] p-4 rounded-2xl rounded-tl-md", "bg-muted/50 border border-border", "animate-in slide-in-from-left-3 fade-in duration-300")}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{
                animationDelay: '0ms'
              }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{
                animationDelay: '150ms'
              }} />
                  <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{
                animationDelay: '300ms'
              }} />
                </div>
                <span className="text-muted-foreground text-xs">yazıyor...</span>
              </div>
            </div>}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="px-6 py-4 border-t border-border bg-card">
          <div className={cn("flex items-center gap-3 px-4 py-3 rounded-xl", "bg-muted/50 border border-border", "transition-all duration-200")}>
            <input type="text" placeholder="Cevabınızı yazın..." className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-sm" disabled />
            <button className={cn("p-2 rounded-lg", "bg-primary text-primary-foreground", "opacity-50 cursor-not-allowed")} disabled>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-center text-muted-foreground mt-2">
            AI doğrulama modülü demo modunda çalışmaktadır
          </p>
        </div>
      </div>
    </div>;
};

// Modern Verify Button Component
export const FuturisticVerifyButton = ({
  onClick,
  disabled
}: {
  onClick: () => void;
  disabled?: boolean;
}) => {
  return <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border">
      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
        <Zap className="w-5 h-5 text-primary" />
        Yetkinliğini Doğrula
      </h3>
      
      <button onClick={onClick} disabled={disabled} className={cn("group relative w-full py-4 px-8 rounded-xl", "bg-primary text-primary-foreground font-semibold text-base", "transition-all duration-300 ease-out", "hover:shadow-xl hover:shadow-primary/20 hover:scale-[1.02]", "active:scale-[0.98]", "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100", "overflow-hidden")}>
        {/* Hover shine effect */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        
        {/* Content */}
        <span className="relative flex items-center justify-center gap-3">
          <Bot className="w-5 h-5" />
          AI ile Yetkinliğimi Doğrula
          <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
        </span>
      </button>
      
      <p className="text-sm text-muted-foreground mt-3 text-center">
        Seçtiğiniz marka ve faaliyet alanlarına göre kişiselleştirilmiş AI doğrulaması
      </p>
    </div>;
};