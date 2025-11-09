"use client";
import { signIn } from "next-auth/react";

export default function GoogleSignInButton({ callbackUrl = "/" }: { callbackUrl?: string }) {
    return (
        <button
            type="button"
            onClick={() => signIn("google", { callbackUrl })}
            className="w-full flex items-center justify-center gap-3 border rounded px-4 py-2 text-sm hover:bg-gray-50"
            aria-label="Iniciar sesión con Google"
        >
            <GoogleIcon className="h-5 w-5" />
            Continuar con Google
        </button>
    );
}

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg {...props} viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.8 31.7 29.3 35 24 35c-7 0-12.8-5.8-12.8-12.8S17 9.5 24 9.5c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.2 3.6 29.4 1.8 24 1.8 12 1.8 2.3 11.5 2.3 23.5S12 45.2 24 45.2c11.5 0 21-8.3 21-21 0-1.6-.2-3.1-.4-4.7z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.5 18.9 13.8 24 13.8c3.1 0 5.9 1.1 8.1 3l5.7-5.7C34.2 7.9 29.4 6.1 24 6.1c-7.6 0-14.2 4.3-17.7 10.6z"/>
            <path fill="#4CAF50" d="M24 45.2c5.3 0 10.1-1.8 13.8-4.9l-6.4-5.2C29.3 35 26.9 35.9 24 35.9c-5.2 0-9.6-3.4-11.2-8.1l-6.5 5.1c3.4 6.5 10 10.3 17.7 10.3z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.4 3.4-4.7 5.9-8.3 5.9-5.2 0-9.6-3.4-11.2-8.1l-6.5 5.1C12.7 37.4 18.9 41.2 26 41.2c11.5 0 21-8.3 21-21 0-1.6-.2-3.1-.4-4.7z"/>
        </svg>
    );
}
