import type { Metadata } from "next";
import { getPublishedPageServer } from "@/services/cmsServiceServer";

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPublishedPageServer("faq");
    return {
        title: page?.content?.pageTitle || "Perguntas Frequentes",
        description: page?.metaDescription || "Tire suas dúvidas sobre reservas, check-in digital, cancelamento, gestão de imóveis e mais na Vivare.",
        alternates: { canonical: "/faq" },
    };
}

/* ── FAQs padrão (fallback) ── */
const defaultGuestFaqs = [
    { q: "Preciso de fiador ou caução?", a: "Não, alugamos sem nenhuma burocracia. Você reserva online e paga diretamente pela plataforma, sem necessidade de fiador, cheque caução ou comprovante de renda.", category: "guest" },
    { q: "Como funciona o check-in?", a: "100% digital. Após a confirmação da reserva, enviamos as instruções completas e senhas de acesso diretamente para seu WhatsApp e e-mail.", category: "guest" },
    { q: "Posso reservar por mês?", a: "Sim! Aceitamos estadias de curta duração (a partir de 2 noites) e também mensais, com descontos progressivos.", category: "guest" },
    { q: "Os apartamentos possuem internet?", a: "Sim, todos os nossos apartamentos possuem Wi-Fi de alta velocidade, ideal para trabalho remoto e streaming.", category: "guest" },
    { q: "O que está incluído na hospedagem?", a: "Todos os apartamentos incluem roupa de cama, toalhas, utensílios de cozinha, produtos de limpeza, Wi-Fi e todas as contas.", category: "guest" },
    { q: "Qual é a política de cancelamento?", a: "Oferecemos cancelamento flexível: reembolso integral se cancelado até 14 dias antes do check-in.", category: "guest" },
];

const defaultOwnerFaqs = [
    { q: "Quais são os custos para começar?", a: "A Vivare cobra apenas o comissionamento sobre as reservas realizadas. Na implantação, há custos iniciais de limpeza profissional e ensaio fotográfico do imóvel, que podem ser descontados diretamente do primeiro repasse.", category: "owner" },
    { q: "Como sei quem está entrando no meu imóvel?", a: "Todos os hóspedes passam por verificação de identidade no check-in digital antes de receberem as chaves/senhas.", category: "owner" },
    { q: "E se houver quebras ou prejuízos?", a: "A Vivare realiza vistorias profundas a cada check-out e cobra eventuais danos diretamente do hóspede.", category: "owner" },
    { q: "Como acompanho a rentabilidade do meu imóvel?", a: "Você recebe relatórios transparentes todos os meses com o detalhamento das reservas, valores e repasses.", category: "owner" },
    { q: "Quais plataformas vocês utilizam?", a: "Airbnb, Booking.com, Stays.net, além do nosso próprio site. Utilizamos precificação dinâmica baseada em IA.", category: "owner" },
];

export default async function FaqPage() {
    const page = await getPublishedPageServer("faq");

    let items: { q: string; a: string; category?: string }[] = [];
    if (page?.content?.items) {
        try {
            items = JSON.parse(page.content.items);
        } catch { /* fallback */ }
    }

    const guestFaqs = items.length > 0
        ? items.filter(i => !i.category || i.category === 'guest')
        : defaultGuestFaqs;
    const ownerFaqs = items.length > 0
        ? items.filter(i => i.category === 'owner')
        : defaultOwnerFaqs;

    const allFaqs = [...guestFaqs, ...ownerFaqs];
    const faqJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: allFaqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
    };

    const pageTitle = page?.content?.pageTitle || "Perguntas Frequentes";

    return (
        <main className="min-h-screen pt-24 pb-12 bg-neutral-50">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">{pageTitle}</h1>
                    <p className="text-xl text-neutral-600">Encontre respostas para as dúvidas mais comuns sobre a Vivare.</p>
                </div>

                {/* Guest FAQs */}
                <section className="mb-16">
                    <h2 className="text-2xl font-display font-bold mb-8 border-b pb-4">Para Hóspedes</h2>
                    <div className="space-y-4">
                        {guestFaqs.map((faq, i) => (
                            <details key={i} className="group border border-neutral-200 rounded-xl bg-white shadow-sm">
                                <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-lg list-none">
                                    <span>{faq.q}</span>
                                    <span className="ml-4 text-neutral-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                                </summary>
                                <div className="px-6 pb-6 text-neutral-600 leading-relaxed">{faq.a}</div>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Owner FAQs */}
                {ownerFaqs.length > 0 && (
                    <section className="mb-16">
                        <h2 className="text-2xl font-display font-bold mb-8 border-b pb-4">Para Proprietários</h2>
                        <div className="space-y-4">
                            {ownerFaqs.map((faq, i) => (
                                <details key={i} className="group border border-neutral-200 rounded-xl bg-white shadow-sm">
                                    <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-lg list-none">
                                        <span>{faq.q}</span>
                                        <span className="ml-4 text-neutral-400 group-open:rotate-45 transition-transform text-2xl">+</span>
                                    </summary>
                                    <div className="px-6 pb-6 text-neutral-600 leading-relaxed">{faq.a}</div>
                                </details>
                            ))}
                        </div>
                    </section>
                )}

                {/* CTA */}
                <section className="text-center bg-white border border-neutral-200 rounded-2xl p-10 shadow-sm">
                    <h2 className="text-2xl font-display font-bold mb-4">Ainda tem dúvidas?</h2>
                    <p className="text-neutral-600 mb-6">Fale diretamente com nossa equipe pelo WhatsApp.</p>
                    <a
                        href="https://wa.me/5511985067840?text=Ol%C3%A1!%20Tenho%20uma%20d%C3%BAvida%20sobre%20a%20Vivare."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-primary px-8 py-4 text-lg"
                    >
                        Falar no WhatsApp
                    </a>
                </section>
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
            />
        </main>
    );
}
