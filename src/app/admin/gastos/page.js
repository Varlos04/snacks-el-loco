"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [concepto, setConcepto] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState('');
  const router = useRouter();

  async function verificarSesionYCargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const { data, error } = await supabase
      .from('gastos')
      .select('*')
      .order('fecha', { ascending: false });

    if (!error) {
      setGastos(data);
    }

    // Por defecto, la fecha de hoy en formato YYYY-MM-DD
    const hoy = new Date().toISOString().slice(0, 10);
    setFecha(hoy);

    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarSesionYCargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function agregarGasto(e) {
    e.preventDefault();

    const { data, error } = await supabase
      .from('gastos')
      .insert({
        concepto,
        monto: parseFloat(monto),
        fecha,
      })
      .select()
      .single();

    if (!error && data) {
      setGastos((prev) =>
        [...prev, data].sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
      );
      setConcepto('');
      setMonto('');
    }
  }

  async function eliminarGasto(id) {
    const { error } = await supabase.from('gastos').delete().eq('id', id);
    if (!error) {
      setGastos((prev) => prev.filter((g) => g.id !== id));
    }
  }

  function formatearFecha(fechaISO) {
    const f = new Date(fechaISO + 'T00:00:00');
    return f.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const totalGastos = gastos.reduce((suma, g) => suma + g.monto, 0);

  if (cargando) {
    return <p className="text-loco-texto p-8">Cargando gastos...</p>;
  }

  return (
    <main className="min-h-screen bg-loco-bg px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-loco-turquesa font-extrabold text-3xl">
          Gastos generales
        </h1>
        <a href="/admin" className="text-loco-texto-suave text-sm underline">
          ← Volver al panel
        </a>
      </div>

      <p className="text-loco-texto-suave text-sm mb-6 max-w-2xl">
        Aquí van los gastos que no son ingredientes de receta: gas, renta del
        puesto, bolsas, transporte, etc. Esto ayuda a ver la ganancia real del
        negocio, no solo el margen de cada producto.
      </p>

      <form
        onSubmit={agregarGasto}
        className="bg-loco-card rounded-xl p-4 flex flex-wrap gap-3 items-end mb-6"
      >
        <div className="flex flex-col gap-1">
          <label className="text-loco-texto-suave text-xs">Concepto</label>
          <input
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Gas para la parrilla"
            required
            className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-48"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-loco-texto-suave text-xs">Monto (MXN)</label>
          <input
            type="number"
            step="0.01"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            required
            className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-28"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-loco-texto-suave text-xs">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            required
            className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-loco-rosa text-white font-bold text-sm px-4 py-2 rounded-full"
        >
          + Agregar gasto
        </button>
      </form>

      <div className="bg-loco-card border border-loco-chile rounded-xl p-4 mb-6 inline-block">
        <p className="text-loco-texto-suave text-xs">Total de gastos registrados</p>
        <p className="text-loco-chile font-extrabold text-2xl">
          ${totalGastos.toFixed(2)} MXN
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {gastos.map((gasto) => (
          <div
            key={gasto.id}
            className="bg-loco-card rounded-xl p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-loco-texto font-bold">{gasto.concepto}</p>
              <p className="text-loco-texto-suave text-xs">
                {formatearFecha(gasto.fecha)}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="bg-loco-chile text-white font-bold text-sm px-3 py-1 rounded-full">
                ${gasto.monto} MXN
              </span>
              <button
                onClick={() => eliminarGasto(gasto.id)}
                className="text-loco-chile text-xs"
              >
                eliminar
              </button>
            </div>
          </div>
        ))}
        {gastos.length === 0 && (
          <p className="text-loco-texto-suave text-sm">
            Todavía no has registrado ningún gasto.
          </p>
        )}
      </div>
    </main>
  );
}