import type { Metadata } from "next";
import Link from "next/link";
import { CabecaPagina, Secao, TituloSecao } from "@/components/Secao";
import { Seta } from "@/components/Icones";

export const metadata: Metadata = { title: "Sobre" };

const valores = [
  {
    titulo: "Built on Respect",
    texto: "Respeito vem antes de tudo: com a galera, com o carro dos outros e com quem está em volta.",
  },
  {
    titulo: "Aqui tem de tudo",
    texto: "Turbo, aspirado, original, preparado. Novo, antigo, nacional, importado. Ninguém precisa de um carro específico pra colar.",
  },
  {
    titulo: "A gente constrói junto",
    texto: "A RUA é feita por quem participa. Evento, projeto, merch: tudo nasce da comunidade.",
  },
];

const regras = [
  "Respeito com todo mundo, dentro e fora do grupo.",
  "Carro de membro não se zoa. Cada projeto tem a sua história.",
  "Sem política e sem treta entre grupos. Aqui o assunto é carro e amizade.",
  "Álcool e direção não combinam. Nunca.",
  "Velocidade só em pista ou em evento fechado.",
  "Na rua, a gente representa a RUA. Chegou junto, sai junto, sem deixar bagunça pra trás.",
];

export default function Sobre() {
  return (
    <>
      <CabecaPagina etiqueta="Sobre a RUA" titulo={<>Rua Unindo<br />Amigos</>}>
        <p>
          A RUA nasceu em São Paulo pra juntar quem gosta de carro, independente de modelo, estilo ou projeto. O nome
          já entrega bastante: carro foi só o jeito que a gente encontrou de juntar todo mundo.
        </p>
      </CabecaPagina>

      <Secao pincelada={{ caractere: "R", lado: "direita" }}>
        <TituloSecao etiqueta="No que a gente acredita">Valores</TituloSecao>
        <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {valores.map((v) => (
            <article key={v.titulo} className="border border-branco/15 bg-preto p-6 md:p-8">
              <h3 className="font-lust text-4xl leading-tight text-verde">{v.titulo}</h3>
              <p className="mt-4 leading-relaxed text-branco/80">{v.texto}</p>
            </article>
          ))}
        </div>
      </Secao>

      <Secao fundo="Regras" className="border-t border-branco/10">
        <div className="grid gap-10 md:grid-cols-[0.8fr_1fr] md:gap-16">
          <div>
            <TituloSecao etiqueta="Pra todo mundo curtir">
              Regras da
              <br />
              comunidade
            </TituloSecao>
            <p className="mt-8 text-2xl">
              <span className="marca-texto">Respeito não é detalhe.</span>
            </p>
          </div>
          <ol className="space-y-px">
            {regras.map((r, i) => (
              <li key={r} className="flex gap-5 border-b border-branco/15 py-5">
                <span className="titulo w-10 shrink-0 text-3xl text-verde">{String(i + 1).padStart(2, "0")}</span>
                <p className="pt-1 text-lg leading-relaxed">{r}</p>
              </li>
            ))}
          </ol>
        </div>
      </Secao>

      <Secao className="border-t border-branco/10">
        <div className="flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <p className="font-lust text-5xl leading-tight md:text-6xl">
            Começa como comunidade.
            <br />O resto, a gente constrói junto.
          </p>
          <Link href="/inscricao" className="botao botao-verde shrink-0">
            Quero ser RUA <Seta />
          </Link>
        </div>
      </Secao>
    </>
  );
}
