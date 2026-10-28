---
name: Vivare Stay
description: Hospedagem de alto padrão e gestão por temporada em SP, Santos e Guarujá. Bronze do logo sobre tinta verde e papel quente, títulos geométricos leves, interface que recua para a fotografia. Mesma identidade da apresentação comercial ao proprietário.
colors:
  bronze: "#a26e35"
  bronze-light: "#d8a767"
  bronze-deep: "#8a5c2a"
  bronze-glow: "#e4bb83"
  bronze-wash: "#f4ebdd"
  ink: "#16241d"
  green: "#22362b"
  green-raised: "#2b4236"
  sage: "#e6ece7"
  paper: "#faf8f4"
  white: "#ffffff"
  line: "#ded7ca"
  text: "#1e2622"
  muted: "#5c6761"
  on-ink-muted: "#b9c5bd"
  success: "#2f6b4a"
  warning: "#8f5f12"
  error: "#9b3b2e"
  info: "#3a5170"
typography:
  display:
    fontFamily: "Jost, Futura, Century Gothic, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 5.5rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "Jost, Futura, Century Gothic, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Jost, Futura, Century Gothic, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.2
  numeral:
    fontFamily: "Jost, Futura, Century Gothic, sans-serif"
    fontSize: "3rem"
    fontWeight: 300
    lineHeight: 1
    letterSpacing: "-0.02em"
  eyebrow:
    fontFamily: "Jost, Futura, Century Gothic, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.22em"
  body:
    fontFamily: "Source Sans 3, Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Source Sans 3, Segoe UI, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "0.1em"
rounded:
  none: "0"
  sm: "0.25rem"
  button: "0.375rem"
  md: "0.5rem"
  lg: "0.75rem"
  xl: "0.75rem"
  2xl: "1rem"
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
    textColor: "{colors.bronze-light}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.625rem 1.5rem"
  button-primary-hover:
    backgroundColor: "{colors.green}"
    textColor: "{colors.bronze-light}"
  button-accent:
    backgroundColor: "{colors.bronze-light}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0.75rem 1.5rem"
  button-accent-hover:
    backgroundColor: "{colors.bronze-glow}"
    textColor: "{colors.ink}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.bronze-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.625rem 1.5rem"
  button-search:
    backgroundColor: "{colors.bronze-light}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    height: "60px"
    padding: "0 2rem"
  card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.xl}"
    padding: "1.25rem"
  card-dark:
    backgroundColor: "{colors.green}"
    rounded: "{rounded.xl}"
    padding: "1.25rem"
  input:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: "0.75rem"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  nav-link-hover:
    textColor: "{colors.bronze-deep}"
---

# Design System: Vivare Stay

## Overview

**Creative North Star: "O Hotel Boutique Discreto"**

