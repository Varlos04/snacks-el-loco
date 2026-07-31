"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import {
  Package,
  Sprout,
  Calculator,
  TrendingUp,
  ShoppingCart,
  History,
  Receipt,
  Wallet,
  ClipboardList,
  BarChart3,
  Settings,
  Menu,
  X,
  LogOut,
} from 'lucide-react';

const ENLACES = [
  { href: '/admin', label: 'Productos', icon: Package },
  { href: '/admin/ingredientes', label: 'Ingredientes', icon: Sprout },
  { href: '/admin/recetas', label: 'Recetas y costos', icon: Calculator },
  { href: '/admin/rentabilidad', label: 'Rentabilidad', icon: TrendingUp },
  { href: '/admin/venta', label: 'Registrar venta', icon: ShoppingCart },
  { href: '/admin/historial', label: 'Historial', icon: History },
  { href: '/admin/corte-caja', label: 'Corte de caja', icon: Receipt },
  { href: '/admin/gastos', label: 'Gastos', icon: Wallet },
  { href: '/admin/lista-compras', label: 'Lista de compras', icon: ClipboardList },
  { href: '/admin/tendencia', label: 'Tendencia', icon: BarChart3 },
  { href: '/admin/configuracion', label: 'Configuración', icon: Settings },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const esPaginaDeLogin = pathname === '/admin/login';

  async function cerrarSesion() {
    await supabase.auth.signOut();
    router.push('/admin/login');
  }

  if (esPaginaDeLogin) {
    return <>{children}</>;
  }

  const paginaActual = ENLACES.find((e) => e.href === pathname);

  return (
    <div className="min-h-screen bg-loco-bg flex">
      {/* Overlay para cerrar el menú en móvil al tocar fuera */}
      {menuAbierto && (
        <div
          onClick={() => setMenuAbierto(false)}
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 bg-loco-bg-elevada border-r border-loco-borde flex flex-col transition-transform duration-200 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="px-5 pt-6 pb-5 border-b border-loco-borde flex items-center justify-between">
          <div>
            <p className="text-loco-chile text-[11px] font-bold uppercase tracking-widest">
              Snacks El Loco
            </p>
            <p className="text-loco-turquesa font-extrabold text-lg leading-tight">
              Panel de negocio
            </p>
          </div>
          <button
            onClick={() => setMenuAbierto(false)}
            className="lg:hidden text-loco-texto-suave"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {ENLACES.map((enlace) => {
            const activo = pathname === enlace.href;
            const Icono = enlace.icon;
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                onClick={() => setMenuAbierto(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  activo
                    ? 'bg-loco-rosa text-white'
                    : 'text-loco-texto-suave hover:bg-loco-card-hover hover:text-loco-texto'
                }`}
              >
                <Icono size={17} strokeWidth={2.25} />
                {enlace.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-loco-borde">
          <button
            onClick={cerrarSesion}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-loco-chile hover:bg-loco-card-hover transition"
          >
            <LogOut size={17} strokeWidth={2.25} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="lg:hidden sticky top-0 z-10 bg-loco-bg-elevada border-b border-loco-borde px-4 py-3 flex items-center gap-3">
          <button onClick={() => setMenuAbierto(true)} className="text-loco-texto">
            <Menu size={22} />
          </button>
          <p className="text-loco-turquesa font-bold text-sm">
            {paginaActual?.label || 'Panel'}
          </p>
        </div>

        <main className="flex-1 px-5 sm:px-8 py-8 max-w-5xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}