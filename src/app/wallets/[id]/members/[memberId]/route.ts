import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function DELETE(
    _req: Request,
    { params }: { params: { id: string; memberId: string } }
) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const walletId = params.id;
    const memberId = params.memberId;

    const me = await prisma.user.findUnique({ where: { email } });

    // Solo OWNER puede eliminar
    const myMembership = await prisma.walletMember.findFirst({
        where: { walletId, userId: me!.id }
    });
    if (!myMembership || myMembership.role !== "OWNER") {
        return NextResponse.json({ error: "Solo OWNER puede eliminar miembros" }, { status: 403 });
    }

    const target = await prisma.walletMember.findUnique({ where: { id: memberId } });
    if (!target || target.walletId !== walletId) {
        return NextResponse.json({ error: "Miembro no pertenece a esta billetera" }, { status: 404 });
    }

    // No dejar la billetera sin OWNER
    if (target.role === "OWNER") {
        const owners = await prisma.walletMember.count({ where: { walletId, role: "OWNER" } });
        if (owners <= 1) {
            return NextResponse.json({ error: "No puedes eliminar al único OWNER" }, { status: 400 });
        }
    }

    await prisma.walletMember.delete({ where: { id: memberId } });
    return NextResponse.json({ ok: true });
}
