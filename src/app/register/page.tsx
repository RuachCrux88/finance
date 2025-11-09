"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErr(null); setLoading(true);

        const f = new FormData(e.currentTarget);
        const body = {
            name: String(f.get("name") || ""),
            email: String(f.get("email") || ""),
            password: String(f.get("password") || ""),
        };

        const res = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const j = await res.json().catch(() => ({}));
            setErr(j?.error || "No se pudo registrar");
            setLoading(false);
            return;
        }

        // auto-login
        const si = await signIn("credentials", {
            email: body.email,
            password: body.password,
            redirect: false,
        });

        setLoading(false);
        router.push(si?.ok ? "/" : "/login");
    }

    return (
        <main className="max-w-md mx-auto p-6 space-y-3">
            <h1 className="text-2xl font-semibold">Crear cuenta</h1>
            <form onSubmit={onSubmit} className="space-y-3">
                <input name="name" placeholder="Nombre" className="w-full border p-2 rounded" />
                <input name="email" type="email" placeholder="Email" className="w-full border p-2 rounded" required />
                <input name="password" type="password" placeholder="Contraseña" className="w-full border p-2 rounded" required />
                {err && <p className="text-red-600 text-sm">{err}</p>}
                <button disabled={loading} className="w-full p-2 rounded bg-black text-white">
                    {loading ? "Creando..." : "Registrarme"}
                </button>
            </form>
        </main>
    );
}
