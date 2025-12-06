import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Upload, ArrowLeft } from "lucide-react";

interface IhaleOlusturModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ihaleTuru: string;
  firmaId: string;
  onSuccess: () => void;
  onBack: () => void;
}

const IHALE_TURU_LABELS: Record<string, string> = {
  'acik_eksiltme': 'Açık Eksiltme Usulü E-İhale',
  'ingiliz': 'İngiliz Usulü E-İhale',
  'hollanda': 'Hollanda Usulü E-İhale',
  'japon': 'Japon Usulü E-İhale',
  'turlu_kapali': 'Turlu Kapalı Usulü E-İhale',
  'muhurlu_kapali': 'Mühürlü Kapalı Usulü E-İhale',
};

export function IhaleOlusturModal({ 
  open, 
  onOpenChange, 
  ihaleTuru, 
  firmaId, 
  onSuccess,
  onBack 
}: IhaleOlusturModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    baslik: '',
    aciklama: '',
    teknikSartlar: '',
    deadline: '',
    deadlineTime: '23:59',
    baslangicFiyati: '',
    minimumFiyat: '',
    fiyatAdimi: '100',
    toplamTur: '3',
  });
  const [dokuman, setDokuman] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.baslik || !formData.deadline) {
      toast({
        title: "Hata",
        description: "Lütfen zorunlu alanları doldurun.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      let dokumanUrl = null;

      // Upload document if exists
      if (dokuman) {
        const fileExt = dokuman.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `ihale-dokumanlari/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('firma-documents')
          .upload(filePath, dokuman);

        if (uploadError) {
          console.error('Upload error:', uploadError);
        } else {
          const { data: { publicUrl } } = supabase.storage
            .from('firma-documents')
            .getPublicUrl(filePath);
          dokumanUrl = publicUrl;
        }
      }

      const deadlineDateTime = `${formData.deadline}T${formData.deadlineTime}:00`;

      const insertData: any = {
        firma_id: firmaId,
        ihale_turu: ihaleTuru,
        baslik: formData.baslik,
        aciklama: formData.aciklama,
        teknik_sartlar: formData.teknikSartlar,
        dokuman_url: dokumanUrl,
        deadline: deadlineDateTime,
        durum: 'aktif',
      };

      // Add type-specific fields
      if (ihaleTuru === 'hollanda') {
        insertData.baslangic_fiyati = parseInt(formData.baslangicFiyati) || 100000;
        insertData.minimum_fiyat = parseInt(formData.minimumFiyat) || 10000;
        insertData.fiyat_adimi = parseInt(formData.fiyatAdimi) || 100;
        insertData.mevcut_fiyat = insertData.baslangic_fiyati;
      }

      if (ihaleTuru === 'turlu_kapali') {
        insertData.toplam_tur = parseInt(formData.toplamTur) || 3;
        insertData.mevcut_tur = 1;
      }

      const { error } = await supabase
        .from('ihaleler')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "İhale başarıyla oluşturuldu.",
      });

      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        baslik: '',
        aciklama: '',
        teknikSartlar: '',
        deadline: '',
        deadlineTime: '23:59',
        baslangicFiyati: '',
        minimumFiyat: '',
        fiyatAdimi: '100',
        toplamTur: '3',
      });
      setDokuman(null);
    } catch (error: any) {
      console.error('Error creating ihale:', error);
      toast({
        title: "Hata",
        description: error.message || "İhale oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const showHollandaFields = ihaleTuru === 'hollanda';
  const showTurluFields = ihaleTuru === 'turlu_kapali';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <DialogTitle className="text-xl font-bold">
              {IHALE_TURU_LABELS[ihaleTuru] || 'İhale Oluştur'}
            </DialogTitle>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="baslik">İhale Adı *</Label>
            <Input
              id="baslik"
              value={formData.baslik}
              onChange={(e) => setFormData({ ...formData, baslik: e.target.value })}
              placeholder="İhale başlığını girin"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="aciklama">İhale Açıklaması</Label>
            <Textarea
              id="aciklama"
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
              placeholder="İhale hakkında detaylı açıklama"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teknikSartlar">Teknik Şartlar</Label>
            <Textarea
              id="teknikSartlar"
              value={formData.teknikSartlar}
              onChange={(e) => setFormData({ ...formData, teknikSartlar: e.target.value })}
              placeholder="Gereken teknik şartları belirtin"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="deadline">Bitiş Tarihi *</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deadlineTime">Bitiş Saati</Label>
              <Input
                id="deadlineTime"
                type="time"
                value={formData.deadlineTime}
                onChange={(e) => setFormData({ ...formData, deadlineTime: e.target.value })}
              />
            </div>
          </div>

          {showHollandaFields && (
            <>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="baslangicFiyati">Başlangıç Fiyatı (₺)</Label>
                  <Input
                    id="baslangicFiyati"
                    type="number"
                    value={formData.baslangicFiyati}
                    onChange={(e) => setFormData({ ...formData, baslangicFiyati: e.target.value })}
                    placeholder="100000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minimumFiyat">Minimum Fiyat (₺)</Label>
                  <Input
                    id="minimumFiyat"
                    type="number"
                    value={formData.minimumFiyat}
                    onChange={(e) => setFormData({ ...formData, minimumFiyat: e.target.value })}
                    placeholder="10000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fiyatAdimi">Fiyat Düşüş Adımı (₺)</Label>
                  <Input
                    id="fiyatAdimi"
                    type="number"
                    value={formData.fiyatAdimi}
                    onChange={(e) => setFormData({ ...formData, fiyatAdimi: e.target.value })}
                    placeholder="100"
                  />
                </div>
              </div>
            </>
          )}

          {showTurluFields && (
            <div className="space-y-2">
              <Label htmlFor="toplamTur">Toplam Tur Sayısı</Label>
              <Input
                id="toplamTur"
                type="number"
                min="2"
                max="10"
                value={formData.toplamTur}
                onChange={(e) => setFormData({ ...formData, toplamTur: e.target.value })}
                placeholder="3"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Teknik Şartname / Doküman</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <input
                type="file"
                id="dokuman"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={(e) => setDokuman(e.target.files?.[0] || null)}
              />
              <label htmlFor="dokuman" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                {dokuman ? (
                  <p className="text-sm text-primary">{dokuman.name}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    PDF, DOC, DOCX, XLS, XLSX dosyası yükleyin
                  </p>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              İptal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                'İhale Başlat'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
