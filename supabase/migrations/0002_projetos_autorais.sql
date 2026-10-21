-- Projetos autorais da RUA (Faísca e Frank) + big numbers completos.
-- Aplicado no Supabase em 21/10/2026 (0002_projetos_autorais e 0003_big_numbers).

create table projetos (
  slug text primary key,
  nome text not null,
  carro text not null,
  descricao text,
  ordem int not null default 0,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);
alter table projetos enable row level security;
create policy projetos_leitura on projetos for select using (ativo);
create policy admin_projetos on projetos for all using (is_admin()) with check (is_admin());

insert into projetos (slug, nome, carro, descricao, ordem) values
 ('faisca', 'Faísca', 'Chevette', 'Projeto de drift da RUA', 1),
 ('frank', 'Frank', 'Chevette Acelero turbo', 'Projeto turbo da RUA', 2);

-- Big numbers da inicial: usar esta função no site
create or replace function big_numbers()
returns table (membros_ativos int, carros_ativos int, montadoras int, projetos_autorais int)
language sql stable security definer set search_path = public as $$
  select n.membros_ativos, n.carros_ativos, n.montadoras, (select count(*) from projetos where ativo)::int
  from numeros_publicos() n;
$$;
grant execute on function big_numbers() to anon, authenticated;
