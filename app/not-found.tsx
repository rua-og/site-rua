import Link from "next/link";
import { CabecaPagina } from "@/components/Secao";

export default function NaoEncontrado() {
  return (
    <CabecaPagina etiqueta="404" titulo={<>Essa rua<br />não tem saída</>}>
      <p>A página que você procurou não existe ou mudou de lugar.</p>
      <Link href="/" className="botao botao-verde mt-8">
        Voltar pro início
      </Link>
    </CabecaPagina>
  );
}
