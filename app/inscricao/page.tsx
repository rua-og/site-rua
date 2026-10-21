import type { Metadata } from "next";
import { CabecaPagina } from "@/components/Secao";
import { IconeInstagram } from "@/components/Icones";
import { site } from "@/lib/site";

export const metadata: Metadata = { title: "Inscrição" };

// Fase 2: formulário em etapas chamando enviar_inscricao().
export default function Inscricao() {
  return (
    <>
      <CabecaPagina etiqueta="Inscrição" titulo={<>Quer colar<br />com a gente?</>}>
        <p>
          O formulário novo está quase pronto. Fica ligado no Instagram que a gente avisa assim que abrir por aqui.
        </p>
      </CabecaPagina>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <a href={site.instagram} target="_blank" rel="noreferrer" className="botao botao-verde">
          <IconeInstagram /> {site.instagramArroba}
        </a>
      </div>
    </>
  );
}
