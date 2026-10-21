import { createClient } from "@/lib/supabase/server";
import type { MembroPublico, Projeto } from "@/lib/formatos";

export * from "@/lib/formatos";

export async function carrosAtivos(): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("numeros_publicos").single<{ carros_ativos: number }>();
  if (error || !data) return null;
  return data.carros_ativos;
}

export async function membrosPublicos(): Promise<MembroPublico[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("membros_publicos");
  if (error || !data) return [];
  return data as MembroPublico[];
}

export async function projetos(): Promise<Projeto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projetos")
    .select("slug, nome, carro, descricao, ordem")
    .eq("ativo", true)
    .order("ordem");
  if (error || !data) return [];
  return data;
}
