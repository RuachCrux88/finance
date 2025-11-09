"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet2, Users, Plus, ChevronRight } from "lucide-react";

type Wallet = {
    id: string;
    name: string;
    type: "PERSONAL" | "GROUP";
    currency: string;
};

export default function WalletsPage() {
    const [name, setName] = useState("");
    const [type, setType] = useState<"PERSONAL" | "GROUP">("GROUP");
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // Cargar billeteras
    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch("/api/wallets", { cache: "no-store" });
                const data = await res.json();
                setWallets(data.wallets ?? []);
            } catch {
                setWallets([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Crear billetera
    async function onCreate(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setErr(null);
        try {
            const res = await fetch("/api/wallets", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, type, currency: "COP" }),
            });
            if (!res.ok) throw new Error("No se pudo crear la billetera");
            const { wallet } = await res.json();
            setWallets((prev) => [wallet, ...prev]);
            setName("");
            setType("GROUP");
        } catch (e: any) {
            setErr(e.message ?? "Error creando billetera");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Billeteras</h1>
                <p className="text-sm text-gray-600">Crea una nueva o gestiona las existentes.</p>
            </div>

            {/* Card Crear billetera */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <form onSubmit={onCreate} className="grid gap-4 md:grid-cols-[1fr,220px,160px] items-end">
                    <div className="grid gap-2">
                        <label className="text-sm text-gray-600">Nombre</label>
                        <input
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Viaje, Hogar, Personal…"
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm text-gray-600">Tipo</label>
                        <select
                            value={type}
                            onChange={(e) => setType(e.target.value as any)}
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="PERSONAL">PERSONAL</option>
                            <option value="GROUP">GROUP (compartida)</option>
                        </select>
                    </div>

                    <button
                        disabled={submitting}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
                    >
                        <Plus className="h-4 w-4" />
                        {submitting ? "Creando..." : "Crear billetera"}
                    </button>

                    {err && <p className="col-span-full text-sm text-rose-600">{err}</p>}
                </form>
            </section>

            {/* Lista de billeteras */}
            <section className="space-y-3">
                {loading ? (
                    <SkeletonList />
                ) : wallets.length === 0 ? (
                    <EmptyState />
                ) : (
                    wallets.map((w) => <WalletRow key={w.id} w={w} />)
                )}
            </section>
        </main>
    );
}

function WalletRow({ w }: { w: Wallet }) {
    return (
        <article className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-lg border bg-gray-50">
                    <Wallet2 className="h-5 w-5 text-gray-700" />
                </div>
                <div>
                    <h3 className="font-medium">{w.name}</h3>
                    <p className="text-xs text-gray-500">
                        <TypeBadge t={w.type} /> • {w.currency}
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Link
                    href={`/wallets/${w.id}`}
                    className="text-sm text-indigo-600 hover:underline"
                    title="Abrir billetera"
                >
                    Ver balances
                </Link>
                <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
        </article>
    );
}

function TypeBadge({ t }: { t: Wallet["type"] }) {
    const cls =
        t === "GROUP"
            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200";
    const txt = t === "GROUP" ? "Compartida" : "Personal";
    return <span className={`inline-block rounded px-2 py-0.5 text-[11px] border ${cls}`}>{txt}</span>;
}

function EmptyState() {
    return (
        <div className="grid place-items-center rounded-xl border border-dashed p-12 text-center">
            <Users className="mb-2 h-7 w-7 text-gray-400" />
            <p className="max-w-sm text-sm text-gray-600">
                Aún no tienes billeteras. Crea una **personal** para tus finanzas o una **compartida** para tu grupo.
            </p>
        </div>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl border bg-gray-50" />
            ))}
        </div>
    );
}
