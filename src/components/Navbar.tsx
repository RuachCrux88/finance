"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
    const { data: session } = useSession();
    const name = session?.user?.name || session?.user?.email || "Invitado";

    return (
        <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
            <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
                <div className="flex items-center gap-6">
                    <Link href="/" className="font-semibold">Finances</Link>
                    <Link href="/" className="text-sm text-gray-600 hover:text-black">Inicio</Link>
                    <Link href="/wallets" className="text-sm text-gray-600 hover:text-black">Billeteras</Link>
                    <Link href="/transactions" className="text-sm text-gray-600 hover:text-black">Transacciones</Link>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">Hola, <b>{name}</b></span>
                    {session && (
                        <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="rounded bg-black px-3 py-1.5 text-sm text-white hover:bg-gray-800"
                        >
                            Cerrar sesión
                        </button>
                    )}
                </div>
            </nav>
        </header>
    );
}
