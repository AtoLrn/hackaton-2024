import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchQuestions() {
    const questions = await prisma.data.findMany({
        take: 2,
        where: {
            id: { equals: 41 },
            themeQuestionId: null,
            themeReponseId: null,
            reponse: { not: null },
        }
    });
    return questions;
}

async function fetchThemes() {
    const themes = await prisma.theme.findMany();
    return themes;
}



export { fetchQuestions,fetchThemes };