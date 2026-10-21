import type { Metadata } from "next";
import { CabecaPagina, Secao } from "@/components/Secao";
import { Marcacao } from "@/components/Marcacao";
import { projetos } from "@/lib/dados";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Projetos" };
export const dynamic = "force-dynamic";

const fundo: Record<string, string> = { faisca: "Drift", frank: "Turbo" };

export default async function Projetos() {
  const lista = await projetos();

  return (
    <>
      <CabecaPagina etiqueta="Projetos RUA" titulo={<>Chevettes<br />da RUA</>}>
        <p>Dois projetos autorais, duas propostas e a mesma vontade de construir junto. Aqui é onde a gente mostra o corre.</p>
      </CabecaPagina>

      {lista.map((p, i) => (
        <Secao key={p.slug} id={p.slug} fundo={fundo[p.slug]} className={i > 0 ? "border-t border-branco/10" : ""}>
          <div className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
            <Marcacao rotulo={`Arte ${p.nome}`} largura={1600} altura={1200} className="w-full" />
            <div>
              <p className="etiqueta">
                0{i + 1} · {p.carro}
              </p>
              <h2 className="titulo linha-verde mt-4 text-7xl md:text-9xl">{p.nome}</h2>
              {p.descricao && <p className="mt-8 text-xl leading-relaxed">{p.descricao}</p>}

              <div className="mt-10 border border-dashed border-branco/30 p-6">
                <p className="etiqueta">Bastidores</p>
                <p className="mt-3 leading-relaxed text-branco/75">
                  Fotos e atualizações do projeto entram aqui conforme o {p.nome} for evoluindo. Enquanto isso, acompanha
                  tudo no{" "}
                  <a href={site.instagram} target="_blank" rel="noreferrer" className="link">
                    {site.instagramArroba}
                  </a>
                  .
                </p>
              </div>
            </div>
          </div>
        </Secao>
      ))}
    </>
  );
}
