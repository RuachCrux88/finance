"use client";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type User = { id: string; name: string | null; email: string };
type Pair = { fromUserId: string; toUserId: string; amount: number };
type Member = { id: string; role: "OWNER" | "MEMBER"; user: User };

export default function WalletDetailPage() {
    const { id } = useParams<{ id: string }>();

    // balances
    const [users, setUsers] = useState<User[]>([]);
    const [pairs, setPairs] = useState<Pair[]>([]);
    const [net, setNet] = useState<{ userId: string; amount: number }[]>([]);
    // miembros
    const [members, setMembers] = useState<Member[]>([]);
    const [emailToAdd, setEmailToAdd] = useState("");
    const [err, setErr] = useState<string | null>(null);

    const dict = useMemo(() => Object.fromEntries(users.map(u => [u.id, u])), [users]);

    async function loadBalances() {
        const r = await fetch(`/api/wallets/${id}/balances`);
        const d = await r.json();
        if (!r.ok) { setErr(d?.error || "Error cargando balances"); return; }
        setUsers(d.users || []);
        setPairs(d.pairwise || []);
        setNet(d.net || []);
    }

    async function loadMembers() {
        const r = await fetch(`/api/wallets/${id}/members`);
        const d = await r.json();
        setMembers(d.members || []);
    }

    useEffect(() => {
        if (id) { loadBalances(); loadMembers(); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function addMember(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        const r = await fetch(`/api/wallets/${id}/members`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: emailToAdd, role: "MEMBER" })
        });
        const d = await r.json();
        if (!r.ok) { setErr(d?.error || "No se pudo agregar"); return; }
        setMembers(prev => [d.member, ...prev]);
        setEmailToAdd("");
    }

    async function removeMember(memberId: string) {
        if (!confirm("¿Eliminar este miembro de la billetera?")) return;
        const r = await fetch(`/api/wallets/${id}/members/${memberId}`, { method: "DELETE" });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) { alert(d?.error || "No se pudo eliminar"); return; }
        setMembers(prev => prev.filter(m => m.id !== memberId));
        // los balances pueden cambiar si quitaste alguien
        loadBalances();
    }

    return (
        <section className="space-y-6">
            <h1 className="text-2xl font-semibold">Billetera</h1>
            {err && <p className="text-red-600">{err}</p>}

            {/* Miembros */}
            <div className="space-y-3 border rounded p-4">
                <h2 className="font-medium">Miembros</h2>
                <form onSubmit={addMember} className="flex gap-2">
                    <input
                        value={emailToAdd}
                        onChange={e => setEmailToAdd(e.target.value)}
                        placeholder="email@ejemplo.com"
                        type="email"
                        className="border p-2 rounded flex-1"
                        required
                    />
                    <button className="px-3 py-2 rounded bg-black text-white">Agregar</button>
                </form>

                <ul className="divide-y">
                    {members.map(m => (
                        <li key={m.id} className="py-2 flex items-center justify-between">
                            <div>
                                <div className="font-medium">{m.user.name || m.user.email}</div>
                                <div className="text-xs text-gray-600">{m.role}</div>
                            </div>
                            <button onClick={() => removeMember(m.id)} className="text-sm underline">
                                Quitar
                            </button>
                        </li>
                    ))}
                    {members.length === 0 && <li className="text-sm text-gray-500 py-2">Aún no hay miembros.</li>}
                </ul>
            </div>

            {/* Deudas par a par */}
            <div className="space-y-2">
                <h2 className="font-medium">Deudas pendientes (par a par)</h2>
                {pairs.length === 0 && <p className="text-sm text-gray-600">No hay deudas pendientes.</p>}
                <ul className="space-y-2">
                    {pairs.map(p => (
                        <li key={`${p.fromUserId}-${p.toUserId}`} className="border rounded p-3 flex justify-between">
                            <div>
                                <b>{dict[p.fromUserId]?.name || dict[p.fromUserId]?.email}</b> debe a{" "}
                                <b>{dict[p.toUserId]?.name || dict[p.toUserId]?.email}</b>
                            </div>
                            <span className="font-semibold">
                {p.amount.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
              </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Neto por persona */}
            <div>
                <h2 className="font-medium">Neto por persona</h2>
                <ul className="mt-2 grid gap-2">
                    {net.map(n => (
                        <li key={n.userId} className="border rounded p-3 flex justify-between">
                            <span>{dict[n.userId]?.name || dict[n.userId]?.email}</span>
                            <span className={n.amount > 0 ? "text-red-600" : "text-green-600"}>
                {n.amount.toLocaleString("es-CO", { style: "currency", currency: "COP" })}
              </span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}
