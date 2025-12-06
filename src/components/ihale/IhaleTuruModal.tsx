import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gavel, TrendingUp, TrendingDown, Users, Lock, Shield } from "lucide-react";

interface IhaleTuruModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: string) => void;
}

const IHALE_TURLERI = [
  {
    id: 'acik_eksiltme',
    name: 'Açık Eksiltme Usulü E-İhale',
    description: 'Tüm teklifler görünür, fiyatlar aşağı doğru rekabet eder. En düşük fiyat kazanır.',
    icon: TrendingDown,
    color: 'bg-blue-500',
  },
  {
    id: 'ingiliz',
    name: 'İngiliz Usulü E-İhale',
    description: 'Açık artırma mantığı. Fiyat yukarı çıkar, en yüksek teklif kazanır.',
    icon: TrendingUp,
    color: 'bg-green-500',
  },
  {
    id: 'hollanda',
    name: 'Hollanda Usulü E-İhale',
    description: 'Fiyat yüksekten başlar ve düşer. İlk kabul eden kazanır.',
    icon: Gavel,
    color: 'bg-orange-500',
  },
  {
    id: 'japon',
    name: 'Japon Usulü E-İhale',
    description: 'Her adımda onay gerekir, devam etmeyenler elenir. Son kalan kazanır.',
    icon: Users,
    color: 'bg-yellow-500',
  },
  {
    id: 'turlu_kapali',
    name: 'Turlu Kapalı Usulü E-İhale',
    description: 'Birden fazla tur, kapalı teklifler. Her turda iyileştirilmiş teklifler alınır.',
    icon: Lock,
    color: 'bg-red-500',
  },
  {
    id: 'muhurlu_kapali',
    name: 'Mühürlü Kapalı Usulü E-İhale',
    description: 'Tek seferlik kapalı teklif. Kimse kimsenin teklifini görmez.',
    icon: Shield,
    color: 'bg-purple-500',
  },
];

export function IhaleTuruModal({ open, onOpenChange, onSelect }: IhaleTuruModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">İhale Türü Seçin</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {IHALE_TURLERI.map((tur) => (
            <Button
              key={tur.id}
              variant="outline"
              className="h-auto p-4 flex flex-col items-start gap-2 hover:border-primary transition-all"
              onClick={() => onSelect(tur.id)}
            >
              <div className="flex items-center gap-3 w-full">
                <div className={`p-2 rounded-lg ${tur.color}`}>
                  <tur.icon className="h-5 w-5 text-white" />
                </div>
                <span className="font-semibold text-left">{tur.name}</span>
              </div>
              <p className="text-sm text-muted-foreground text-left">
                {tur.description}
              </p>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
