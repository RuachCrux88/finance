import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

type SplitIn = { owedByUserId: string; amount: number };

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const walletId = searchParams.get("walletId");
    if (!walletId) return NextResponse.json({ error: "walletId requerido" }, { status: 400 });

    const txs = await prisma.transaction.findMany({
        where: { walletId },
        include: { category: true, splits: true, paidBy: true },
        orderBy: { date: "desc" }
    });
    return NextResponse.json({ transactions: txs });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { email } });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { walletId, categoryId, type, amount, date, description, paidByUserId, splits } = await req.json();

    if (!walletId || !categoryId || !type || !amount)
        return NextResponse.json({ error: "walletId, categoryId, type, amount requeridos" }, { status: 400 });

    // validar miembro del wallet
    const isMember = await prisma.walletMember.findFirst({ where: { walletId, userId: me.id } });
    if (!isMember) return NextResponse.json({ error: "No eres miembro del wallet" }, { status: 403 });

    // crear transacción + splits
    const tx = await prisma.transaction.create({
        data: {
            walletId,
            categoryId,
            type,
            amount,
            date: date ? new Date(date) : undefined,
            description,
            paidByUserId: paidByUserId || me.id,
            createdById: me.id,
            splits: splits && Array.isArray(splits) && splits.length > 0
                ? {
                    create: (splits as SplitIn[]).map(s => ({
                        owedByUserId: s.owedByUserId,
                        amount: s.amount
                    }))
                }
                : undefined
        },
        include: { category: true, splits: true, paidBy: true }
    });

    return NextResponse.json({ transaction: tx }, { status: 201 });
}
