import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    const { name, email, password } = await req.json();

    if (!email || !password) {
        return NextResponse.json({ error: "Email y password requeridos" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
        return NextResponse.json({ error: "El usuario ya existe" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { name, email, password: hashed } });

    const { password: _omit, ...safe } = user as any;
    return NextResponse.json({ user: safe }, { status: 201 });
}