A identidade é a mesma da apresentação comercial ao proprietário (Apresentacao_Vivare_Proprietario, outubro de 2026): o site e o material de venda são a mesma casa. O bronze do logo (#a26e35) é acabamento, não parede. Ele aparece no traço antes do chapéu, no destaque de uma palavra do título, nos números grandes e leves, no fio de 2 px em cima de um pilar, no visto de uma lista. A tinta não é preta: é um verde quase preto (#16241d), o fundo da capa da apresentação, usado no rodapé, nos blocos de destaque e no tema escuro. O claro é papel quente (#faf8f4), não cinza.

Os títulos são em Jost, uma geométrica da mesma família do logotipo VIVARE, em peso leve (400 nos grandes, 500 nos pequenos). O texto corrido é Source Sans 3, legível no celular com uma mão. Não há serifa nem itálico em lugar nenhum: o destaque de uma palavra no título é bronze, em pé. Um grão de ruído quase imperceptível cobre a página e tira o aspecto de tela plástica.

Direção confirmada para refinamentos: **flutuação suave** na profundidade e componentes **táteis e confiantes**. Botões cheios e com altura de toque, bronze claro como cor de ação, cards com presença. A contenção fica na tipografia, no espaço e na raridade do bronze como superfície.

**Key Characteristics:**
- Bronze do logo como acabamento: traços, números, destaques, ícones; superfície só em botão e faixa estreita.
- Tinta verde quase preta e papel quente como os dois neutros opostos.
- Jost leve nos títulos; Source Sans 3 em tudo o que se lê de perto.
- Chapéu em caixa alta muito espaçada (0,22 em) com um traço de 22 px antes, como na apresentação.
- Fotografia da unidade manda; a interface recua com vidro fosco e sobreposições escuras.
- Dois temas (claro e escuro) com os mesmos tokens de marca.

## Colors

Uma cor de marca em três intensidades, dois neutros opostos com um verde intermediário, cinzas tingidos de verde e semânticas sóbrias.

### Primary
- **Bronze** (#a26e35): o dourado do logo. Traço do chapéu, destaque em título, números grandes, fio de pilar, ícones, visto de lista, anel de foco, marcador do mapa. Como texto, só a partir de 24 px (4,1:1 sobre papel).
- **Bronze Claro** (#d8a767): todo texto bronze sobre tinta (7,4:1) e o fundo dos botões de ação, com texto tinta por cima (7,4:1). É o botão da apresentação.
- **Bronze Profundo** (#8a5c2a): texto bronze pequeno sobre claro, chapéu no tema claro, links (5,4:1 sobre papel, 4,9:1 sobre Fundo Bronze).
- **Brilho Bronze** (#e4bb83): hover dos botões em Bronze Claro.
- **Fundo Bronze** (#f4ebdd): faixas de nota, ícone em círculo, intervalo de datas no calendário.

### Neutral
- **Tinta** (#16241d): verde quase preto. Fundo do tema escuro, rodapé, blocos de destaque, botão primário, dia escolhido no calendário.
- **Verde** (#22362b): card no tema escuro e bloco escuro dentro de seção clara.
- **Verde Elevado** (#2b4236): menus e superfícies interativas no tema escuro.
- **Verde Claro** (#e6ece7): avisos calmos e selos de segurança.
- **Papel** (#faf8f4): fundo do tema claro.
- **Branco** (#ffffff): cards no tema claro e painel de busca sobre a foto.
- **Linha** (#ded7ca): bordas de card e divisórias no claro.
- **Texto** (#1e2622): texto corrido no claro (14,6:1).
- **Suave** (#5c6761): texto secundário no claro (5,5:1).
- **Suave no escuro** (#b9c5bd): texto secundário sobre tinta (9:1).

A escala `neutral` do Tailwind foi trocada por cinzas tingidos de verde (50 #faf8f4 a 950 #0e1813), com a mesma luminância da escala padrão nos tons de texto. Assim todo `text-neutral-*` e `bg-neutral-*` herda a identidade sem editar componente por componente.

### Semantic
- **Sucesso** (#2f6b4a), **Aviso** (#8f5f12), **Erro** (#9b3b2e, o "negativo" da apresentação), **Info** (#3a5170). Todas passam de 4,5:1 como texto sobre branco. Cada uma tem uma variante clara para fundo de mensagem.

### Named Rules
**The Bronze Trim Rule.** O bronze cobre no máximo um décimo de qualquer tela. Quando vira superfície, é de um botão, de um selo ou de uma faixa estreita, sempre em Bronze Claro com texto Tinta.

**The Three Bronzes Rule.** Bronze Claro sobre tinta, Bronze Profundo para texto pequeno sobre claro, Bronze para tudo que é grande ou não é texto. Texto tinta nunca vai sobre o Bronze base (3,7:1).

## Typography

**Display Font:** Jost (com Futura, Century Gothic, sans-serif)
**Body Font:** Source Sans 3 (com Segoe UI, Helvetica Neue, Arial, sans-serif)

**Character:** uma geométrica leve, parente do logotipo, para o que é promessa (títulos, números de prova, chapéus), e um sans humanista para o que é instrução (texto, formulários, botões). O par soa como o material impresso da empresa: a geométrica assina, o humanista informa. As duas são fontes variáveis, carregadas pelo next/font, um arquivo para cada.

### Hierarchy
- **Display** (400, clamp(2.25rem, 6vw, 5.5rem), 1,05): título do hero e aberturas de página. Branco sobre fotografia com sombra de texto, ou tinta sobre papel. Uma palavra pode vir em bronze com `<em>`, sem itálico.
- **Headline** (400, clamp(1.875rem, 4vw, 3rem), 1,12): título de seção, de página institucional e de artigo.
- **Title** (500, 1,25 rem, 1,2): nome da unidade, título de pilar, card e bloco de formulário.
- **Numeral** (300, 3 rem ou mais, 1,0, bronze): números de etapa (01, 02), percentuais e provas, como os pilares da apresentação. Classe `.numeral`.
- **Chapéu** (Jost 500, 0,75 rem, 0,22 em, caixa alta, Bronze Profundo no claro e Bronze Claro no escuro, traço de 22 px antes): rótulo acima do título de seção. Classe `.chapeu`.
- **Body** (Source Sans 3 400, 1 rem, 1,55): parágrafos. Nunca em peso 300. Largura de leitura em torno de 65 caracteres nas páginas editoriais.
- **Label** (Source Sans 3 600, 0,75 rem, 0,1 em, caixa alta): navegação, botões, rótulos de campo.
- **Micro** (400, 0,75 rem a 0,8125 rem): metadados de card, legendas de preço, avisos legais.

### Named Rules
**The Geometric Signs, Humanist Informs Rule.** Jost só em títulos, números e chapéus. Texto que o hóspede precisa ler para agir (campo, botão, erro, preço com centavos) é Source Sans 3.

**The Upright Rule.** Não há itálico. Ênfase em título é cor (bronze); ênfase em texto é peso.

**The Spaced Caps Rule.** Caixa alta sempre com espaçamento de 0,1 em ou mais e no máximo 13 px.

## Layout

Container central de 80 rem (max-w-7xl) com gutter de 1,5 rem no celular e 2,5 rem no desktop. Seções respiram de 5 rem a 6 rem verticais. A listagem de unidades usa duas colunas no desktop: grade de cards à esquerda e mapa fixo à direita. A página da unidade tem conteúdo à esquerda e um painel de reserva pegajoso à direita, que vira barra fixa inferior no celular.

A escala de espaço é de base 8 px. Cards usam 1,25 rem de preenchimento interno. O cabeçalho tem 72 px no celular e 96 px a partir de 768 px.

Pontos de quebra seguem o Tailwind: 640, 768, 1024 e 1280 px.

## Elevation & Depth

**Flutuação suave.** Cards ficam levemente acima do fundo em repouso (sombra pequena e borda de 1 px em Linha) e sobem ao passar o mouse. As sombras são tingidas de tinta verde (`rgb(20 36 29 / …)`), como as folhas da apresentação sobre a mesa. Sobre fotografia, a profundidade vem de vidro fosco e de gradientes escuros de baixo para cima. No tema escuro, a separação vem da borda bronze translúcida e do passo entre Tinta, Verde e Verde Elevado.

### Shadow Vocabulary
- **Repouso** (`0 1px 3px 0 rgb(20 36 29 / 0.06), 0 1px 2px -1px rgb(20 36 29 / 0.05)`): card e botão em estado normal.
- **Hover** (`0 10px 15px -3px rgb(20 36 29 / 0.08), 0 4px 6px -4px rgb(20 36 29 / 0.05)`): card ao passar o mouse.
- **Levantar** (`0 24px 48px -8px rgba(22, 36, 29, 0.16)`): cards de destaque com a classe de levantar.
- **Painel** (`0 24px 48px -12px rgb(20 36 29 / 0.18)`): busca do hero e modais.

### Named Rules
**The Soft Float Rule.** Toda superfície interativa tem uma sombra de repouso e uma de hover. Nenhuma é dura o bastante para desenhar uma linha.

**The Dark Border Rule.** No tema escuro, a separação vem da borda `rgba(216, 167, 103, 0.25)` e do passo tonal entre os verdes, não de sombra.

## Shapes

Cantos discretos, como na apresentação (3 mm). Cards e painéis com 0,75 rem; botões cheios com 0,375 rem; campos com 0,75 rem. Botões do cabeçalho e CTAs institucionais podem ser retos. Selos são pílulas. Bordas são de 1 px; a única linha grossa é o fio de 2 px em Bronze no topo de um pilar. Imagens de card são cortadas em 4:3.

## Components

### Buttons
Táteis e confiantes: altura mínima de 44 px no celular, feedback de escala de 2% ao pressionar.
- **Accent (ação):** fundo Bronze Claro, texto Tinta, hover em Brilho Bronze. Busca do hero, CTA de proprietário, botões da listagem.
- **Primary:** fundo Tinta, texto Bronze Claro, hover em Verde. No tema escuro inverte para fundo Bronze Claro e texto Tinta. Reservar, enviar formulário.
- **Outline:** borda de 1 px em Bronze, texto Bronze Profundo, fundo transparente; no hover ganha Fundo Bronze.
- **Foco:** anel de 2 px em Bronze com deslocamento de 2 px.

### Cards / Containers
- **Corner Style:** 0,75 rem.
- **Background:** Branco no claro, Verde no escuro.
- **Border:** 1 px em Linha (claro) ou bronze translúcido (escuro).
- **Internal Padding:** 1,25 rem.
- **Card de unidade:** imagem 4:3; abaixo, nome em Jost 500, bairro e cidade em Suave, metadados com ícones de traço fino.
- **Bloco escuro:** fundo Tinta com chapéu e números em Bronze Claro, como o "contrato em poucas linhas" da apresentação.

### Pilares
Etapas e princípios numerados: fio de 2 px em Bronze no topo, número 01, 02… em `.numeral`, título em Title e texto em Suave. Alinhados à esquerda, sem card em volta.

### Inputs / Fields
- **Style:** fundo Papel, borda de 1 px em Linha, raio 0,75 rem, texto 16 px (evita zoom no iOS).
- **Focus:** fundo Branco e anel de 2 px em Bronze.
- **Error / Disabled:** borda e mensagem em Erro; desabilitado a 50% de opacidade.

### Calendário
Dia escolhido em Tinta com número em Bronze Claro; intervalo em Fundo Bronze. Dias de 44 px.

### Navigation
- **Cabeçalho:** pegajoso, vidro fosco, logo à esquerda, quatro links em Label ao centro, WhatsApp em outline e "Reservar" em Primary à direita.
- **Estados:** link em Tinta, hover e página atual em Bronze Profundo.
- **Rodapé:** sempre em Tinta, títulos de coluna em chapéu Bronze Claro, texto em Linha.

### Chapéu e fio
O chapéu (traço de 22 px e caixa alta espaçada) abre cada seção. O fio de 22 px por 1,5 px (`.gold-line`) pode fechar o título. São a assinatura gráfica mais barata e mais reconhecível do sistema.

## Do's and Don'ts

### Do:
- **Do** deixar a fotografia da unidade ocupar o maior espaço da tela.
- **Do** usar Bronze Claro para texto bronze sobre Tinta e Bronze Profundo para texto bronze pequeno sobre claro.
- **Do** destacar uma palavra do título com `<em>` em bronze, sem itálico.
- **Do** abrir seções com o chapéu e numerar etapas com pilares.
- **Do** manter botões com 44 px ou mais de altura.
- **Do** respeitar `prefers-reduced-motion`.

### Don't:
- **Don't** usar serifa ou itálico.
- **Don't** pôr texto Tinta sobre o Bronze base; use Bronze Claro.
- **Don't** usar o bronze como fundo de seção inteira.
- **Don't** usar preto puro ou cinza azulado; os escuros são verdes e os cinzas são tingidos de verde.
- **Don't** usar Source Sans 3 em peso 300.
- **Don't** introduzir uma terceira cor de destaque fora dos estados semânticos.
