"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function CorteDeCaja() {
  const [pedidos, setPedidos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const router = useRouter();

  async function verificarSesionYCargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const [resPedidos, resDetalles, resProductos] = await Promise.all([
      supabase.from('pedidos').select('*').order('fecha', { ascending: false }),
      supabase.from('detalle_pedido').select('*'),
      supabase.from('productos').select('*'),
    ]);

    if (resPedidos.data) setPedidos(resPedidos.data);
    if (resDetalles.data) setDetalles(resDetalles.data);
    if (resProductos.data) setProductos(resProductos.data);

    if (resPedidos.data && resPedidos.data.length > 0) {
      setFechaSeleccionada(resPedidos.data[0].fecha.slice(0, 10));
    }

    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarSesionYCargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function nombreProducto(productoId) {
    const p = productos.find((prod) => prod.id === productoId);
    return p ? p.nombre : 'Producto eliminado';
  }

  const diasDisponibles = [
    ...new Set(pedidos.map((p) => p.fecha.slice(0, 10))),
  ].sort((a, b) => (a < b ? 1 : -1));

  const pedidosDelDia = pedidos.filter(
    (p) => p.fecha.slice(0, 10) === fechaSeleccionada
  );
  const idsDelDia = pedidosDelDia.map((p) => p.id);
  const detallesDelDia = detalles.filter((d) => idsDelDia.includes(d.pedido_id));

  const totalDelDia = pedidosDelDia.reduce((suma, p) => suma + p.total, 0);
  const numeroDeVentas = pedidosDelDia.length;
  const ticketPromedio = numeroDeVentas > 0 ? totalDelDia / numeroDeVentas : 0;

  const conteoPorProducto = {};
  detallesDelDia.forEach((d) => {
    if (!conteoPorProducto[d.producto_id]) {
      conteoPorProducto[d.producto_id] = { cantidad: 0, ingresos: 0 };
    }
    conteoPorProducto[d.producto_id].cantidad += d.cantidad;
    conteoPorProducto[d.producto_id].ingresos += d.subtotal;
  });

  const ranking = Object.entries(conteoPorProducto)
    .map(([productoId, datos]) => ({
      productoId: parseInt(productoId),
      nombre: nombreProducto(parseInt(productoId)),
      ...datos,
    }))
    .sort((a, b) => b.cantidad - a.cantidad);

  function formatearFechaLarga(claveDia) {
    if (!claveDia) return '';
    const fecha = new Date(claveDia + 'T00:00:00');
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  if (cargando) {
    return <p className="text-loco-texto">Cargando corte de caja...</p>;
  }

  return (
    <>
      <h2 className="text-loco-rosa font-bold text-xl mb-4">Corte de caja</h2>

      {diasDisponibles.length === 0 ? (
        <p className="text-loco-texto-suave text-sm">
          Todavía no hay ventas registradas.
        </p>
      ) : (
        <>
          <div className="mb-6">
            <label className="text-loco-texto-suave text-xs block mb-1">
              Selecciona el día
            </label>
            <select
              value={fechaSeleccionada}
              onChange={(e) => setFechaSeleccionada(e.target.value)}
              className="bg-loco-card text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-2 text-sm w-full max-w-xs"
            >
              {diasDisponibles.map((dia) => (
                <option key={dia} value={dia}>
                  {formatearFechaLarga(dia)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="bg-loco-card border border-loco-turquesa/30 rounded-xl p-5 text-center">
              <p className="text-loco-turquesa font-extrabold text-3xl">
                ${totalDelDia.toFixed(2)}
              </p>
              <p className="text-loco-texto-suave text-xs mt-1">Total vendido (MXN)</p>
            </div>
            <div className="bg-loco-card border border-loco-turquesa/30 rounded-xl p-5 text-center">
              <p className="text-loco-turquesa font-extrabold text-3xl">
                {numeroDeVentas}
              </p>
              <p className="text-loco-texto-suave text-xs mt-1">Ventas registradas</p>
            </div>
            <div className="bg-loco-card border border-loco-turquesa/30 rounded-xl p-5 text-center">
              <p className="text-loco-turquesa font-extrabold text-3xl">
                ${ticketPromedio.toFixed(2)}
              </p>
              <p className="text-loco-texto-suave text-xs mt-1">Ticket promedio</p>
            </div>
          </div>

          <h3 className="text-loco-texto font-bold text-lg mb-4">
            Productos más vendidos ese día
          </h3>

          {ranking.length === 0 ? (
            <p className="text-loco-texto-suave text-sm">
              No hay ventas para este día.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {ranking.map((item, index) => (
                <div
                  key={item.productoId}
                  className="bg-loco-card rounded-xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-loco-amarillo font-extrabold text-lg w-6">
                      {index + 1}
                    </span>
                    <p className="text-loco-texto font-bold">{item.nombre}</p>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="text-loco-texto-suave text-sm">
                      {item.cantidad} pieza{item.cantidad !== 1 ? 's' : ''}
                    </span>
                    <span className="bg-loco-turquesa text-loco-bg font-bold text-sm px-3 py-1 rounded-full">
                      ${item.ingresos.toFixed(2)} MXN
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}