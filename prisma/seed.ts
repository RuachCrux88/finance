// prisma/seed.ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const EXPENSE = "EXPENSE" as const;
const INCOME  = "INCOME"  as const;

const defaultCategories = [
    // Gastos
    { name: "Comida",       type: EXPENSE, description: "Super, restaurantes, snacks" },
    { name: "Transporte",   type: EXPENSE, description: "Público, gasolina, peajes" },
    { name: "Vivienda",     type: EXPENSE, description: "Arriendo, servicios, mantenimiento" },
    { name: "Salud",        type: EXPENSE, description: "Medicinas, citas" },
    { name: "Entretenimiento", type: EXPENSE, description: "Cine, streaming" },
    { name: "Educación",    type: EXPENSE, description: "Cursos, matrículas, libros" },
    // Ingresos
    { name: "Salario",      type: INCOME,  description: "Nómina, honorarios" },
    { name: "Intereses",    type: INCOME,  description: "Intereses, rendimientos" },
    { name: "Ventas",       type: INCOME,  description: "Venta de artículos o servicios" },
];

async function main() {
    for (const c of defaultCategories) {
        const found = await prisma.category.findFirst({
            where: { name: c.name, type: c.type, isSystem: true },
            select: { id: true },
        });

        if (found) {
            await prisma.category.update({
                where: { id: found.id },
                data: { description: c.description, isSystem: true },
            });
        } else {
            await prisma.category.create({
                data: { ...c, isSystem: true },
            });
        }
    }
    console.log("✅ Categorías globales listas.");
}

main().finally(() => prisma.$disconnect());
