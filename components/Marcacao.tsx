// Marcação neutra enquanto a imagem final não existe:
// bloco preto, borda tracejada e as dimensões escritas.
export function Marcacao({
  rotulo,
  largura,
  altura,
  className = "",
}: {
  rotulo: string;
  largura: number;
  altura: number;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`Espaço reservado: ${rotulo}, ${largura} por ${altura}`}
      className={`flex items-center justify-center border-2 border-dashed border-branco/30 bg-preto p-4 text-center ${className}`}
      style={{ aspectRatio: `${largura} / ${altura}` }}
    >
      <div className="text-xs uppercase tracking-[0.18em] text-branco/50">
        <p>{rotulo}</p>
        <p className="mt-1 text-branco/80">
          {largura} × {altura}
        </p>
      </div>
    </div>
  );
}
