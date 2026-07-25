"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Correo o contraseña incorrectos.');
      return;
    }

    router.push('/admin');
  }

  return (
    <main className="min-h-screen bg-loco-bg flex items-center justify-center px-6">
      <form
        onSubmit={handleLogin}
        className="bg-loco-card p-8 rounded-2xl w-full max-w-sm flex flex-col gap-4"
      >
        <h1 className="text-loco-turquesa font-extrabold text-2xl text-center mb-2">
          Panel Snacks El Loco
        </h1>

        <input
          type="email"
          placeholder="Correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-4 py-2"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="bg-loco-bg text-loco-texto border border-loco-turquesa/30 rounded-lg px-4 py-2"
          required
        />

        {error && <p className="text-loco-chile text-sm">{error}</p>}

        <button
          type="submit"
          className="bg-loco-rosa text-white font-bold py-2 rounded-lg mt-2"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}