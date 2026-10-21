"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { paginasPublicas } from "@/lib/site";

export function Cabecalho() {
  const caminho = usePathname();
  const [aberto, setAberto] = useState(false);

  useEffect(() => setAberto(false), [caminho]);

  useEffect(() => {
    document.body.style.overflow = aberto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [aberto]);

  const ativo = (href: string) => (href === "/" ? caminho === "/" : caminho.startsWith(href));

  return (
    <header className="sticky top-0 z-50 border-b border-branco/10 bg-preto/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-8">
        <Link href="/" aria-label="RUA, página inicial" className="shrink-0">
          <Image src="/brand/logo-negativo.png" alt="RUA" width={2000} height={1147} priority className="h-9 w-auto md:h-11" />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {paginasPublicas.slice(1).map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={ativo(p.href) ? "page" : undefined}
              className={`text-sm uppercase tracking-[0.16em] transition-colors hover:text-verde ${ativo(p.href) ? "text-verde" : "text-branco"}`}
            >
              {p.rotulo}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/entrar" className="text-sm uppercase tracking-[0.16em] hover:text-verde">
            Entrar
          </Link>
          <Link href="/inscricao" className="botao botao-verde">
            Quero ser RUA
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-movel"
          className="flex h-12 w-12 items-center justify-center lg:hidden"
        >
          <span className="sr-only">{aberto ? "Fechar menu" : "Abrir menu"}</span>
          <span aria-hidden className="relative block h-4 w-7">
            <span className={`absolute left-0 h-0.5 w-7 bg-branco transition-transform ${aberto ? "top-2 rotate-45" : "top-0"}`} />
            <span className={`absolute left-0 top-2 h-0.5 w-5 bg-verde transition-opacity ${aberto ? "opacity-0" : ""}`} />
            <span className={`absolute left-0 h-0.5 w-7 bg-branco transition-transform ${aberto ? "top-2 -rotate-45" : "top-4"}`} />
          </span>
        </button>
      </div>

      <div
        id="menu-movel"
        hidden={!aberto}
        className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto bg-preto px-4 pb-10 pt-6 lg:hidden"
      >
        <nav aria-label="Menu" className="flex flex-col">
          {paginasPublicas.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              aria-current={ativo(p.href) ? "page" : undefined}
              className={`titulo border-b border-branco/10 py-4 text-4xl ${ativo(p.href) ? "text-verde" : ""}`}
            >
              {p.rotulo}
            </Link>
          ))}
        </nav>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/inscricao" className="botao botao-verde">
            Quero ser RUA
          </Link>
          <Link href="/entrar" className="botao botao-linha">
            Entrar
          </Link>
        </div>
      </div>
    </header>
  );
}
