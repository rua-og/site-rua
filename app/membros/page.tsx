import type { Metadata } from "next";
import { CabecaPagina } from "@/components/Secao";
import { membrosPublicos } from "@/lib/dados";
import { BuscaMembros } from "./BuscaMembros";

export const metadata: Metadata = { title: "Membros" };
export const dynamic = "force-dynamic";

export default async function Membros() {
  const membros = await membrosPublicos();

  return (
    <>
      <CabecaPagina etiqueta="Repertório" titulo={<>Quem faz<br />a RUA</>}>
        <p>
          A galera que já é RUA e os projetos de cada um. Busca por nome, montadora ou carro.
        </p>
      </CabecaPagina>
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-16">
        <BuscaMembros membros={membros} />
      </div>
    </>
  );
}
