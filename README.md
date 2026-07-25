# 🌶️ Snacks El Loco

Sistema de gestión digital para **Snacks El Loco**, un negocio de snacks preparados con chamoy y Miguelito (Boings, Smoothies, Vacas Locas, Arizona, Cueritos, entre otras cosas). 

Proyecto real construido para digitalizar el menú, los pedidos y la administración del negocio.

## 🔗 Demo en vivo

**[snacks-el-loco.vercel.app](https://snacks-el-loco.vercel.app)**

> El panel de administración (`/admin/login`) es privado y requiere credenciales — no está enlazado desde el menú público a propósito.

## 📌 Estado del proyecto

✅ MVP completo y desplegado en producción.

## ✨ Funcionalidades

- **Menú público interactivo** con identidad visual propia, agrupado por categoría
- **Carrito de compras** con cálculo de total en tiempo real
- **Pedido directo por WhatsApp** — el cliente arma su pedido y le llega al negocio ya escrito
- **Panel de administración protegido** (login con Supabase Auth)
  - CRUD completo de productos (crear, editar precio, activar/desactivar, eliminar)
  - Gestión de ingredientes con costo unitario y stock
  - **Calculadora de costos y márgenes** por receta (ingredientes → producto)
  - **Registro de ventas** con descuento automático de inventario según receta

## 🛠️ Tecnologías

| Capa           | Tecnología                    |
|----------------|--------------------------------|
| Frontend       | Next.js 16 (App Router), React, Tailwind CSS |
| Backend / BD   | Supabase (Postgres + Auth + RLS) |
| Pedidos        | Enlaces de WhatsApp (wa.me)   |
| Despliegue     | Vercel                        |

## 📂 Estructura del proyecto
snacks-el-loco/
├── src/
│ ├── app/
│ │ ├── page.js # Menú público
│ │ ├── admin/
│ │ │ ├── page.js # Panel: gestión de productos
│ │ │ ├── login/page.js # Login
│ │ │ ├── ingredientes/page.js # CRUD de ingredientes
│ │ │ ├── recetas/page.js # Recetas y cálculo de costos
│ │ │ └── venta/page.js # Registrar venta + descuento de inventario
│ ├── components/
│ │ ├── Menu.js # Carrito y agrupamiento por categoría
│ │ └── TarjetaProducto.js
│ └── lib/
│ └── supabaseClient.js
├── docs/
│ └── modelo-datos.md # Diseño de las tablas
└── README.md
## 🗄️ Modelo de datos

5 tablas relacionales en Postgres: `productos`, `ingredientes`, `recetas` (relación muchos-a-muchos entre productos e ingredientes con cantidad), `pedidos` y `detalle_pedido`. Documentación completa en [`docs/modelo-datos.md`](./docs/modelo-datos.md).

## 💻 Cómo ejecutar el proyecto localmente

```bash
git clone https://github.com/Varlos04/snacks-el-loco.git
cd snacks-el-loco
npm install
```

Crea un archivo `.env.local` en la raíz con:
NEXT_PUBLIC_SUPABASE_URL=tu_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_publishable_key
```bash
npm run dev
```

Abre `http://localhost:3000`.

## 💰 Moneda

Todos los precios y cálculos se manejan en **pesos mexicanos (MXN)**.

## 🎯 Decisiones de diseño

- **Server Components para datos públicos, Client Components para interactividad**: el menú trae productos directo del servidor (`async function Home()`); el carrito y el panel usan `"use client"` con `useState`/`useEffect` donde se necesita estado.
- **RLS granular por tabla y operación**: lectura pública solo en `productos`; todo lo demás (ingredientes, recetas, pedidos, escritura de productos) requiere autenticación.
- **Costos y márgenes como cálculo derivado**, nunca guardados en la base de datos — siempre se recalculan con los datos más recientes de ingredientes y recetas.
- **Diseñado para operación real de fin de semana** en un solo punto de venta, sin sobre-ingeniería (sin turnos, sin múltiples cajeros, sin lógica de alta concurrencia).

## ✍️ Autor

Proyecto desarrollado por [Varlos04](https://github.com/Varlos04).