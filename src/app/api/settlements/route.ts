import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");
    if (!walletId) return NextResponse.json({ error: "walletId requerido" }, { status: 400 });

    const items = await prisma.settlement.findMany({
        where: { walletId },
        orderBy: { date: "desc" }
    });
    return NextResponse.json({ settlements: items });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { email } });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { walletId, fromUserId, toUserId, amount } = await req.json();

    if (!walletId || !fromUserId || !toUserId || !amount)
        return NextResponse.json({ error: "walletId, fromUserId, toUserId, amount requeridos" }, { status: 400 });
    if (fromUserId === toUserId)
        return NextResponse.json({ error: "fromUserId y toUserId no pueden ser iguales" }, { status: 400 });

    // Ambos deben ser miembros
    const [m1, m2] = await Promise.all([
        prisma.walletMember.findFirst({ where: { walletId, userId: fromUserId } }),
        prisma.walletMember.findFirst({ where: { walletId, userId: toUserId } }),
    ]);
    if (!m1 || !m2) return NextResponse.json({ error: "Usuarios no pertenecen a la billetera" }, { status: 403 });

    const st = await prisma.settlement.create({
        data: {
            walletId,
            fromUserId,
            toUserId,
            amount,
            createdById: me.id
        }
    });

    return NextResponse.json({ settlement: st }, { status: 201 });
}
