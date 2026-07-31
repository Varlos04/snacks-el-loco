"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Historial() {
  const [pedidos, setPedidos] = useState([]);
  const [detalles, setDetalles] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [diasAbiertos, setDiasAbiertos] = useState({});
  const [pedidosAbiertos, setPedidosAbiertos] = useState({});
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

  function detalleDePedido(pedidoId) {
    return detalles.filter((d) => d.pedido_id === pedidoId);
  }

  function claveDelDia(fechaISO) {
    return fechaISO.slice(0, 10);
  }

  function formatearFechaLarga(claveDia) {
    const fecha = new Date(claveDia + 'T00:00:00');
    return fecha.toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function formatearHora(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }

  const dias = {};
  pedidos.forEach((pedido) => {
    const clave = claveDelDia(pedido.fecha);
    if (!dias[clave]) {
      dias[clave] = { pedidos: [], total: 0 };
    }
    dias[clave].pedidos.push(pedido);
    dias[clave].total += pedido.total;
  });

  const clavesOrdenadas = Object.keys(dias).sort((a, b) => (a < b ? 1 : -1));

  function alternarDia(clave) {
    setDiasAbiertos((prev) => ({ ...prev, [clave]: !prev[clave] }));
  }

  function alternarPedido(id) {
    setPedidosAbiertos((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  if (cargando) {
    return <p className="text-loco-texto">Cargando historial...</p>;
  }

  return (
    <>
      <h2 className="text-loco-rosa font-bold text-xl mb-4">Historial de ventas</h2>

      {clavesOrdenadas.length === 0 && (
        <p className="text-loco-texto-suave text-sm">
          Todavía no hay ventas registradas.
        </p>
      )}

      <div className="flex flex-col gap-4">
        {clavesOrdenadas.map((clave) => {
          const dia = dias[clave];
          const abierto = diasAbiertos[clave];

          return (
            <div key={clave} className="bg-loco-card rounded-xl overflow-hidden">
              <button
                onClick={() => alternarDia(clave)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div>
                  <p className="text-loco-texto font-bold capitalize">
                    {formatearFechaLarga(clave)}
                  </p>
                  <p className="text-loco-texto-suave text-xs">
                    {dia.pedidos.length} venta{dia.pedidos.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="bg-loco-turquesa text-loco-bg font-bold text-sm px-3 py-1 rounded-full">
                    ${dia.total.toFixed(2)} MXN
                  </span>
                  <span className="text-loco-texto-suave text-lg">
                    {abierto ? '▲' : '▼'}
                  </span>
                </div>
              </button>

              {abierto && (
                <div className="border-t border-loco-turquesa/20 px-4 pb-4">
                  {dia.pedidos.map((pedido) => {
                    const items = detalleDePedido(pedido.id);
                    const pedidoAbierto = pedidosAbiertos[pedido.id];

                    return (
                      <div
                        key={pedido.id}
                        className="border-b border-loco-turquesa/10 last:border-b-0 py-3"
                      >
                        <button
                          onClick={() => alternarPedido(pedido.id)}
                          className="w-full flex items-center justify-between text-left"
                        >
                          <span className="text-loco-texto-suave text-sm">
                            {formatearHora(pedido.fecha)} · {items.length} producto
                            {items.length !== 1 ? 's' : ''}
                          </span>
                          <span className="text-loco-texto text-sm font-bold">
                            ${pedido.total} MXN
                          </span>
                        </button>

                        {pedidoAbierto && (
                          <ul className="mt-2 pl-3 flex flex-col gap-1">
                            {items.map((item) => (
                              <li
                                key={item.id}
                                className="flex justify-between text-loco-texto-suave text-xs"
                              >
                                <span>
                                  {item.cantidad}× {nombreProducto(item.producto_id)}
                                </span>
                                <span>${item.subtotal} MXN</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}