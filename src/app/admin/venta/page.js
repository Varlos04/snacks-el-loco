"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function RegistrarVenta() {
  const [productos, setProductos] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [ingredientes, setIngredientes] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const router = useRouter();
  const procesandoRef = useRef(false);

  async function verificarSesionYCargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const [resProductos, resRecetas, resIngredientes] = await Promise.all([
      supabase.from('productos').select('*').eq('activo', true).order('categoria'),
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

  function agregarAlCarrito(producto) {
    setCarrito((prev) => {
      const existente = prev.find((item) => item.producto.id === producto.id);
      if (existente) {
        return prev.map((item) =>
          item.producto.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { producto, cantidad: 1 }];
    });
  }

  function quitarDelCarrito(productoId) {
    setCarrito((prev) => prev.filter((item) => item.producto.id !== productoId));
  }

  const total = carrito.reduce(
    (suma, item) => suma + item.producto.precio_venta * item.cantidad,
    0
  );

  async function confirmarVenta() {
    if (carrito.length === 0) return;

    // Bloqueo extra: si ya hay una venta en proceso, ignora clics adicionales
    if (procesandoRef.current) return;
    procesandoRef.current = true;

    setGuardando(true);
    setMensaje('');

    try {
      const { data: pedido, error: errorPedido } = await supabase
        .from('pedidos')
        .insert({ total, estado: 'completado' })
        .select()
        .single();

      if (errorPedido) {
        setMensaje('Error al registrar el pedido: ' + errorPedido.message);
        return;
      }

      const detalles = carrito.map((item) => ({
        pedido_id: pedido.id,
        producto_id: item.producto.id,
        cantidad: item.cantidad,
        subtotal: item.producto.precio_venta * item.cantidad,
      }));

      const { error: errorDetalle } = await supabase
        .from('detalle_pedido')
        .insert(detalles);

      if (errorDetalle) {
        setMensaje('Error al guardar el detalle: ' + errorDetalle.message);
        return;
      }

      const descuentos = {};
      carrito.forEach((item) => {
        const recetasDelProducto = recetas.filter(
          (r) => r.producto_id === item.producto.id
        );
        recetasDelProducto.forEach((r) => {
          const totalUsado = r.cantidad_necesaria * item.cantidad;
          descuentos[r.ingrediente_id] = (descuentos[r.ingrediente_id] || 0) + totalUsado;
        });
      });

      for (const [ingredienteId, cantidadUsada] of Object.entries(descuentos)) {
        const ingrediente = ingredientes.find((i) => i.id === parseInt(ingredienteId));
        if (!ingrediente) continue;

        const nuevoStock = ingrediente.stock_actual - cantidadUsada;

        await supabase
          .from('ingredientes')
          .update({ stock_actual: nuevoStock })
          .eq('id', ingredienteId);
      }

      setMensaje('¡Venta registrada! Inventario actualizado.');
      setCarrito([]);

      const { data: ingredientesActualizados } = await supabase
        .from('ingredientes')
        .select('*');
      if (ingredientesActualizados) setIngredientes(ingredientesActualizados);
    } catch (err) {
      setMensaje('Ocurrió un error inesperado: ' + err.message);
    } finally {
      setGuardando(false);
      procesandoRef.current = false;
    }
  }

  if (cargando) {
    return <p className="text-loco-texto p-8">Cargando...</p>;
  }

  return (
    <main className="min-h-screen bg-loco-bg px-6 py-10 pb-40">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-loco-turquesa font-extrabold text-3xl">Registrar venta</h1>
        <a href="/admin" className="text-loco-texto-suave text-sm underline">
          ← Volver al panel
        </a>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {productos.map((producto) => (
          <button
            key={producto.id}
            onClick={() => agregarAlCarrito(producto)}
            className="bg-loco-card rounded-xl p-4 text-left hover:border-loco-turquesa border border-transparent transition"
          >
            <p className="text-loco-texto font-bold">{producto.nombre}</p>
            <p className="text-loco-turquesa text-sm font-bold">
              ${producto.precio_venta} MXN
            </p>
          </button>
        ))}
      </div>

      {mensaje && (
        <div className="fixed bottom-0 left-0 right-0 bg-loco-card border-t border-loco-turquesa/30 p-4 text-center z-10">
          <p className="text-loco-turquesa text-sm max-w-2xl mx-auto">{mensaje}</p>
        </div>
      )}

      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-loco-card border-t border-loco-turquesa/30 p-4">
          <div className="max-w-2xl mx-auto">
            <ul className="mb-3 max-h-32 overflow-y-auto">
              {carrito.map((item) => (
                <li
                  key={item.producto.id}
                  className="flex justify-between text-loco-texto text-sm py-1"
                >
                  <span>
                    {item.cantidad}× {item.producto.nombre}
                  </span>
                  <div className="flex items-center gap-3">
                    <span>${item.producto.precio_venta * item.cantidad} MXN</span>
                    <button
                      onClick={() => quitarDelCarrito(item.producto.id)}
                      className="text-loco-chile text-xs"
                    >
                      quitar
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between">
              <span className="text-loco-turquesa font-bold text-lg">
                Total: ${total} MXN
              </span>
              <button
                onClick={confirmarVenta}
                disabled={guardando}
                className="bg-loco-rosa text-white font-bold px-5 py-2 rounded-full disabled:opacity-50"
              >
                {guardando ? 'Guardando...' : 'Confirmar venta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}