---
name: Vivare Stay
description: Hospedagem de alto padrão em SP, Santos e Guarujá. Dourado envelhecido sobre tinta e pergaminho, serifa editorial, interface que recua para a fotografia.
colors:
  gold: "#b89a5c"
  gold-light: "#d4b87a"
  gold-veil: "rgba(184, 154, 92, 0.12)"
  ink: "#0f0e0c"
  ink-card: "#161410"
  parchment: "#f7f8fa"
  paper: "#ffffff"
  warm-mid: "#e2e4e8"
  muted: "#7a7060"
  success: "hsl(152, 69%, 42%)"
  warning: "hsl(38, 92%, 50%)"
  error: "hsl(0, 72%, 51%)"
  info: "hsl(210, 100%, 50%)"
typography:
  display:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Cormorant Garamond, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "-0.01em"
  label:
    fontFamily: "Manrope, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.1em"
rounded:
  none: "0"
  sm: "0.25rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "1rem"
  2xl: "1.5rem"
  full: "9999px"
spacing:
  1: "0.25rem"
  2: "0.5rem"
  3: "0.75rem"
  4: "1rem"
  5: "1.25rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  20: "5rem"
  24: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.gold-light}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.625rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.gold}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.625rem 1.5rem"
  button-outline-hover:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
  button-search:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.ink}"
    rounded: "{rounded.2xl}"
    height: "60px"
    padding: "0 2rem"
  card:
    backgroundColor: "{colors.paper}"
    rounded: "{rounded.xl}"
    padding: "1.25rem"
  card-dark:
    backgroundColor: "{colors.ink-card}"
    rounded: "{rounded.xl}"
    padding: "1.25rem"
  input:
    backgroundColor: "{colors.parchment}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "0.75rem"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  nav-link-hover:
    textColor: "{colors.gold}"
---

# Design System: Vivare Stay

## Overview

**Creative North Star: "O Hotel Boutique Discreto"**

