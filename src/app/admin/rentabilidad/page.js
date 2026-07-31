"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Rentabilidad() {
  const [productos, setProductos] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  async function verificarSesionYCargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const [resProductos, resRecetas, resIngredientes] = await Promise.all([
      supabase.from('productos').select('*').order('categoria'),
      supabase.from('recetas').select('*'),
      supabase.from('ingredientes').select('*'),
    ]);

    if (resProductos.data) setProductos(resProductos.data);
    if (resRecetas.data) setRecetas(resRecetas.data);
    if (resIngredientes.data) setIngredientes(resIngredientes.data);

    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarSesionYCargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function calcularCosto(productoId) {
    const items = recetas.filter((r) => r.producto_id === productoId);
    return items.reduce((total, item) => {
      const ing = ingredientes.find((i) => i.id === item.ingrediente_id);
      if (!ing) return total;
      return total + ing.costo_unitario * item.cantidad_necesaria;
    }, 0);
  }

  function tieneReceta(productoId) {
    return recetas.some((r) => r.producto_id === productoId);
  }

  function evaluarEstado(margenPorcentaje, sinReceta) {
    if (sinReceta) {
      return {
        label: 'Sin receta',
        color: 'bg-loco-texto-suave text-loco-bg',
        borde: 'border-loco-texto-suave',
      };
    }
    if (margenPorcentaje < 30) {
      return {
        label: 'Alarma: pérdida o margen muy bajo',
        color: 'bg-loco-chile text-white',
        borde: 'border-loco-chile',
      };
    }
    if (margenPorcentaje < 50) {
      return {
        label: 'Margen bajo',
        color: 'bg-loco-amarillo text-loco-bg',
        borde: 'border-loco-amarillo',
      };
    }
    return {
      label: 'Buena ganancia',
      color: 'bg-loco-lime text-loco-bg',
      borde: 'border-loco-lime',
    };
  }

  const analisis = productos
    .filter((p) => p.activo)
    .map((producto) => {
      const sinReceta = !tieneReceta(producto.id);
      const costo = calcularCosto(producto.id);
      const margen = producto.precio_venta - costo;
      const margenPorcentaje = producto.precio_venta
        ? (margen / producto.precio_venta) * 100
        : 0;
      const estado = evaluarEstado(margenPorcentaje, sinReceta);

      return { producto, costo, margen, margenPorcentaje, estado, sinReceta };
    })
    .sort((a, b) => a.margenPorcentaje - b.margenPorcentaje);

  const conAlarma = analisis.filter(
    (a) => !a.sinReceta && a.margenPorcentaje < 30
  );
  const conMargenBajo = analisis.filter(
    (a) => !a.sinReceta && a.margenPorcentaje >= 30 && a.margenPorcentaje < 50
  );
  const conBuenaGanancia = analisis.filter(
    (a) => !a.sinReceta && a.margenPorcentaje >= 50
  );
  const sinRecetaCount = analisis.filter((a) => a.sinReceta).length;

  if (cargando) {
    return <p className="text-loco-texto">Cargando análisis...</p>;
  }

  return (
    <>
      <h2 className="text-loco-rosa font-bold text-xl mb-4">Rentabilidad</h2>

      <p className="text-loco-texto-suave text-sm mb-6 max-w-2xl">
        Con 50% de margen o más el producto va bien (verde). Entre 30% y 49% hay
        que tener cuidado (amarillo). Menos de 30% es alarma (rojo) — puede que
        el producto esté dejando muy poco, o incluso perdiendo dinero.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        <div className="bg-loco-card border border-loco-chile rounded-xl p-4 text-center">
          <p className="text-loco-chile font-extrabold text-2xl">{conAlarma.length}</p>
          <p className="text-loco-texto-suave text-xs">En alarma</p>
        </div>
        <div className="bg-loco-card border border-loco-amarillo rounded-xl p-4 text-center">
          <p className="text-loco-amarillo font-extrabold text-2xl">{conMargenBajo.length}</p>
          <p className="text-loco-texto-suave text-xs">Margen bajo</p>
        </div>
        <div className="bg-loco-card border border-loco-lime rounded-xl p-4 text-center">
          <p className="text-loco-lime font-extrabold text-2xl">{conBuenaGanancia.length}</p>
          <p className="text-loco-texto-suave text-xs">Buena ganancia</p>
        </div>
        <div className="bg-loco-card border border-loco-texto-suave rounded-xl p-4 text-center">
          <p className="text-loco-texto-suave font-extrabold text-2xl">{sinRecetaCount}</p>
          <p className="text-loco-texto-suave text-xs">Sin receta cargada</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {analisis.map(({ producto, costo, margen, margenPorcentaje, estado, sinReceta }) => (
          <div
            key={producto.id}
            className={`bg-loco-card rounded-xl p-4 border-l-4 ${estado.borde} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}
          >
            <div>
              <p className="text-loco-texto font-bold">{producto.nombre}</p>
              <p className="text-loco-texto-suave text-sm">{producto.categoria}</p>
            </div>

            <div className="flex items-center gap-5 flex-wrap">
              {!sinReceta && (
                <>
                  <div className="text-right">
                    <p className="text-loco-texto-suave text-xs">Precio</p>
                    <p className="text-loco-texto font-bold text-sm">
                      ${producto.precio_venta} MXN
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-loco-texto-suave text-xs">Costo</p>
                    <p className="text-loco-texto font-bold text-sm">
                      ${costo.toFixed(2)} MXN
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-loco-texto-suave text-xs">Ganancia</p>
                    <p className="text-loco-texto font-bold text-sm">
                      ${margen.toFixed(2)} MXN
                    </p>
                  </div>
                </>
              )}
              <span className={`${estado.color} text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap`}>
                {sinReceta ? estado.label : `${margenPorcentaje.toFixed(0)}% — ${estado.label}`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}