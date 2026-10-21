-- RUA · schema inicial
-- Rodar no Supabase: SQL Editor > colar este arquivo > Run.
-- Regras: placa, celular e nascimento nunca saem em leitura pública.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------
create type status_membro as enum ('em_analise', 'ativo', 'inativo', 'removido', 'reprovado');
create type tipo_conta as enum ('pessoal', 'carro', 'mista', 'nao_informado');
create type decisao_inscricao as enum ('pendente', 'aprovado', 'reprovado');
create type motivo_reprovacao as enum ('menor_idade', 'dados_incompletos', 'localizacao', 'fora_do_perfil');
create type origem_inscricao as enum ('site', 'forms');
create type tipo_termo as enum ('imagem', 'responsabilidade', 'privacidade', 'novidades');
create type tipo_mensagem as enum ('aviso', 'evento', 'campanha', 'aniversario', 'tempo_de_casa');

-- ---------------------------------------------------------------
-- Configuração (e-mail único do painel)
-- ---------------------------------------------------------------
create table config (
  chave text primary key,
  valor text not null
);
insert into config (chave, valor) values ('admin_email', 'contatorua.og@gmail.com');

create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(lower(auth.jwt() ->> 'email') = (select lower(valor) from config where chave = 'admin_email'), false);
$$;

-- ---------------------------------------------------------------
-- Montadoras (lista fechada, campo de busca no formulário)
-- ---------------------------------------------------------------
create table montadoras (
  nome text primary key
);
insert into montadoras (nome) values
 ('Agrale'),('Alfa Romeo'),('Aston Martin'),('Audi'),('Bentley'),('BMW'),('Buick'),('BYD'),('Cadillac'),
 ('Caoa Chery'),('Chevrolet'),('Chrysler'),('Citroën'),('Daihatsu'),('DKW-Vemag'),('Dodge'),('Effa'),
 ('Ferrari'),('Fiat'),('Ford'),('GAC'),('Geely'),('GWM'),('Gurgel'),('Honda'),('Hummer'),('Hyundai'),
 ('Infiniti'),('Iveco'),('Jac'),('Jaguar'),('Jeep'),('JPX'),('Kia'),('Lada'),('Lamborghini'),('Land Rover'),
 ('Lexus'),('Lifan'),('Lotus'),('Mahindra'),('Maserati'),('Mazda'),('McLaren'),('Mercedes-Benz'),('Mini'),
 ('Mitsubishi'),('Nissan'),('Omoda'),('Peugeot'),('Plymouth'),('Pontiac'),('Porsche'),('Puma'),('RAM'),
 ('Renault'),('Rolls-Royce'),('Seat'),('Simca'),('Smart'),('SsangYong'),('Subaru'),('Suzuki'),('Tesla'),
 ('Toyota'),('Troller'),('Volkswagen'),('Volvo'),('Willys'),('Zeekr');

-- ---------------------------------------------------------------
-- Código de membro: AAM-R-NN
-- AA = ano com 2 dígitos, M = mês em letra (A = jan ... L = dez),
-- R de RUA, NN = ordem de entrada dentro do mês.
-- Ex.: 26I-R-07 = sétimo a entrar em setembro de 2026.
-- ---------------------------------------------------------------
create table codigo_contadores (
  prefixo text primary key,
  ultimo int not null default 0
);

create or replace function gerar_codigo_membro(data_entrada date) returns text
language plpgsql as $$
declare
  pref text := to_char(data_entrada, 'YY') || chr(64 + extract(month from data_entrada)::int);
  n int;
begin
  insert into codigo_contadores (prefixo, ultimo) values (pref, 1)
  on conflict (prefixo) do update set ultimo = codigo_contadores.ultimo + 1
  returning ultimo into n;
  return pref || '-R-' || lpad(n::text, 2, '0');
end;
$$;

