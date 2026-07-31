# 🌶️ Snacks El Loco — Panel de Gestión

Sistema de gestión para **Snacks El Loco**, un negocio de snacks preparados con chamoy y Miguelito (Boings, Smoothies, Vacas Locas, Arizona y Cueritos). Opera los fines de semana en un solo puesto.

Proyecto real construido para digitalizar la administración del negocio de mi papá — costos, inventario, ventas y rentabilidad — y como parte de mi portafolio de desarrollo full-stack.

## 🔗 Demo en vivo

**[snacks-el-loco.vercel.app](https://snacks-el-loco.vercel.app)**

> Es una herramienta interna, no un sitio para clientes: la URL raíz redirige directo al login del panel. El acceso es privado.

## 📌 Estado del proyecto

✅ Completo y en uso real por el negocio.

## ✨ Funcionalidades

**Catálogo y costos**
- CRUD completo de productos (crear, editar precio, activar/desactivar, eliminar)
- Ingredientes con costo unitario, unidad de medida y stock
- Recetas: relación producto-ingrediente con cantidades editables
- **Calculadora de rentabilidad** con semáforo (buena ganancia / margen bajo / alarma) según umbrales propios del negocio

**Operación diaria**
- Registro de ventas con carrito rápido, pensado para usarse en el puesto
- **Descuento automático de inventario** según la receta de cada producto vendido
- Protección contra doble registro accidental de una misma venta

**Análisis del negocio**
- Historial de ventas agrupado por día, con detalle expandible por pedido
- Corte de caja: total del día, número de ventas, ticket promedio y ranking de productos más vendidos
- Gastos generales (gas, renta del puesto, transporte) para ver la ganancia real, no solo el margen por producto
- Lista de compras sugerida según nivel de stock
- Gráfica de tendencia de ventas por fin de semana

**Seguridad y acceso**
- Autenticación con Supabase Auth
- Todas las rutas del panel protegidas — sin sesión, redirige al login
- Row Level Security granular por tabla y operación en Postgres
- Reinicio de datos transaccionales con confirmación por texto, sin afectar catálogo ni recetas

## 🛠️ Tecnologías

| Capa            | Tecnología                              |
|-----------------|-------------------------------------------|
| Frontend        | Next.js 16 (App Router), React, Tailwind CSS |
| Backend / BD    | Supabase (Postgres + Auth + RLS)         |
| Gráficas        | Recharts                                  |
| Iconos          | Lucide React                              |
| Despliegue      | Vercel                                    |


6 tablas relacionales en Postgres: `productos`, `ingredientes`, `recetas` (muchos-a-muchos entre productos e ingredientes, con cantidad), `pedidos`, `detalle_pedido` y `gastos`. Documentación completa en [`docs/modelo-datos.md`](./docs/modelo-datos.md).

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

- **Herramienta 100% interna, no orientada a clientes.** El negocio ya coordina pedidos por WhatsApp de forma directa; el valor real estaba en la administración, no en un menú público.
- **Layout compartido (`layout.js`)** centraliza sidebar, navegación y sesión — cada página se enfoca solo en su lógica, sin duplicar UI.
- **Costos y márgenes como cálculo derivado**, nunca guardados en la base de datos — siempre se recalculan con los datos más recientes de ingredientes y recetas.
- **RLS granular por operación**: cada tabla define explícitamente qué puede hacer un usuario autenticado (leer, crear, editar, borrar) — sin permisos genéricos.
- **Diseñado para operación real de fin de semana** en un solo punto de venta: sin turnos, sin múltiples cajeros, sin lógica de alta concurrencia.
- **Acciones destructivas con fricción intencional**: el reinicio de datos exige escribir una palabra de confirmación, no solo un clic, para evitar pérdidas accidentales.

## ✍️ Autor

Proyecto desarrollado por [Varlos04](https://github.com/Varlos04).