export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      entegrator: {
        Row: {
          belgesi1: string | null
          belgesi2: string | null
          belgesi3: string | null
          created_at: string | null
          email: string | null
          entegrator_adi: string
          entegrator_buyuklugu:
            | Database["public"]["Enums"]["entegrator_buyuklugu"]
            | null
          faaliyet_alanlari: string | null
          hizmet_verilen_iller: string | null
          id: string
          iletisim_sosyal_medya: string | null
          kac_kisi: number | null
          konum: string | null
          puan: number | null
          referans: string | null
          sektor: string | null
          tecrube: string | null
          user_id: string | null
          uzmanlik_alani: string | null
          yorumlar: string | null
        }
        Insert: {
          belgesi1?: string | null
          belgesi2?: string | null
          belgesi3?: string | null
          created_at?: string | null
          email?: string | null
          entegrator_adi: string
          entegrator_buyuklugu?:
            | Database["public"]["Enums"]["entegrator_buyuklugu"]
            | null
          faaliyet_alanlari?: string | null
          hizmet_verilen_iller?: string | null
          id?: string
          iletisim_sosyal_medya?: string | null
          kac_kisi?: number | null
          konum?: string | null
          puan?: number | null
          referans?: string | null
          sektor?: string | null
          tecrube?: string | null
          user_id?: string | null
          uzmanlik_alani?: string | null
          yorumlar?: string | null
        }
        Update: {
          belgesi1?: string | null
          belgesi2?: string | null
          belgesi3?: string | null
          created_at?: string | null
          email?: string | null
          entegrator_adi?: string
          entegrator_buyuklugu?:
            | Database["public"]["Enums"]["entegrator_buyuklugu"]
            | null
          faaliyet_alanlari?: string | null
          hizmet_verilen_iller?: string | null
          id?: string
          iletisim_sosyal_medya?: string | null
          kac_kisi?: number | null
          konum?: string | null
          puan?: number | null
          referans?: string | null
          sektor?: string | null
          tecrube?: string | null
          user_id?: string | null
          uzmanlik_alani?: string | null
          yorumlar?: string | null
        }
        Relationships: []
      }
      firma: {
        Row: {
          belgesi1: string | null
          belgesi2: string | null
          belgesi3: string | null
          belgesi4: string | null
          created_at: string | null
          email: string | null
          firma_adi: string
          firma_olcegi: Database["public"]["Enums"]["firma_olcegi"]
          firma_tanitim_yazisi: string | null
          id: string
          kredi: number | null
          user_id: string | null
        }
        Insert: {
          belgesi1?: string | null
          belgesi2?: string | null
          belgesi3?: string | null
          belgesi4?: string | null
          created_at?: string | null
          email?: string | null
          firma_adi: string
          firma_olcegi?: Database["public"]["Enums"]["firma_olcegi"]
          firma_tanitim_yazisi?: string | null
          id?: string
          kredi?: number | null
          user_id?: string | null
        }
        Update: {
          belgesi1?: string | null
          belgesi2?: string | null
          belgesi3?: string | null
          belgesi4?: string | null
          created_at?: string | null
          email?: string | null
          firma_adi?: string
          firma_olcegi?: Database["public"]["Enums"]["firma_olcegi"]
          firma_tanitim_yazisi?: string | null
          id?: string
          kredi?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      firma_ratings: {
        Row: {
          created_at: string
          entegrator_id: string
          firma_id: string
          id: string
          kalite_puan: number
          musteri_iliskisi_puan: number
          surec_yonetimi_puan: number
          updated_at: string
          yorum: string | null
        }
        Insert: {
          created_at?: string
          entegrator_id: string
          firma_id: string
          id?: string
          kalite_puan: number
          musteri_iliskisi_puan: number
          surec_yonetimi_puan: number
          updated_at?: string
          yorum?: string | null
        }
        Update: {
          created_at?: string
          entegrator_id?: string
          firma_id?: string
          id?: string
          kalite_puan?: number
          musteri_iliskisi_puan?: number
          surec_yonetimi_puan?: number
          updated_at?: string
          yorum?: string | null
        }
        Relationships: []
      }
      ihale_katilimcilar: {
        Row: {
          aktif: boolean | null
          created_at: string
          entegrator_id: string
          id: string
          ihale_id: string
          son_onay_turu: number | null
        }
        Insert: {
          aktif?: boolean | null
          created_at?: string
          entegrator_id: string
          id?: string
          ihale_id: string
          son_onay_turu?: number | null
        }
        Update: {
          aktif?: boolean | null
          created_at?: string
          entegrator_id?: string
          id?: string
          ihale_id?: string
          son_onay_turu?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ihale_katilimcilar_entegrator_id_fkey"
            columns: ["entegrator_id"]
            isOneToOne: false
            referencedRelation: "entegrator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ihale_katilimcilar_ihale_id_fkey"
            columns: ["ihale_id"]
            isOneToOne: false
            referencedRelation: "ihaleler"
            referencedColumns: ["id"]
          },
        ]
      }
      ihale_teklifleri: {
        Row: {
          created_at: string
          durum: string | null
          entegrator_id: string
          id: string
          ihale_id: string
          teklif_tutari: number
          tur_no: number | null
        }
        Insert: {
          created_at?: string
          durum?: string | null
          entegrator_id: string
          id?: string
          ihale_id: string
          teklif_tutari: number
          tur_no?: number | null
        }
        Update: {
          created_at?: string
          durum?: string | null
          entegrator_id?: string
          id?: string
          ihale_id?: string
          teklif_tutari?: number
          tur_no?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ihale_teklifleri_entegrator_id_fkey"
            columns: ["entegrator_id"]
            isOneToOne: false
            referencedRelation: "entegrator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ihale_teklifleri_ihale_id_fkey"
            columns: ["ihale_id"]
            isOneToOne: false
            referencedRelation: "ihaleler"
            referencedColumns: ["id"]
          },
        ]
      }
      ihaleler: {
        Row: {
          aciklama: string | null
          baslangic_fiyati: number | null
          baslik: string
          created_at: string
          deadline: string
          dokuman_url: string | null
          durum: Database["public"]["Enums"]["ihale_durumu"]
          firma_id: string
          fiyat_adimi: number | null
          id: string
          ihale_turu: Database["public"]["Enums"]["ihale_turu"]
          kazanan_entegrator_id: string | null
          kazanan_teklif: number | null
          mevcut_fiyat: number | null
          mevcut_tur: number | null
          minimum_fiyat: number | null
          teknik_sartlar: string | null
          toplam_tur: number | null
          updated_at: string
        }
        Insert: {
          aciklama?: string | null
          baslangic_fiyati?: number | null
          baslik: string
          created_at?: string
          deadline: string
          dokuman_url?: string | null
          durum?: Database["public"]["Enums"]["ihale_durumu"]
          firma_id: string
          fiyat_adimi?: number | null
          id?: string
          ihale_turu: Database["public"]["Enums"]["ihale_turu"]
          kazanan_entegrator_id?: string | null
          kazanan_teklif?: number | null
          mevcut_fiyat?: number | null
          mevcut_tur?: number | null
          minimum_fiyat?: number | null
          teknik_sartlar?: string | null
          toplam_tur?: number | null
          updated_at?: string
        }
        Update: {
          aciklama?: string | null
          baslangic_fiyati?: number | null
          baslik?: string
          created_at?: string
          deadline?: string
          dokuman_url?: string | null
          durum?: Database["public"]["Enums"]["ihale_durumu"]
          firma_id?: string
          fiyat_adimi?: number | null
          id?: string
          ihale_turu?: Database["public"]["Enums"]["ihale_turu"]
          kazanan_entegrator_id?: string | null
          kazanan_teklif?: number | null
          mevcut_fiyat?: number | null
          mevcut_tur?: number | null
          minimum_fiyat?: number | null
          teknik_sartlar?: string | null
          toplam_tur?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ihaleler_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firma"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ihaleler_kazanan_entegrator_id_fkey"
            columns: ["kazanan_entegrator_id"]
            isOneToOne: false
            referencedRelation: "entegrator"
            referencedColumns: ["id"]
          },
        ]
      }
      ilanlar: {
        Row: {
          aciklama: string | null
          aranan_faaliyet_alanlari: string | null
          aranan_kisiler: string | null
          aranan_sektor: string | null
          aranan_tecrube: string | null
          aranan_uzmanlik: string | null
          baslik: string | null
          butce_max: number | null
          butce_min: number | null
          created_at: string | null
          firma_id: string
          hizmet_verilen_iller: string | null
          id: string
          son_tarih: string | null
        }
        Insert: {
          aciklama?: string | null
          aranan_faaliyet_alanlari?: string | null
          aranan_kisiler?: string | null
          aranan_sektor?: string | null
          aranan_tecrube?: string | null
          aranan_uzmanlik?: string | null
          baslik?: string | null
          butce_max?: number | null
          butce_min?: number | null
          created_at?: string | null
          firma_id: string
          hizmet_verilen_iller?: string | null
          id?: string
          son_tarih?: string | null
        }
        Update: {
          aciklama?: string | null
          aranan_faaliyet_alanlari?: string | null
          aranan_kisiler?: string | null
          aranan_sektor?: string | null
          aranan_tecrube?: string | null
          aranan_uzmanlik?: string | null
          baslik?: string | null
          butce_max?: number | null
          butce_min?: number | null
          created_at?: string | null
          firma_id?: string
          hizmet_verilen_iller?: string | null
          id?: string
          son_tarih?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ilanlar_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firma"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          alan_id: string
          conversation_id: string | null
          created_at: string | null
          gonderen_id: string
          id: string
          ilan_id: string | null
          mesaj: string
        }
        Insert: {
          alan_id: string
          conversation_id?: string | null
          created_at?: string | null
          gonderen_id: string
          id?: string
          ilan_id?: string | null
          mesaj: string
        }
        Update: {
          alan_id?: string
          conversation_id?: string | null
          created_at?: string | null
          gonderen_id?: string
          id?: string
          ilan_id?: string | null
          mesaj?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_ilan_id_fkey"
            columns: ["ilan_id"]
            isOneToOne: false
            referencedRelation: "ilanlar"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      revealed_contacts: {
        Row: {
          created_at: string | null
          entegrator_id: string
          firma_id: string
          harcanan_kredi: number
          id: string
        }
        Insert: {
          created_at?: string | null
          entegrator_id: string
          firma_id: string
          harcanan_kredi: number
          id?: string
        }
        Update: {
          created_at?: string | null
          entegrator_id?: string
          firma_id?: string
          harcanan_kredi?: number
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "revealed_contacts_entegrator_id_fkey"
            columns: ["entegrator_id"]
            isOneToOne: false
            referencedRelation: "entegrator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revealed_contacts_firma_id_fkey"
            columns: ["firma_id"]
            isOneToOne: false
            referencedRelation: "firma"
            referencedColumns: ["id"]
          },
        ]
      }
      teklifler: {
        Row: {
          created_at: string | null
          entegrator_id: string
          id: string
          ilan_id: string
          mesaj: string | null
          teklif_tutari: number | null
        }
        Insert: {
          created_at?: string | null
          entegrator_id: string
          id?: string
          ilan_id: string
          mesaj?: string | null
          teklif_tutari?: number | null
        }
        Update: {
          created_at?: string | null
          entegrator_id?: string
          id?: string
          ilan_id?: string
          mesaj?: string | null
          teklif_tutari?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "teklifler_entegrator_id_fkey"
            columns: ["entegrator_id"]
            isOneToOne: false
            referencedRelation: "entegrator"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teklifler_ilan_id_fkey"
            columns: ["ilan_id"]
            isOneToOne: false
            referencedRelation: "ilanlar"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      entegrator_buyuklugu: "kucuk" | "orta" | "buyuk"
      firma_olcegi: "kucuk" | "orta" | "buyuk" | "global"
      ihale_durumu: "aktif" | "beklemede" | "tamamlandi" | "iptal"
      ihale_turu:
        | "acik_eksiltme"
        | "ingiliz"
        | "hollanda"
        | "japon"
        | "turlu_kapali"
        | "muhurlu_kapali"
      user_role: "firma" | "entegrator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      entegrator_buyuklugu: ["kucuk", "orta", "buyuk"],
      firma_olcegi: ["kucuk", "orta", "buyuk", "global"],
      ihale_durumu: ["aktif", "beklemede", "tamamlandi", "iptal"],
      ihale_turu: [
        "acik_eksiltme",
        "ingiliz",
        "hollanda",
        "japon",
        "turlu_kapali",
        "muhurlu_kapali",
      ],
      user_role: ["firma", "entegrator"],
    },
  },
} as const
