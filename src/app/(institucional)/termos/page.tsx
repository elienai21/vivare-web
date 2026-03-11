import type { Metadata } from "next";
import { getPublishedPageServer } from "@/services/cmsServiceServer";

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPublishedPageServer("termos");
    return {
        title: page?.content?.pageTitle || "Termos e Condições",
        description: page?.metaDescription || "Leia os termos e condições de uso dos serviços de hospedagem da Vivare.",
        alternates: { canonical: "/termos" },
    };
}

/* ── Conteúdo fallback (hard-coded) ── */
const FALLBACK_HTML = `
<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">1. Aceitação dos Termos</h2>
    <p>Ao acessar e utilizar o site da Vivare Experience (doravante "Vivare"), você concorda integralmente com os presentes Termos e Condições de Uso. Caso não concorde com algum dos termos aqui descritos, por favor, não utilize nossos serviços.</p>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">2. Sobre a Vivare</h2>
    <p>A Vivare é uma empresa especializada na gestão profissional de imóveis para locação por temporada em São Paulo, Santos e Guarujá. Atuamos como intermediários entre proprietários de imóveis e hóspedes, oferecendo curadoria, operação e atendimento completos.</p>
    <p class="mt-3"><strong>Razão Social:</strong> Vivare Gestão de Negócios Imobiliários Ltda.<br/><strong>CNPJ:</strong> 51.486.823/0001-00<br/><strong>Endereço:</strong> Rua Rondinha, 180, Chácara Inglesa, São Paulo — SP</p>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">3. Serviços Oferecidos</h2>
    <p>A Vivare oferece os seguintes serviços:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li>Locação de imóveis mobiliados por temporada (curta e média duração);</li>
        <li>Gestão profissional de imóveis para proprietários;</li>
        <li>Simulação de rentabilidade para proprietários;</li>
        <li>Intermediação de reservas e atendimento ao hóspede.</li>
    </ul>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">4. Reservas e Pagamentos</h2>
    <p>As reservas podem ser realizadas diretamente pelo site da Vivare ou através de plataformas parceiras (Airbnb, Booking.com, Stays.net). Ao confirmar uma reserva, o hóspede concorda com:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li>O pagamento integral ou parcial conforme as condições da reserva;</li>
        <li>O cumprimento das regras da casa e políticas de cada propriedade;</li>
        <li>A veracidade dos dados pessoais fornecidos;</li>
        <li>A política de cancelamento vigente no momento da reserva.</li>
    </ul>
    <p class="mt-3">Os pagamentos são processados de forma segura via Stripe ou plataformas parceiras. A Vivare não armazena dados de cartão de crédito.</p>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">5. Obrigações do Hóspede</h2>
    <p>Ao utilizar uma propriedade gerenciada pela Vivare, o hóspede se compromete a:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li>Tratar o imóvel e seus equipamentos com zelo e cuidado;</li>
        <li>Respeitar o número máximo de hóspedes declarado na reserva;</li>
        <li>Não realizar festas ou eventos sem autorização prévia;</li>
        <li>Respeitar as regras de convivência do condomínio;</li>
        <li>Manter silêncio no período noturno (após 22h00);</li>
        <li>Comunicar imediatamente qualquer dano ou problema ao imóvel.</li>
    </ul>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">6. Danos e Responsabilidades</h2>
    <p>O hóspede é responsável por eventuais danos causados ao imóvel, mobília e equipamentos durante sua estadia. A Vivare realiza vistoria a cada check-out e reserva-se o direito de cobrar reparos diretamente do hóspede responsável.</p>
    <p class="mt-3">Adicionalmente, as plataformas de reserva possuem seguros próprios (como o AirCover do Airbnb) que cobrem danos em determinadas situações.</p>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">7. Check-in e Check-out</h2>
    <p>O check-in é 100% digital. As instruções de acesso serão enviadas por e-mail e/ou WhatsApp até 24 horas antes da data de chegada. Os horários padrão são:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li><strong>Check-in:</strong> a partir das 15h00;</li>
        <li><strong>Check-out:</strong> até as 11h00.</li>
    </ul>
    <p class="mt-3">Horários diferenciados podem ser solicitados e estarão sujeitos à disponibilidade.</p>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">8. Propriedade Intelectual</h2>
    <p>Todo o conteúdo do site da Vivare — incluindo textos, imagens, logotipos, design e código — é protegido por direitos autorais e não pode ser reproduzido, distribuído ou utilizado sem autorização prévia por escrito.</p>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">9. Limitação de Responsabilidade</h2>
    <p>A Vivare se esforça para manter informações precisas e atualizadas no site, mas não garante que todo o conteúdo esteja livre de erros. As fotos dos imóveis são ilustrativas e podem apresentar pequenas variações em relação ao estado atual.</p>
    <p class="mt-3">A Vivare não se responsabiliza por eventos de força maior, desastres naturais, greves, falhas de internet ou qualquer outro evento fora do controle razoável da empresa.</p>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">10. Alterações nos Termos</h2>
    <p>A Vivare reserva-se o direito de alterar estes Termos e Condições a qualquer momento, sem aviso prévio. As alterações entram em vigor imediatamente após sua publicação no site. Recomendamos que você revise esta página periodicamente.</p>
</section>

<section>
    <h2 class="font-display text-xl font-medium text-ink mb-4">11. Foro e Legislação Aplicável</h2>
    <p>Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca de São Paulo — SP para dirimir quaisquer questões decorrentes destes Termos, renunciando-se a qualquer outro por mais privilegiado que seja.</p>
</section>

<section class="border-t border-primary/20 pt-10">
    <h2 class="font-display text-xl font-medium text-ink mb-4">Contato</h2>
    <p>Em caso de dúvidas sobre estes Termos, entre em contato conosco:</p>
    <ul class="mt-3 space-y-2">
        <li><strong>E-mail:</strong> <a href="mailto:contato@vivarestay.com" class="text-primary hover:underline">contato@vivarestay.com</a></li>
        <li><strong>WhatsApp:</strong> <a href="https://wa.me/5511985067840" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">+55 (11) 98506-7840</a></li>
    </ul>
</section>
`;

export default async function TermosPage() {
    const page = await getPublishedPageServer("termos");
    const title = page?.content?.pageTitle || "Termos e Condições";
    const bodyHtml = page?.content?.bodyHtml || FALLBACK_HTML;

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background-light dark:bg-background-dark">
            <div className="mx-auto max-w-3xl px-6 lg:px-10">
                <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Legal</span>
                <h1 className="font-display text-4xl md:text-5xl font-light text-ink dark:text-parchment mt-2 mb-4">{title}</h1>
                <span className="gold-line"></span>
                <p className="text-sm text-muted mb-12">Última atualização: Março de 2026</p>

                <div
                    className="space-y-10 text-sm leading-relaxed text-ink/80 dark:text-parchment/80"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
            </div>
        </main>
    );
}
