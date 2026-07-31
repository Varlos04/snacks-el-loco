"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Admin() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [editandoId, setEditandoId] = useState(null);
  const [precioTemp, setPrecioTemp] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaCategoria, setNuevaCategoria] = useState('');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoPrecio, setNuevoPrecio] = useState('');
  const router = useRouter();

  async function verificarSesionYCargarDatos() {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      router.push('/admin/login');
      return;
    }

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('categoria');

    if (!error) {
      setProductos(data);
    }
    setCargando(false);
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    verificarSesionYCargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function iniciarEdicion(producto) {
    setEditandoId(producto.id);
    setPrecioTemp(producto.precio_venta);
  }

  function cancelarEdicion() {
    setEditandoId(null);
    setPrecioTemp('');
  }

  async function guardarPrecio(id) {
    const { error } = await supabase
      .from('productos')
      .update({ precio_venta: parseFloat(precioTemp) })
      .eq('id', id);

    if (!error) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, precio_venta: parseFloat(precioTemp) } : p
        )
      );
    }
    setEditandoId(null);
  }

  async function alternarActivo(producto) {
    const nuevoEstado = !producto.activo;

    const { error } = await supabase
      .from('productos')
      .update({ activo: nuevoEstado })
      .eq('id', producto.id);

    if (!error) {
      setProductos((prev) =>
        prev.map((p) =>
          p.id === producto.id ? { ...p, activo: nuevoEstado } : p
        )
      );
    }
  }

  async function eliminarProducto(producto) {
    const confirmado = window.confirm(
      `¿Seguro que quieres eliminar "${producto.nombre}" para siempre? Si ya tiene ventas registradas, esto puede fallar — en ese caso, usa "Desactivar" en su lugar.`
    );
    if (!confirmado) return;

    const { error } = await supabase.from('productos').delete().eq('id', producto.id);

    if (error) {
      alert(
        'No se pudo eliminar (probablemente tiene ventas o receta asociada). Usa "Desactivar" en su lugar.'
      );
      return;
    }

    setProductos((prev) => prev.filter((p) => p.id !== producto.id));
  }

  async function crearProducto(e) {
    e.preventDefault();

    const { data, error } = await supabase
      .from('productos')
      .insert({
        nombre: nuevoNombre,
        categoria: nuevaCategoria,
        descripcion: nuevaDescripcion,
        precio_venta: parseFloat(nuevoPrecio),
        activo: true,
      })
      .select()
      .single();

    if (!error && data) {
      setProductos((prev) =>
        [...prev, data].sort((a, b) => a.categoria.localeCompare(b.categoria))
      );
      setNuevoNombre('');
      setNuevaCategoria('');
      setNuevaDescripcion('');
      setNuevoPrecio('');
      setMostrarFormulario(false);
    }
  }

  if (cargando) {
    return <p className="text-loco-texto">Cargando panel...</p>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-loco-rosa font-bold text-xl">Productos</h2>
        <button
          onClick={() => setMostrarFormulario((prev) => !prev)}
          className="bg-loco-turquesa text-loco-bg font-bold text-sm px-4 py-1.5 rounded-full"
        >
          {mostrarFormulario ? 'Cancelar' : '+ Nuevo producto'}
        </button>
      </div>

      {mostrarFormulario && (
        <form
          onSubmit={crearProducto}
          className="bg-loco-card rounded-xl p-4 flex flex-wrap gap-3 items-end mb-6"
        >
          <div className="flex flex-col gap-1">
            <label className="text-loco-texto-suave text-xs">Nombre</label>
            <input
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              required
              className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-40"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-loco-texto-suave text-xs">Categoría</label>
            <input
              value={nuevaCategoria}
              onChange={(e) => setNuevaCategoria(e.target.value)}
              placeholder="Boings Locos"
              required
              className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-36"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-loco-texto-suave text-xs">Descripción</label>
            <input
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-56"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-loco-texto-suave text-xs">Precio (MXN)</label>
            <input
              type="number"
              step="0.01"
              value={nuevoPrecio}
              onChange={(e) => setNuevoPrecio(e.target.value)}
              required
              className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-3 py-1.5 text-sm w-24"
            />
          </div>
          <button
            type="submit"
            className="bg-loco-rosa text-white font-bold text-sm px-4 py-2 rounded-full"
          >
            Guardar producto
          </button>
        </form>
      )}

      <div className="flex flex-col gap-3">
        {productos.map((producto) => (
          <div
            key={producto.id}
            className={`bg-loco-card rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between ${
              !producto.activo ? 'opacity-50' : ''
            }`}
          >
            <div>
              <p className="text-loco-texto font-bold">{producto.nombre}</p>
              <p className="text-loco-texto-suave text-sm">{producto.categoria}</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {editandoId === producto.id ? (
                <>
                  <input
                    type="number"
                    value={precioTemp}
                    onChange={(e) => setPrecioTemp(e.target.value)}
                    className="w-20 bg-loco-bg text-loco-texto border border-loco-turquesa rounded-lg px-2 py-1 text-sm"
                    autoFocus
                  />
                  <button
                    onClick={() => guardarPrecio(producto.id)}
                    className="bg-loco-turquesa text-loco-bg text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={cancelarEdicion}
                    className="text-loco-texto-suave text-xs"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <>
                  <span className="bg-loco-turquesa text-loco-bg font-bold text-sm px-3 py-1 rounded-full">
                    ${producto.precio_venta} MXN
                  </span>
                  <button
                    onClick={() => iniciarEdicion(producto)}
                    className="text-loco-rosa text-xs font-bold"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => alternarActivo(producto)}
                    className="text-loco-texto-suave text-xs border border-loco-texto-suave rounded-full px-3 py-1"
                  >
                    {producto.activo ? 'Desactivar' : 'Activar'}
                  </button>
                  <button
                    onClick={() => eliminarProducto(producto)}
                    className="text-loco-chile text-xs border border-loco-chile rounded-full px-3 py-1"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}