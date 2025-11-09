import NextAuth from "next-auth";
import { authOptions } from "@/auth.config"; // si tu alias falla, usa la ruta relativa: "../../../../auth.config"

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
