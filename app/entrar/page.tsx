import type { Metadata } from "next";
import { CabecaPagina } from "@/components/Secao";

export const metadata: Metadata = { title: "Entrar" };

// Fase 4: login do membro com celular + senha.
export default function Entrar() {
  return (
    <CabecaPagina etiqueta="Área do membro" titulo={<>Em breve<br />por aqui</>}>
      <p>
        Logo, logo, quem é RUA vai entrar com o celular e uma senha pra ver o perfil, os carros e as mensagens da
        comunidade.
      </p>
    </CabecaPagina>
  );
}
