export default function TarjetaProducto({ producto, onAgregar }) {
  return (
    <div className="relative bg-loco-card border border-loco-turquesa/20 rounded-2xl p-5 flex flex-col gap-2">
      {producto.destacado && (
        <span className="absolute -top-2 -right-2 bg-loco-amarillo text-loco-bg text-xs font-bold px-2 py-1 rounded-full rotate-6">
          {producto.destacado}
        </span>
      )}

      <h3 className="text-loco-texto font-bold text-lg leading-snug">
        {producto.nombre}
      </h3>

      <p className="text-loco-texto-suave text-sm leading-snug">
        {producto.descripcion}
      </p>

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <span className="bg-loco-turquesa text-loco-bg font-bold text-sm px-3 py-1 rounded-full">
            ${producto.precio_venta} MXN
          </span>
          {producto.precio_chico && (
            <span className="text-loco-texto-suave text-xs">
              Chico ${producto.precio_chico}
            </span>
          )}
        </div>

        <button
          onClick={onAgregar}
          className="bg-loco-rosa text-white text-sm font-bold px-3 py-1.5 rounded-full active:scale-95 transition"
        >
          + Agregar
        </button>
      </div>
    </div>
  );
}