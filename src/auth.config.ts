import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    session: { strategy: "jwt" }, // simple y sin tabla Session (puedes quitar si quieres DB session)
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: { email: {}, password: {} },
            async authorize(creds) {
                if (!creds?.email || !creds?.password) return null;
                const user = await prisma.user.findUnique({ where: { email: creds.email } });
                if (!user?.password) return null; // cuenta Google sin password → usa Google login
                const ok = await bcrypt.compare(creds.password, user.password);
                if (!ok) return null;
                return { id: user.id, email: user.email, name: user.name };
            },
        }),
    ],
    pages: { signIn: "/login" }, // opcional
    callbacks: {
        async jwt({ token, user }) { if (user) token.id = (user as any).id; return token; },
        async session({ session, token }) {
            if (session.user && token.id) (session.user as any).id = token.id as string;
            return session;
        },
    },
};
