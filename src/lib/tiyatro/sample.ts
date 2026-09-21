import type { ScenarioInput } from "./schema";
import { VARSAYILAN_DUYGU, bosProfil } from "./voiceProfile";

const ORNEK_PROFIL = { ...bosProfil("Yüzbaşı Kemal"), id: "yuzbasi-kemal" };

/** Hizli test icin ornek senaryo (5 replik) */
export const SAMPLE_SCENARIO: ScenarioInput = {
  id: "ornek-canakkale",
  oyunAdi: "Çanakkale'de Bir Gece",
  karakter: "Yüzbaşı Kemal",
  profiller: [ORNEK_PROFIL],
  ayarlar: { threshold: 0.62, mode: "sirali", bridgeEnabled: false, reactionMs: 250, interimMatch: true },
  replikler: [
    {
      sira: 1,
      tetikleyici: "Yüzbaşım, düşman siperleri sessizliğe gömüldü. Bu gece bir şeyler olacak.",
      yanit: "Sessizlik, fırtınadan önceki nefestir evlat. Askerlere söyle, kimse gözünü kırpmasın.",
      esneklik: "dusuk",
      profil: ORNEK_PROFIL.id,
      duygu: VARSAYILAN_DUYGU,
    },
    {
      sira: 2,
      tetikleyici: "Cephane azaldı yüzbaşım. En fazla iki saat dayanabiliriz.",
      yanit: "İki saat mi? İki saat bir ömürdür. Bu topraklarda her dakika bir destan yazılır.",
      esneklik: "dusuk",
      profil: ORNEK_PROFIL.id,
      duygu: VARSAYILAN_DUYGU,
    },
    {
      sira: 3,
      tetikleyici: "Anamdan mektup geldi. Köye dönmemi istiyor.",
      yanit: "Ananın duası seninle. Dön, ama başın dik dön. Bu siperden geçen hiç kimse bir daha aynı adam olmaz.",
      esneklik: "orta",
      profil: ORNEK_PROFIL.id,
      duygu: VARSAYILAN_DUYGU,
    },
    {
      sira: 4,
      tetikleyici: "Işıklar söndü! Düşman ilerliyor!",
      yanit: "Süngü tak! Bugün burada ölmek var, dönmek yok. Haydi aslanlarım, ileri!",
      esneklik: "dusuk",
      profil: ORNEK_PROFIL.id,
      duygu: VARSAYILAN_DUYGU,
    },
    {
      sira: 5,
      tetikleyici: "Sabah oldu yüzbaşım. Hâlâ buradayız.",
      yanit: "Evet... hâlâ buradayız. Ve bu bayrak, bu tepede dalgalanmaya devam edecek.",
      esneklik: "yuksek",
      profil: ORNEK_PROFIL.id,
      duygu: VARSAYILAN_DUYGU,
    },
  ],
};
