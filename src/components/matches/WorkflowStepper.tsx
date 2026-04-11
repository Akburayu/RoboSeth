import { useAuth } from '@/hooks/useAuth';
import { Match, StepState } from '@/hooks/useMatches';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { FileUp, CheckCircle2, Clock, Calendar, AlertCircle } from 'lucide-react';
import { useState } from 'react';

const stepsMeta = [
  { step: 1, title: 'Şartname', desc: 'Firma dosya yükler' },
  { step: 2, title: 'RFQ Oluşturma', desc: 'Firma detayları girer' },
  { step: 3, title: 'Teklif Aşaması', desc: 'Entegratör teklif dosyası yükler' },
  { step: 4, title: 'BenchMark', desc: 'Firma karşılaştırma verisi yükler' },
  { step: 5, title: 'Gantt Chart', desc: 'Entegratör proje takvimi yükler' },
  { step: 6, title: 'Oto Update', desc: 'Durum güncellemeleri' },
];

export function WorkflowStepper({ 
  match, 
  updateStep, 
  advanceStep 
}: { 
  match: Match, 
  updateStep: (matchId: string, stepNumber: 1|2|3|4|5, updates: Partial<StepState>) => void,
  advanceStep: (matchId: string) => void
}) {
  const { user, userRole } = useAuth();

  // Sahte uploader state
  const [uploading, setUploading] = useState(false);
  const [tempFile, setTempFile] = useState<File | null>(null);
  const [tempDate, setTempDate] = useState<string>('');
  const [tempText, setTempText] = useState<string>('');

  const handleFakeUpload = async (stepValue: 1|2|3|4|5) => {
    setUploading(true);
    // Simüle yavaşlık
    await new Promise(r => setTimeout(r, 1000));
    updateStep(match.id, stepValue, { status: 'completed', fileName: tempFile?.name || 'document.pdf' });
    setUploading(false);
    setTempFile(null);
  };

  const completeStep = (stepValue: 1|2|3|4|5) => {
    if (stepValue === 2) {
      updateStep(match.id, stepValue, { 
        status: 'completed', 
        details: tempText,
        fileName: tempFile?.name || undefined
      });
      setTempText('');
      setTempFile(null);
    }
    advanceStep(match.id);
  };

  const setDeadline = (stepValue: 1|2|3|4|5) => {
    updateStep(match.id, stepValue, { deadline: tempDate });
    setTempDate('');
  };

  return (
    <div className="space-y-6">
      {stepsMeta.map(({ step, title, desc }) => {
        const isCurrent = match.currentStep === step;
        const isPast = match.currentStep > step;
        const stepData = match.steps[step as keyof typeof match.steps];

        return (
          <div key={step} className={`flex gap-4 ${!isCurrent && !isPast ? 'opacity-50' : ''}`}>
            {/* Timeline icon */}
            <div className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isPast ? 'bg-emerald-500 text-white' : 
                isCurrent ? 'bg-primary text-primary-foreground border-2 border-primary-foreground' : 
                'bg-muted text-muted-foreground'
              }`}>
                {isPast ? <CheckCircle2 size={20} /> : step}
              </div>
              {step !== 6 && (
                <div className={`w-0.5 h-full min-h-[40px] my-2 ${isPast ? 'bg-emerald-500' : 'bg-muted'}`} />
              )}
            </div>

            {/* Content box */}
            <Card className={`flex-1 ${isCurrent ? 'border-primary ring-1 ring-primary/20' : ''}`}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <p className="text-sm text-muted-foreground">{desc}</p>
                  </div>
                  {stepData?.deadline && (
                    <span className="flex items-center gap-1 text-xs font-medium bg-amber-500/10 text-amber-600 px-2 py-1 rounded-md">
                      <Clock size={12} /> Son Tarih: {stepData.deadline}
                    </span>
                  )}
                </div>

                {isPast && stepData?.fileName && (
                  <div className="mt-3 p-3 bg-muted rounded-md flex items-center gap-2 text-sm">
                    <CheckCircle2 className="text-emerald-500" size={16} /> 
                    <span>{stepData.fileName} başarıyla yüklendi.</span>
                  </div>
                )}
                
                {isPast && stepData?.details && (
                  <div className="mt-3 p-3 bg-muted rounded-md text-sm">
                    <strong>RFQ Detayları: </strong> {stepData.details}
                  </div>
                )}

                {/* İş Akışı Aksiyonları (Sadece Mevcut Adım İçin) */}
                {isCurrent && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    
                    {/* 1. Şartname (Firma Yetkili) */}
                    {step === 1 && userRole === 'firma' && (
                      <div className="flex gap-2">
                        <Input type="file" onChange={e => setTempFile(e.target.files?.[0] || null)} />
                        <Button onClick={() => { handleFakeUpload(1); completeStep(1); }} disabled={uploading || !tempFile}>
                          <FileUp className="mr-2" size={16} /> Yükle ve Onayla
                        </Button>
                      </div>
                    )}
                    {step === 1 && userRole === 'entegrator' && (
                      <p className="text-sm text-amber-600 flex items-center gap-2"><Clock size={16}/> Firmanın şartnameyi yüklemesi bekleniyor.</p>
                    )}

                    {/* 2. RFQ (Firma Yetkili) */}
                    {step === 2 && userRole === 'firma' && (
                      <div className="flex flex-col gap-3">
                        <Input placeholder="Teknik kriterler ve gereksinimler (İsteğe bağlı metin)..." value={tempText} onChange={e => setTempText(e.target.value)} />
                        <div className="flex gap-2">
                          <Input type="file" onChange={e => setTempFile(e.target.files?.[0] || null)} />
                          <Button onClick={async () => {
                              if (tempFile) {
                                setUploading(true);
                                await new Promise(r => setTimeout(r, 1000));
                                setUploading(false);
                              }
                              completeStep(2); 
                            }} 
                            disabled={uploading || (!tempText && !tempFile)}>
                            {tempFile ? <FileUp className="mr-2" size={16} /> : <CheckCircle2 className="mr-2" size={16} />}
                            Kaydet ve İlerle
                          </Button>
                        </div>
                      </div>
                    )}
                    {step === 2 && userRole === 'entegrator' && (
                      <p className="text-sm text-amber-600 flex items-center gap-2"><Clock size={16}/> Firmanın RFQ detaylarını ve ek ticari belgeleri belirlemesi bekleniyor.</p>
                    )}

                    {/* 3. Teklif (Entegratör Yükler, Firma Deadline Belirleyebilir) */}
                    {step === 3 && (
                      <div className="space-y-3">
                        {userRole === 'firma' && !stepData?.deadline && (
                          <div className="flex gap-2 items-center bg-muted/50 p-2 rounded">
                            <span className="text-sm shrink-0"><Calendar size={16}/> Deadline Belirle:</span>
                            <Input type="date" value={tempDate} onChange={e => setTempDate(e.target.value)} className="w-auto h-8" />
                            <Button size="sm" variant="secondary" disabled={!tempDate} onClick={() => setDeadline(3)}>Ayarla</Button>
                          </div>
                        )}
                        {userRole === 'firma' && (
                           <p className="text-sm text-amber-600 flex items-center gap-2 mt-2"><Clock size={16}/> Entegratörün teklif yüklemesi bekleniyor.</p>
                        )}
                        {userRole === 'entegrator' && (
                          <div className="flex gap-2">
                            <Input type="file" onChange={e => setTempFile(e.target.files?.[0] || null)} />
                            <Button onClick={() => { handleFakeUpload(3); completeStep(3); }} disabled={uploading || !tempFile}>
                              <FileUp className="mr-2" size={16} /> Teklifi İlet
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 4. BenchMark (Firma Yükler) */}
                    {step === 4 && userRole === 'firma' && (
                      <div className="flex gap-2">
                        <Input type="file" onChange={e => setTempFile(e.target.files?.[0] || null)} />
                        <Button onClick={() => { handleFakeUpload(4); completeStep(4); }} disabled={uploading || !tempFile}>
                          <FileUp className="mr-2" size={16} /> BenchMark Yükle
                        </Button>
                      </div>
                    )}
                    {step === 4 && userRole === 'entegrator' && (
                      <p className="text-sm text-amber-600 flex items-center gap-2"><Clock size={16}/> Firmanın Değerlendirme (BenchMark) yapması bekleniyor.</p>
                    )}

                    {/* 5. Gantt Chart (Entegratör Yükler) */}
                    {step === 5 && (
                      <div className="space-y-3">
                        {userRole === 'firma' && !stepData?.deadline && (
                          <div className="flex gap-2 items-center bg-muted/50 p-2 rounded">
                            <span className="text-sm shrink-0"><Calendar size={16}/> Deadline Belirle:</span>
                            <Input type="date" value={tempDate} onChange={e => setTempDate(e.target.value)} className="w-auto h-8" />
                            <Button size="sm" variant="secondary" disabled={!tempDate} onClick={() => setDeadline(5)}>Ayarla</Button>
                          </div>
                        )}
                        {userRole === 'firma' && (
                           <p className="text-sm text-amber-600 flex items-center gap-2 mt-2"><Clock size={16}/> Entegratörün takvim (Gantt Chart) yüklemesi bekleniyor.</p>
                        )}
                        {userRole === 'entegrator' && (
                          <div className="flex gap-2">
                            <Input type="file" onChange={e => setTempFile(e.target.files?.[0] || null)} />
                            <Button onClick={() => { handleFakeUpload(5); completeStep(5); }} disabled={uploading || !tempFile}>
                              <FileUp className="mr-2" size={16} /> Gantt Chart İlet
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 6. Oto Update Akışı */}
                    {step === 6 && (
                      <div className="p-4 bg-primary/5 rounded-md border border-primary/20">
                        <h4 className="font-semibold text-primary mb-2 flex items-center gap-2"><AlertCircle size={16}/> Süreç Tamamlandı ve Oto-Update Moduna Geçildi</h4>
                        <p className="text-sm text-muted-foreground">Bundan sonraki proje güncellemeleri otomatik olarak her iki taraf için buraya zaman tüneli olarak yansıyacaktır.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