-- ---------------------------------------------------------------
-- Membros
-- ---------------------------------------------------------------
create table membros (
  id uuid primary key default gen_random_uuid(),
  codigo text unique,                       -- AAM-R-NN, gerado ao virar ativo
  nome text not null,
  celular text not null unique check (celular ~ '^[0-9]{10,11}$'),
  nascimento date,
  cidade text,
  estado char(2),
  instagram text,
  tipo_conta tipo_conta not null default 'nao_informado',
  mostra_instagram boolean not null default false,
  aceita_novidades boolean not null default false,
  status status_membro not null default 'em_analise',
  entrou_em date,                           -- data de entrada (base do código)
  pendencias text[] not null default '{}',  -- campos a completar após importação
  auth_user_id uuid unique references auth.users (id) on delete set null,
  senha_provisoria boolean not null default true,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index membros_status_idx on membros (status);

-- Gera o código na primeira vez que o membro fica ativo
create or replace function membros_antes_salvar() returns trigger
language plpgsql as $$
begin
  new.atualizado_em := now();
  if new.status = 'ativo' and new.codigo is null then
    new.entrou_em := coalesce(new.entrou_em, current_date);
    new.codigo := gerar_codigo_membro(new.entrou_em);
  end if;
  return new;
end;
$$;

create trigger membros_antes_salvar
before insert or update on membros
for each row execute function membros_antes_salvar();

-- ---------------------------------------------------------------
-- Carros
-- ---------------------------------------------------------------
create table carros (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references membros (id) on delete cascade,
  montadora text not null references montadoras (nome),
  modelo text not null,
  placa text,                               -- só ADM e dono
  tem_modificacao boolean not null default false,
  modificacoes text,
  fotos text[] not null default '{}',       -- caminhos no Storage
  ativo boolean not null default true,      -- false = vendido
  pendente_validacao boolean not null default false,
  criado_em timestamptz not null default now()
);
create index carros_membro_idx on carros (membro_id);

-- ---------------------------------------------------------------
-- Inscrições (histórico de análise)
-- ---------------------------------------------------------------
create table inscricoes (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references membros (id) on delete cascade,
  origem origem_inscricao not null default 'site',
  enviada_em timestamptz not null default now(),
  decisao decisao_inscricao not null default 'pendente',
  motivo motivo_reprovacao,
  campos_faltantes text[] not null default '{}',
  observacao text,                          -- interna, nunca vai na mensagem
  decidida_em timestamptz,
  check (decisao <> 'reprovado' or motivo is not null),
  check (motivo is distinct from 'dados_incompletos' or cardinality(campos_faltantes) > 0)
);
create index inscricoes_fila_idx on inscricoes (decisao, enviada_em);

-- ---------------------------------------------------------------
-- Aceites (prova de consentimento)
-- ---------------------------------------------------------------
create table aceites (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references membros (id) on delete cascade,
  termo tipo_termo not null,
  versao text not null default 'v1',
  aceito_em timestamptz not null default now(),
  unique (membro_id, termo, versao)
);

-- ---------------------------------------------------------------
-- Atualizações de projeto
-- ---------------------------------------------------------------
create table atualizacoes (
  id uuid primary key default gen_random_uuid(),
  carro_id uuid not null references carros (id) on delete cascade,
  texto text not null,
  fotos text[] not null default '{}',
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Mensagens e códigos de desconto (fase pós-lançamento)
-- ---------------------------------------------------------------
create table mensagens (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  texto text not null,
  tipo tipo_mensagem not null default 'aviso',
  membro_id uuid references membros (id) on delete cascade,  -- null = todos
  criado_em timestamptz not null default now()
);

create table codigos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  membro_id uuid not null references membros (id) on delete cascade,
  mensagem_id uuid references mensagens (id) on delete set null,
  desconto text not null,
  validade date,
  usado_em timestamptz,
  criado_em timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Segurança: tudo fechado por padrão
-- ---------------------------------------------------------------
alter table config enable row level security;
alter table montadoras enable row level security;
alter table codigo_contadores enable row level security;
alter table membros enable row level security;
alter table carros enable row level security;
alter table inscricoes enable row level security;
alter table aceites enable row level security;
alter table atualizacoes enable row level security;
alter table mensagens enable row level security;
alter table codigos enable row level security;

-- Lista de montadoras é pública
create policy montadoras_leitura on montadoras for select using (true);

-- Admin vê e altera tudo
create policy admin_membros on membros for all using (is_admin()) with check (is_admin());
create policy admin_carros on carros for all using (is_admin()) with check (is_admin());
create policy admin_inscricoes on inscricoes for all using (is_admin()) with check (is_admin());
create policy admin_aceites on aceites for all using (is_admin()) with check (is_admin());
create policy admin_atualizacoes on atualizacoes for all using (is_admin()) with check (is_admin());
create policy admin_mensagens on mensagens for all using (is_admin()) with check (is_admin());
create policy admin_codigos on codigos for all using (is_admin()) with check (is_admin());

-- Membro logado vê o próprio cadastro, carros, mensagens e códigos
create or replace function meu_membro_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from membros where auth_user_id = auth.uid() and status in ('ativo', 'inativo');
$$;

create policy membro_le_proprio on membros for select using (id = meu_membro_id());
create policy membro_carros on carros for select using (membro_id = meu_membro_id());
create policy membro_add_carro on carros for insert with check (membro_id = meu_membro_id() and pendente_validacao);
create policy membro_atualizacoes_le on atualizacoes for select
  using (carro_id in (select id from carros where membro_id = meu_membro_id()));
create policy membro_atualizacoes_cria on atualizacoes for insert
  with check (carro_id in (select id from carros where membro_id = meu_membro_id()));
create policy membro_mensagens on mensagens for select
  using (membro_id is null or membro_id = meu_membro_id());
create policy membro_codigos on codigos for select using (membro_id = meu_membro_id());

-- Campos que o próprio membro pode editar (o resto só via ADM)
create or replace function atualizar_meu_perfil(p_instagram text, p_tipo_conta tipo_conta, p_mostra_instagram boolean)
returns void language sql security definer set search_path = public as $$
  update membros
     set instagram = p_instagram, tipo_conta = p_tipo_conta, mostra_instagram = p_mostra_instagram
   where id = meu_membro_id();
$$;

-- ---------------------------------------------------------------
-- Leituras públicas (sem dado sensível)
-- ---------------------------------------------------------------

-- Big numbers da inicial
create or replace function numeros_publicos()
returns table (membros_ativos int, carros_ativos int, montadoras int)
language sql stable security definer set search_path = public as $$
  select
    (select count(*) from membros where status = 'ativo')::int,
    (select count(*) from carros c join membros m on m.id = c.membro_id where m.status = 'ativo' and c.ativo and not c.pendente_validacao)::int,
    (select count(distinct c.montadora) from carros c join membros m on m.id = c.membro_id where m.status = 'ativo' and c.ativo and not c.pendente_validacao)::int;
$$;

-- Repertório da página Membros: só ativo com autorização de imagem
create or replace function membros_publicos()
returns table (
  codigo text, nome text, entrou_em date, instagram text,
  carros jsonb
)
language sql stable security definer set search_path = public as $$
  select
    m.codigo,
    m.nome,
    m.entrou_em,
    case when m.mostra_instagram then m.instagram end,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id, 'montadora', c.montadora, 'modelo', c.modelo,
        'tem_modificacao', c.tem_modificacao, 'modificacoes', c.modificacoes,
        'fotos', c.fotos,
        'atualizacoes', coalesce((
          select jsonb_agg(jsonb_build_object('texto', a.texto, 'fotos', a.fotos, 'criado_em', a.criado_em) order by a.criado_em desc)
          from atualizacoes a where a.carro_id = c.id
        ), '[]'::jsonb)
      ) order by c.criado_em)
      from carros c where c.membro_id = m.id and c.ativo and not c.pendente_validacao
    ), '[]'::jsonb)
  from membros m
  where m.status = 'ativo'
    and exists (select 1 from aceites ac where ac.membro_id = m.id and ac.termo = 'imagem')
  order by m.entrou_em, m.codigo;
