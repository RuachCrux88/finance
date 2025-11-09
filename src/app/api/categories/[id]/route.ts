import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    const body = await req.json();
    const cat = await prisma.category.findUnique({ where: { id: params.id } });

    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (cat.isSystem || cat.createdById !== me?.id)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const updated = await prisma.category.update({
        where: { id: params.id },
        data: {
            name: body.name ?? cat.name,
            description: body.description ?? cat.description,
            type: body.type ?? cat.type,
        },
    });

    return NextResponse.json({ category: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    const cat = await prisma.category.findUnique({ where: { id: params.id } });

    if (!cat) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (cat.isSystem || cat.createdById !== me?.id)
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
}
