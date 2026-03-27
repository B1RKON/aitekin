import { Scale, Terminal } from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
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
          <Scale className="text-neon-cyan" size={32} />
          <h1 className="text-3xl font-bold text-text-primary">{"Kullanım Şartları"}</h1>
        </div>

        <div className="space-y-8 text-text-secondary text-sm leading-relaxed">
          <p className="text-text-secondary/70 text-xs">
            {"Son güncelleme: Mart 2026"}
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"1. Hizmet Tanımı"}</h2>
            <p>
              {"aitekin.com, açık kaynaklı yapay zeka araçlarını ücretsiz olarak sunan bir web platformudur. Video/ses dönüştürme, AI sohbet, PDF analizi, görüntü işleme, müzik üretimi ve daha birçok araç barındırır."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"2. Kabul Koşulları"}</h2>
            <p>
              {"Platformu kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız. Şartları kabul etmiyorsanız, platformu kullanmayınız."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"3. Hesap Oluşturma"}</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{"Kayıt sırasında doğru ve güncel bilgi vermeniz gerekmektedir"}</li>
              <li>{"Hesabınızın güvenliğinden siz sorumlusunuz"}</li>
              <li>{"Hesabınızı başkalarıyla paylaşmamalısınız"}</li>
              <li>{"13 yaşından büyük olmanız gerekmektedir"}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"4. Kabul Edilebilir Kullanım"}</h2>
            <p>{"Aşağıdaki davranışlar yasaktır:"}</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{"Platformu yasadışı amaçlarla kullanmak"}</li>
              <li>{"Zararlı, tehditkar veya iftira niteliğinde içerik üretmek"}</li>
              <li>{"Telif hakkıyla korunan materyalleri izinsiz işlemek"}</li>
              <li>{"Platformun güvenliğini tehlikeye atacak girişimlerde bulunmak"}</li>
              <li>{"API'leri kötüye kullanmak, bot saldırıları düzenlemek"}</li>
              <li>{"Diğer kullanıcıların deneyimini olumsuz etkilemek"}</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"5. Fikri Mülkiyet"}</h2>
            <p>
              {"Platform üzerinde kullandığınız araçlarla ürettiğiniz içerikler size aittir. Platformun kendisi, tasarımı ve yazılımı aitekin.com'a aittir. Açık kaynak bileşenler kendi lisansları altında sunulmaktadır."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"6. Hizmet Düzeyi"}</h2>
            <p>
              {"Platform \"olduğu gibi\" sunulmaktadır. Ücretsiz bir hizmet olarak, %100 kesintisiz çalışma garantisi verilmemektedir. Bakım, güncelleme veya teknik sorunlar nedeniyle hizmet geçici olarak kesintiye uğrayabilir."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"7. Sorumluluk Sınırı"}</h2>
            <p>
              {"AI tarafından üretilen içeriklerin doğruluğu garanti edilmez. Akademik çalışmalar, tıbbi veya hukuki konularda AI çıktılarını profesyonel tavsiye yerine kullanmayınız."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"8. Üçüncü Parti Hizmetler"}</h2>
            <p>
              {"Platform, üçüncü parti API'ler (OpenRouter, Groq, Hugging Face) ve hizmetler kullanmaktadır. Bu hizmetlerin kendi kullanım şartları ve kotaları geçerlidir. Üçüncü parti hizmetlerdeki değişiklikler platformun işlevselliğini etkileyebilir."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"9. Hesap Kapatma"}</h2>
            <p>
              {"Kullanım şartlarını ihlal eden hesaplar uyarı verilmeden askıya alınabilir veya kapatılabilir. Hesabınızı istediğiniz zaman silme hakkınız vardır."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"10. Değişiklikler"}</h2>
            <p>
              {"Bu kullanım şartları herhangi bir zamanda güncellenebilir. Önemli değişiklikler platformda duyurulacaktır. Güncellemelerden sonra platformu kullanmaya devam etmeniz, yeni şartları kabul ettiğiniz anlamına gelir."}
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-neon-cyan">{"11. İletişim"}</h2>
            <p>
              {"Kullanım şartlarıyla ilgili sorularınız için info@aitekin.com adresine e-posta gönderebilirsiniz."}
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
