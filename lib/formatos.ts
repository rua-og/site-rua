export type Atualizacao = { texto: string; fotos: string[] | null; criado_em: string };

export type CarroPublico = {
  id: string;
  montadora: string;
  modelo: string;
  tem_modificacao: boolean;
  modificacoes: string | null;
  fotos: string[] | null;
  atualizacoes: Atualizacao[];
};

export type MembroPublico = {
  codigo: string;
  nome: string;
  entrou_em: string;
  instagram: string | null;
  carros: CarroPublico[];
};

export type Projeto = {
  slug: string;
  nome: string;
  carro: string;
  descricao: string | null;
  ordem: number;
};

const meses = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

export function desdeQuando(data: string) {
  const [ano, mes] = data.split("-").map(Number);
  return `${meses[mes - 1]} de ${ano}`;
}

export function arroba(instagram: string) {
  const limpo = instagram.trim().replace(/^@/, "").replace(/^https?:\/\/(www\.)?instagram\.com\//, "").replace(/\/$/, "");
  return { texto: `@${limpo}`, url: `https://www.instagram.com/${limpo}/` };
}

// Primeiro nome + inicial do sobrenome, pra cards de destaque.
export function nomeCurto(nome: string) {
  const partes = nome.trim().split(/\s+/);
  if (partes.length === 1) return partes[0];
  return `${partes[0]} ${partes[partes.length - 1][0]}.`;
}
