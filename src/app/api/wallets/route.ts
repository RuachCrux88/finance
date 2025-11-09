import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { email } });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const wallets = await prisma.wallet.findMany({
        where: { members: { some: { userId: me.id } } },
        include: { members: { include: { user: true } } },
        orderBy: { createdAt: "desc" }
    });

    return NextResponse.json({ wallets });
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Regístrate para iniciar" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { email } });
    if (!me) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { name, type = "PERSONAL", currency = "COP" } = await req.json();
    if (!name) return NextResponse.json({ error: "name requerido" }, { status: 400 });

    const wallet = await prisma.wallet.create({
        data: {
            name, type, currency, createdById: me.id,
            members: { create: { userId: me.id, role: "OWNER" } }
        },
        include: { members: true }
    });

    return NextResponse.json({ wallet }, { status: 201 });
}
