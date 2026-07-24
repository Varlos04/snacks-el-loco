import { supabase } from '@/lib/supabaseClient';
import Menu from '@/components/Menu';

export default async function Home() {
  const { data: productos, error } = await supabase
    .from('productos')
    .select('*')
    .eq('activo', true)
    .order('categoria');

  if (error) {
    return <p className="text-loco-chile p-8">Hubo un error cargando el menú: {error.message}</p>;
  }

  return (
    <main className="min-h-screen bg-loco-bg px-6 py-10">
      <h1 className="text-loco-turquesa font-extrabold text-4xl text-center mb-10">
        Snacks El Loco
      </h1>
      <Menu productos={productos} />
    </main>
  );
}