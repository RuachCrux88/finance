"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Wallet, ArrowDownUp, Target, Plus, Wallet2 } from "lucide-react";

type W = { id: string; name: string; type: "PERSONAL"|"GROUP"; currency: string };
type T = { id: string; amount: number; type: "INCOME"|"EXPENSE"; createdAt: string; description?: string; walletId: string };

export default function DashboardContent() {
    const [wallets, setWallets] = useState<W[]>([]);
    const [recent, setRecent] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const w = await fetch("/api/wallets").then(r => r.ok ? r.json() : { wallets: [] });
                const t = await fetch("/api/transactions?limit=5").then(r => r.ok ? r.json() : { transactions: [] });
                setWallets(w.wallets ?? []);
                setRecent(t.transactions ?? []);
            } catch {
                setWallets([]); setRecent([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const total = useMemo(() => {
        return recent.reduce((acc, tx) => acc + (tx.type === "INCOME" ? tx.amount : -tx.amount), 0);
    }, [recent]);

    return (
        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8">
            {/* HERO */}
            <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-tr from-slate-900 via-slate-800 to-indigo-900 p-8 text-white">
                <h1 className="text-2xl font-semibold">Dashboard</h1>
                <p className="mt-1 text-sm/6 text-white/80">
                    Resumen de tus finanzas y accesos rápidos.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/wallets" className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20">Ver espacios financieros</Link>
                    <Link href="/transactions" className="rounded-lg bg-indigo-500 px-4 py-2 text-sm hover:bg-indigo-600">Ver transacciones</Link>
                    <Link href="/transactions?new=1" className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm text-black hover:bg-gray-100">
                        <Plus className="h-4 w-4" /> Nueva transacción
                    </Link>
                </div>
                <div className="pointer-events-none absolute -right-14 -top-14 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            </section>

            {/* MÉTRICAS */}
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                    title="Billeteras"
                    value={loading ? "…" : wallets.length.toString()}
                    icon={<Wallet2 className="h-5 w-5" />}
                />
                <StatCard
                    title="Movimientos (30d)"
                    value={loading ? "…" : recent.length.toString()}
                    icon={<ArrowDownUp className="h-5 w-5" />}
                />
                <StatCard
                    title="Balance reciente"
                    value={loading ? "…" : currency(total)}
                    subtitle="Ingresos - gastos (últimos movimientos)"
                    icon={<Target className="h-5 w-5" />}
                />
            </section>

            {/* LISTAS */}
            <section className="grid gap-6 lg:grid-cols-2">
                <Card title="Tus billeteras" action={<Link href="/wallets" className="text-sm text-indigo-600 hover:underline">Ver todas</Link>}>
                    {wallets.length === 0 ? (
                        <Empty text="Aún no tienes billeteras. ¡Crea la primera!">
                            <Link href="/wallets" className="inline-flex items-center gap-2 rounded bg-black px-3 py-1.5 text-white hover:bg-gray-800">
                                <Wallet className="h-4 w-4" /> Crear billetera
                            </Link>
                        </Empty>
                    ) : (
                        <ul className="divide-y">
                            {wallets.slice(0,5).map(w => (
                                <li key={w.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium">{w.name}</p>
                                        <p className="text-xs text-gray-500">{w.type} • {w.currency}</p>
                                    </div>
                                    <Link href={`/wallets/${w.id}`} className="text-sm text-indigo-600 hover:underline">Abrir</Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>

                <Card title="Actividad reciente" action={<Link href="/transactions" className="text-sm text-indigo-600 hover:underline">Ver todo</Link>}>
                    {recent.length === 0 ? (
                        <Empty text="Sin movimientos recientes." />
                    ) : (
                        <ul className="divide-y">
                            {recent.map(tx => (
                                <li key={tx.id} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium">{tx.description || "Transacción"}</p>
                                        <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <span className={`text-sm ${tx.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                    {tx.type === "INCOME" ? "+" : "-"}{currency(Math.abs(tx.amount))}
                  </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Card>
            </section>
        </div>
    );
}

function StatCard({
                      title, value, icon, subtitle,
                  }: { title: string; value: string; icon: React.ReactNode; subtitle?: string }) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{title}</p>
                <div className="rounded-lg border bg-gray-50 p-2 text-gray-700">{icon}</div>
            </div>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
        </div>
    );
}

function Card({
                  title, children, action,
              }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
    return (
        <div className="rounded-xl border bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="font-medium">{title}</h3>
                {action}
            </div>
            {children}
        </div>
    );
}

function Empty({ text, children }: { text: string; children?: React.ReactNode }) {
    return (
        <div className="grid place-items-center rounded-lg border border-dashed py-12 text-center">
            <p className="text-sm text-gray-500">{text}</p>
            {children && <div className="mt-3">{children}</div>}
        </div>
    );
}

function currency(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}
