export const clinic = {
  name: "ALENTO",
  claim: "clínica de psicologia",
  positioning: "cuidado que cabe na sua rotina",
  city: "São Paulo",
  country: "Brasil",
  email: "contato@alento.com.br",
  phone: "+55 11 97777-1010",
  whatsapp: "5511977771010",
  instagram: "https://instagram.com/alento.psi",
  linkedin: "https://linkedin.com/company/alento-psi",
  founded: 2018,
  hours: "Seg a Sáb — 8h às 21h",
  address: "Rua das Acácias, 214 — Vila Mariana, São Paulo",
  legal: "ALENTO Psicologia LTDA — CNPJ 39.114.220/0001-07",
};

export const nav = [
  { label: "A clínica", href: "/#clinica" },
  { label: "Psicólogos", href: "/psicologos" },
  { label: "Como funciona", href: "/#como-funciona" },
  { label: "Dúvidas", href: "/#duvidas" },
  { label: "Contato", href: "/#contato" },
];

export const heroSlide = {
  eyebrow: "Clínica de psicologia — São Paulo",
  title: "Um lugar tranquilo para olhar para si",
  claim: "Um lugar tranquilo para olhar para si",
  lede:
    "Atendimento psicológico online e presencial, com horários que respeitam a sua rotina. Você escolhe o psicólogo, agenda sozinho e acompanha tudo pela sua conta.",
  highlights: [
    { value: "12", suffix: "psicólogos", label: "com CRP ativo e supervisão" },
    { value: "8", suffix: "anos", label: "cuidando de quem procura ajuda" },
    { value: "4.9", suffix: "/5", label: "média de satisfação dos pacientes" },
  ],
};

export const values = [
  {
    title: "Escuta sem pressa",
    body: "Cada sessão é seu tempo. Sem roteiro engessado, sem julgamento, no ritmo que fizer sentido para você.",
  },
  {
    title: "Ética e sigilo",
    body: "Tudo o que você traz fica entre você e seu psicólogo, dentro do sigilo profissional previsto no código de ética.",
  },
  {
    title: "Prático de verdade",
    body: "Marque, remarque ou cancele pela sua conta, a qualquer hora. Sem ligações, sem espera em fila.",
  },
];

export type Approach = {
  slug: string;
  name: string;
  short: string;
  body: string;
};

export const approaches: Approach[] = [
  {
    slug: "tcc",
    name: "Terapia Cognitivo-Comportamental",
    short: "TCC",
    body: "Trabalha a relação entre pensamento, emoção e comportamento. Costuma ser objetiva e prática, com metas claras para o dia a dia.",
  },
  {
    slug: "psicanalise",
    name: "Psicanálise",
    short: "Psicanálise",
    body: "Investiga o que está por baixo do que você sente, a partir da sua história. Um trabalho mais longo e profundo sobre si.",
  },
  {
    slug: "sistemic",
    name: "Terapia Sistêmica",
    short: "Sistêmica",
    body: "Olha para você junto das suas relações — família, casal, trabalho. Útil quando o sofrimento envolve vínculos.",
  },
  {
    slug: "humanista",
    name: "Abordagem Humanista",
    short: "Humanista",
    body: "Foca no seu potencial e no aqui e agora, num espaço acolhedor para se conhecer e se aceitar melhor.",
  },
];

export type Psychologist = {
  slug: string;
  name: string;
  crp: string;
  role: string;
  approach: string;
  specialties: string[];
  bio: string;
  price: number;
  online: boolean;
  inPerson: boolean;
  initial: string;
};

