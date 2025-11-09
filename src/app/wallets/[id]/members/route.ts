import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function GET(
    _req: Request,
    { params }: { params: { id: string } }
) {
    const walletId = params.id;
    const members = await prisma.walletMember.findMany({
        where: { walletId },
        include: { user: true },
        orderBy: { joinedAt: "asc" }
    });
    return NextResponse.json({
        members: members.map(m => ({
            id: m.id,
            role: m.role,
            user: { id: m.userId, name: m.user.name, email: m.user.email }
        }))
    });
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const walletId = params.id;

    // Solo OWNER puede agregar
    const me = await prisma.user.findUnique({ where: { email } });
    const myMembership = await prisma.walletMember.findFirst({
        where: { walletId, userId: me!.id }
    });
    if (!myMembership || myMembership.role !== "OWNER") {
        return NextResponse.json({ error: "Solo OWNER puede agregar miembros" }, { status: 403 });
    }

    const { email: newEmail, role = "MEMBER" } = await req.json();
    if (!newEmail) return NextResponse.json({ error: "email requerido" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email: newEmail } });
    if (!user) {
        return NextResponse.json({ error: "Usuario no encontrado. (Luego podemos invitar por email)" }, { status: 404 });
    }

    try {
        const member = await prisma.walletMember.create({
            data: { walletId, userId: user.id, role }
        });
        return NextResponse.json({
            member: {
                id: member.id,
                role: member.role,
                user: { id: user.id, name: user.name, email: user.email }
            }
        }, { status: 201 });
    } catch (e: any) {
        // Único por (walletId, userId)
        return NextResponse.json({ error: "Ya es miembro de esta billetera" }, { status: 409 });
    }
}
