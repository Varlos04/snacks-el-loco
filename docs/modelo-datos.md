# Modelo de datos — Snacks El Loco

## Tablas

### productos
id, nombre, categoria, precio_venta (MXN), precio_chico (opcional), destacado (opcional), activo

### ingredientes
id, nombre, costo_unitario (MXN), unidad, stock_actual

### recetas
id, producto_id (FK), ingrediente_id (FK), cantidad_necesaria

### pedidos
id, fecha, total (MXN), estado

### detalle_pedido
id, pedido_id (FK), producto_id (FK), cantidad, subtotal (MXN)

## Notas
- El costo de un producto = suma de (cantidad_necesaria × costo_unitario) de sus ingredientes en `recetas`.
- Al confirmar un pedido, se resta de `ingredientes.stock_actual` según la receta de cada producto vendido.