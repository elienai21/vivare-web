# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Hóspede** (público principal do site): pessoa pesquisando e reservando hospedagem de temporada em São Paulo, Santos ou Guarujá. Na maioria das vezes está no celular, comparando com Airbnb e Booking, e decide rápido. Mais de 90% das reservas são de brasileiros; estrangeiros que entram em contato são direcionados às OTAs.
- **Proprietário** (público secundário): dono de studio, 1 ou 2 quartos, cobertura ou apartamento de condomínio clube nas mesmas cidades, avaliando entregar o imóvel à gestão da Vivare. Muitas vezes mora fora ou não quer operar o imóvel.
- **Equipe Vivare** usa o site apenas como vitrine; a operação (calendário, reservas, pagamentos) fica no CRM Stays.net.

Prioridade confirmada para esta revisão: **reserva do hóspede vem primeiro**. Em conflito de espaço ou atenção, a captação de proprietário cede.

## Product Purpose

Vitrine e canal de reserva direta das unidades geridas pela Vivare, e porta de entrada para proprietários que querem terceirizar a gestão. Sucesso para o hóspede é encontrar a unidade certa e reservar sem fricção; sucesso para a empresa é reserva direta (sem comissão de OTA) e lead qualificado de proprietário.

## Positioning

Três coisas que o hóspede não tem reservando a mesma unidade pelo Airbnb ou Booking, confirmadas pelo fundador:

1. **Preço melhor no direto**: reservar no site sai mais barato ou com condições melhores que nas plataformas (sem taxa de serviço da OTA, cupom Vivare, flexibilidade).
2. **Curadoria e atendimento**: imóveis selecionados a rigor, suporte humano por WhatsApp, check-in digital, sem depósito caução, sem fiador, sem burocracia.
3. **Gestão é o negócio**: a Vivare é uma gestora profissional de temporada, não um anfitrião individual. Isso sustenta a consistência de limpeza, manutenção e atendimento entre unidades.

Para o proprietário: gestão completa ("da criação do anúncio à troca da resistência do chuveiro"), cobrança só por comissão sobre reservas, repasse no 5º dia útil com relatório mensal, foco em alto padrão.

## Operating Context

- Unidades em São Paulo (Consolação, Pinheiros, Jardins, Moema, Vila Mariana, Vila Clementino, Vila Olímpia), Santos (Boqueirão) e Guarujá. Hoje 29 unidades ativas na Stays.
- Dados de unidades, preços, calendário e reservas vêm da API da Stays.net; o site é um front-end sobre esse CRM.
- O botão "Reservar" hoje envia o hóspede para o checkout hospedado da Stays (flag `NEXT_PUBLIC_USE_STAYS_HOSTED_CHECKOUT=1` na Vercel). Existe um checkout interno em `/reserva` (Stripe) desligado; está em estudo a troca para Asaas com PIX. **Fora do escopo desta revisão visual**: lógica de reserva e pagamento.
- Formulários de proprietário e de simulação não têm backend: montam uma mensagem e abrem o WhatsApp.
- Conteúdo editorial (blog, algumas páginas) vem do Firestore via área admin.
- Deploy na Vercel; analytics via gtag (GA4 + Google Ads) e GTM opcional.

## Capabilities and Constraints

- Stack: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, next-themes (tema claro e escuro, padrão do sistema), next/font (Manrope e Cormorant Garamond), Leaflet com tiles do OpenStreetMap.
- Rotas públicas no escopo: `/`, `/unidades`, `/unidades/[slug]`, `/reserva`, `/reserva/confirmacao`, `/blog`, `/blog/[slug]`, `/para-proprietarios`, `/para-proprietarios/simulacao`, `/sobre`, `/faq`, `/termos`, `/politica-de-privacidade`, `/politica-de-cancelamento`.
- Fora do escopo: `/admin`, rotas de API, Firestore, integração Stays, lógica de reserva e pagamento.
- Idioma único: português do Brasil. Sem i18n.
- Terminologia: "unidade" / "acomodação" para o imóvel; "proprietário" para o dono; "repasse" para o pagamento ao proprietário; "check-in digital".
- Desempenho: não piorar LCP da home e da página de unidade; imagens dimensionadas; sem bibliotecas de animação pesadas sem necessidade.
- SEO: preservar metadados, URLs, JSON-LD (Organization, WebSite) e canônicas.
- Não commitar, fazer push nem deploy sem OK explícito.

## Brand Commitments

- Nome: **Vivare** (domínio e e-mail usam "Vivare Stay": vivarestay.com). Perfis sociais ainda usam "vivare.locacoes" (Instagram e LinkedIn).
- Razão social: Vivare Gestão de Negócios Imobiliários Ltda., CNPJ 51.486.823/0001-00, Rua Rondinha, 180, Chácara Inglesa, São Paulo, SP.
- Contato público: WhatsApp +55 (11) 98506-7840, contato@vivarestay.com.
- Identidade visual vigente (fonte da verdade é o código, não `design-system/vivare/MASTER.md`, que está desatualizado): dourado `#b89a5c` como cor de marca, fundo escuro `#0f0e0c`, claro `#f7f8fa`, display em Cormorant Garamond, texto em Manrope. Logos em `public/new_logo_vivare*.svg` e `public/logo.png`.
- Voz: direta, hospitaleira, sem jargão imobiliário; promessas concretas ("sem caução, sem fiador") em vez de adjetivos.
- Manter identidade (logo, dourado, temas claro e escuro) em qualquer refinamento.

## Evidence on Hand

- **Números na home**: "4,82 · 747 avaliações", "Superhost no Airbnb · 4 anos", "100%", "Atuando desde 2022/2023". **São reais, mas desatualizados.** Os valores atuais serão fornecidos pelo fundador; até lá, não alterar nem remover, apenas reposicionar.
- **Depoimentos de proprietários** em `/para-proprietarios` (dois, com cidade e tipo de imóvel): reais, mantidos.
- Fotos das unidades vêm da Stays (fotografia profissional). Não há banco de fotos próprio no repositório além do OG image e logos.
- História do fundador (Elienai Cordeiro) em `/sobre`.
- FAQ de hóspede e FAQ de operação para proprietário já escritos.
- **Ausências que não podem ser inventadas**: prêmios, selos além do Superhost, número de hóspedes atendidos, avaliações por unidade no site, logos de imprensa, casos com nomes de proprietários.

## Product Principles

1. **Celular primeiro, reserva primeiro.** Toda decisão de layout é testada a 390 px com o polegar; o caminho busca → unidade → reservar nunca perde para outro conteúdo.
2. **Provar com o que existe.** Avaliações, Superhost, tempo de operação e depoimentos reais ganham lugar; nada é inventado ou inflado.
3. **Direto vale a pena.** A vantagem de reservar no site em vez da OTA precisa estar visível onde a decisão acontece: card, página da unidade e checkout.
4. **Gestora, não anfitrião.** A consistência operacional (limpeza, manutenção, atendimento humano) é a mensagem para os dois públicos.
5. **Refinar, não reinventar.** A identidade dourado/escuro e as fontes atuais ficam; a revisão corrige hierarquia, ritmo, acessibilidade e acabamento.

## Accessibility & Inclusion

- Mínimo WCAG AA: contraste de texto, foco visível, alvos de toque de 44 px, respeito a `prefers-reduced-motion`.
- Dois temas (claro e escuro) precisam passar nos mesmos critérios.
- Formulários com rótulos visíveis e mensagens de erro em português claro.
