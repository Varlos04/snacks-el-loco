"use client";

import { useState } from 'react';
import TarjetaProducto from './TarjetaProducto';

export default function Menu({ productos }) {
  const [carrito, setCarrito] = useState([]);

  function agregarAlCarrito(producto) {
    console.log('Agregando:', producto.nombre);
    setCarrito((prev) => [...prev, producto]);
  }

  function enviarPorWhatsApp() {
  const numeroTelefono = '523321503186'; 

  const lineas = carrito.map(
    (item) => `• ${item.nombre} — $${item.precio_venta} MXN`
  );
  const mensaje = [
    '¡Hola! Quiero hacer este pedido:',
    '',
    ...lineas,
    '',
    `Total: $${total} MXN`,
  ].join('\n');

  const mensajeCodificado = encodeURIComponent(mensaje);
  const url = `https://wa.me/${numeroTelefono}?text=${mensajeCodificado}`;

  window.open(url, '_blank');
}

  function quitarDelCarrito(index) {
    setCarrito((prev) => prev.filter((_, i) => i !== index));
  }

  const total = carrito.reduce((suma, item) => suma + item.precio_venta, 0);
  const categorias = [...new Set(productos.map((p) => p.categoria))];

  return (
    <div className="pb-32">
      {categorias.map((categoria) => (
        <section key={categoria} className="mb-10">
          <h2 className="text-loco-rosa font-bold text-xl mb-4">
            {categoria}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {productos
              .filter((p) => p.categoria === categoria)
              .map((producto) => (
                <TarjetaProducto
                  key={producto.id}
                  producto={producto}
                  onAgregar={() => agregarAlCarrito(producto)}
                />
              ))}
          </div>
        </section>
      ))}

      {carrito.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-loco-card border-t border-loco-turquesa/30 p-4">
          <div className="max-w-2xl mx-auto">
            <ul className="mb-3 max-h-32 overflow-y-auto">
              {carrito.map((item, index) => (
                <li key={index} className="flex justify-between text-loco-texto text-sm py-1">
                  <span>{item.nombre}</span>
                  <div className="flex items-center gap-3">
                    <span>${item.precio_venta} MXN</span>
                    <button
                      onClick={() => quitarDelCarrito(index)}
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
  onClick={enviarPorWhatsApp}
  className="bg-loco-rosa text-white font-bold px-5 py-2 rounded-full"
>
  Enviar pedido
</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}