"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function TendenciaSemanal() {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  async function verificarSesionYCargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('fecha', { ascending: true });

    if (!error) {
      setPedidos(data);
    }
    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarSesionYCargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function claveDelFinDeSemana(fechaISO) {
    const fecha = new Date(fechaISO);
    const diaSemana = fecha.getDay();

    if (diaSemana === 0) {
      fecha.setDate(fecha.getDate() - 1);
    }

    return fecha.toISOString().slice(0, 10);
  }

  function formatearEtiqueta(claveSabado) {
    const fecha = new Date(claveSabado + 'T00:00:00');
    return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });
  }

  const semanas = {};
  pedidos.forEach((pedido) => {
    const clave = claveDelFinDeSemana(pedido.fecha);
    if (!semanas[clave]) {
      semanas[clave] = 0;
    }
    semanas[clave] += pedido.total;
  });

  const datosGrafica = Object.entries(semanas)
    .map(([clave, total]) => ({
      semana: formatearEtiqueta(clave),
      total: Number(total.toFixed(2)),
    }))
    .sort((a, b) => (a.semana > b.semana ? 1 : -1));

  const totalGeneral = datosGrafica.reduce((suma, d) => suma + d.total, 0);
  const promedioSemanal = datosGrafica.length
    ? totalGeneral / datosGrafica.length
    : 0;

  if (cargando) {
    return <p className="text-loco-texto">Cargando tendencia...</p>;
  }

  return (
    <>
      <h2 className="text-loco-rosa font-bold text-xl mb-4">Tendencia semanal</h2>

      {datosGrafica.length === 0 ? (
        <p className="text-loco-texto-suave text-sm">
          Todavía no hay suficientes ventas registradas para mostrar una tendencia.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-8 max-w-md">
            <div className="bg-loco-card border border-loco-turquesa/30 rounded-xl p-4 text-center">
              <p className="text-loco-turquesa font-extrabold text-2xl">
                ${totalGeneral.toFixed(2)}
              </p>
              <p className="text-loco-texto-suave text-xs mt-1">Total acumulado</p>
            </div>
            <div className="bg-loco-card border border-loco-turquesa/30 rounded-xl p-4 text-center">
              <p className="text-loco-turquesa font-extrabold text-2xl">
                ${promedioSemanal.toFixed(2)}
              </p>
              <p className="text-loco-texto-suave text-xs mt-1">Promedio por fin de semana</p>
            </div>
          </div>

          <div className="bg-loco-card rounded-xl p-4" style={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={datosGrafica} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3a2c20" />
                <XAxis
                  dataKey="semana"
                  stroke="#a89b8a"
                  fontSize={12}
                />
                <YAxis stroke="#a89b8a" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#241c16',
                    border: '1px solid #4dd4d4',
                    borderRadius: 8,
                    color: '#f5ede0',
                  }}
                  formatter={(value) => [`$${value} MXN`, 'Total']}
                />
                <Bar dataKey="total" fill="#4dd4d4" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </>
  );
}