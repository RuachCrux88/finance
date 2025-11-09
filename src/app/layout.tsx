import "./globals.css";
import Link from "next/link";
import Providers from "./providers";
import AuthMenu from "@/components/AuthMenu";

export const metadata = {
    title: "fAInance",
    description: "Portafolio de finanzas personal y en equipo",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
        <body>
        <Providers>
            <header style={{ borderBottom: "1px solid #eee" }}>
                <nav
                    style={{
                        maxWidth: 960,
                        margin: "0 auto",
                        padding: "12px 16px",
                        display: "flex",
                        gap: 16,
                        alignItems: "center",
                    }}
                >
                    <Link href="/">Inicio</Link>
                    <Link href="/wallets">Billeteras</Link>
                    <Link href="/transactions">Transacciones</Link>

                    <div style={{ marginLeft: "auto" }}>
                        <AuthMenu />
                    </div>
                </nav>
            </header>

            <main style={{ maxWidth: 960, margin: "0 auto", padding: "16px" }}>
                {children}
            </main>
        </Providers>
        </body>
        </html>
    );
}
