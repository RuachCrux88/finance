// src/app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth.config";
import { prisma } from "@/lib/prisma";
import type { CategoryType } from "@prisma/client";

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email ?? null;

    const typeParam = req.nextUrl.searchParams.get("type") as CategoryType | null;

    const me = email
        ? await prisma.user.findUnique({ where: { email }, select: { id: true } })
        : null;

    const where = {
        OR: [{ createdById: me?.id ?? "__none__" }, { isSystem: true }],
        ...(typeParam ? { type: typeParam } : {}),
    };

    const categories = await prisma.category.findMany({
        where,
        orderBy: [{ isSystem: "desc" }, { name: "asc" }],
        select: { id: true, name: true, type: true, description: true, isSystem: true, createdById: true },
    });

    const list = categories.map(c => ({
        ...c,
        editable: !!me && c.createdById === me.id, // solo las mías
    }));

    return NextResponse.json({ categories: list });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    const email = session?.user?.email;
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const me = await prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, type, description } = await req.json();
    if (!name || !type) return NextResponse.json({ error: "name/type required" }, { status: 400 });

    const created = await prisma.category.create({
        data: { name, type, description, createdById: me.id, isSystem: false },
    });

    return NextResponse.json({ category: created }, { status: 201 });
}
