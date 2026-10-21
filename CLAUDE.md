# Site RUA · guia do projeto

Site da RUA (Rua Unindo Amigos), comunidade de cultura automotiva de São Paulo. @rua.og.
Especificação completa e decisões: https://claude.ai/artifact/GUS6P6j1T1nc3cQ2pN9EV8
Em caso de dúvida entre este guia e a especificação, vale a especificação. Pergunte antes de inventar.

## Stack

- Next.js (App Router, TypeScript) + Tailwind, hospedado na Vercel (projeto já conectado ao repositório).
- Supabase: banco, Storage (fotos dos carros) e Auth. Variáveis já configuradas na Vercel pela integração:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`. Use `@supabase/ssr`.
- Schema: `supabase/migrations/0001_schema.sql` (testado em Postgres 16). Rodar no SQL Editor do Supabase.
- Importação do Forms: `scripts/importar_forms.py` gera `importacao/importar.sql` (pasta ignorada pelo git).

## Identidade visual

- Cores: preto `#000000` (fundo de tudo), branco `#ffffff` (texto), verde `#dbfd19` (botões, links, linha sob título,
  marca-texto na frase-chave, status ativo). Nada além disso.
- Fontes em `public/fonts/` (licença web confirmada), carregar com `next/font/local`:
  - TransRobotics Italic: títulos grandes
  - Codec Pro: corpo, formulários, painel (só temos o Regular; destaque em black ainda falta arquivo)
  - Lust: frases de destaque e elementos expressivos
  - Lust em zoom: pinceladas e texturas = caracteres da Lust ampliados, em verde, nas bordas das seções
  - Six Caps: só fundo, sempre vazado (`-webkit-text-stroke`, preenchimento transparente)
- Logos em `public/brand/` (negativo branco, positivo preto, ícone). Favicon e apple-touch-icon já em `public/`.
- Fotos noturnas. Hero, artes do Faísca e Frank e imagem de compartilhamento ainda não existem:
  usar marcação neutra (bloco preto com borda tracejada e as dimensões escritas: hero 2400×1350 e mobile 1080×1350,
  Faísca/Frank 1600×1200, share 1200×630).
- Mobile primeiro. Visual de oficina, noturno, sem cara de template.

## Linguagem

- Amigo da oficina, parceiro e raiz. Trata por você/galera, fala como "a gente". Emojis: no máximo 1 ou 2.
- Nunca usar travessão. Nada corporativo.
- Bordões: "Built on Respect", "Respeito não é detalhe", "Começa como comunidade. O resto, a gente constrói junto",
  "Aqui tem de tudo", "Rua Unindo Amigos".
- Proibido: a palavra "racha", política, treta entre grupos, zoar carro de membro, álcool e direção.
  Velocidade só em pista, evento fechado ou meme.

## Privacidade (inegociável)

- Placa, celular, nascimento e cidade NUNCA aparecem em página pública.
- Página de Membros: só status `ativo` com aceite de imagem, via função `membros_publicos()`. Instagram só se `mostra_instagram`.
- Leitura pública só pelas funções `numeros_publicos()` e `membros_publicos()`. Nunca ler tabelas direto com a chave anon.
- A chave service role só no servidor (route handlers / server actions), nunca no cliente.

## Páginas (todas com o mesmo rodapé: mapa das páginas públicas + Instagram e WhatsApp)

| Área | Rota | Conteúdo |
| --- | --- | --- |
| Pública | `/` | Hero, big numbers, manifesto, como funciona, Faísca e Frank, destaque de membros, merch, chamada pra inscrição |
| Pública | `/sobre` | Rua Unindo Amigos, valores, regras da comunidade |
| Pública | `/projetos` | Faísca (Chevette drift) e Frank (Chevette Acelero turbo), bastidores |
| Pública | `/membros` | Repertório com busca por nome, montadora e carro |
| Pública | `/membros/[codigo]` | Nome, carros, desde quando é RUA, fotos, atualizações, @ se autorizado |
| Pública | `/loja` | Vitrine fixa de merch, botão de compra direto no WhatsApp |
| Pública | `/inscricao` | Formulário em etapas, chama `enviar_inscricao()` |
| Pública | `/entrar` | Login do membro: celular + senha |
| Membro | `/membro`, `/membro/carros`, `/membro/mensagens` | Perfil, carros e atualizações, mensagens |
| Painel | `/admin`, `/admin/membros`, `/admin/mensagens` | Fila, membros, mensagens e códigos |

