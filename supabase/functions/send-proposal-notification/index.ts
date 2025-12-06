import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ProposalNotificationRequest {
  ilan_id: string;
  entegrator_id: string;
  teklif_tutari: number;
  mesaj: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ilan_id, entegrator_id, teklif_tutari, mesaj }: ProposalNotificationRequest = await req.json();

    console.log("Received proposal notification request:", { ilan_id, entegrator_id, teklif_tutari });

    // Create Supabase client with service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get ilan details with firma info
    const { data: ilan, error: ilanError } = await supabase
      .from("ilanlar")
      .select("baslik, firma_id")
      .eq("id", ilan_id)
      .single();

    if (ilanError || !ilan) {
      console.error("Error fetching ilan:", ilanError);
      throw new Error("İlan bulunamadı");
    }

    // Get firma details including email
    const { data: firma, error: firmaError } = await supabase
      .from("firma")
      .select("firma_adi, email, user_id")
      .eq("id", ilan.firma_id)
      .single();

    if (firmaError || !firma) {
      console.error("Error fetching firma:", firmaError);
      throw new Error("Firma bulunamadı");
    }

    // Get entegrator name
    const { data: entegrator, error: entegratorError } = await supabase
      .from("entegrator")
      .select("entegrator_adi")
      .eq("id", entegrator_id)
      .single();

    if (entegratorError || !entegrator) {
      console.error("Error fetching entegrator:", entegratorError);
      throw new Error("Entegratör bulunamadı");
    }

    console.log("Firma email:", firma.email);
    console.log("Firma name:", firma.firma_adi);
    console.log("Entegrator name:", entegrator.entegrator_adi);

    // Send email if firma has email
    if (firma.email) {
      const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
      
      if (RESEND_API_KEY) {
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Entegratör Platformu <onboarding@resend.dev>",
            to: [firma.email],
            subject: `Yeni Teklif: ${ilan.baslik || 'İlanınıza'}`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">
                  🎉 Yeni Teklif Aldınız!
                </h1>
                
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #4F46E5; margin-top: 0;">
                    ${ilan.baslik || 'İlanınız'}
                  </h2>
                  
                  <p style="color: #666;">
                    <strong>Teklif Veren:</strong> ${entegrator.entegrator_adi}
                  </p>
                  
                  <p style="color: #666;">
                    <strong>Teklif Tutarı:</strong> ${teklif_tutari ? `${teklif_tutari.toLocaleString('tr-TR')} TL` : 'Belirtilmedi'}
                  </p>
                  
                  ${mesaj ? `
                    <div style="background-color: #fff; padding: 15px; border-left: 4px solid #4F46E5; margin-top: 15px;">
                      <p style="color: #333; margin: 0; font-style: italic;">"${mesaj}"</p>
                    </div>
                  ` : ''}
                </div>
                
                <p style="color: #666;">
                  Teklifi incelemek ve detayları görmek için platformumuza giriş yapın.
                </p>
                
                <p style="color: #999; font-size: 12px; margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px;">
                  Bu e-posta Entegratör Platformu tarafından otomatik olarak gönderilmiştir.
                </p>
              </div>
            `,
          }),
        });

        const emailResult = await emailResponse.json();
        console.log("Email sent successfully:", emailResult);
      } else {
        console.log("RESEND_API_KEY not configured, skipping email");
      }
    } else {
      console.log("No email address found for firma, skipping email notification");
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-proposal-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
