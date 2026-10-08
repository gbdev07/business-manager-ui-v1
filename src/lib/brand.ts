export const brandName = "KODA";

export const tagline = "Tecnologia que transforma ideias em soluções.";

export const sections = [
  { id: "hero", index: "01", label: "Capa" },
  { id: "conceito", index: "02", label: "Conceito" },
  { id: "logotipos", index: "03", label: "Logotipos" },
  { id: "paleta", index: "04", label: "Paleta" },
  { id: "tipografia", index: "05", label: "Tipografia" },
  { id: "elementos", index: "06", label: "Elementos" },
  { id: "aplicacoes", index: "07", label: "Aplicações" },
  { id: "componentes", index: "08", label: "Componentes" },
] as const;

export type SwatchTone = "light" | "dark";

export type Swatch = {
  name: string;
  hex: string;
  usage: string;
  tone: SwatchTone;
};

export const palette: {
  primary: Swatch[];
  auxiliary: Swatch[];
  semantic: Swatch[];
} = {
  primary: [
    {
      name: "Preto grafite",
      hex: "#171917",
      usage: "Fundos escuros, texto principal em fundo claro e áreas institucionais.",
      tone: "dark",
    },
    {
      name: "Off-white",
      hex: "#F4F1E8",
      usage: "Fundos claros, superfícies e texto sobre o grafite.",
      tone: "light",
    },
    {
      name: "Verde natural",
      hex: "#526B50",
      usage: "Destaque, botões, módulo do símbolo e chamadas para ação.",
      tone: "dark",
    },
  ],
  auxiliary: [
    {
      name: "Verde hover",
      hex: "#5A7258",
      usage: "Estado de hover dos botões primários, ainda com texto off-white.",
      tone: "dark",
    },
    {
      name: "Verde ativo",
      hex: "#415440",
      usage: "Estado pressionado e ênfase mais fechada.",
      tone: "dark",
    },
    {
      name: "Verde de texto",
      hex: "#8B9A85",
      usage: "Links e rótulos verdes sobre fundo grafite. Não substitui o verde oficial em áreas grandes.",
      tone: "light",
    },
    {
      name: "Cinza de texto",
      hex: "#5C5952",
      usage: "Texto secundário em superfícies claras.",
      tone: "dark",
    },
    {
      name: "Cinza de apoio",
      hex: "#B7B2A6",
      usage: "Texto secundário e metadados sobre o grafite.",
      tone: "light",
    },
    {
      name: "Borda",
      hex: "#D2CDBF",
      usage: "Contornos, divisórias e campos em fundo claro.",
      tone: "light",
    },
    {
      name: "Branco",
      hex: "#FFFFFF",
      usage: "Somente quando o off-white não separa um campo do fundo.",
      tone: "light",
    },
  ],
  semantic: [
    {
      name: "Sucesso",
      hex: "#1F6B45",
      usage: "Confirmações em produtos. Não usar como cor de marca.",
      tone: "dark",
    },
    {
      name: "Alerta",
      hex: "#8A5A2A",
      usage: "Avisos de atenção em interfaces de produto.",
      tone: "dark",
    },
    {
      name: "Erro",
      hex: "#8E3B32",
      usage: "Erros e bloqueios em interfaces de produto.",
      tone: "dark",
    },
  ],
};

export const personality = [
  { name: "Moderna", text: "Contemporânea sem perseguir tendência." },
  { name: "Confiável", text: "Estável na forma, no contraste e no tom." },
  { name: "Inteligente", text: "Precisa, sem precisar explicar que é técnica." },
  { name: "Simples", text: "Poucas peças, cada uma com função." },
  { name: "Próxima", text: "Direta com o cliente, sem informalidade artificial." },
  { name: "Competente", text: "A qualidade aparece no encaixe, não no efeito." },
  { name: "Sólida", text: "Formas ortogonais, peso visual constante." },
  { name: "Em evolução", text: "O módulo solto é a próxima peça do sistema." },
];

export const values = [
  {
    name: "Clareza",
    text: "A interface e a marca mostram a estrutura do problema antes de decorá-lo.",
  },
  {
    name: "Confiança",
    text: "Contraste, consistência e previsibilidade valem mais do que novidade visual.",
  },
  {
    name: "Evolução modular",
    text: "Produtos novos entram na mesma linguagem. Não nasce uma marca a cada sistema.",
  },
  {
    name: "Proximidade",
    text: "O discurso é de quem constrói junto com a operação do cliente.",
  },
];

export const typeScale = [
  {
    role: "Display",
    sample: "Tecnologia que transforma ideias em soluções.",
    meta: "Plus Jakarta Sans Medium · clamp 2.75–5.15rem · entrelinha 1.02 · tracking -0.035em",
    className:
      "text-[clamp(2rem,4vw,3.25rem)] font-medium leading-[1.05] tracking-[-0.035em] text-balance",
  },
  {
    role: "Título",
    sample: "Sistemas que sustentam a operação.",
    meta: "Semibold · clamp 2.25–3.25rem · entrelinha 1.12 · tracking -0.03em",
    className: "text-[clamp(1.75rem,3vw,2.4rem)] font-semibold leading-[1.12] tracking-[-0.03em]",
  },
  {
    role: "Subtítulo",
    sample: "Arquitetura, produto e integração no mesmo desenho.",
    meta: "Semibold · 1.5rem · entrelinha 1.3",
    className: "text-2xl font-semibold leading-snug tracking-[-0.02em]",
  },
  {
    role: "Texto",
    sample:
      "A KODA projeta sistemas sob medida, plataformas SaaS e integrações para empresas que precisam digitalizar a operação sem trocar de fornecedor a cada etapa.",
    meta: "Regular · 1.0625rem · entrelinha 1.65",
    className: "text-[1.0625rem] font-normal leading-[1.65]",
  },
  {
    role: "Auxiliar",
    sample: "Versão horizontal · altura mínima de 20px · área de proteção igual ao módulo.",
    meta: "Medium · 0.875rem · entrelinha 1.5 · cor de texto secundário",
    className: "text-sm font-medium leading-normal text-muted",
  },
  {
    role: "Rótulo",
    sample: "Identidade visual",
    meta: "Semibold · 0.75rem · caixa alta · tracking 0.18em",
    className: "text-xs font-semibold tracking-[0.18em] text-primary-text uppercase",
  },
];

export const spacingScale = [4, 8, 12, 16, 24, 32, 48, 64];

export const radii = [
  { name: "xs", value: "2px" },
  { name: "sm", value: "4px" },
  { name: "md", value: "6px" },
  { name: "lg", value: "10px" },
];

export const logoVariants = [
  { file: "primary" as const, label: "Principal", note: "Empilhado. Capas, abertura e peças quadradas." },
  { file: "horizontal" as const, label: "Horizontal", note: "Uso corrente em cabeçalhos, documentos e assinaturas." },
  { file: "compact" as const, label: "Compacta", note: "Mesma relação, com menos espaço entre símbolo e nome." },
  { file: "symbol" as const, label: "Símbolo", note: "Reconhecível sem o nome. Favorece favicon e avatar." },
  { file: "monochrome" as const, label: "Monocromática", note: "Uma tinta só, para gravação, relevo e restrição de cor." },
  { file: "on-light" as const, label: "Fundo claro", note: "Grafite com o módulo em verde natural." },
  { file: "on-dark" as const, label: "Fundo escuro", note: "Estrutura em off-white e módulo no verde oficial." },
];
