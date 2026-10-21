import { Marcacao } from "./Marcacao";
import type { Projeto } from "@/lib/formatos";

export function CartaoProjeto({ projeto, indice }: { projeto: Projeto; indice: number }) {
  return (
    <article className="group border border-branco/15">
      <Marcacao rotulo={`Arte ${projeto.nome}`} largura={1600} altura={1200} className="w-full border-0 border-b-2" />
      <div className="p-6 md:p-8">
        <p className="etiqueta">
          0{indice + 1} · {projeto.carro}
        </p>
        <h3 className="titulo mt-3 text-5xl md:text-6xl">{projeto.nome}</h3>
        {projeto.descricao && <p className="mt-3 text-branco/75">{projeto.descricao}</p>}
      </div>
    </article>
  );
}
