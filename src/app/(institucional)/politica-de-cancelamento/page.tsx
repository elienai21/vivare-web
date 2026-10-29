import type { Metadata } from "next";
import { getPublishedPageServer } from "@/services/cmsServiceServer";

export async function generateMetadata(): Promise<Metadata> {
    const page = await getPublishedPageServer("politica-de-cancelamento");
    return {
        title: page?.content?.pageTitle || "Política de Cancelamento",
        description: page?.metaDescription || "Entenda a política de cancelamento e reembolso das reservas na Vivare. Cancelamento flexível e transparente.",
        alternates: { canonical: "/politica-de-cancelamento" },
    };
}

const FALLBACK_HTML = `
<section>
    <h2 class="font-display text-2xl font-semibold text-ink dark:text-parchment mt-2 mb-4">1. Visão Geral</h2>
    <p>A Vivare preza pela transparência e flexibilidade. Entendemos que imprevistos acontecem, por isso oferecemos condições claras de cancelamento para que você se sinta seguro ao reservar conosco.</p>
    <p class="mt-3">Esta política se aplica a todas as reservas realizadas diretamente pelo site da Vivare. Reservas feitas por plataformas terceiras (Airbnb, Booking.com) seguem as políticas de cancelamento da respectiva plataforma.</p>
</section>
<section aria-labelledby="resumo">
    <h2 id="resumo" class="font-display text-2xl font-semibold text-ink dark:text-parchment mb-4">Resumo: quanto é reembolsado</h2>
    <table class="w-full text-left border-collapse text-base">
        <caption class="sr-only">Reembolso por prazo de cancelamento, contado até a data do check-in</caption>
        <thead><tr class="border-b border-primary/20"><th scope="col" class="py-3 pr-4 font-semibold">Cancelamento</th><th scope="col" class="py-3 font-semibold text-right">Reembolso</th></tr></thead>
        <tbody>
            <tr class="border-b border-primary/10"><td class="py-3 pr-4">14 dias ou mais antes do check-in</td><td class="py-3 font-semibold text-right tabular-nums">100%</td></tr>
            <tr class="border-b border-primary/10"><td class="py-3 pr-4">De 13 a 7 dias antes</td><td class="py-3 font-semibold text-right tabular-nums">50%</td></tr>
            <tr class="border-b border-primary/10"><td class="py-3 pr-4">6 dias ou menos antes</td><td class="py-3 font-semibold text-right">Sem reembolso</td></tr>
            <tr><td class="py-3 pr-4">Cancelado pela Vivare</td><td class="py-3 font-semibold text-right">100% + alternativa ou crédito</td></tr>
        </tbody>
    </table>
    <p class="mt-3 text-sm">Exemplo: para um check-in no dia 20, cancelar até o dia 6 devolve 100%; do dia 7 ao dia 13, 50%; a partir do dia 14, não há reembolso.</p>
</section>
<section>
    <h2 class="font-display text-2xl font-semibold text-ink dark:text-parchment mt-2 mb-4">2. Cancelamento pelo Hóspede</h2>
    <div class="mt-6 space-y-6">
        <div class="border border-primary/20 p-6 bg-paper dark:bg-ink-card rounded-xl">
            <h3 class="font-display text-xl font-semibold text-ink dark:text-parchment mb-2">Cancelamento gratuito</h3>
            <p><strong>14 dias ou mais antes do check-in:</strong> reembolso integral de 100% do valor pago.</p>
        </div>
        <div class="border border-primary/20 p-6 bg-paper dark:bg-ink-card rounded-xl">
            <h3 class="font-display text-xl font-semibold text-ink dark:text-parchment mb-2">Cancelamento parcial</h3>
            <p><strong>De 13 a 7 dias antes do check-in:</strong> reembolso de 50% do valor total da reserva.</p>
        </div>
        <div class="border border-primary/20 p-6 bg-paper dark:bg-ink-card rounded-xl">
            <h3 class="font-display text-xl font-semibold text-ink dark:text-parchment mb-2">Sem reembolso</h3>
            <p><strong>6 dias ou menos antes do check-in:</strong> não há reembolso. O valor integral é retido como taxa de cancelamento.</p>
        </div>
    </div>
</section>
<section>
    <h2 class="font-display text-2xl font-semibold text-ink dark:text-parchment mt-2 mb-4">3. Cancelamento pela Vivare</h2>
    <p>Em casos excepcionais, a Vivare pode precisar cancelar uma reserva. Nessa situação:</p>
    <ul class="list-disc list-outside mt-3 space-y-2 pl-5">
        <li>Reembolso integral de 100%;</li>
        <li>Acomodação alternativa de padrão equivalente ou superior;</li>
        <li>Crédito de 10% sobre o valor da reserva para uso futuro.</li>
    </ul>
</section>
<section>
    <h2 class="font-display text-2xl font-semibold text-ink dark:text-parchment mt-2 mb-4">4. Como Solicitar o Cancelamento</h2>
    <p>Entre em contato conosco:</p>
    <ul class="mt-4 space-y-3">
        <li>E-mail: <a href="mailto:contato@vivarestay.com" class="font-semibold text-primary-deep dark:text-primary-light underline underline-offset-4">contato@vivarestay.com</a></li>
        <li>WhatsApp: <a href="https://wa.me/5511985067840" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary-deep dark:text-primary-light underline underline-offset-4">+55 (11) 98506-7840</a></li>
    </ul>
    <p class="mt-4">Informe o <strong>código da reserva</strong>, o <strong>nome do titular</strong> e o <strong>motivo do cancelamento</strong>. O reembolso será processado em até <strong>7 dias úteis</strong>.</p>
</section>
<section>
    <h2 class="font-display text-2xl font-semibold text-ink dark:text-parchment mt-2 mb-4">5. Alterações de Data</h2>
    <p>Se você precisa alterar as datas da sua estadia, entre em contato conosco. Alterações estão sujeitas à disponibilidade e podem incorrer em diferença de tarifa, mas <strong>não incidimos taxa de alteração</strong>.</p>
</section>
<section>
    <h2 class="font-display text-2xl font-semibold text-ink dark:text-parchment mt-2 mb-4">6. Reservas de Longa Duração</h2>
    <p>Para estadias de 28 noites ou mais:</p>
    <ul class="list-disc list-outside mt-3 space-y-2 pl-5">
        <li><strong>Até 30 dias antes do check-in:</strong> reembolso integral;</li>
        <li><strong>Menos de 30 dias antes:</strong> reembolso de 50% do primeiro mês;</li>
        <li><strong>Após o check-in:</strong> cancelamento com 30 dias de aviso prévio.</li>
    </ul>
</section>

`;

export default async function CancelamentoPage() {
    const page = await getPublishedPageServer("politica-de-cancelamento");
    const title = page?.content?.pageTitle || "Política de Cancelamento";
    const bodyHtml = page?.content?.bodyHtml || FALLBACK_HTML;

    return (
        <main className="min-h-screen pt-10 md:pt-14 pb-20 bg-background-light dark:bg-background-dark">
            <div className="mx-auto max-w-3xl px-6 lg:px-10">
                <span className="text-xs font-bold uppercase tracking-[.3em] text-primary-deep dark:text-primary-light">Legal</span>
                <h1 className="font-display text-4xl md:text-5xl font-light text-ink dark:text-parchment mt-2 mb-4">{title}</h1>
                <span className="gold-line"></span>
                <p className="text-sm text-secondary-text mb-12">Última atualização: Março de 2026</p>

                <div
                    className="space-y-10 text-base leading-[1.7] max-w-[68ch] text-ink/80 dark:text-parchment/80"
                    dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
            </div>
        </main>
    );
}
