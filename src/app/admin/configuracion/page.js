"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { AlertTriangle } from 'lucide-react';

const PALABRA_CONFIRMACION = 'REINICIAR';

export default function Configuracion() {
  const [cargando, setCargando] = useState(true);
  const [textoConfirmacion, setTextoConfirmacion] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const router = useRouter();

  async function verificarSesion() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/admin/login');
      return;
    }
    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarSesion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const puedeReiniciar = textoConfirmacion.trim().toUpperCase() === PALABRA_CONFIRMACION;

  async function reiniciarDatosTransaccionales() {
    if (!puedeReiniciar || procesando) return;
    setProcesando(true);
    setMensaje('');

    try {
      // Se borra en este orden por las relaciones (detalle_pedido depende de pedidos)
      const { error: errorDetalle } = await supabase
        .from('detalle_pedido')
        .delete()
        .gt('id', 0);
      if (errorDetalle) throw errorDetalle;

      const { error: errorPedidos } = await supabase
        .from('pedidos')
        .delete()
        .gt('id', 0);
      if (errorPedidos) throw errorPedidos;

      const { error: errorGastos } = await supabase
        .from('gastos')
        .delete()
        .gt('id', 0);
      if (errorGastos) throw errorGastos;

      setMensaje(
        '✓ Ventas, historial y gastos reiniciados. Productos, ingredientes y recetas se quedaron intactos.'
      );
      setTextoConfirmacion('');
    } catch (err) {
      setMensaje('Ocurrió un error: ' + err.message);
    } finally {
      setProcesando(false);
    }
  }

  if (cargando) {
    return <p className="text-loco-texto">Cargando...</p>;
  }

  return (
    <>
      <h2 className="text-loco-rosa font-bold text-xl mb-4">Configuración</h2>

      <div className="bg-loco-card border border-loco-chile rounded-xl p-5 max-w-xl">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="text-loco-chile" size={20} />
          <h3 className="text-loco-texto font-bold">Reiniciar datos del negocio</h3>
        </div>

        <p className="text-loco-texto-suave text-sm mb-1">
          Esto borra <strong className="text-loco-texto">para siempre</strong> todas las
          ventas, el historial y los gastos registrados.
        </p>
        <p className="text-loco-texto-suave text-sm mb-4">
          <strong className="text-loco-texto">No se borran:</strong> productos,
          ingredientes ni recetas — el catálogo y las recetas se quedan tal cual.
        </p>
        <p className="text-loco-amarillo text-xs mb-5">
          Nota: el stock actual de ingredientes no se restaura automáticamente,
          ya que refleja el consumo real que ya ocurrió. Ajústalo a mano en
          Ingredientes si hace falta después de reiniciar.
        </p>

        <label className="text-loco-texto-suave text-xs block mb-1">
          Escribe <span className="text-loco-chile font-bold">REINICIAR</span> para
          confirmar
        </label>
        <input
          value={textoConfirmacion}
          onChange={(e) => setTextoConfirmacion(e.target.value)}
          className="bg-loco-bg text-loco-texto border border-loco-borde rounded-lg px-3 py-2 text-sm w-full mb-4"
          placeholder="REINICIAR"
        />

        <button
          onClick={reiniciarDatosTransaccionales}
          disabled={!puedeReiniciar || procesando}
          className="bg-loco-chile text-white font-bold text-sm px-5 py-2.5 rounded-full disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {procesando ? 'Reiniciando...' : 'Reiniciar ventas, historial y gastos'}
        </button>

        {mensaje && (
          <p className="text-loco-turquesa text-sm mt-4">{mensaje}</p>
        )}
      </div>
    </>
  );
}