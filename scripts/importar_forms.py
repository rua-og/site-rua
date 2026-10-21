#!/usr/bin/env python3
"""
Importa a planilha de respostas do Google Forms (CSV) para o banco da RUA.

Uso:
    python3 scripts/importar_forms.py caminho/para/respostas.csv

Gera dois arquivos em ./importacao/ (pasta ignorada pelo git, NUNCA versionar):
    importar.sql   -> colar no Supabase (SQL Editor) e rodar
    relatorio.md   -> conferência: duplicados, campos a completar, alertas

Regras:
- Respostas com o mesmo celular viram um membro só, com vários carros.
- E-mail é descartado.
- STATUS da planilha: ATIVO -> ativo, REPROVADO -> reprovado, vazio -> em_analise.
- Data de entrada = data da primeira resposta (base do código AAM-R-NN).
- Campos que o Forms não tinha (cidade, estado, mostrar @) ficam como pendência.
- Instagram inválido ("Não", nome solto, e-mail) vira pendência.
"""
import csv
import datetime as dt
import re
import sys
from collections import OrderedDict
from pathlib import Path

MONTADORAS = [
    "Agrale", "Alfa Romeo", "Aston Martin", "Audi", "Bentley", "BMW", "Buick", "BYD", "Cadillac",
    "Caoa Chery", "Chevrolet", "Chrysler", "Citroën", "Daihatsu", "DKW-Vemag", "Dodge", "Effa",
    "Ferrari", "Fiat", "Ford", "GAC", "Geely", "GWM", "Gurgel", "Honda", "Hummer", "Hyundai",
    "Infiniti", "Iveco", "Jac", "Jaguar", "Jeep", "JPX", "Kia", "Lada", "Lamborghini", "Land Rover",
    "Lexus", "Lifan", "Lotus", "Mahindra", "Maserati", "Mazda", "McLaren", "Mercedes-Benz", "Mini",
    "Mitsubishi", "Nissan", "Omoda", "Peugeot", "Plymouth", "Pontiac", "Porsche", "Puma", "RAM",
    "Renault", "Rolls-Royce", "Seat", "Simca", "Smart", "SsangYong", "Subaru", "Suzuki", "Tesla",
    "Toyota", "Troller", "Volkswagen", "Volvo", "Willys", "Zeekr",
]
APELIDOS = {"mercedes": "Mercedes-Benz", "vw": "Volkswagen", "gm": "Chevrolet", "chery": "Caoa Chery"}
# Marca escrita no modelo que contradiz a montadora marcada
MARCA_NO_MODELO = {"chery": "Caoa Chery", "daihatsu": "Daihatsu", "iveco": "Iveco"}

INSTAGRAM_INVALIDO = re.compile(
    r"^(n[aã]o.*|sim|nenhum|-+|\.+|meu instagram.*|n/?a)$", re.IGNORECASE
)
HANDLE = re.compile(r"^@?[A-Za-z0-9._]{2,30}$")
PLACA = re.compile(r"^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$")

TIPO_CONTA = {
    "pessoal": "pessoal",
    "carro": "carro",
    "mista (pessoal + carro)": "mista",
    "não informei": "nao_informado",
}


def q(v):
    """Literal SQL seguro."""
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    return "'" + str(v).replace("'", "''") + "'"


def arr(items):
    return "'{" + ",".join('"' + i.replace('"', "") + '"' for i in items) + "}'"


def normaliza_montadora(marcada, modelo):
    alvo = None
    m = marcada.strip()
    for nome in MONTADORAS:
        if nome.lower() == m.lower():
            alvo = nome
    alvo = alvo or APELIDOS.get(m.lower())
    corrigida = None
    for palavra, marca in MARCA_NO_MODELO.items():
        if palavra in modelo.lower() and alvo != marca:
            corrigida, alvo = alvo or m, marca
    return alvo, corrigida


