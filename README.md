# Site RUA

Site da comunidade RUA (Rua Unindo Amigos) · @rua.og

- `CLAUDE.md`: guia do projeto (marca, privacidade, páginas, regras)
- `supabase/migrations/`: banco de dados (rodar no SQL Editor do Supabase, em ordem)
- `scripts/importar_forms.py`: importa a planilha do Google Forms
- `public/`: fontes, logos e ícones

## Importar o Forms

```
python3 scripts/importar_forms.py respostas.csv
```

Gera `importacao/importar.sql` e `importacao/relatorio.md`. Rodar o SQL no Supabase depois do schema.
A pasta `importacao/` tem dados pessoais e não vai pro GitHub.
