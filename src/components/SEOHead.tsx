import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
}

const defaultTitle = 'RoboSeth | Endüstriyel B2B Otomasyon Ekosistemi';
const defaultDescription = 'Firmalar ve entegratörleri buluşturan Türkiye\'nin en kapsamlı B2B platformu. Doğru iş ortağını bulun, projelerinizi hayata geçirin.';
const defaultKeywords = 'entegrasyon, B2B, robot, otomasyon, kaynak, PLC, endüstriyel, firma, entegratör, ihale, teklif';
const defaultOgImage = '/og-image.png';

export function SEOHead({
  title,
  description = defaultDescription,
  keywords = defaultKeywords,
  ogImage = defaultOgImage,
  ogType = 'website',
  canonical,
}: SEOHeadProps) {
  const fullTitle = title ? `${title} | RoboSeth` : defaultTitle;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="RoboSeth" />
      <meta property="og:locale" content="tr_TR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Language */}
      <html lang="tr" />
    </Helmet>
  );
}
