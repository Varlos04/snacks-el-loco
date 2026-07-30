"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

const UMBRAL_STOCK_BAJO = 10;

export default function ListaDeCompras() {
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  async function verificarSesionYCargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const { data, error } = await supabase
      .from('ingredientes')
      .select('*')
      .order('stock_actual', { ascending: true });

    if (!error) {
      setIngredientes(data);
    }
    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarSesionYCargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const porComprar = ingredientes.filter(
    (ing) => ing.stock_actual < UMBRAL_STOCK_BAJO
  );
  const enBuenNivel = ingredientes.filter(
    (ing) => ing.stock_actual >= UMBRAL_STOCK_BAJO
  );

  if (cargando) {
    return <p className="text-loco-texto p-8">Cargando lista de compras...</p>;
  }

  return (
    <main className="min-h-screen bg-loco-bg px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-loco-turquesa font-extrabold text-3xl">
          Lista de compras
        </h1>
        <a href="/admin" className="text-loco-texto-suave text-sm underline">
          ← Volver al panel
        </a>
      </div>

      <p className="text-loco-texto-suave text-sm mb-6 max-w-2xl">
        Ingredientes con menos de {UMBRAL_STOCK_BAJO} unidades en stock — es
        buena idea comprarlos antes del próximo fin de semana.
      </p>

      {porComprar.length === 0 ? (
        <p className="text-loco-lime text-sm mb-8">
          Todo tu inventario está en buen nivel. No hay nada urgente que comprar.
        </p>
      ) : (
        <div className="flex flex-col gap-2 mb-10">
          {porComprar.map((ing) => (
            <div
              key={ing.id}
              className="bg-loco-card border-l-4 border-loco-chile rounded-xl p-4 flex items-center justify-between"
            >
              <div>
                <p className="text-loco-texto font-bold">{ing.nombre}</p>
                <p className="text-loco-texto-suave text-sm">
                  ${ing.costo_unitario} MXN / {ing.unidad}
                </p>
              </div>
              {ing.stock_actual < 0 ? (
  <span className="bg-loco-chile text-white font-bold text-sm px-3 py-1 rounded-full">
    ⚠ Sin stock (falta surtir)
  </span>
) : (
  <span className="bg-loco-chile text-white font-bold text-sm px-3 py-1 rounded-full">
    Quedan {ing.stock_actual} {ing.unidad}
  </span>
)}
            </div>
          ))}
        </div>
      )}

      <h2 className="text-loco-texto-suave font-bold text-sm mb-3 uppercase tracking-wide">
        En buen nivel
      </h2>
      <div className="flex flex-col gap-2 opacity-60">
        {enBuenNivel.map((ing) => (
          <div
            key={ing.id}
            className="bg-loco-card rounded-xl p-4 flex items-center justify-between"
          >
            <p className="text-loco-texto text-sm">{ing.nombre}</p>
            <span className="text-loco-texto-suave text-sm">
              {ing.stock_actual} {ing.unidad}
            </span>
          </div>
        ))}
      </div>
    </main>
  );
}