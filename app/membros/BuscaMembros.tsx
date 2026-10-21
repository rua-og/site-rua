"use client";

import { useMemo, useState } from "react";
import { CartaoMembro } from "@/components/CartaoMembro";
import type { MembroPublico } from "@/lib/formatos";

const normalizar = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function BuscaMembros({ membros }: { membros: MembroPublico[] }) {
  const [termo, setTermo] = useState("");
  const [montadora, setMontadora] = useState("");

  const montadoras = useMemo(
    () => [...new Set(membros.flatMap((m) => m.carros.map((c) => c.montadora)))].sort((a, b) => a.localeCompare(b, "pt-BR")),
    [membros],
  );

  const filtrados = useMemo(() => {
    const t = normalizar(termo.trim());
    return membros.filter((m) => {
      if (montadora && !m.carros.some((c) => c.montadora === montadora)) return false;
      if (!t) return true;
      const alvo = normalizar([m.nome, ...m.carros.flatMap((c) => [c.montadora, c.modelo])].join(" "));
      return alvo.includes(t);
    });
  }, [membros, termo, montadora]);

  return (
    <div>
      <div className="grid gap-3 md:grid-cols-[1fr_280px]">
        <label className="block">
          <span className="sr-only">Buscar por nome ou carro</span>
          <input
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por nome ou carro"
            className="h-14 w-full border border-branco/25 bg-preto px-4 text-base placeholder:text-branco/40 focus:border-verde focus:outline-none"
          />
        </label>
        <label className="block">
          <span className="sr-only">Filtrar por montadora</span>
          <select
            value={montadora}
            onChange={(e) => setMontadora(e.target.value)}
            className="h-14 w-full border border-branco/25 bg-preto px-4 text-base focus:border-verde focus:outline-none"
          >
            <option value="">Todas as montadoras</option>
            {montadoras.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="etiqueta mt-6" aria-live="polite">
        {filtrados.length} {filtrados.length === 1 ? "membro" : "membros"}
      </p>

      {filtrados.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtrados.map((m) => (
            <CartaoMembro key={m.codigo} membro={m} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-lg text-branco/70">
          {membros.length === 0
            ? "O repertório está carregando a galera. Volta daqui a pouco."
            : "Ninguém com esse nome ou carro por aqui ainda."}
        </p>
      )}
    </div>
  );
}
