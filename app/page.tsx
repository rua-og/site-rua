import Link from "next/link";
import { Marcacao } from "@/components/Marcacao";
import { Secao, TituloSecao } from "@/components/Secao";
import { Seta } from "@/components/Icones";
import { CartaoProjeto } from "@/components/CartaoProjeto";
import { CartaoMembro } from "@/components/CartaoMembro";
import { carrosAtivos, membrosPublicos, projetos } from "@/lib/dados";

export const dynamic = "force-dynamic";

const passos = [
  {
    titulo: "Faz a inscrição",
    texto: "Conta quem você é e qual é o seu carro. Pode ser antigo, novo, original ou preparado. Aqui tem de tudo.",
  },
  {
    titulo: "A gente analisa",
    texto: "Os ADMs olham cada inscrição com calma, pra manter a proposta e o respeito dentro da comunidade.",
  },
  {
    titulo: "Chega junto",
    texto: "Aprovado, você entra no grupo oficial no WhatsApp, ganha seu ID de membro e aparece no repertório da RUA.",
  },
];

export default async function Inicio() {
  const [total, membros, listaProjetos] = await Promise.all([carrosAtivos(), membrosPublicos(), projetos()]);
  // Destaque: os quatro que chegaram por último.
  const destaque = membros.slice(-4).reverse();

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-branco/10">
        <div className="absolute inset-0">
          <Marcacao rotulo="Hero mobile" largura={1080} altura={1350} className="h-full w-full !items-start pt-10 md:hidden" />
          <Marcacao rotulo="Hero desktop" largura={2400} altura={1350} className="hidden h-full w-full md:flex md:items-end md:justify-end md:pb-10 md:pr-10" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-preto via-preto/60 to-transparent md:bg-gradient-to-r" />
        <div className="relative mx-auto flex min-h-[calc(100svh-4rem)] max-w-7xl flex-col justify-end px-4 pb-14 pt-24 md:min-h-[calc(100svh-5rem)] md:justify-center md:px-8">
          <p className="etiqueta">Cultura automotiva · São Paulo · Est. 2026</p>
          <h1 className="titulo mt-5 text-[17vw] md:text-[9rem]">
            Rua
            <br />
            unindo
            <br />
            amigos
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-branco/85">
            O nome já entrega bastante. Carro foi só o jeito que a gente encontrou de juntar todo mundo.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/inscricao" className="botao botao-verde">
              Quero ser RUA <Seta />
            </Link>
            <Link href="/sobre" className="botao botao-linha">
              Entender a RUA
            </Link>
          </div>
        </div>
      </section>

      {/* Big number */}
      {total !== null && (
        <section className="relative overflow-hidden border-b border-branco/10">
          <p aria-hidden className="vazado absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[70vw] md:text-[40vw]">
            Projetos
          </p>
          <div className="relative mx-auto max-w-7xl px-4 py-20 text-center md:px-8 md:py-28">
            <p className="titulo text-3xl md:text-5xl">
              <span className="block">Já são</span>
              <span className="block text-[38vw] leading-[0.85] text-verde md:text-[18rem]">{total}</span>
              <span className="block">projetos na RUA</span>
            </p>
          </div>
        </section>
      )}

      {/* Manifesto */}
      <Secao id="manifesto" pincelada={{ caractere: "R", lado: "direita" }}>
        <div className="grid gap-10 md:grid-cols-[0.8fr_1fr] md:gap-16">
          <TituloSecao etiqueta="Mas afinal">
            O que é
            <br />a RUA?
          </TituloSecao>
          <div className="max-w-2xl space-y-6 text-lg leading-relaxed text-branco/85">
            <p className="text-2xl leading-snug text-branco">
              Um espaço feito pra juntar quem gosta de carro, independente de modelo, estilo ou projeto.
            </p>
            <p>
              Dos antigos aos novos, dos originais aos preparados, a ideia é ter de tudo por aqui, porque o que une a
              gente nunca foi um tipo de carro. <span className="marca-texto">É a mesma paixão.</span>
            </p>
            <p className="font-lust text-4xl leading-tight text-branco md:text-5xl">
              Começa como comunidade. O resto, a gente constrói junto.
            </p>
          </div>
        </div>
      </Secao>

      {/* Como funciona */}
      <Secao id="como-funciona" fundo="Respeito" className="border-y border-branco/10">
        <TituloSecao etiqueta="Como funciona">
          Como chegar
          <br />
          junto
        </TituloSecao>
        <ol className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          {passos.map((p, i) => (
            <li key={p.titulo} className="border border-branco/15 bg-preto p-6 md:p-8">
              <span className="titulo text-6xl text-verde">0{i + 1}</span>
              <h3 className="titulo mt-6 text-3xl">{p.titulo}</h3>
              <p className="mt-3 leading-relaxed text-branco/75">{p.texto}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12 text-center text-2xl md:text-3xl">
          <span className="marca-texto">Respeito não é detalhe.</span>
        </p>
      </Secao>

      {/* Faísca e Frank */}
      <Secao id="projetos">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <TituloSecao etiqueta="Projetos RUA">
            Chevettes
            <br />
            da RUA
          </TituloSecao>
          <p className="max-w-sm text-branco/75">Dois projetos, duas propostas e a mesma vontade de construir junto.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {listaProjetos.map((p, i) => (
            <CartaoProjeto key={p.slug} projeto={p} indice={i} />
          ))}
        </div>
        <Link href="/projetos" className="botao botao-linha mt-10">
          Ver os bastidores <Seta />
        </Link>
      </Secao>

      {/* Destaque de membros */}
      {destaque.length > 0 && (
        <Secao id="membros" className="border-y border-branco/10" pincelada={{ caractere: "u", lado: "esquerda" }}>
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <TituloSecao etiqueta="Chegaram agora">
              Quem faz
              <br />a RUA
            </TituloSecao>
            <Link href="/membros" className="botao botao-linha self-start md:self-auto">
              Ver todo mundo <Seta />
            </Link>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {destaque.map((m) => (
              <CartaoMembro key={m.codigo} membro={m} />
            ))}
          </div>
        </Secao>
      )}

      {/* Merch */}
      <Secao id="merch">
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
          <Marcacao rotulo="Foto da merch" largura={1086} altura={1448} className="w-full" />
          <div>
            <TituloSecao etiqueta="Merch oficial">
              Veste
              <br />a RUA
            </TituloSecao>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-branco/80">
              Camiseta, boné e o que mais a galera pedir. Escolheu, chama a gente no WhatsApp e fecha direto com a
              equipe.
            </p>
            <Link href="/loja" className="botao botao-verde mt-8">
              Ver a loja <Seta />
            </Link>
          </div>
        </div>
      </Secao>

      {/* Chamada pra inscrição */}
      <section className="relative overflow-hidden bg-verde text-preto">
        <p aria-hidden className="pincelada absolute -right-10 -top-16 text-[50vw] !text-preto/10 md:text-[24vw]">
          a
        </p>
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-20 md:flex-row md:items-end md:justify-between md:px-8 md:py-28">
          <div>
            <p className="text-xs uppercase tracking-[0.18em]">Quer colar com a gente?</p>
            <h2 className="titulo mt-4 text-7xl md:text-9xl">Vem pra RUA</h2>
            <p className="mt-6 max-w-lg text-lg leading-relaxed">
              As inscrições passam pela validação dos ADMs pra manter a proposta e o respeito dentro da comunidade.
            </p>
          </div>
          <Link
            href="/inscricao"
            className="botao shrink-0 border-preto bg-preto text-verde hover:bg-verde hover:text-preto"
          >
            Fazer inscrição <Seta />
          </Link>
        </div>
      </section>
    </>
  );
}
