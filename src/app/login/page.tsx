// src/app/login/page.tsx
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export const metadata = { title: "Iniciar sesión" };

export default function LoginPage() {
    return (
        <section className="max-w-md mx-auto space-y-6">
            <h1 className="text-2xl font-semibold">Iniciar sesión</h1>

            <GoogleSignInButton callbackUrl="/" />

            <div className="flex items-center gap-3">
                <div className="h-px bg-gray-200 flex-1" />
                <span className="text-xs text-gray-500">o</span>
                <div className="h-px bg-gray-200 flex-1" />
            </div>

            <div className="text-sm">
                ¿No tienes cuenta? <Link href="/register" className="underline">Regístrate</Link>
            </div>
        </section>
    );
}
