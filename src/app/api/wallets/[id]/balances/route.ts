import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: Request,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id: walletId } = await ctx.params;

    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { email } });
    // Debes ser miembro de la billetera
    const myMembership = await prisma.walletMember.findFirst({
        where: { walletId, userId: me!.id },
    });
    if (!myMembership) {
        return NextResponse.json({ error: "Wallet no encontrada" }, { status: 404 });
    }

    // ✅ SOLO miembros de esta billetera
    const members = await prisma.walletMember.findMany({
        where: { walletId },
        include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Estructura de saldos por miembro
    const balances: Record<string, number> = {};
    for (const m of members) balances[m.userId] = 0;

    // Trae transacciones de la billetera con sus splits
    const txs = await prisma.transaction.findMany({
        where: { walletId },
        include: { splits: true, category: { select: { type: true } } },
    });

    for (const t of txs) {
        // Solo contamos EXPENSE para repartir entre miembros
        if (t.type === "EXPENSE") {
            // quien paga recupera el total
            if (balances[t.paidByUserId] !== undefined) {
                balances[t.paidByUserId] += Number(t.amount);
            }
            // cada split resta su parte
            for (const s of t.splits) {
                if (balances[s.owedByUserId] !== undefined) {
                    balances[s.owedByUserId] -= Number(s.amount);
                }
            }
        }
    }

    // Respuesta: neto por persona SOLO miembros
    const netByUser = members.map((m) => ({
        userId: m.userId,
        name: m.user.name || m.user.email,
        amount: balances[m.userId] || 0,
    }));

    return NextResponse.json({ members: netByUser });
}
