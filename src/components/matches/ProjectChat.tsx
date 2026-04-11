import { useState, useRef, useEffect } from 'react';
import { Match, useMatches } from '@/hooks/useMatches';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Send, MessageSquare, Info } from 'lucide-react';

export function ProjectChat({ match, sendMessage }: { match: Match, sendMessage: (matchId: string, text: string) => void }) {
  const { userRole } = useAuth();
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Otomatik aşağı kaydırma (Smooth scroll into view)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [match.messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(match.id, text);
    setText('');
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const messages = match.messages || [];

  return (
    <Card className="flex flex-col h-[600px] border-primary/20 shadow-md">
      <CardHeader className="py-3 border-b bg-muted/30">
        <CardTitle className="text-lg flex items-center gap-2">
          <MessageSquare size={18} className="text-primary" />
          Proje Sohbeti
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm opacity-70 gap-3">
            <Info size={32} />
            Proje sohbetine hoş geldiniz. İlk mesajı gönderin.
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === userRole;
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div className={`px-4 py-2 rounded-2xl max-w-[75%] text-sm shadow-sm relative break-words whitespace-pre-wrap ${
                  isMe 
                    ? 'bg-primary text-primary-foreground rounded-tr-none pb-5' 
                    : 'bg-muted text-foreground rounded-tl-none pb-5'
                }`} style={{ minWidth: '80px' }}>
                  {msg.text}
                  <span className={`absolute bottom-1 right-3 text-[10px] opacity-70 ${isMe ? 'text-primary-foreground' : 'text-muted-foreground'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </CardContent>

      <CardFooter className="p-3 border-t bg-muted/10">
        <div className="flex w-full gap-2 relative items-end">
          <Textarea 
            placeholder="Mesajınızı yazın... (Göndermek için Enter, alt satır için Shift+Enter)" 
            value={text} 
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            className="pr-12 min-h-[44px] max-h-[120px] rounded-2xl resize-none py-3"
            rows={1}
          />
          <Button 
            onClick={handleSend}
            size="icon" 
            disabled={!text.trim()} 
            className="absolute right-2 bottom-2 h-10 w-10 shrink-0 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Send size={16} className="-ml-0.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
