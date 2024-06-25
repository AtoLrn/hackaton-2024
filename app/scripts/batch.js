import { Ollama } from 'ollama'
import { PrismaClient } from "@prisma/client";

async function fetchHealthIndicatorFromFeedback(ollama, question, response)
{
    const system = {
        role: 'system',
        content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te poser des questions et en fonction de la réponse donne moi un indicateur de 0 à 10 sur l\'état de santé du patient au format {"indicateur_de_sante": int}.'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la question posée : "'+question+'"(si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+response+'".'
    }
    const output = await ollama.chat({
        model: 'mistral',
        messages: [system, prompt],
        format: 'json'
    })

    const parsedRes = JSON.parse(output.message.content)

    console.log(parsedRes)

    return parsedRes.indicateur_de_sante
}

async function fetchSatisfactionIndicatorFromFeedback(ollama, question, response) 
{
    const system = {
        role: 'system',
        content: 'Tu es un personnel d\'hôpital qui s\'occupe des patients. Tu sais prendre en compte les avis des patients sur leur séjour à l\'hôpital et en tirer un indicateur de satisfaction. Je vais te poser des questions et en fonction de la réponse, donne-moi un indicateur de 0 à 10 sur l\'état de satisfaction du patient au format: {"indicateur_de_satisfaction": int}.'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la question posée :  "'+question+'" (si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+response+'".'
    }
    const output = await ollama.chat({
        model: 'mistral',
        messages: [system, prompt],
        format: 'json'
    })

    const parsedRes = JSON.parse(output.message.content)

    console.log(parsedRes)

    return parsedRes.indicateur_de_satisfaction
}

const PrismaClient = new PrismaClient()
const ollama = new Ollama({ host: 'http://localhost:11434' })