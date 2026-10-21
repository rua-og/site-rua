import type { ReactNode } from "react";

export function Secao({
  id,
  children,
  className = "",
  pincelada,
  fundo,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  // Caractere da Lust ampliado na borda da seção.
  pincelada?: { caractere: string; lado: "esquerda" | "direita" };
  // Palavra vazada em Six Caps no fundo.
  fundo?: string;
}) {
  return (
    <section id={id} className={`relative overflow-hidden ${className}`}>
      {fundo && (
        <p aria-hidden className="vazado absolute -top-4 left-1/2 -translate-x-1/2 text-[45vw] md:text-[28vw]">
          {fundo}
        </p>
      )}
      {pincelada && (
        <span
          aria-hidden
          className={`pincelada absolute -top-[20vw] text-[48vw] md:top-1/2 md:-translate-y-1/2 md:text-[24vw] ${
            pincelada.lado === "esquerda" ? "-left-[14vw] md:-left-[15vw]" : "-right-[14vw] md:-right-[15vw]"
          }`}
        >
          {pincelada.caractere}
        </span>
      )}
      <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-8 md:py-32">{children}</div>
    </section>
  );
}

export function TituloSecao({ etiqueta, children }: { etiqueta?: string; children: ReactNode }) {
  return (
    <div>
      {etiqueta && <p className="etiqueta mb-4">{etiqueta}</p>}
      <h2 className="titulo linha-verde text-5xl md:text-7xl">{children}</h2>
    </div>
  );
}

export function CabecaPagina({ etiqueta, titulo, children }: { etiqueta: string; titulo: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-branco/10">
      <span aria-hidden className="pincelada absolute -right-[16vw] -top-[22vw] text-[48vw] md:-right-[6vw] md:text-[26vw]">
        r
      </span>
      <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-16 md:px-8 md:pb-20 md:pt-24">
        <p className="etiqueta">{etiqueta}</p>
        <h1 className="titulo mt-4 text-6xl md:text-8xl">{titulo}</h1>
        {children && <div className="mt-6 max-w-2xl text-lg leading-relaxed text-branco/80">{children}</div>}
      </div>
    </section>
  );
}
