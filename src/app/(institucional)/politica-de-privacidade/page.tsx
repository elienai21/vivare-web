import type { Metadata } from "next";
import { getPublishedPageServer } from "@/services/cmsServiceServer";

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPublishedPageServer("politica-de-privacidade");
    return {
        title: page?.content?.pageTitle || "Política de Privacidade",
        description: page?.metaDescription || "Saiba como a Vivare coleta, usa e protege seus dados pessoais de acordo com a LGPD.",
        alternates: { canonical: "/politica-de-privacidade" },
    };
}

const FALLBACK_HTML = `
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">1. Introdução</h2>
    <p>A Vivare Gestão de Negócios Imobiliários Ltda. ("Vivare"), inscrita no CNPJ 51.486.823/0001-00, com sede na Rua Rondinha, 180, Chácara Inglesa, São Paulo — SP, está comprometida com a proteção dos dados pessoais de seus usuários, hóspedes e proprietários parceiros.</p>
    <p class="mt-3">Esta Política de Privacidade descreve como coletamos, utilizamos, armazenamos e protegemos seus dados pessoais ao utilizar nosso site e serviços.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">2. Dados que Coletamos</h2>
    <p>Podemos coletar os seguintes tipos de dados pessoais:</p>
    <h3 class="font-semibold text-ink dark:text-parchment mt-4 mb-2">2.1. Dados fornecidos diretamente por você:</h3>
    <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Nome completo;</li><li>Endereço de e-mail;</li><li>Número de telefone/WhatsApp;</li>
        <li>CPF ou documento de identidade (para check-in);</li><li>Endereço do imóvel (para proprietários);</li>
        <li>Informações sobre o imóvel (tipo, metragem, localização).</li>
    </ul>
    <h3 class="font-semibold text-ink dark:text-parchment mt-4 mb-2">2.2. Dados coletados automaticamente:</h3>
    <ul class="list-disc list-inside space-y-2 ml-4">
        <li>Endereço IP;</li><li>Tipo de navegador e dispositivo;</li>
        <li>Páginas visitadas e tempo de permanência;</li><li>Cookies e tecnologias similares.</li>
    </ul>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">3. Finalidade do Tratamento</h2>
    <p>Utilizamos seus dados pessoais para as seguintes finalidades:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li><strong>Execução de contrato:</strong> processar reservas, gerenciar check-in/check-out, enviar confirmações;</li>
        <li><strong>Comunicação:</strong> responder solicitações, enviar informações sobre sua estadia ou proposta de gestão;</li>
        <li><strong>Marketing (com consentimento):</strong> enviar newsletters, promoções e novidades;</li>
        <li><strong>Segurança:</strong> verificação de identidade para check-in digital;</li>
        <li><strong>Melhoria dos serviços:</strong> análise de uso do site para aprimorar a experiência do usuário;</li>
        <li><strong>Obrigação legal:</strong> cumprimento de obrigações fiscais e legais.</li>
    </ul>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">4. Base Legal (LGPD Art. 7º)</h2>
    <p>O tratamento dos seus dados pessoais é realizado com base nas seguintes hipóteses legais:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li><strong>Consentimento</strong> (Art. 7º, I) — para envio de comunicações de marketing;</li>
        <li><strong>Execução de contrato</strong> (Art. 7º, V) — para processar reservas e serviços;</li>
        <li><strong>Interesse legítimo</strong> (Art. 7º, IX) — para melhoria dos serviços e segurança;</li>
        <li><strong>Cumprimento de obrigação legal</strong> (Art. 7º, II) — para obrigações fiscais e regulatórias.</li>
    </ul>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">5. Compartilhamento de Dados</h2>
    <p>Seus dados pessoais podem ser compartilhados com:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li><strong>Plataformas de reserva:</strong> Airbnb, Booking.com, Stays.net — para efetivação das reservas;</li>
        <li><strong>Processadores de pagamento:</strong> Stripe — para processamento seguro de pagamentos;</li>
        <li><strong>Prestadores de serviço:</strong> equipes de limpeza e manutenção — apenas dados operacionais necessários;</li>
        <li><strong>Autoridades públicas:</strong> quando exigido por lei ou decisão judicial.</li>
    </ul>
    <p class="mt-3">A Vivare <strong>não vende, aluga ou comercializa</strong> seus dados pessoais com terceiros para fins de marketing.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">6. Cookies</h2>
    <p>Utilizamos cookies para melhorar sua experiência no site.</p>
    <p class="mt-3">Você pode desabilitar cookies nas configurações do seu navegador, mas isso pode afetar algumas funcionalidades do site.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">7. Seus Direitos (LGPD Art. 18)</h2>
    <p>Como titular dos dados, você tem os seguintes direitos:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li><strong>Confirmação e acesso:</strong> saber se tratamos seus dados e obter uma cópia;</li>
        <li><strong>Correção:</strong> solicitar a atualização de dados incompletos ou desatualizados;</li>
        <li><strong>Anonimização ou eliminação:</strong> solicitar a exclusão de dados desnecessários;</li>
        <li><strong>Portabilidade:</strong> solicitar a transferência de seus dados para outro fornecedor;</li>
        <li><strong>Revogação do consentimento:</strong> retirar seu consentimento a qualquer momento;</li>
        <li><strong>Oposição:</strong> opor-se ao tratamento realizado com base em interesse legítimo.</li>
    </ul>
    <p class="mt-3">Para exercer qualquer um desses direitos, entre em contato através do e-mail <a href="mailto:contato@vivarestay.com" class="text-primary hover:underline">contato@vivarestay.com</a>.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">8. Armazenamento e Segurança</h2>
    <p>Seus dados pessoais são armazenados em servidores seguros com criptografia. Os dados de pagamento são processados exclusivamente pelo Stripe e <strong>não são armazenados</strong> em nossos servidores.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">9. Retenção de Dados</h2>
    <p>Seus dados pessoais são retidos pelo período necessário para cumprir as finalidades descritas nesta política, ou conforme exigido por lei. Dados de reservas são mantidos por 5 (cinco) anos para fins fiscais e legais.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">10. Alterações nesta Política</h2>
    <p>A Vivare reserva-se o direito de atualizar esta Política de Privacidade a qualquer momento.</p>
</section>
<section class="border-t border-primary/20 pt-10">
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">Contato do Encarregado (DPO)</h2>
    <p>Para questões relacionadas à proteção de dados pessoais:</p>
    <ul class="mt-3 space-y-2">
        <li><strong>E-mail:</strong> <a href="mailto:contato@vivarestay.com" class="text-primary hover:underline">contato@vivarestay.com</a></li>
        <li><strong>WhatsApp:</strong> <a href="https://wa.me/5511985067840" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">+55 (11) 98506-7840</a></li>
        <li><strong>Endereço:</strong> Rua Rondinha, 180, Chácara Inglesa, São Paulo — SP</li>
    </ul>
</section>
`;

export default async function PrivacidadePage() {
    const page = await getPublishedPageServer("politica-de-privacidade");
    const title = page?.content?.pageTitle || "Política de Privacidade";
    const bodyHtml = page?.content?.bodyHtml || FALLBACK_HTML;

    return (
        <main className="min-h-screen pt-32 pb-20 bg-background-light dark:bg-background-dark">
            <div className="mx-auto max-w-3xl px-6 lg:px-10">
                <span className="text-xs font-bold uppercase tracking-[.3em] text-primary">Legal</span>
                <h1 className="font-display text-4xl md:text-5xl font-light text-ink dark:text-parchment mt-2 mb-4">{title}</h1>
                <span className="gold-line"></span>
                <p className="text-sm text-muted mb-12">Última atualização: Março de 2026 · Em conformidade com a LGPD</p>

                <div
                    className="space-y-10 text-sm leading-relaxed text-ink/80 dark:text-parchment/80"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
            </div>
        </main>
    );
}
