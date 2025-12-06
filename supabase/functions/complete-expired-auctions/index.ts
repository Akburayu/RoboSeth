import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log("Checking for expired auctions...");

    // Get all active auctions that have passed their deadline
    const { data: expiredAuctions, error: fetchError } = await supabase
      .from("ihaleler")
      .select(`
        *,
        firma:firma_id (user_id, firma_adi)
      `)
      .eq("durum", "aktif")
      .lt("deadline", new Date().toISOString());

    if (fetchError) {
      console.error("Error fetching expired auctions:", fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredAuctions?.length || 0} expired auctions`);

    const results = [];

    for (const ihale of expiredAuctions || []) {
      console.log(`Processing auction: ${ihale.id} - ${ihale.baslik}`);

      let kazananEntegratorId = null;
      let kazananTeklif = null;

      // Determine winner based on auction type
      if (ihale.ihale_turu === "acik_eksiltme" || ihale.ihale_turu === "muhurlu_kapali" || ihale.ihale_turu === "turlu_kapali") {
        // Lowest bid wins
        const { data: lowestBid } = await supabase
          .from("ihale_teklifleri")
          .select("*")
          .eq("ihale_id", ihale.id)
          .order("teklif_tutari", { ascending: true })
          .limit(1)
          .single();

        if (lowestBid) {
          kazananEntegratorId = lowestBid.entegrator_id;
          kazananTeklif = lowestBid.teklif_tutari;
        }
      } else if (ihale.ihale_turu === "ingiliz") {
        // Highest bid wins
        const { data: highestBid } = await supabase
          .from("ihale_teklifleri")
          .select("*")
          .eq("ihale_id", ihale.id)
          .order("teklif_tutari", { ascending: false })
          .limit(1)
          .single();

        if (highestBid) {
          kazananEntegratorId = highestBid.entegrator_id;
          kazananTeklif = highestBid.teklif_tutari;
        }
      } else if (ihale.ihale_turu === "japon") {
        // Last remaining active participant wins
        const { data: activeParticipants } = await supabase
          .from("ihale_katilimcilar")
          .select("*")
          .eq("ihale_id", ihale.id)
          .eq("aktif", true);

        if (activeParticipants && activeParticipants.length === 1) {
          kazananEntegratorId = activeParticipants[0].entegrator_id;
          kazananTeklif = ihale.mevcut_fiyat;
        } else if (activeParticipants && activeParticipants.length > 1) {
          // Multiple participants still active - pick one with highest confirmed round
          const winner = activeParticipants.sort((a, b) => (b.son_onay_turu || 0) - (a.son_onay_turu || 0))[0];
          kazananEntegratorId = winner.entegrator_id;
          kazananTeklif = ihale.mevcut_fiyat;
        }
      } else if (ihale.ihale_turu === "hollanda") {
        // Check if someone already accepted
        const { data: acceptedBid } = await supabase
          .from("ihale_teklifleri")
          .select("*")
          .eq("ihale_id", ihale.id)
          .eq("durum", "kabul")
          .single();

        if (acceptedBid) {
          kazananEntegratorId = acceptedBid.entegrator_id;
          kazananTeklif = acceptedBid.teklif_tutari;
        }
      }

      // Update the auction
      const { error: updateError } = await supabase
        .from("ihaleler")
        .update({
          durum: "tamamlandi",
          kazanan_entegrator_id: kazananEntegratorId,
          kazanan_teklif: kazananTeklif,
        })
        .eq("id", ihale.id);

      if (updateError) {
        console.error(`Error updating auction ${ihale.id}:`, updateError);
        continue;
      }

      // Send notification to firma
      if (ihale.firma?.user_id) {
        const winnerMessage = kazananTeklif
          ? `"${ihale.baslik}" ihalesi tamamlandı. Kazanan teklif: ${kazananTeklif.toLocaleString("tr-TR")} ₺`
          : `"${ihale.baslik}" ihalesi tamamlandı. Kazanan bulunamadı.`;

        await supabase.from("notifications").insert({
          user_id: ihale.firma.user_id,
          type: "ihale_tamamlandi",
          title: "İhale Tamamlandı",
          message: winnerMessage,
          related_id: ihale.id,
        });
      }

      // Send notification to winner
      if (kazananEntegratorId) {
        const { data: winnerEntegrator } = await supabase
          .from("entegrator")
          .select("user_id")
          .eq("id", kazananEntegratorId)
          .single();

        if (winnerEntegrator?.user_id) {
          await supabase.from("notifications").insert({
            user_id: winnerEntegrator.user_id,
            type: "ihale_kazanildi",
            title: "Tebrikler! İhaleyi Kazandınız",
            message: `"${ihale.baslik}" ihalesini ${kazananTeklif?.toLocaleString("tr-TR")} ₺ ile kazandınız.`,
            related_id: ihale.id,
          });
        }
      }

      results.push({
        ihale_id: ihale.id,
        baslik: ihale.baslik,
        kazanan_entegrator_id: kazananEntegratorId,
        kazanan_teklif: kazananTeklif,
      });
    }

    console.log("Completed processing expired auctions:", results);

    return new Response(
      JSON.stringify({ success: true, processed: results.length, results }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in complete-expired-auctions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
