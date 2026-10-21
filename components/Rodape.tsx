import Image from "next/image";
import Link from "next/link";
import { linkWhatsapp, paginasPublicas, site } from "@/lib/site";
import { IconeInstagram, IconeWhatsapp } from "./Icones";

export function Rodape() {
  return (
    <footer className="relative overflow-hidden border-t border-branco/10">
      <p aria-hidden className="vazado absolute -bottom-6 left-0 text-[38vw] md:text-[22vw]">
        Built on Respect
      </p>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-14 md:grid-cols-[1.2fr_1fr_1fr] md:px-8 md:py-20">
        <div>
          <Image src="/brand/logo-negativo.png" alt="RUA" width={2000} height={1147} className="h-16 w-auto" />
          <p className="mt-6 max-w-xs font-lust text-3xl leading-tight">
            Começa como comunidade. O resto, a gente constrói junto.
          </p>
        </div>

        <nav aria-label="Mapa do site">
          <p className="etiqueta">Mapa</p>
          <ul className="mt-4 space-y-2">
            {paginasPublicas.map((p) => (
              <li key={p.href}>
                <Link href={p.href} className="uppercase tracking-[0.14em] hover:text-verde">
                  {p.rotulo}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/inscricao" className="uppercase tracking-[0.14em] hover:text-verde">
                Inscrição
              </Link>
            </li>
            <li>
              <Link href="/entrar" className="uppercase tracking-[0.14em] hover:text-verde">
                Área do membro
              </Link>
            </li>
          </ul>
        </nav>

        <div>
          <p className="etiqueta">Chega junto</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row md:flex-col">
            <a href={site.instagram} target="_blank" rel="noreferrer" className="botao botao-linha">
              <IconeInstagram /> Instagram
            </a>
            <a href={linkWhatsapp()} target="_blank" rel="noreferrer" className="botao botao-linha">
              <IconeWhatsapp /> WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="relative border-t border-branco/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs uppercase tracking-[0.16em] text-branco/60 md:flex-row md:justify-between md:px-8">
          <span>Rua Unindo Amigos · São Paulo · Est. 2026</span>
          <span>Built on Respect</span>
        </div>
      </div>
    </footer>
  );
}
