import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Cpu, Settings, Factory, Network, Wrench, Database, Monitor, PenTool, Rocket, Car, ArrowRight } from "lucide-react";

export default function Partners() {
  const navigate = useNavigate();

  const partners = [
    {
      name: "KUKA",
      icon: <Cpu size={24} />,
      desc: "Endüstriyel robotik kollar ve otomasyon çözümlerinde dünya lideri.",
    },
    {
      name: "ABB Robotics",
      icon: <Settings size={24} />,
      desc: "Esnek üretim ve akıllı robotik sistemlerde global partnerimiz.",
    },
    {
      name: "FANUC",
      icon: <Factory size={24} />,
      desc: "CNC sistemleri ve fabrika otomasyonunda güvenilir teknoloji sağlayıcısı.",
    },
    {
      name: "Siemens",
      icon: <Network size={24} />,
      desc: "Endüstri 4.0, PLC ve dijital ikiz teknolojilerinde altyapı destekçimiz.",
    },
    {
      name: "Festo",
      icon: <Wrench size={24} />,
      desc: "Pnömatik ve elektriksel otomasyon teknolojilerinde mühendislik gücü.",
    },
    {
      name: "SAP",
      icon: <Database size={24} />,
      desc: "Kurumsal kaynak planlama (ERP) sistemleriyle kesintisiz veri entegrasyonu.",
    },
    {
      name: "Rockwell Automation",
      icon: <Monitor size={24} />,
      desc: "Endüstriyel kontrol ve bilgi çözümlerinde dijital rehberimiz.",
    },
    {
      name: "Autodesk",
      icon: <PenTool size={24} />,
      desc: "Tasarım ve mühendislik süreçlerinde 3D modelleme partnerimiz.",
    },
    {
      name: "BTM",
      icon: <Rocket size={24} />,
      desc: "İnovasyon ve girişimcilik ekosistemindeki stratejik büyüme destekçimiz.",
    },
    {
      name: "TAYSAD",
      icon: <Car size={24} />,
      desc: "Otomotiv yan sanayi ve üretim ağındaki sektörel iş ortağımız.",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      
      {/* 1. Hero Section */}
      <section className="bg-primary py-32 px-4 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/2 w-[600px] h-[600px] rounded-full bg-accent/20 blur-[120px] -translate-x-1/2" />
        </div>
        <div className="container mx-auto text-center relative z-10 flex flex-col items-center justify-center mt-8">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-8">
            Güçlü Bir <span className="text-accent drop-shadow-md">Ekosistemle</span> Büyüyoruz
          </h1>
          <p className="text-xl text-slate-300 max-w-4xl mx-auto leading-relaxed font-medium">
            RoboSeth olarak, fabrikalar ve sistem entegratörleri arasındaki köprüyü kurarken endüstrinin küresel teknoloji liderleri, yazılım devleri ve stratejik ekosistem merkezleriyle omuz omuza çalışıyoruz.
          </p>
        </div>
      </section>

      {/* 2. Partner Grid */}
      <section className="bg-slate-50 py-24 px-4 flex-1">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner, idx) => (
              <Card 
                key={idx} 
                className="group border border-slate-200 shadow-sm hover:shadow-lg hover:border-accent hover:-translate-y-1 transition-all duration-300 bg-white"
              >
                <CardContent className="p-6 flex flex-row items-center gap-5 text-left h-full">
                  <div className="shrink-0 w-16 h-16 bg-primary text-accent rounded-xl flex items-center justify-center shadow-inner transition-colors">
                    {partner.icon}
                  </div>
                  <div className="flex flex-col justify-center">
                    <h3 className="text-lg font-bold text-primary mb-1">{partner.name}</h3>
                    <p className="text-sm text-slate-500 font-medium leading-snug">
                      {partner.desc}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 3. CTA Section */}
      <section className="bg-primary py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-20" />
        <div className="container mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6">
            Ekosistemimize Katılın
          </h2>
          <p className="text-lg md:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Teknolojiniz veya vizyonunuzla RoboSeth partner ağına dahil olmak istiyorsanız bizimle iletişime geçin.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/iletisim')} 
            className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 text-primary border-0 shadow-lg shadow-accent/20 font-semibold"
          >
            İletişime Geç <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
