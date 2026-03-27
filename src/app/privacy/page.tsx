import { Shield, Terminal } from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base-100">
      <nav className="border-b border-base-300 py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Terminal className="text-neon-cyan" size={20} />
            <span className="text-sm font-bold">
              <span className="text-neon-cyan">ai</span>
              <span className="text-text-primary">tekin</span>
              <span className="text-neon-green">.com</span>
            </span>
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="text-neon-cyan" size={32} />
          <h1 className="text-3xl font-bold text-text-primary">{"Gizlilik Politikası"}</h1>
        </div>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <p className="text-text-secondary/70 text-xs">
            {"Son güncelleme: Mart 2026"}
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"1. Genel Bakış"}</h2>
            <p>
              {"aitekin.com olarak kullanıcılarımızın gizliliğine büyük önem veriyoruz. Bu gizlilik politikası, platformumuzu kullanırken kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu açıklar."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"2. Toplanan Veriler"}</h2>
            <p>{"Platformumuzu kullandığınızda aşağıdaki verileri toplayabiliriz:"}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{"Hesap bilgileri: E-posta adresi, kullanıcı adı"}</li>
              <li>{"Kimlik doğrulama: OAuth sağlayıcıları üzerinden giriş bilgileri"}</li>
              <li>{"Kullanım verileri: Araç kullanım istatistikleri, XP ve seviye bilgileri"}</li>
              <li>{"Teknik veriler: Tarayıcı türü, cihaz bilgisi (anonim olarak)"}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"3. İstemci Tarafı İşleme"}</h2>
            <p className="text-neon-green font-medium">
              {"Bu platformun en önemli özelliği: Dosyalarınız sunucuya yüklenmez."}
            </p>
            <p>
              {"Video dönüştürme, ses işleme, OCR, görüntü işleme gibi araçlar tamamen tarayıcınızda (WebAssembly/WebGPU) çalışır. Dosyalarınız hiçbir zaman sunucularımıza gönderilmez, üçüncü taraflarla paylaşılmaz veya herhangi bir yerde depolanmaz."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"4. AI Sohbet Verileri"}</h2>
            <p>
              {"AI sohbet asistanını kullandığınızda, mesajlarınız yanıt üretmek için üçüncü parti API sağlayıcılarına (OpenRouter, Groq) iletilir. Bu sağlayıcıların kendi gizlilik politikaları geçerlidir. Hassas kişisel bilgilerinizi sohbette paylaşmamanızı öneririz."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"5. Çerezler ve İzleme"}</h2>
            <p>
              {"Oturum yönetimi için gerekli çerezler kullanılır. Reklam amaçlı izleme çerezleri kullanmıyoruz. Üçüncü parti analitik araçları kullanılması durumunda, veriler anonim olarak toplanır."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"6. Veri Güvenliği"}</h2>
            <p>
              {"Kişisel verilerinizi korumak için endüstri standardı güvenlik önlemleri uyguluyoruz. Tüm bağlantılar SSL/TLS ile şifrelenir. Kimlik doğrulama verileri Supabase altyapısında güvenli şekilde saklanır."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"7. Üçüncü Parti Hizmetler"}</h2>
            <p>{"Platformumuz aşağıdaki üçüncü parti hizmetleri kullanmaktadır:"}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{"Supabase: Kimlik doğrulama ve veri depolama"}</li>
              <li>{"OpenRouter / Groq: AI sohbet asistanı API'leri"}</li>
              <li>{"Hugging Face Spaces: Gömülü AI modelleri"}</li>
              <li>{"Vercel: Web barındırma hizmetleri"}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"8. Kullanıcı Hakları"}</h2>
            <p>{"Aşağıdaki haklara sahipsiniz:"}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{"Hesabınızı ve tüm ilişkili verileri silme hakkı"}</li>
              <li>{"Kişisel verilerinize erişim ve düzeltme hakkı"}</li>
              <li>{"Veri taşınabilirliği hakkı"}</li>
              <li>{"İşleme itiraz etme hakkı"}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"9. Yaş Sınırı"}</h2>
            <p>
              {"Platformumuz 13 yaşından küçük çocuklara yönelik değildir. 13 yaşından küçük bireylerin verilerini bilerek toplamıyoruz."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"10. İletişim"}</h2>
            <p>
              {"Gizlilik politikamızla ilgili sorularınız için info@aitekin.com adresine e-posta gönderebilirsiniz."}
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-base-300 text-center">
          <Link href="/" className="text-neon-cyan hover:underline text-sm">
            {"Ana Sayfaya Dön"}
          </Link>
        </div>
      </div>
    </div>
  );
}