A Vivare se apresenta como um hotel boutique que não precisa gritar. O dourado envelhecido (#b89a5c) é acabamento, não parede: aparece em fios de 1 px, em letras pequenas em caixa alta, no texto de um botão escuro, na borda de um card no tema noturno. O que ocupa a tela é a fotografia dos apartamentos e, sobre ela, uma serifa editorial (Cormorant Garamond) com peso e tamanho para parecer um título de revista de arquitetura. O texto corrido é um sans humanista (Manrope) levemente apertado, legível no celular com uma mão. Um grão de ruído quase imperceptível cobre a página inteira e tira o aspecto de tela plástica.

Há dois mundos tonais, e os dois são a mesma casa: "tinta" (#0f0e0c) para o tema escuro e para o rodapé em qualquer tema, "pergaminho" (#f7f8fa) para o tema claro. Em ambos, os cards flutuam de leve sobre o fundo, com sombra ambiente discreta que cresce ao passar o mouse. A densidade é de hospitalidade, não de ferramenta: respiro generoso entre seções, poucos elementos por tela, uma ação principal por vez.

Direção confirmada para refinamentos: **flutuação suave** na profundidade e componentes **táteis e confiantes**. Botões cheios e com altura de toque, dourado como cor de ação no funil de busca e reserva, cards com presença. A contenção fica na tipografia, no espaço e na raridade do dourado como superfície.

**Key Characteristics:**
- Dourado envelhecido como detalhe de acabamento, raramente como fundo largo.
- Serifa Cormorant em títulos grandes; Manrope em tudo o que se lê de perto.
- Rótulos em caixa alta espaçada (0,1 em a 0,25 em) como assinatura tipográfica.
- Fotografia da unidade manda; a interface recua com vidro fosco e sobreposições escuras.
- Dois temas (claro e escuro) com os mesmos tokens de marca.
- Grão global sutil, linhas douradas de 1 px como separadores.

## Colors

Uma única cor de marca, o dourado, sobre dois neutros opostos e um conjunto pequeno de semânticas.

### Primary
- **Ouro Envelhecido** (#b89a5c): cor de marca. Texto de rótulos e links de navegação no hover, bordas finas, divisores, ícones de confiança (selo de empresa verificada, estrelas), fundo do botão de busca e dos botões de ação no funil, borda de card no tema escuro. Nunca como fundo de seção inteira.
- **Ouro Claro** (#d4b87a): texto dourado sobre tinta (botão primário escuro, títulos de coluna no rodapé). Existe porque o ouro base perde contraste sobre #0f0e0c.
- **Véu Dourado** (rgba(184, 154, 92, 0.12)): fundo de hover em itens de menu, chips e áreas de destaque suave.

### Neutral
- **Tinta** (#0f0e0c): fundo do tema escuro, fundo do rodapé em qualquer tema, texto principal no tema claro, fundo do botão primário.
- **Tinta de Card** (#161410): superfície de card no tema escuro, um passo acima da tinta.
- **Pergaminho** (#f7f8fa): fundo do tema claro, texto principal no tema escuro, fundo de campos de formulário.
- **Papel** (#ffffff): superfície de card no tema claro e painel de busca sobre a foto do hero (a 95% de opacidade com desfoque).
- **Cinza Morno** (#e2e4e8): bordas de card e divisores no tema claro, texto secundário no rodapé escuro.
- **Mudo** (#7a7060): texto auxiliar, legendas, metadados. Um cinza puxado para o dourado, nunca azulado.

### Semantic
- **Sucesso** (hsl(152, 69%, 42%)), **Aviso** (hsl(38, 92%, 50%)), **Erro** (hsl(0, 72%, 51%)), **Info** (hsl(210, 100%, 50%)): estados de formulário, confirmação de reserva e avisos. Cada uma tem uma variante clara a 95% de luminosidade para fundos de mensagem.

### Named Rules
**The Gold Trim Rule.** O dourado cobre no máximo um décimo de qualquer tela. Ele aparece em linhas, letras, ícones e no botão de ação; quando vira fundo, é de um botão, nunca de uma seção.

**The Two Inks Rule.** Texto sobre tinta usa Ouro Claro ou Pergaminho; texto sobre pergaminho usa Tinta ou Mudo. O Ouro base (#b89a5c) como texto corrido só é permitido em rótulos de 12 px ou mais, em peso 600 ou mais, e nunca para parágrafos.

## Typography

**Display Font:** Cormorant Garamond (com Georgia, serif)
**Body Font:** Manrope (com system-ui, sans-serif)

**Character:** uma serifa de alto contraste e formas antigas para o que é promessa (títulos, nomes de unidade, números de prova), e um sans humanista compacto para o que é instrução (texto, formulários, rótulos). O par soa como papelaria de hotel: a serifa assina, o sans informa.

### Hierarchy
- **Display** (700, clamp(2.25rem, 6vw, 4.5rem), 1.1, -0.02em): título do hero e aberturas de página. Branco sobre fotografia com sombra de texto, ou tinta sobre pergaminho.
- **Headline** (700, clamp(1.875rem, 4vw, 3rem), 1.2, -0.02em): título de seção da home, de página institucional e de artigo do blog.
- **Title** (600, 1.25rem, 1.3): nome da unidade no card, título de bloco em formulários e FAQ. Em Cormorant.
- **Body** (400, 1rem, 1.6, -0.01em): parágrafos e descrições. Largura máxima de leitura em torno de 65 caracteres nas páginas editoriais. Peso 300 para subtítulos sobre foto.
- **Label** (600, 0.75rem, 1.25, 0.1em, caixa alta): navegação, botões, rótulos de campo, títulos de coluna do rodapé (lá com 0.25em). Em Manrope. É a assinatura tipográfica mais repetida do site.
- **Micro** (400, 0.75rem a 0.8125rem): metadados de card (quartos, banheiros, hóspedes), legendas de preço "/noite", avisos legais.

### Named Rules
**The Serif Signs, Sans Informs Rule.** Cormorant só em títulos e números de prova. Qualquer texto que o hóspede precise ler para agir (campo, botão, erro, preço com centavos) é Manrope.

**The Spaced Caps Rule.** Rótulos em caixa alta sempre têm espaçamento de 0,1 em ou mais e nunca passam de 13 px. Caixa alta sem espaçamento não existe no sistema.

## Layout

Container central de 80 rem (max-w-7xl) com gutter de 1,5 rem no celular e 2,5 rem no desktop. Seções da home respiram de 5 rem a 6 rem verticais. A listagem de unidades usa duas colunas no desktop: grade de cards à esquerda e mapa fixo à direita; no celular o mapa some ou vai para baixo. A página da unidade tem conteúdo à esquerda e um painel de reserva pegajoso à direita, que vira barra fixa inferior no celular.

A escala de espaço é de base 8 px (0,25 rem a 6 rem). Cards usam 1,25 rem de preenchimento interno; formulários empilham campos com 1 rem a 1,5 rem. O cabeçalho é alto (100 px no celular, 120 px no desktop) para acomodar a logo com a árvore, e é pegajoso com vidro fosco a 90%.

Pontos de quebra seguem o Tailwind: 640, 768, 1024 e 1280 px. A navegação principal some abaixo de 768 px e vira menu de tela cheia sob o cabeçalho.

## Elevation & Depth

Sistema híbrido com viés para **flutuação suave**. Superfícies de card ficam levemente acima do fundo em repouso (sombra pequena mais borda de 1 px) e sobem ao passar o mouse (até 6 px de deslocamento e sombra dourada difusa). Sobre fotografia, a profundidade vem de vidro fosco (branco a 95% ou tinta a 90%, desfoque de 12 px) e de gradientes escuros de baixo para cima que garantem leitura do texto branco. No tema escuro, a borda dourada translúcida substitui boa parte da sombra, porque sombra sobre tinta não aparece.

### Shadow Vocabulary
- **Repouso** (`0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)`): card e botão em estado normal.
- **Hover** (`0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.06)`): card ao passar o mouse.
- **Levantar dourado** (`0 24px 48px -8px rgba(184, 154, 92, 0.18)`): cards de destaque com a classe de levantar; a sombra carrega a cor da marca.
- **Painel sobre foto** (`0 25px 50px -12px rgb(0 0 0 / 0.15)`): busca do hero e modais.

### Named Rules
**The Soft Float Rule.** Toda superfície interativa tem uma sombra de repouso e uma de hover. A diferença entre as duas é o feedback; nenhuma delas é dura o bastante para desenhar uma linha.

**The Dark Border Rule.** No tema escuro, a separação de superfícies vem da borda `rgba(184, 154, 92, 0.2)` e do passo tonal entre Tinta e Tinta de Card, não de sombra.

## Shapes

Duas linguagens de canto convivem de propósito. Os elementos de marca e navegação são **retos** (botões do cabeçalho, botão de WhatsApp, CTAs institucionais, raio zero), ecoando papelaria. Os elementos do funil de busca e reserva são **arredondados e táteis** (painel de busca com 1,5 rem, botão de busca com 1,5 rem, cards com 1 rem, campos com 0,75 rem), porque ali o hóspede toca e digita. Selos e contadores são pílulas completas. Bordas são sempre de 1 px; não há bordas grossas nem duplas. Imagens de card são cortadas em 4:3 e ganham zoom suave de 5% no hover.

## Components

### Buttons
Táteis e confiantes: altura mínima de 44 px no celular, texto em caixa alta espaçada, feedback de escala de 2% a 5% ao pressionar.
- **Shape:** retos no cabeçalho e CTAs institucionais (raio 0); arredondados no funil (0,75 rem a 1,5 rem).
- **Primary:** fundo Tinta, texto Ouro Claro, rótulo 12 px em caixa alta espaçada, preenchimento 0,625 rem por 1,5 rem. No tema escuro inverte para fundo Pergaminho e texto Tinta.
- **Hover / Focus:** fundo vira Ouro e texto vira Tinta; foco visível com anel de 2 px em Ouro e deslocamento de 2 px.
- **Outline (WhatsApp):** borda de 1 px em Ouro, texto Ouro, fundo transparente; no hover preenche com Ouro.
- **Search (hero e listagem):** fundo Ouro, texto Tinta, 60 px de altura, raio 1,5 rem, ícone de lupa à esquerda, sombra de painel.
- **Premium (reserva):** fundo quase preto (#1a1a1a), texto branco, sombra média; usado no botão de reservar e no checkout.

### Cards / Containers
- **Corner Style:** 1 rem.
- **Background:** Papel no tema claro, Tinta de Card no escuro.
- **Shadow Strategy:** repouso e hover do vocabulário acima; levantar de 2 px a 6 px no hover.
- **Border:** 1 px em Cinza Morno (claro) ou borda dourada translúcida (escuro).
- **Internal Padding:** 1,25 rem.
- **Card de unidade:** imagem 4:3 com gradiente escuro na base e preço em branco sobre a foto; abaixo, nome em Cormorant 600 de 1,125 rem em uma linha, bairro e cidade em Mudo, e três metadados com ícones de traço fino.

### Inputs / Fields
- **Style:** fundo Pergaminho, borda de 1 px em Cinza Morno, raio 0,75 rem, preenchimento 0,75 rem, texto 16 px (evita zoom no iOS).
- **Focus:** fundo vira Papel e anel de 2 px em Ouro com deslocamento.
- **Campos do painel de busca:** sem borda própria; vivem dentro do painel branco com rótulo em caixa alta espaçada acima, separados por fios verticais de 1 px no desktop.
- **Error / Disabled:** borda e mensagem em Erro; desabilitado a 50% de opacidade sem ponteiro.

### Navigation
- **Cabeçalho:** pegajoso, vidro fosco a 90%, borda inferior dourada translúcida, 100 px a 120 px de altura. Logo à esquerda, quatro links em rótulo de 12 px em caixa alta espaçada ao centro, botão outline de WhatsApp e botão primário "Reservar" à direita.
- **Estados:** link em Tinta ou Pergaminho, hover em Ouro; o link da seção atual pode ficar em Ouro.
- **Celular:** ícone de menu de 24 px; menu de tela cheia sob o cabeçalho com itens de 14 px, 0,75 rem de preenchimento vertical e fundo de hover em Véu Dourado; CTA de largura total ao final.
- **Rodapé:** sempre em Tinta, quatro colunas com títulos em Ouro a 0,25 em de espaçamento, texto em Cinza Morno de 12 px, selo de empresa verificada, CNPJ e endereço.

### Gold Line
Fio dourado de 1 px e 2,5 rem de largura, usado sob títulos de seção como marca de parágrafo; e o divisor de seção em gradiente que some nas pontas. São a assinatura gráfica mais barata e mais reconhecível do sistema.

## Do's and Don'ts

### Do:
- **Do** deixar a fotografia da unidade ocupar o maior espaço da tela e colocar o texto sobre ela só com gradiente escuro de base ou vidro fosco.
- **Do** usar Ouro Claro (#d4b87a) para qualquer texto dourado sobre Tinta; o Ouro base não passa em contraste ali.
- **Do** manter botões de ação do funil com 44 px ou mais de altura e raio arredondado; manter os do cabeçalho retos.
- **Do** dar a toda superfície interativa uma sombra de repouso e uma de hover (Soft Float Rule).
- **Do** usar rótulos em caixa alta com espaçamento de 0,1 em ou mais e tamanho de 12 px a 13 px.
- **Do** respeitar `prefers-reduced-motion`: o crossfade do hero vira imagem estática e as entradas por rolagem somem.

### Don't:
- **Don't** usar o dourado como fundo de seção ou de blocos largos; ele é acabamento.
- **Don't** usar Cormorant em texto de ação, campo, erro ou preço com centavos.
- **Don't** introduzir uma terceira cor de destaque (azul, verde, laranja) fora dos estados semânticos de formulário.
- **Don't** misturar cantos retos e arredondados dentro do mesmo grupo de botões.
- **Don't** usar sombras duras ou bordas acima de 1 px para separar superfícies.
- **Don't** colocar texto Mudo (#7a7060) sobre Tinta; no escuro o texto auxiliar é Cinza Morno.
