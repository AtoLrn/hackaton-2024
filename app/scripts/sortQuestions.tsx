import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchQuestions() {
    const questions = await prisma.data.findMany({
        take: 2,
    });
    return questions;
}

async function fetchThemes() {
    const themes = await prisma.theme.findMany();
    return themes;
}



export { fetchQuestions,fetchThemes };