"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Ingredientes() {
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nombre, setNombre] = useState('');
  const [costoUnitario, setCostoUnitario] = useState('');
  const [unidad, setUnidad] = useState('');
  const [stockActual, setStockActual] = useState('');
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
      .order('nombre');

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

  async function agregarIngrediente(e) {
    e.preventDefault();

    const { data, error } = await supabase
      .from('ingredientes')
      .insert({
        nombre,
        costo_unitario: parseFloat(costoUnitario),
        unidad,
        stock_actual: parseFloat(stockActual) || 0,
      })
      .select();

    if (!error && data) {
      setIngredientes((prev) => [...prev, data[0]].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      setNombre('');
      setCostoUnitario('');
      setUnidad('');
      setStockActual('');
    }
  }

  async function eliminarIngrediente(id) {
    const { error } = await supabase.from('ingredientes').delete().eq('id', id);

    if (!error) {
      setIngredientes((prev) => prev.filter((i) => i.id !== id));
    }
  }

  if (cargando) {
    return <p className="text-loco-texto p-8">Cargando ingredientes...</p>;
  }

  return (
    <main className="min-h-screen bg-loco-bg px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-loco-turquesa font-extrabold text-3xl">
          Ingredientes
        </h1>
        <a href="/admin" className="text-loco-texto-suave text-sm underline">
          ← Volver al panel
        </a>
      </div>

      <form
        onSubmit={agregarIngrediente}
        className="bg-loco-card rounded-xl p-4 flex flex-wrap gap-3 items-end mb-8"
      >
        <div className="flex flex-col gap-1">
          <label className="text-loco-texto-suave text-xs">Nombre</label>
          <input
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Chamoy"
            required
            className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-32"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-loco-texto-suave text-xs">Costo unitario (MXN)</label>
          <input
            type="number"
            step="0.01"
            value={costoUnitario}
            onChange={(e) => setCostoUnitario(e.target.value)}
            placeholder="0.50"
            required
            className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-28"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-loco-texto-suave text-xs">Unidad</label>
          <input
            value={unidad}
            onChange={(e) => setUnidad(e.target.value)}
            placeholder="ml, g, pieza"
            required
            className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-24"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-loco-texto-suave text-xs">Stock actual</label>
          <input
            type="number"
            step="0.01"
            value={stockActual}
            onChange={(e) => setStockActual(e.target.value)}
            placeholder="0"
            className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-24"
          />
        </div>
        <button
          type="submit"
          className="bg-loco-rosa text-white font-bold text-sm px-4 py-2 rounded-full"
        >
          + Agregar
        </button>
      </form>

      <div className="flex flex-col gap-3">
        {ingredientes.map((ing) => (
          <div
            key={ing.id}
            className="bg-loco-card rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-loco-texto font-bold">{ing.nombre}</p>
              <p className="text-loco-texto-suave text-sm flex items-center gap-2">
  <span>${ing.costo_unitario} MXN / {ing.unidad} · Stock: {ing.stock_actual}</span>
  {ing.stock_actual < 10 && (
    <span className="bg-loco-chile text-white text-xs font-bold px-2 py-0.5 rounded-full">
      Stock bajo
    </span>
  )}
</p>
            </div>
            <button
              onClick={() => eliminarIngrediente(ing.id)}
              className="text-loco-chile text-xs"
            >
              eliminar
            </button>
          </div>
        ))}
        {ingredientes.length === 0 && (
          <p className="text-loco-texto-suave text-sm">
            Todavía no has agregado ningún ingrediente.
          </p>
        )}
      </div>
    </main>
  );
}