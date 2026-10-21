import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Cliente com a chave anon. Leitura pública só por numeros_publicos(),
// membros_publicos() e a tabela projetos.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(lista) {
          try {
            lista.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Chamado de um Server Component: o middleware cuida da sessão.
          }
        },
      },
    },
  );
}