$$;

-- ---------------------------------------------------------------
-- Inscrição pública (formulário do site)
-- Tudo entra como em_analise; alertas são calculados no painel.
-- ---------------------------------------------------------------
create or replace function enviar_inscricao(
  p_nome text, p_nascimento date, p_celular text, p_estado char(2), p_cidade text,
  p_instagram text, p_tipo_conta tipo_conta, p_mostra_instagram boolean,
  p_aceita_novidades boolean, p_carros jsonb
) returns void
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
  v_status status_membro;
  v_carro jsonb;
begin
  if p_carros is null or jsonb_array_length(p_carros) = 0 then
    raise exception 'Informe pelo menos um carro';
  end if;

  select id, status into v_id, v_status from membros where celular = regexp_replace(p_celular, '\D', '', 'g');

  if v_id is not null and v_status in ('ativo', 'inativo', 'removido') then
    raise exception 'Esse celular já está cadastrado na RUA. Fala com a gente no WhatsApp.';
  end if;

  if v_id is null then
    insert into membros (nome, nascimento, celular, estado, cidade, instagram, tipo_conta, mostra_instagram, aceita_novidades)
    values (trim(p_nome), p_nascimento, regexp_replace(p_celular, '\D', '', 'g'), upper(p_estado), trim(p_cidade),
            trim(p_instagram), p_tipo_conta, p_mostra_instagram, p_aceita_novidades)
    returning id into v_id;
  else
    -- reprovado ou em análise mandando de novo: atualiza dados e reabre análise
    update membros set nome = trim(p_nome), nascimento = p_nascimento, estado = upper(p_estado), cidade = trim(p_cidade),
           instagram = trim(p_instagram), tipo_conta = p_tipo_conta, mostra_instagram = p_mostra_instagram,
           aceita_novidades = p_aceita_novidades, status = 'em_analise'
     where id = v_id;
    delete from carros where membro_id = v_id;
  end if;

  for v_carro in select * from jsonb_array_elements(p_carros) loop
    insert into carros (membro_id, montadora, modelo, placa, tem_modificacao, modificacoes, fotos)
    values (v_id, v_carro->>'montadora', trim(v_carro->>'modelo'),
            upper(regexp_replace(coalesce(v_carro->>'placa', ''), '[^A-Za-z0-9]', '', 'g')),
            coalesce((v_carro->>'tem_modificacao')::boolean, false), v_carro->>'modificacoes',
            coalesce(array(select jsonb_array_elements_text(v_carro->'fotos')), '{}'));
  end loop;

  -- uma inscrição pendente por pessoa: reenvio só atualiza a data
  update inscricoes set enviada_em = now() where membro_id = v_id and decisao = 'pendente';
  if not found then
    insert into inscricoes (membro_id, origem) values (v_id, 'site');
  end if;

  insert into aceites (membro_id, termo) values (v_id, 'imagem'), (v_id, 'responsabilidade'), (v_id, 'privacidade')
  on conflict do nothing;
  if p_aceita_novidades then
    insert into aceites (membro_id, termo) values (v_id, 'novidades') on conflict do nothing;
  end if;
