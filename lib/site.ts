export const site = {
  nome: "RUA",
  nomeCompleto: "Rua Unindo Amigos",
  descricao:
    "Comunidade de cultura automotiva de São Paulo. Aqui tem de tudo: antigo, novo, original, preparado. Built on Respect.",
  instagram: "https://www.instagram.com/rua.og/",
  instagramArroba: "@rua.og",
  // Número oficial da RUA com DDI e DDD, só dígitos (ex.: 5511999999999).
  // Pendente: definir na Vercel como NEXT_PUBLIC_RUA_WHATSAPP.
  whatsapp: process.env.NEXT_PUBLIC_RUA_WHATSAPP ?? "",
};

export const paginasPublicas = [
  { href: "/", rotulo: "Início" },
  { href: "/sobre", rotulo: "Sobre" },
  { href: "/projetos", rotulo: "Projetos" },
  { href: "/membros", rotulo: "Membros" },
  { href: "/loja", rotulo: "Loja" },
];

export function linkWhatsapp(texto?: string) {
  const base = site.whatsapp ? `https://wa.me/${site.whatsapp}` : "https://wa.me/";
  return texto ? `${base}?text=${encodeURIComponent(texto)}` : base;
}
