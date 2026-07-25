"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Recetas() {
  const [productos, setProductos] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [ingredienteSeleccionado, setIngredienteSeleccionado] = useState('');
  const [cantidad, setCantidad] = useState('');
  const router = useRouter();

  async function verificarSesionYCargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const [resProductos, resIngredientes, resRecetas] = await Promise.all([
      supabase.from('productos').select('*').order('nombre'),
      supabase.from('ingredientes').select('*').order('nombre'),
      supabase.from('recetas').select('*'),
    ]);

    if (resProductos.data) setProductos(resProductos.data);
    if (resIngredientes.data) setIngredientes(resIngredientes.data);
    if (resRecetas.data) setRecetas(resRecetas.data);

    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarSesionYCargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function agregarIngredienteAReceta(e) {
    e.preventDefault();

    const { data, error } = await supabase
      .from('recetas')
      .insert({
        producto_id: parseInt(productoSeleccionado),
        ingrediente_id: parseInt(ingredienteSeleccionado),
        cantidad_necesaria: parseFloat(cantidad),
      })
      .select();

    if (!error && data) {
      setRecetas((prev) => [...prev, data[0]]);
      setIngredienteSeleccionado('');
      setCantidad('');
    }
  }

  async function eliminarDeReceta(id) {
    const { error } = await supabase.from('recetas').delete().eq('id', id);
    if (!error) {
      setRecetas((prev) => prev.filter((r) => r.id !== id));
    }
  }

  function calcularCosto(productoId) {
    const items = recetas.filter((r) => r.producto_id === productoId);
    return items.reduce((total, item) => {
      const ing = ingredientes.find((i) => i.id === item.ingrediente_id);
      if (!ing) return total;
      return total + ing.costo_unitario * item.cantidad_necesaria;
    }, 0);
  }

  if (cargando) {
    return <p className="text-loco-texto p-8">Cargando recetas...</p>;
  }

  const recetasDelProducto = recetas.filter(
    (r) => r.producto_id === parseInt(productoSeleccionado)
  );

  return (
    <main className="min-h-screen bg-loco-bg px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-loco-turquesa font-extrabold text-3xl">Recetas y costos</h1>
        <a href="/admin" className="text-loco-texto-suave text-sm underline">
          ← Volver al panel
        </a>
      </div>

      <div className="mb-6">
        <label className="text-loco-texto-suave text-xs block mb-1">
          Selecciona un producto
        </label>
        <select
          value={productoSeleccionado}
          onChange={(e) => setProductoSeleccionado(e.target.value)}
          className="bg-loco-card text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-2 text-sm w-full max-w-xs"
        >
          <option value="">-- Elige un producto --</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre}
            </option>
          ))}
        </select>
      </div>

      {productoSeleccionado && (
        <>
          <form
            onSubmit={agregarIngredienteAReceta}
            className="bg-loco-card rounded-xl p-4 flex flex-wrap gap-3 items-end mb-6"
          >
            <div className="flex flex-col gap-1">
              <label className="text-loco-texto-suave text-xs">Ingrediente</label>
              <select
                value={ingredienteSeleccionado}
                onChange={(e) => setIngredienteSeleccionado(e.target.value)}
                required
                className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-40"
              >
                <option value="">Elige uno</option>
                {ingredientes.map((ing) => (
                  <option key={ing.id} value={ing.id}>
                    {ing.nombre} ({ing.unidad})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-loco-texto-suave text-xs">Cantidad usada</label>
              <input
                type="number"
                step="0.01"
                value={cantidad}
                onChange={(e) => setCantidad(e.target.value)}
                required
                className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-24"
              />
            </div>
            <button
              type="submit"
              className="bg-loco-rosa text-white font-bold text-sm px-4 py-2 rounded-full"
            >
              + Agregar a receta
            </button>
          </form>

          <div className="flex flex-col gap-2 mb-4">
            {recetasDelProducto.map((item) => {
              const ing = ingredientes.find((i) => i.id === item.ingrediente_id);
              return (
                <div
                  key={item.id}
                  className="bg-loco-card rounded-lg p-3 flex items-center justify-between"
                >
                  <span className="text-loco-texto text-sm">
                    {ing?.nombre}: {item.cantidad_necesaria} {ing?.unidad}
                  </span>
                  <button
                    onClick={() => eliminarDeReceta(item.id)}
                    className="text-loco-chile text-xs"
                  >
                    quitar
                  </button>
                </div>
              );
            })}
            {recetasDelProducto.length === 0 && (
              <p className="text-loco-texto-suave text-sm">
                Este producto no tiene ingredientes en su receta todavía.
              </p>
            )}
          </div>

          <div className="bg-loco-card border border-loco-turquesa/30 rounded-xl p-4">
            {(() => {
              const producto = productos.find(
                (p) => p.id === parseInt(productoSeleccionado)
              );
              const costo = calcularCosto(parseInt(productoSeleccionado));
              const margen = producto.precio_venta - costo;
              const margenPorcentaje = producto.precio_venta
                ? ((margen / producto.precio_venta) * 100).toFixed(0)
                : 0;

              return (
                <div className="flex flex-wrap gap-6">
                  <div>
                    <p className="text-loco-texto-suave text-xs">Precio de venta</p>
                    <p className="text-loco-turquesa font-bold text-lg">
                      ${producto.precio_venta} MXN
                    </p>
                  </div>
                  <div>
                    <p className="text-loco-texto-suave text-xs">Costo de ingredientes</p>
                    <p className="text-loco-chile font-bold text-lg">
                      ${costo.toFixed(2)} MXN
                    </p>
                  </div>
                  <div>
                    <p className="text-loco-texto-suave text-xs">Margen</p>
                    <p className="text-loco-rosa font-bold text-lg">
                      ${margen.toFixed(2)} MXN ({margenPorcentaje}%)
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}
    </main>
  );
}