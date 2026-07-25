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