export const psychologists: Psychologist[] = [
  {
    slug: "marina-alencar",
    name: "Marina Alencar",
    crp: "CRP 06/118204",
    role: "Psicóloga clínica",
    approach: "tcc",
    specialties: ["Ansiedade", "Síndrome do pânico", "Estresse e burnout"],
    bio: "Mestre em psicologia clínica, atende adultos há 11 anos. Conduz o tratamento com metas construídas junto de cada paciente, uma semana por vez.",
    price: 180,
    online: true,
    inPerson: true,
    initial: "M",
  },
  {
    slug: "rafael-tavares",
    name: "Rafael Tavares",
    crp: "CRP 06/094771",
    role: "Psicólogo clínico",
    approach: "psicanalise",
    specialties: ["Depressão", "Luto", "Questões de identidade"],
    bio: "Formação psicanalítica, mais de 15 anos de consultório. Trabalha o que dói por baixo da história de cada um, sem fórmulas prontas.",
    price: 220,
    online: true,
    inPerson: false,
    initial: "R",
  },
  {
    slug: "camila-nogueira",
    name: "Camila Nogueira",
    crp: "CRP 06/131560",
    role: "Psicóloga clínica",
    approach: "sistemic",
    specialties: ["Terapia de casal", "Conflitos familiares", "Parentalidade"],
    bio: "Especialista em terapia de casal e família. Ajuda as pessoas a se ouvirem de novo quando a conversa parece que empacou.",
    price: 200,
    online: true,
    inPerson: true,
    initial: "C",
  },
  {
    slug: "joao-pedro-lima",
    name: "João Pedro Lima",
    crp: "CRP 06/142903",
    role: "Psicólogo clínico",
    approach: "humanista",
    specialties: ["Autoconhecimento", "Carreira e transições", "Autoestima"],
    bio: "Atende adultos em momentos de mudança — de carreira, de cidade, de vida. Um espaço para se reconhecer e se acolher sem pressa.",
    price: 170,
    online: true,
    inPerson: true,
    initial: "J",
  },
  {
    slug: "helena-castro",
    name: "Helena Castro",
    crp: "CRP 06/108442",
    role: "Psicóloga clínica",
    approach: "tcc",
    specialties: ["TDAH em adultos", "Ansiedade social", "Fobia"],
    bio: "Pós-graduada em neuropsicologia. Trabalha com TDAH e ansiedade em adultos, com estratégias que cabem na vida real.",
    price: 190,
    online: true,
    inPerson: false,
    initial: "H",
  },
  {
    slug: "bruno-estevao",
    name: "Bruno Estêvão",
    crp: "CRP 06/119087",
    role: "Psicólogo clínico",
    approach: "sistemic",
    specialties: ["Adolescentes", "Relações familiares", "Orientação de pais"],
    bio: "Trabalha com adolescentes e suas famílias há 9 anos. Cria pontes quando o diálogo em casa parece impossível.",
    price: 175,
    online: true,
    inPerson: true,
    initial: "B",
  },
];

export type Step = {
  number: string;
  title: string;
  body: string;
};

export const steps: Step[] = [
  {
    number: "01",
    title: "Crie sua conta",
    body: "Um minuto, com seu nome e e-mail. Serve para você agendar e acompanhar suas sessões, nada além disso.",
  },
  {
    number: "02",
    title: "Escolha o psicólogo",
    body: "Veja a abordagem, as especialidades e o valor de cada profissional. Filtre por online ou presencial.",
  },
  {
    number: "03",
    title: "Agende o horário",
    body: "Escolha o dia e o horário que caibam na sua semana. A confirmação aparece na hora, na sua conta.",
  },
  {
    number: "04",
    title: "Comece quando quiser",
    body: "Você recebe o link da sessão online ou o endereço, se for presencial. Remarcar ou cancelar é com você.",
  },
];

export type Faq = {
  question: string;
  answer: string;
};

export const faqs: Faq[] = [
  {
    question: "Atendem online?",
    answer:
      "Sim. Boa parte dos nossos psicólogos atende online por videochamada, e você escolhe isso já na hora de agendar. Funciona igual à sessão presencial.",
  },
  {
    question: "Quanto custa uma sessão?",
    answer:
      "Os valores variam de R$ 170 a R$ 220 por sessão, e aparecem no perfil de cada psicólogo. É possível ajustar a frequência conforme sua possibilidade.",
  },
  {
    question: "O que é dito na terapia fica em sigilo?",
    answer:
      "Sim. O sigilo é garantido pelo código de ética do psicólogo. Só é quebrado nas situações previstas em lei, como risco de vida.",
  },
  {
    question: "Posso trocar de psicólogo?",
    answer:
      "Pode, a qualquer momento. O vínculo é uma das coisas mais importantes na terapia, e se a sintonia não acontecer, tudo bem mudar.",
  },
  {
    question: "Como faço para atender na ALENTO?",
    answer:
      "Temos uma página para psicólogos que querem fazer parte. Você envia seu currículo por lá e nosso time entra em contato com os próximos passos.",
  },
];

export const sessionPrices = { min: 170, max: 220 };
