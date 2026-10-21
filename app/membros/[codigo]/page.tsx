import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { arroba, desdeQuando, membrosPublicos, nomeCurto } from "@/lib/dados";

export const dynamic = "force-dynamic";

async function buscar(codigo: string) {
  const membros = await membrosPublicos();
  return membros.find((m) => m.codigo === decodeURIComponent(codigo).toUpperCase()) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ codigo: string }> }): Promise<Metadata> {
  const membro = await buscar((await params).codigo);
  return { title: membro ? nomeCurto(membro.nome) : "Membro" };
}

export default async function FichaMembro({ params }: { params: Promise<{ codigo: string }> }) {
  const membro = await buscar((await params).codigo);
  if (!membro) notFound();

  const ig = membro.instagram ? arroba(membro.instagram) : null;

  return (
    <>
      <section className="relative overflow-hidden border-b border-branco/10">
        <span aria-hidden className="pincelada absolute -right-[16vw] -top-[22vw] text-[48vw] md:-right-[6vw] md:text-[26vw]">
          u
        </span>
        <div className="relative mx-auto max-w-7xl px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-16">
          <Link href="/membros" className="etiqueta hover:underline">
            ← Membros
          </Link>
          <p className="etiqueta mt-10">{membro.codigo}</p>
          <h1 className="titulo mt-4 text-5xl md:text-8xl">{membro.nome}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-lg">
            <p>
              RUA desde <span className="marca-texto">{desdeQuando(membro.entrou_em)}</span>
            </p>
            {ig && (
              <a href={ig.url} target="_blank" rel="noreferrer" className="link">
                {ig.texto}
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-16 px-4 py-14 md:px-8 md:py-20">
        {membro.carros.map((c) => (
          <article key={c.id}>
            <p className="etiqueta">{c.montadora}</p>
            <h2 className="titulo linha-verde mt-3 text-4xl md:text-6xl">{c.modelo}</h2>

            {c.fotos?.some((f) => f.startsWith("http")) ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {c.fotos.filter((f) => f.startsWith("http")).map((f) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={f} src={f} alt={`${c.montadora} ${c.modelo}`} className="aspect-[4/3] w-full object-cover" />
                ))}
              </div>
            ) : (
              <p className="mt-8 border border-dashed border-branco/30 p-5 text-sm uppercase tracking-[0.16em] text-branco/50">
                Fotos do projeto em breve
              </p>
            )}

            {c.tem_modificacao && c.modificacoes && (
              <div className="mt-8">
                <p className="etiqueta">O que tem</p>
                <p className="mt-3 max-w-3xl whitespace-pre-line leading-relaxed text-branco/85">{c.modificacoes}</p>
              </div>
            )}

            {c.atualizacoes.length > 0 && (
              <div className="mt-8">
                <p className="etiqueta">Atualizações</p>
                <ul className="mt-3 space-y-4">
                  {c.atualizacoes.map((a) => (
                    <li key={a.criado_em} className="border-l-2 border-verde pl-4">
                      <p className="text-xs uppercase tracking-[0.16em] text-branco/50">
                        {new Date(a.criado_em).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="mt-1 leading-relaxed">{a.texto}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