end;
$$;

-- ---------------------------------------------------------------
-- Fila do painel com alertas (só admin)
-- ---------------------------------------------------------------
create or replace function fila_inscricoes()
returns table (
  inscricao_id uuid, membro_id uuid, enviada_em timestamptz, nome text, idade int,
  cidade text, estado char(2), instagram text, tipo_conta tipo_conta, carros jsonb,
  alerta_menor boolean, alerta_fora_sp boolean, alerta_celular_repetido boolean, alerta_placa_repetida boolean
)
language sql stable security definer set search_path = public as $$
  select
    i.id, m.id, i.enviada_em, m.nome,
    extract(year from age(m.nascimento))::int,
    m.cidade, m.estado, m.instagram, m.tipo_conta,
    (select jsonb_agg(jsonb_build_object('montadora', c.montadora, 'modelo', c.modelo, 'placa', c.placa,
        'tem_modificacao', c.tem_modificacao, 'modificacoes', c.modificacoes, 'fotos', c.fotos))
       from carros c where c.membro_id = m.id),
    coalesce(age(m.nascimento) < interval '18 years', false),
    coalesce(m.estado <> 'SP', false),
    exists (select 1 from inscricoes i2 where i2.membro_id = m.id and i2.id <> i.id),
    exists (select 1 from carros c join carros c2 on c2.placa = c.placa and c2.membro_id <> c.membro_id
             where c.membro_id = m.id and c.placa <> '')
  from inscricoes i join membros m on m.id = i.membro_id
  where i.decisao = 'pendente' and is_admin()
  order by i.enviada_em asc;
$$;

-- Permissões de execução
revoke all on function fila_inscricoes() from public, anon;
revoke all on function atualizar_meu_perfil(text, tipo_conta, boolean) from public, anon;
grant execute on function numeros_publicos() to anon, authenticated;
grant execute on function membros_publicos() to anon, authenticated;
grant execute on function enviar_inscricao(text, date, text, char, text, text, tipo_conta, boolean, boolean, jsonb) to anon, authenticated;
grant execute on function fila_inscricoes() to authenticated;
grant execute on function atualizar_meu_perfil(text, tipo_conta, boolean) to authenticated;