Big numbers (de `numeros_publicos()`): membros ativos, carros ativos, montadoras. Textos sugeridos:
"Já somos X na RUA", "X projetos rodando", "X montadoras, uma RUA só".

## Formulário de inscrição

Etapas: Sobre você (nome, nascimento, celular WhatsApp, estado, cidade) · Seu veículo (montadora, modelo, placa,
tem modificação, o que tem, até 3 fotos; pode adicionar mais carros) · Mídia (Instagram obrigatório, tipo de conta
pessoal/carro/mista, mostrar @ na página de Membros) · Termos (imagem, responsabilidade, privacidade obrigatórios;
novidades opcional). Avisar que os dados ficam na base mesmo sem aprovação, pra reanálise futura.

- Montadora: campo de busca com filtro ao digitar, só aceita item da tabela `montadoras` (sem "Outra").
- Nada é bloqueado no envio. Menor de 18 e estado diferente de SP só geram alerta no painel.

## Login

- Membro: celular + senha, sem SMS. Implementação: no Supabase Auth, usuário com e-mail sintético
  `<celular>@membros.rua.og` criado pelo servidor (service role, `auth.admin.createUser` com `email_confirm: true`,
  assim nenhum e-mail é enviado) na aprovação, com senha provisória aleatória.
  Tela de login pede celular e senha e converte. Primeiro acesso obriga trocar a senha (`senha_provisoria`).
  Esqueceu: ADM gera nova provisória no painel. Ligar `membros.auth_user_id` ao usuário criado.
- Painel: um único acesso, login Google com o e-mail definido em `config.admin_email` (contatorua.og@gmail.com).
  `is_admin()` confere o e-mail do JWT.

## Painel

- Topo: big numbers + inscrições pendentes + aniversariantes do mês + ranking de montadoras.
- Fila por data de envio (mais antiga primeiro) via `fila_inscricoes()`, com alertas: menor de 18, fora de SP,
  já se inscreveu antes, placa repetida.
- Aprovar: status `ativo` (o trigger gera o código), cria login com senha provisória, abre WhatsApp com a mensagem
  de aprovação pronta (link do grupo + senha provisória). O grupo tem aprovação de entrada pelos ADMs.
- Reprovar: motivo obrigatório (menor_idade, dados_incompletos, localizacao, fora_do_perfil) + observação interna.
  Em dados_incompletos o ADM marca os campos que faltaram. Abre WhatsApp com a mensagem do motivo.
- Membros: busca, ficha completa, status ativo/inativo/removido, aba de reprovados, filtro "campos a completar"
  (`pendencias`), gerar senha provisória, exportar planilha.
- No lançamento as mensagens saem por link `https://wa.me/55<celular>?text=` (envio manual). API da Meta fica pra depois.

## ID de membro

`AAM-R-NN`: ano com 2 dígitos, mês em letra (A = jan ... L = dez), R de RUA, ordem de entrada no mês.
Ex.: `26I-R-07`. Gerado pelo banco (`gerar_codigo_membro`) quando o status vira ativo. Não gerar no app.

## Mensagens de reprovação (textos aprovados)

Todas abrem com "Salve! Que bom ver você querendo chegar junto com a RUA." e, exceto dados incompletos,
fecham com o mesmo final:
"E fica ligado nas nossas redes: em breve queremos abrir um canal pra ninguém ficar de fora dos eventos em que a RUA vai estar, nossos encontros, novidades, lançamentos e produtos.
A gente se vê na RUA. 🚀"
O miolo de cada motivo está na especificação (seção Login e mensagens pelo WhatsApp).

## Fases

1. Base: identidade, páginas públicas, big numbers, rodapé
2. Inscrição e painel
3. Importação do Forms (o Forms só fecha depois do site publicado e divulgado)
4. Página de Membros e área do membro
5. Domínio e lançamento

Depois do lançamento: Meta (WhatsApp API), mensagens e códigos, produtos e pagamento.

## Regras de trabalho

- Nunca versionar dados de membros (CSV, `importacao/`, exports). Já estão no `.gitignore`.
- Mudança no banco = nova migration numerada em `supabase/migrations/`, nunca editar a 0001 depois de aplicada.
- Conferir visual no mobile e no desktop antes de dar uma tarefa por concluída.
