"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function AuthMenu() {
    const { data: session, status } = useSession();

    if (status === "loading") return <span>Cargando…</span>;

    if (!session) {
        return (
            <div className="flex items-center gap-3">
                <Link href="/login" className="underline text-sm">Login</Link>
                <GoogleSignInButton />
            </div>
        );
    }

    const name = session.user?.name || session.user?.email || "Usuario";

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-gray-700">Hola, <b>{name}</b></span>
            <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-3 py-1 rounded bg-black text-white text-sm"
            >
                Cerrar sesión
            </button>
        </div>
    );
}
