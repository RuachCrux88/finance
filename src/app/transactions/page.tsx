"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Search } from "lucide-react";

type Wallet = { id: string; name: string; type: "PERSONAL" | "GROUP"; currency: string };
type Category = { id: string; name: string; type: "INCOME" | "EXPENSE" };
type Tx = {
    id: string;
    walletId: string;
    categoryId: string | null;
    type: "INCOME" | "EXPENSE";
    amount: number;
    description?: string | null;
    createdAt: string;
    wallet?: { name: string };
    category?: { name: string };
};

export default function TransactionsPage() {
    // form
    const [walletId, setWalletId] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [txType, setTxType] = useState<"INCOME" | "EXPENSE">("EXPENSE");
    const [amountStr, setAmountStr] = useState("");
    const [desc, setDesc] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // data
    const [wallets, setWallets] = useState<Wallet[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [tx, setTx] = useState<Tx[]>([]);
    const [loading, setLoading] = useState(true);

    // filtros de la lista
    const [typeFilter, setTypeFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");
    const [walletFilter, setWalletFilter] = useState<string>("ALL");
    const [q, setQ] = useState("");

    useEffect(() => {
        const load = async () => {
            try {
                const w = await safeJson(fetch("/api/wallets"));
                setWallets(w.wallets ?? []);

                const c = await safeJson(fetch("/api/categories"));
                setCategories(c.categories ?? []);

                const t = await safeJson(fetch("/api/transactions?limit=50"));
                setTx(t.transactions ?? []);
            } catch {
                setWallets([]); setCategories([]); setTx([]);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // categorías que coinciden con el tipo elegido
    const categoriesByType = useMemo(() => {
        return categories.filter(c => c.type === txType);
    }, [categories, txType]);

    // lista filtrada
    const filtered = useMemo(() => {
        return tx
            .filter(t => (typeFilter === "ALL" ? true : t.type === typeFilter))
            .filter(t => (walletFilter === "ALL" ? true : t.walletId === walletFilter))
            .filter(t => {
                if (!q.trim()) return true;
                const hay = [t.description, t.category?.name, t.wallet?.name]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();
                return hay.includes(q.toLowerCase());
            })
            .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    }, [tx, typeFilter, walletFilter, q]);

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        const amount = toNumberCOP(amountStr);
        if (!walletId) return end("Selecciona una billetera.");
        if (!categoryId) return end("Selecciona una categoría.");
        if (!amount || amount <= 0) return end("Ingresa un monto válido.");

        try {
            const res = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    walletId,
                    categoryId,
                    type: txType,
                    amount,
                    description: desc || null,
                }),
            });
            if (!res.ok) throw new Error("No se pudo crear la transacción");
            const { transaction } = await res.json();
            // refrescar lista
            setTx(prev => [transaction, ...prev]);
            // reset
            setAmountStr("");
            setDesc("");
        } catch (e: any) {
            setError(e.message ?? "Error al crear transacción");
        } finally {
            setSubmitting(false);
        }
    }

    function end(msg: string) {
        setError(msg);
        setSubmitting(false);
    }

    return (
        <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
            <div>
                <h1 className="text-2xl font-semibold">Transacciones</h1>
                <p className="text-sm text-gray-600">Registra ingresos o gastos y consulta la actividad.</p>
            </div>

            {/* FORM */}
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
                <form onSubmit={onSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                        <label className="text-sm text-gray-600">Billetera</label>
                        <select
                            value={walletId}
                            onChange={e => setWalletId(e.target.value)}
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">Selecciona una billetera</option>
                            {wallets.map(w => (
                                <option key={w.id} value={w.id}>{w.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="grid gap-2">
                            <label className="text-sm text-gray-600">Categoría</label>
                            <select
                                value={categoryId}
                                onChange={e => setCategoryId(e.target.value)}
                                className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Selecciona categoría</option>
                                {categoriesByType.map(c => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid gap-2">
                            <label className="text-sm text-gray-600">Tipo</label>
                            <select
                                value={txType}
                                onChange={e => {
                                    setTxType(e.target.value as any);
                                    setCategoryId("");
                                }}
                                className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="EXPENSE">Gasto</option>
                                <option value="INCOME">Ingreso</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm text-gray-600">Monto</label>
                        <input
                            inputMode="numeric"
                            placeholder="Ej: 150000"
                            value={amountStr}
                            onChange={(e) => setAmountStr(e.target.value.replace(/[^\d.,]/g, ""))}
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-xs text-gray-500">Se guarda en COP. Solo números, punto o coma.</p>
                    </div>

                    <div className="grid gap-2">
                        <label className="text-sm text-gray-600">Descripción (opcional)</label>
                        <input
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            placeholder="Ej: Mercado, Netflix, etc."
                            className="rounded-lg border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            disabled={submitting}
                            className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-60"
                        >
                            {submitting ? "Guardando..." : "Agregar transacción"}
                        </button>
                        {amountStr && (
                            <span className="text-sm text-gray-600">
                {txType === "INCOME" ? "Ingreso" : "Gasto"}:{" "}
                                <b>{fmtCOP(toNumberCOP(amountStr) || 0)}</b>
              </span>
                        )}
                    </div>

                    {error && <p className="text-sm text-rose-600">{error}</p>}
                </form>
            </section>

            {/* FILTROS */}
            <section className="flex flex-wrap items-center gap-3">
                <div className="inline-flex rounded-lg border bg-white p-1">
                    <Chip active={typeFilter === "ALL"} onClick={() => setTypeFilter("ALL")}>Todos</Chip>
                    <Chip active={typeFilter === "INCOME"} onClick={() => setTypeFilter("INCOME")}>
                        <ArrowUpCircle className="mr-1 h-4 w-4" /> Ingresos
                    </Chip>
                    <Chip active={typeFilter === "EXPENSE"} onClick={() => setTypeFilter("EXPENSE")}>
                        <ArrowDownCircle className="mr-1 h-4 w-4" /> Gastos
                    </Chip>
                </div>

                <select
                    value={walletFilter}
                    onChange={e => setWalletFilter(e.target.value)}
                    className="rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                >
                    <option value="ALL">Todas las billeteras</option>
                    {wallets.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                </select>

                <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                        value={q}
                        onChange={e => setQ(e.target.value)}
                        placeholder="Buscar descripción/categoría…"
                        className="rounded-lg border bg-white pl-9 pr-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </section>

            {/* LISTA */}
            <section className="rounded-2xl border bg-white p-4 shadow-sm">
                {loading ? (
                    <SkeletonList />
                ) : filtered.length === 0 ? (
                    <div className="grid place-items-center py-12 text-sm text-gray-500">
                        No hay transacciones.
                    </div>
                ) : (
                    <ul className="divide-y">
                        {filtered.map(t => (
                            <li key={t.id} className="flex items-center justify-between py-3">
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium">
                                        {t.description || (t.type === "INCOME" ? "Ingreso" : "Gasto")}
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {new Date(t.createdAt).toLocaleDateString()} • {t.category?.name || "Sin categoría"} • {t.wallet?.name || ""}
                                    </p>
                                </div>
                                <span className={`ml-4 shrink-0 text-sm font-medium ${t.type === "INCOME" ? "text-emerald-600" : "text-rose-600"}`}>
                  {t.type === "INCOME" ? "+" : "-"}{fmtCOP(Math.abs(t.amount))}
                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </main>
    );
}

/* ---------- UI helpers ---------- */

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
    return (
        <button
            onClick={onClick}
            className={`rounded-md px-3 py-1.5 text-sm ${active ? "bg-black text-white" : "text-gray-700 hover:bg-gray-100"}`}
        >
            {children}
        </button>
    );
}

function SkeletonList() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-50" />
            ))}
        </div>
    );
}

/* ---------- utils ---------- */

async function safeJson(p: Promise<Response>) {
    try {
        const r = await p;
        if (!r.ok) return {};
        const text = await r.text();
        return text ? JSON.parse(text) : {};
    } catch {
        return {};
    }
}

function fmtCOP(n: number) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n);
}

function toNumberCOP(input: string) {
    // admite "1.234,56" o "1234.56" -> 1234.56
    let s = input.trim().replace(/\s/g, "");
    const hasComma = s.includes(",");
    const hasDot = s.includes(".");
    if (hasComma && hasDot) {
        // si ambos, asumimos formato ES: miles con punto y decimales con coma
        s = s.replace(/\./g, "").replace(",", ".");
    } else {
        // si solo coma, la usamos como decimal
        s = s.replace(",", ".");
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
}