def main(caminho):
    linhas = list(csv.DictReader(open(caminho, encoding="utf-8")))
    linhas.sort(key=lambda r: dt.datetime.strptime(r["Carimbo de data/hora"], "%d/%m/%Y %H:%M:%S"))
    hoje = dt.date.today()

    pessoas = OrderedDict()
    for r in linhas:
        cel = re.sub(r"\D", "", r["Celular"])
        pessoas.setdefault(cel, []).append(r)

    sql = ["-- Importação do Google Forms. Rodar no SQL Editor do Supabase.", "begin;"]
    rel = {"duplicados": [], "pendencias": {}, "alertas": [], "montadora": [], "sem_montadora": [], "celular": []}
    contagem = {"ativo": 0, "reprovado": 0, "em_analise": 0}

    for cel, rs in pessoas.items():
        base = rs[0]
        nome = re.sub(r"\s+", " ", base["Nome Completo"]).strip()
        enviada = dt.datetime.strptime(base["Carimbo de data/hora"], "%d/%m/%Y %H:%M:%S")
        status_planilha = {r["STATUS"].strip().upper() for r in rs}
        status = "ativo" if "ATIVO" in status_planilha else "reprovado" if "REPROVADO" in status_planilha else "em_analise"
        contagem[status] += 1
        pend = ["cidade", "estado", "mostra_instagram"]

        if len(rs) > 1:
            rel["duplicados"].append(f"{nome}: {len(rs)} respostas, viraram {len(rs)} carros no mesmo cadastro")

        if not re.fullmatch(r"[0-9]{10,11}", cel):
            rel["celular"].append(f"{nome}: celular '{base['Celular']}' inválido, não importado")
            continue

        nasc = dt.datetime.strptime(base["Data de Nascimento"], "%d/%m/%Y").date()
        idade = (hoje - nasc).days // 365
        if idade < 5:
            pend.append("nascimento")
            rel["alertas"].append(f"{nome}: nascimento {nasc:%d/%m/%Y} impossível, ficou em branco")
            nasc = None
        elif idade < 18:
            rel["alertas"].append(f"{nome}: menor de 18 ({idade} anos), status {status}")

        ig_raw = (base["Instagram"] or "").strip()
        ig = None
        if ig_raw and not INSTAGRAM_INVALIDO.match(ig_raw) and HANDLE.match(ig_raw):
            ig = "@" + ig_raw.lstrip("@").lower()
        else:
            pend.append("instagram")

        tipo = TIPO_CONTA.get(base["A conta informada é:"].strip().lower(), "nao_informado")

        sql.append(
            "insert into membros (nome, celular, nascimento, instagram, tipo_conta, status, entrou_em, pendencias) values "
            f"({q(nome)}, {q(cel)}, {q(nasc.isoformat() if nasc else None)}, {q(ig)}, {q(tipo)}, "
            f"{q(status)}, {q(enviada.date().isoformat())}, {arr(pend)});"
        )
        sub = f"(select id from membros where celular = {q(cel)})"

        for r in rs:
            modelo = re.sub(r"\s+", " ", r["Carro/Modelo/Detalhe"]).strip()
            montadora, corrigida = normaliza_montadora(r["Montadora"], modelo)
            if corrigida:
                rel["montadora"].append(f"{nome}: '{modelo}' estava como {corrigida}, ajustado para {montadora}")
            if not montadora:
                rel["sem_montadora"].append(f"{nome}: montadora '{r['Montadora']}' fora da lista, carro não importado")
                continue
            placa = re.sub(r"[^A-Za-z0-9]", "", r["Placa"]).upper()
            if not PLACA.match(placa):
                if "placa" not in pend:
                    pend.append("placa")
                placa = ""
            tem_mod = r["Tem modificações?"].strip().lower() == "sim"
            mods = (r["O que tem de modificação?"] or "").strip() or None
            sql.append(
                "insert into carros (membro_id, montadora, modelo, placa, tem_modificacao, modificacoes) values "
                f"({sub}, {q(montadora)}, {q(modelo)}, {q(placa)}, {q(tem_mod)}, {q(mods)});"
            )

        # placa pode ter entrado como pendência depois do insert do membro
        sql.append(f"update membros set pendencias = {arr(pend)} where celular = {q(cel)};")

        decisao = {"ativo": "aprovado", "reprovado": "reprovado", "em_analise": "pendente"}[status]
        motivo = "fora_do_perfil" if status == "reprovado" else None
        obs = "Importado do Forms; motivo original não registrado" if status == "reprovado" else "Importado do Forms"
        decidida = enviada.isoformat() if status != "em_analise" else None
        sql.append(
            "insert into inscricoes (membro_id, origem, enviada_em, decisao, motivo, observacao, decidida_em) values "
            f"({sub}, 'forms', {q(enviada.isoformat())}, {q(decisao)}, {q(motivo)}, {q(obs)}, {q(decidida)});"
        )

        aceites = base.get("Assinale abaixo", "")
        for termo, chave in (("imagem", "Autorizo o uso"), ("responsabilidade", "Me responsabilizo")):
            if chave in aceites:
                sql.append(
                    "insert into aceites (membro_id, termo, versao, aceito_em) values "
                    f"({sub}, '{termo}', 'forms', {q(enviada.isoformat())});"
                )

        rel["pendencias"][nome] = pend

    sql.append("commit;")

    saida = Path("importacao")
    saida.mkdir(exist_ok=True)
    (saida / "importar.sql").write_text("\n".join(sql) + "\n", encoding="utf-8")

    md = ["# Relatório da importação do Forms", ""]
    md.append(f"- Respostas: {len(linhas)}")
    md.append(f"- Pessoas: {len(pessoas)} (ativas {contagem['ativo']}, reprovadas {contagem['reprovado']}, em análise {contagem['em_analise']})")
    for titulo, chave in (
        ("Mais de um carro", "duplicados"),
        ("Montadora ajustada", "montadora"),
        ("Montadora fora da lista", "sem_montadora"),
        ("Celular inválido", "celular"),
        ("Alertas", "alertas"),
    ):
        if rel[chave]:
            md += ["", f"## {titulo}", ""] + [f"- {x}" for x in rel[chave]]
    extras = {n: [p for p in ps if p not in ("cidade", "estado", "mostra_instagram")] for n, ps in rel["pendencias"].items()}
    extras = {n: ps for n, ps in extras.items() if ps}
    md += ["", "## Pendências além de cidade, estado e mostrar @", "", "Todos os importados precisam de cidade, estado e da escolha de mostrar o @.", ""]
    md += [f"- {n}: {', '.join(ps)}" for n, ps in extras.items()]
    (saida / "relatorio.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(f"OK: {saida/'importar.sql'} e {saida/'relatorio.md'}")


if __name__ == "__main__":
    if len(sys.argv) != 2:
        sys.exit(__doc__)
    main(sys.argv[1])
