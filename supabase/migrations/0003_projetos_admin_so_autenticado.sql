-- A política de admin valia pra todos os papéis e chamava is_admin(), que a anon não executa.
-- Resultado: a leitura pública de projetos falhava. Admin só faz sentido pra quem está logado.
alter policy admin_projetos on public.projetos to authenticated;
