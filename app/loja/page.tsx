import type { Metadata } from "next";
import { CabecaPagina } from "@/components/Secao";
import { Marcacao } from "@/components/Marcacao";
import { IconeWhatsapp } from "@/components/Icones";
import { linkWhatsapp } from "@/lib/site";

export const metadata: Metadata = { title: "Loja" };

// Vitrine fixa até o cadastro de produtos entrar no painel.
// Nomes e preços a confirmar com a equipe.
const produtos = [
  { nome: "Camiseta RUA preta", detalhe: "Logo no peito" },
  { nome: "Camiseta RUA branca", detalhe: "Logo no peito" },
  { nome: "Camiseta Corcel II", detalhe: "Arte nas costas" },
];

export default function Loja() {
  return (
    <>
      <CabecaPagina etiqueta="Merch oficial" titulo={<>Veste<br />a RUA</>}>
        <p>
          Escolheu, chama a gente no WhatsApp com o nome da peça e o tamanho. A equipe fecha o pedido direto com você.
        </p>
      </CabecaPagina>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {produtos.map((p) => (
            <article key={p.nome} className="flex flex-col border border-branco/15">
              <Marcacao rotulo={`Foto ${p.nome}`} largura={1086} altura={1448} className="w-full border-0 border-b-2" />
              <div className="flex flex-1 flex-col p-5">
                <h2 className="titulo text-3xl">{p.nome}</h2>
                <p className="mt-2 text-branco/70">{p.detalhe}</p>
                <p className="mt-4 text-sm uppercase tracking-[0.16em] text-branco/50">Preço a confirmar</p>
                <a
                  href={linkWhatsapp(`Salve, RUA! Quero a ${p.nome}. Meu tamanho é: `)}
                  target="_blank"
                  rel="noreferrer"
                  className="botao botao-verde mt-6"
                >
                  <IconeWhatsapp /> Comprar no WhatsApp
                </a>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-12 max-w-2xl text-branco/70">
          Membro RUA tem preço especial. Quando a área do membro abrir, os valores aparecem lá direto pra você.
        </p>
      </div>
    </>
  );
}
