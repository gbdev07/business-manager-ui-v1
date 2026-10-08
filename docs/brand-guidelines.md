# Diretrizes de marca — KODA

Identidade visual da KODA, empresa de tecnologia focada em desenvolvimento de software, sistemas de gestão, plataformas SaaS, integrações e modernização de sistemas.

Estas diretrizes descrevem o sistema implementado no repositório. Não afirmam registro, disponibilidade de marca ou de domínio.

## Conceito

A KODA transforma problemas operacionais e ideias de negócio em soluções digitais eficientes, confiáveis e escaláveis.

A marca visual parte dessa prática. O símbolo recomendado, chamado Estrutura, é um canto construído e um módulo separado. O canto é o que já está de pé. O módulo é a próxima peça. Tecnologia aparece como construção, não como efeito.

Frase institucional provisória, centralizada em `src/lib/brand.ts`:

> Tecnologia que transforma ideias em soluções.

## Personalidade

A marca deve parecer moderna, confiável, inteligente, simples, próxima, competente, sólida e em evolução.

Não deve parecer uma empresa genérica de TI, uma agência ou uma startup futurista. A estética é minimalista, funcional e memorável. Sem gradiente neon, verde fluorescente, sombra exagerada, vidro decorativo ou ícone clichê de tecnologia.

## Paleta principal

| Nome | HEX | Uso |
| --- | --- | --- |
| Preto grafite | `#171917` | Fundos escuros, texto principal em fundo claro, áreas institucionais |
| Off-white | `#F4F1E8` | Fundos claros, superfícies, texto sobre o grafite |
| Verde natural | `#526B50` | Destaque, botões, módulo do símbolo, chamadas para ação |

Proporção de partida: 60% grafite, 30% off-white, 10% verde. É referência. Contraste e legibilidade vêm primeiro.

Contraste medido:

- Off-white sobre grafite: 15,65:1
- Off-white sobre verde natural: 5,20:1
- Grafite sobre verde natural: 3,01:1, insuficiente para texto. Texto sobre botão verde usa off-white, não grafite.

## Paleta auxiliar

Derivada da principal. Não compete com ela.

| Nome | HEX | Uso |
| --- | --- | --- |
| Verde hover | `#5A7258` | Hover do botão primário. Off-white continua em 4,67:1 |
| Verde ativo | `#415440` | Estado pressionado |
| Verde de texto | `#8B9A85` | Texto e links verdes sobre grafite, 5,94:1. Não substitui o verde oficial em áreas grandes |
| Cinza de texto | `#5C5952` | Texto secundário em fundo claro, 6,19:1 |
| Cinza de apoio | `#B7B2A6` | Texto secundário sobre grafite |
| Borda | `#D2CDBF` | Contornos e divisórias em fundo claro |
| Branco | `#FFFFFF` | Só quando o off-white não separa um campo |

No tema escuro, bordas passam a `#444744` e superfícies sobem um degrau a partir do grafite (`#20221F`, `#292A28`).

## Cores de produto

Somente em interfaces. Não entram no logotipo, no site institucional nem em papelaria.

| Nome | HEX |
| --- | --- |
| Sucesso | `#1F6B45` |
| Alerta | `#8A5A2A` |
| Erro | `#8E3B32` |

No tema escuro, o texto dessas mensagens clareia para manter contraste sobre o grafite. Os códigos acima continuam sendo a cor de referência em fundo claro.

## Tipografia

Família única: **Plus Jakarta Sans**.

Motivo: geométrica, contemporânea, boa em interface e com cobertura de português, incluindo acentos. Títulos e texto usam a mesma família. Não há segunda fonte.

| Papel | Peso | Tamanho | Entrelinha | Espaçamento |
| --- | --- | --- | --- | --- |
| Display | 500 | clamp(2.75rem, 6vw, 5.15rem) | 1.02 | -0.035em |
| Título | 600 | clamp(2.25rem, 4vw, 3.25rem) | 1.12 | -0.03em |
| Subtítulo | 600 | 1.5rem | 1.3 | -0.02em |
| Texto | 400 | 1.0625rem | 1.65 | 0 |
| Auxiliar | 500 | 0.875rem | 1.5 | 0 |
| Rótulo | 600 | 0.75rem | 1.4 | 0.18em, caixa alta |

Pesos em uso: 400, 500, 600 e 700. O 700 é raro.

O wordmark do logotipo é Plus Jakarta Sans SemiBold, com tracking curto, convertido em caminhos. A direção Wordmark de destaque usa Medium com tracking mais aberto. Licença da família: SIL Open Font License.

