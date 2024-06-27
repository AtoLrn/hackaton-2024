import { PrismaClient } from '@prisma/client';
import { Ollama } from 'ollama';

const prisma = new PrismaClient();
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })


/**
 * DB RELATED
 */
async function fetchQuestions() {
    const questions = await prisma.data.findMany({
        take: 2,
        where: {
            id: { equals: 293 },
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

/**
 * IA RELATED
 */

const exempleThemePrompt = {
    role: 'system',
    content: `Un exemple de question et de réponse pour chaque theme :
    THEME HEALTH:  c'est Questions sur le bien-être et les symptômes du patient. exemple: "Hopital de la Pitié Salpetrière : Evaluez de nouveau votre douleur sur une échelle de 0 à 10 (0 = pas de douleur; 10 = douleur insupportable)", reponse : "O pas douleur", un autre exemple : "Vous n'avez répondu à aucun message, répondez y maintenant. Si tout va bien répondez maintenant TVB" (TVB est un acronyme de tout va bien), reponse : "Bonjour pour l instant TVB la douleur est supportable merci", si la question ou la réponse parle de TVB ou ses synonymes "tout va bien", ect c'est que ça concerne l'état de santé (donc le theme HEALTH)
    THEME SATISFACTION: c’est une question sur la satisfaction vis-à-vis des services médicaux ou de la prise en charge. Si la réponse donne une note (sans parler de douleur ou de son état physique) ou un avis, c'est le theme SATISFACTION, exemple de question : "Pole de santé du Villeneuvois: évaluez votre prise en charge sur une échelle de 1 à 5 (1: pas satisfait du tout 5: très satisfait) Cette note concerne les soins et les informations transmises par le médecin et l'équipe soignante", réponse : "très satifait", un autre exemple de réponse :"10 pour la satisfaction", quoi qu'il arrive, si ça parle de satisfaction, c'est le theme SATISFACTION.
    THEME INFORMATION: c’est un message fournissant des informations ou des directives spécifiques. : exemple: "Un accompagnant sera obligatoire pour votre retour à domicile et il devra etre présent à vos cotés jusqu'au lendemain matin" ou une réponse "j'habite chez mes parents" ect
    THEME OTHER: les questions et réponses qui ne rentrent pas dans les autres themes qui ne parlent ni de satisfaction, ni d'état de santé .`
}


async function isQuestionAnswerCohesive(question, answer, theme) {
    let themesArray = []
    for (let i = 0; i < theme.length; i++) {
        themesArray.push(theme[i].name)
    }
    const system = {
        role: 'system',
        content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé et leur état de satisfaction. Je vais te poser une question et une réponse donnée par un patient, et tu dois me dire si la réponse est cohérente avec la question et quelles sont liés à un des themes que je fourni, répond par oui si la réponse et la question possèdent le même theme (parmis les themes que je te fourni) c\'est à dire que la réponse répond à la question, sinon non. Réponds par "oui" ou "non" obligatoirement.Répond uniquement par OUI ou NON, pas de phrase, pas besoin de mexpliquer, je veux une réponse dans le format : { "cohesive": "oui" } ou { "cohesive": "non" }.'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la question posée : "'+question+'", et voici la réponse donnée par le patient : "'+answer+'". Les themes sont : '+themesArray+'.'
    }
    const output = await ollama.chat({
        model: 'llama3',
        messages: [system, exempleThemePrompt,  prompt],
        format: 'json'
    })
    return output
}

async function getThemeQuestion(question, theme) {
    let themesArray = []
    for (let i = 0; i < theme.length; i++) {
        themesArray.push(theme[i].name)
    }
    const system = {
        role: 'system',
        content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te poser une question et tu dois me dire à quel theme elle appartient parmis les thèmes suivants: '+themesArray+'. Réponds par le theme obligatoirement dans le format suivant { "theme": "<theme correspondant>" }.'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la question posée : "'+question+'".'
    }
    const output = await ollama.chat({
        model: 'llama3',
        messages: [system, exempleThemePrompt, prompt],
        format: 'json'
    })
    return output
}

async function getThemeAnswer(answer, theme) {
    let themesArray = []
    for (let i = 0; i < theme.length; i++) {
        themesArray.push(theme[i].name)
    }
    const system = {
        role: 'system',
        content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te donner une réponse à une question et tu dois me dire à quel theme elle appartient parmis les thèmes suvant : '+ themesArray+ ', répond par le theme de la réponse obligatoirement dans ce format : { "theme": "<theme correspondant>" }.'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la réponse donnée par le patient : "'+answer+'"'
    }
    const output = await ollama.chat({
        model: 'llama3',
        messages: [system, exempleThemePrompt, prompt],
        format: 'json'
    })
    return output
}

async function doesTheAnswerIsUsable(answer) {
    const system = {
        role: 'system',
        content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te poser une réponse et tu dois me dire si elle est compréhensible et ou utilisable pour obtenir le theme de cette réponse, cest à dire ou non, répond par "oui" si la réponse est utilisable, sinon "non, je veux une réponse dans le format : { "usable": "oui" } ou { "usable": "non" }.'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la réponse donnée par le patient : "'+answer+'".'
    }
    const output = await ollama.chat({
        model: 'llama3',
        messages: [system, exempleThemePrompt, prompt],
        format: 'json'
    })
    return output
}

/**
 * END OF IA RELATED
 */

  const questions = await fetchQuestions()
  const themes = await fetchThemes()

    for (const question of questions) {
    //   console.log("--------------------");
    //   console.log("Question : ", question.question)
    //   console.log("Reponse : ", question.reponse)

    //On regarde si les questions et les réponses sont cohérente entre elles, (et quelles ont le meme theme)
      const isQuestionResponseCohesiveOllama = await isQuestionAnswerCohesive(question.question, question.reponse, themes)
      const jsonCohesiveParsed = JSON.parse(isQuestionResponseCohesiveOllama.message.content);
      const isQuestionResponseCohesive = jsonCohesiveParsed.cohesive == "oui" ? true : false

      //on récupère le theme de la question en même temps 
      const themeOfQuestionOllama = await getThemeQuestion(question.question, themes)
      const jsonThemeQuestionParsed = JSON.parse(themeOfQuestionOllama.message.content);
      const themeOfQuestion = jsonThemeQuestionParsed.theme
      const theme = themes.find(theme => theme.name === themeOfQuestion)  //Get theme id from theme name
    
       //Si cohérente, on récupère le theme de la question(fait précedemment) et on le set à la question et a la réponse
      if(isQuestionResponseCohesive){
          question.themeQuestionId = theme.id ? theme.id : null
          question.themeReponseId = theme.id ? theme.id : null
          question.exploitable = true
      }else{
        //On set le theme de la question comme on l'a
        question.themeQuestionId = theme.id ? theme.id : null

        //on récupère le theme de la réponse si on peut mainteant
        const themeOfResponseOllama = await getThemeAnswer(question.reponse, themes)
        const jsonThemeResponseParsed = JSON.parse(themeOfResponseOllama.message.content);
        const themeOfResponse = jsonThemeResponseParsed.theme
        const themeResponse = themes.find(theme => theme.name === themeOfResponse)  //Get theme id from theme name

        //Si la question n'a pas de theme, on va voir si elle est "utilisable/compréhensible"
        if(!themeResponse){
          const isQuestionUnderstandableOllama = await doesTheAnswerIsUsable(question.question)
          const jsonUnderstandableParsed = JSON.parse(isQuestionUnderstandableOllama.message.content);
          const isQuestionUnderstandable = jsonUnderstandableParsed.usable == "oui" ? true : false
          if(isQuestionUnderstandable){
            question.exploitable = true
          }else{
            question.exploitable = false
          }
        }else{
            question.themeReponseId = themeResponse.id ? themeResponse.id : null
            question.exploitable = true
        }

      }

    //   console.log("question : ", question)
      //l'objet à traiter est question, on peut le sauvegarder en DB tho

    }

