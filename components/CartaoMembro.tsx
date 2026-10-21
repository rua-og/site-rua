import Link from "next/link";
import { nomeCurto, type MembroPublico } from "@/lib/formatos";

export function CartaoMembro({ membro }: { membro: MembroPublico }) {
  return (
    <Link
      href={`/membros/${membro.codigo}`}
      className="group flex h-full flex-col justify-between border border-branco/15 p-5 transition-colors hover:border-verde"
    >
      <div>
        <p className="etiqueta">{membro.codigo}</p>
        <h3 className="titulo mt-3 text-3xl group-hover:text-verde">{nomeCurto(membro.nome)}</h3>
      </div>
      <ul className="mt-6 space-y-1 text-sm text-branco/80">
        {membro.carros.map((c) => (
          <li key={c.id}>
            <span className="text-branco/50">{c.montadora}</span> {c.modelo}
          </li>
        ))}
      </ul>
    </Link>
  );
}