## Versões do logotipo

Conjunto aplicado, direção Estrutura, em `public/brand/`:

- `logo-primary.svg` — principal, empilhado
- `logo-horizontal.svg` — símbolo e nome na mesma linha
- `logo-compact.svg` — relação mais fechada
- `logo-symbol.svg` — símbolo em fundo claro
- `logo-symbol-on-dark.svg` — símbolo em fundo escuro
- `logo-monochrome.svg` — uma cor
- `logo-on-light.svg` — grafite e verde, para fundo claro
- `logo-on-dark.svg` — off-white e verde, para fundo escuro
- `favicon.svg` — placa de 32px
- `logo-gestao.svg`, `logo-barbearia.svg`, `logo-varejo.svg` — família de produtos

As alternativas permanecem em:

- `public/brand/concepts/a-wordmark/`
- `public/brand/concepts/b-estrutura/`
- `public/brand/concepts/c-modular/`

O favicon da aplicação está em `src/app/icon.svg`.

## Área de proteção

A margem mínima em volta do logotipo é a altura do módulo verde, um terço do lado do símbolo. Nenhum texto, ícone ou borda entra nessa área.

## Tamanho mínimo

- Símbolo: 16px de lado
- Versão horizontal: 20px de altura
- Abaixo disso, usar só o favicon ou o símbolo, nunca a versão horizontal comprimida

## Aplicações corretas

- Fundo off-white com a versão para fundo claro
- Fundo grafite com a versão para fundo escuro
- Uma cor só, na versão monocromática, quando a reprodução não sustenta o verde
- Símbolo isolado quando o nome não cabe, desde que o contexto já tenha apresentado a KODA
- Produtos futuros no formato KODA + descritor, com o mesmo símbolo

## Aplicações incorretas

- Esticar, comprimir ou rotacionar
- Aplicar sombra, brilho, contorno ou gradiente
- Trocar o verde natural por verde fluorescente ou por outra cor de destaque
- Usar grafite sobre grafite, ou verde sobre verde próximo
- Redesenhar o símbolo para cada produto
- Colocar o logotipo sobre fotografia sem uma área lisa de grafite ou off-white
- Usar as cores de sucesso, alerta ou erro como cor de marca

## Contraste

Texto corrido usa grafite no off-white ou off-white no grafite.

Verde natural pode ser texto sobre off-white (5,20:1). Sobre grafite, texto verde pequeno usa `#8B9A85`. O verde oficial sobre grafite fica reservado a formas, botões e ao módulo do símbolo. Como forma, o par atinge o mínimo de 3:1 para elemento gráfico.

Botão primário: fundo `#526B50`, texto `#F4F1E8`. Hover clareia só até o ponto em que o texto continua acima de 4,5:1.

## Utilização em fundos

- Fundo claro: estrutura em `#171917`, módulo em `#526B50`, nome em `#171917`
- Fundo escuro: estrutura em `#F4F1E8`, módulo em `#526B50`, nome em `#F4F1E8`
- Fundo fotográfico: aplicar uma área sólida antes do logotipo
- Fundos coloridos fora da paleta: não usar

## Uso em materiais digitais

Site, apresentação, rede social e assinatura de e-mail usam a versão horizontal sempre que a largura permite. Capas e avatares usam a versão principal ou o símbolo. Padrões de grade, módulos e linhas ficam em opacidade baixa e nunca atrás de texto.

## Uso em produtos SaaS

O produto herda símbolo, tipografia, raios, espaçamento e tokens. O nome do produto é uma segunda linha, como em KODA Gestão.

Tokens semânticos vivem em `src/styles/tokens.css`. Componentes leem `--color-background`, `--color-foreground`, `--color-primary` e os demais papéis, não os hexadecimais da paleta. O tema escuro reatribui esses papéis em `[data-theme="dark"]`.

Raios: 2, 4, 6 e 10 pixels. Sombras são curtas e opcionais. A separação padrão é a borda.

Cantos do símbolo são retos. Os cantos da interface são levemente arredondados. Essa diferença é intencional: a marca é ortogonal, o produto é preciso sem ficar agressivo.

## Breakpoints

Os breakpoints do sistema seguem a escala do Tailwind usada na apresentação:

- 40rem
- 48rem
- 64rem
- 80rem

A navegação lateral entra a partir de 64rem. Abaixo disso, a capa usa um menu em tela cheia.
