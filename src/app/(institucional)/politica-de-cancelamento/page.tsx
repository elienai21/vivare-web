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
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">1. Visão Geral</h2>
    <p>A Vivare preza pela transparência e flexibilidade. Entendemos que imprevistos acontecem, por isso oferecemos condições claras de cancelamento para que você se sinta seguro ao reservar conosco.</p>
    <p class="mt-3">Esta política se aplica a todas as reservas realizadas diretamente pelo site da Vivare. Reservas feitas por plataformas terceiras (Airbnb, Booking.com) seguem as políticas de cancelamento da respectiva plataforma.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">2. Cancelamento pelo Hóspede</h2>
    <div class="mt-6 space-y-6">
        <div class="border border-primary/20 p-6 bg-white dark:bg-ink">
            <h3 class="font-semibold text-ink dark:text-parchment mb-2">✅ Cancelamento Gratuito</h3>
            <p><strong>Até 14 dias antes do check-in:</strong> reembolso integral de 100% do valor pago.</p>
        </div>
        <div class="border border-primary/20 p-6 bg-white dark:bg-ink">
            <h3 class="font-semibold text-ink dark:text-parchment mb-2">⏰ Cancelamento Parcial</h3>
            <p><strong>Entre 14 e 7 dias antes do check-in:</strong> reembolso de 50% do valor total da reserva.</p>
        </div>
        <div class="border border-primary/20 p-6 bg-white dark:bg-ink">
            <h3 class="font-semibold text-ink dark:text-parchment mb-2">🚫 Sem Reembolso</h3>
            <p><strong>Menos de 7 dias antes do check-in:</strong> não há reembolso. O valor integral é retido como taxa de cancelamento.</p>
        </div>
    </div>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">3. Cancelamento pela Vivare</h2>
    <p>Em casos excepcionais, a Vivare pode precisar cancelar uma reserva. Nessa situação:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li>Reembolso integral de 100%;</li>
        <li>Acomodação alternativa de padrão equivalente ou superior;</li>
        <li>Crédito de 10% sobre o valor da reserva para uso futuro.</li>
    </ul>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">4. Como Solicitar o Cancelamento</h2>
    <p>Entre em contato conosco:</p>
    <ul class="mt-4 space-y-3">
        <li>📧 E-mail: <a href="mailto:contato@vivarestay.com" class="text-primary hover:underline">contato@vivarestay.com</a></li>
        <li>💬 WhatsApp: <a href="https://wa.me/5511985067840" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">+55 (11) 98506-7840</a></li>
    </ul>
    <p class="mt-4">Informe o <strong>código da reserva</strong>, o <strong>nome do titular</strong> e o <strong>motivo do cancelamento</strong>. O reembolso será processado em até <strong>7 dias úteis</strong>.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">5. Alterações de Data</h2>
    <p>Se você precisa alterar as datas da sua estadia, entre em contato conosco. Alterações estão sujeitas à disponibilidade e podem incorrer em diferença de tarifa, mas <strong>não incidimos taxa de alteração</strong>.</p>
</section>
<section>
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">6. Reservas de Longa Duração</h2>
    <p>Para estadias de 28 noites ou mais:</p>
    <ul class="list-disc list-inside mt-3 space-y-2 ml-4">
        <li><strong>Até 30 dias antes do check-in:</strong> reembolso integral;</li>
        <li><strong>Menos de 30 dias antes:</strong> reembolso de 50% do primeiro mês;</li>
        <li><strong>Após o check-in:</strong> cancelamento com 30 dias de aviso prévio.</li>
    </ul>
</section>
<section class="border-t border-primary/20 pt-10">
    <h2 class="font-display text-xl font-medium text-ink dark:text-parchment mb-4">Resumo Rápido</h2>
    <table class="w-full text-left border-collapse">
        <thead><tr class="border-b border-primary/20"><th class="py-3 pr-4 font-semibold">Prazo</th><th class="py-3 font-semibold">Reembolso</th></tr></thead>
        <tbody class="text-sm">
            <tr class="border-b border-primary/10"><td class="py-3 pr-4">+14 dias antes do check-in</td><td class="py-3 text-primary font-semibold">100%</td></tr>
            <tr class="border-b border-primary/10"><td class="py-3 pr-4">7 a 14 dias antes</td><td class="py-3 font-semibold">50%</td></tr>
            <tr class="border-b border-primary/10"><td class="py-3 pr-4">Menos de 7 dias</td><td class="py-3 text-red-500 font-semibold">Sem reembolso</td></tr>
            <tr><td class="py-3 pr-4">Cancelado pela Vivare</td><td class="py-3 text-primary font-semibold">100% + alternativa ou crédito</td></tr>
        </tbody>
    </table>
</section>
`;

export default async function CancelamentoPage() {
    const page = await getPublishedPageServer("politica-de-cancelamento");
    const title = page?.content?.pageTitle || "Política de Cancelamento";
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
