import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Cost based on entegrator size
const REVEAL_COSTS: Record<string, number> = {
  kucuk: 5,
  orta: 15,
  buyuk: 30,
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    // Get user token from header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.log('No authorization header provided')
      return new Response(
        JSON.stringify({ error: 'Yetkilendirme gerekli' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create admin client for operations
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
    
    // Create user client to get user info
    const supabaseUser = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } }
    })

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabaseUser.auth.getUser()
    if (userError || !user) {
      console.log('User authentication failed:', userError?.message)
      return new Response(
        JSON.stringify({ error: 'Kullanıcı doğrulanamadı' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Authenticated user:', user.id)

    // Parse request body
    const { entegrator_id } = await req.json()
    if (!entegrator_id) {
      return new Response(
        JSON.stringify({ error: 'Entegratör ID gerekli' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Reveal request for entegrator:', entegrator_id)

    // Get firma for this user (handle potential duplicates by getting most recent)
    const { data: firmaList, error: firmaError } = await supabaseAdmin
      .from('firma')
      .select('id, kredi')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)

    if (firmaError) {
      console.log('Firma query error:', firmaError.message)
      return new Response(
        JSON.stringify({ error: 'Firma bilgisi alınamadı' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const firma = firmaList?.[0]

    if (!firma) {
      console.log('No firma found for user:', user.id)
      return new Response(
        JSON.stringify({ error: 'Firma bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Firma found:', firma.id, 'Credits:', firma.kredi)

    // Check if already revealed
    const { data: existingReveal, error: revealCheckError } = await supabaseAdmin
      .from('revealed_contacts')
      .select('id')
      .eq('firma_id', firma.id)
      .eq('entegrator_id', entegrator_id)
      .maybeSingle()

    if (revealCheckError) {
      console.log('Reveal check error:', revealCheckError.message)
    }

    if (existingReveal) {
      // Already revealed - just return contact info
      console.log('Contact already revealed, returning existing data')
      
      const { data: entegrator, error: entError } = await supabaseAdmin
        .from('entegrator')
        .select('entegrator_adi, iletisim_sosyal_medya, konum')
        .eq('id', entegrator_id)
        .single()

      if (entError || !entegrator) {
        return new Response(
          JSON.stringify({ error: 'Entegratör bulunamadı' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({
          success: true,
          already_revealed: true,
          contact: {
            entegrator_adi: entegrator.entegrator_adi,
            iletisim: entegrator.iletisim_sosyal_medya,
            konum: entegrator.konum
          },
          remaining_credits: firma.kredi
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get entegrator info to determine cost
    const { data: entegrator, error: entError } = await supabaseAdmin
      .from('entegrator')
      .select('id, entegrator_adi, entegrator_buyuklugu, iletisim_sosyal_medya, konum')
      .eq('id', entegrator_id)
      .single()

    if (entError || !entegrator) {
      console.log('Entegrator not found:', entError?.message)
      return new Response(
        JSON.stringify({ error: 'Entegratör bulunamadı' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const cost = REVEAL_COSTS[entegrator.entegrator_buyuklugu || 'kucuk'] || 5
    console.log('Reveal cost:', cost, 'Firma credits:', firma.kredi)

    // Check if firma has enough credits
    if ((firma.kredi || 0) < cost) {
      return new Response(
        JSON.stringify({ 
          error: 'Yetersiz kredi',
          required: cost,
          available: firma.kredi || 0
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Perform transaction: deduct credits and create reveal record
    // First update credits
    const { error: updateError } = await supabaseAdmin
      .from('firma')
      .update({ kredi: (firma.kredi || 0) - cost })
      .eq('id', firma.id)

    if (updateError) {
      console.log('Credit update error:', updateError.message)
      return new Response(
        JSON.stringify({ error: 'Kredi güncellenemedi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create reveal record
    const { error: insertError } = await supabaseAdmin
      .from('revealed_contacts')
      .insert({
        firma_id: firma.id,
        entegrator_id: entegrator_id,
        harcanan_kredi: cost
      })

    if (insertError) {
      console.log('Reveal insert error:', insertError.message)
      // Rollback credit deduction
      await supabaseAdmin
        .from('firma')
        .update({ kredi: firma.kredi })
        .eq('id', firma.id)
      
      return new Response(
        JSON.stringify({ error: 'İşlem kaydedilemedi' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Reveal successful! Remaining credits:', (firma.kredi || 0) - cost)

    return new Response(
      JSON.stringify({
        success: true,
        contact: {
          entegrator_adi: entegrator.entegrator_adi,
          iletisim: entegrator.iletisim_sosyal_medya,
          konum: entegrator.konum
        },
        cost,
        remaining_credits: (firma.kredi || 0) - cost
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Beklenmeyen bir hata oluştu' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
