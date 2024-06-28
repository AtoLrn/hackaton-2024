import { PrismaClient } from '@prisma/client';
import { Ollama } from 'ollama';

const prisma = new PrismaClient();
const ollama = new Ollama({ host: 'http://127.0.0.1:11434' })

/**
 * DB RELATED
 */
async function fetchDatalist() {
    const dataList = await prisma.data.findMany({
        where: {
            themeQuestionId: null,
            themeReponseId: null,
        }
    });
    return dataList;
}

async function fetchThemes() {
    const themes = await prisma.theme.findMany();
    return themes;
}

/**
 * IA RELATED
 */

async function fetchHealthIndicatorFromFeedback(question, response)
{
    const system = {
        role: 'system',
        content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te soumettre une question posé par un service automatique ou par un personnel de santé, et une réponse donné par un patient pouvant ne pas être à l\'aise avec la technologie. Si la question est à propos de la douleur, prends le en compte, si le patient n\'a pas ou peu de douleurs, c\'est que le health_indicator doit être très élevé. Donne moi un indicateur de 1 à 10 sur l\'état de santé actuel du patient (1 : état de santé critique, 10: état de santé parfait), s\'il allait mal avant mais qu\'il va mieux, prend en compte son état présent. L\'indicateur, ne peut pas avoir une valeur égale à 0 (zéro), il doit forcément être comprise entre 1 et 10.'
    }
    const systemAbreviations = {
        role: 'system',
        content: 'Voici une lise des abréviations utilisées, prends les en compte dans ta notation : "TVB" pour "TOUT VA BIEN", "AID" pour "AIDE"'
    }
    const systemFormat = {
        role: 'system',
        content: 'Ton format de retour est : {"health_indicator": int}'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la question posée : "'+question+'"(si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+response+'".'
    }
    const output = await ollama.chat({
        model: 'llama3',
        messages: [system, systemAbreviations, systemFormat, prompt],
        format: 'json'
    })

    const parsedRes = JSON.parse(output.message.content)
    return parsedRes
}

async function fetchSatisfactionIndicatorFromFeedback(question, response) 
{
    const system = {
        role: 'system',
        content: 'Tu es un personnel d\'hôpital qui s\'occupe des patients. Tu sais prendre en compte les avis des patients sur leur séjour à l\'hôpital, la pénibilité et la facilité des différentes tâches et en tirer un indicateur de satisfaction. Je vais te poser des questions et en fonction de la réponse, donne-moi un indicateur de 1 à 10 sur l\'état de satisfaction du patient (1 : pas satisfait du tout, 10: très satisfait). L\'indicateur ne peut pas avoir une valeur égale à 0 (zéro), il doit forcément être comprise entre 1 et 10.'
    }
    const systemAbreviations = {
        role: 'system',
        content: 'Voici une lise des abréviations utilisées : "TVB" pour "TOUT VA BIEN", "AID" pour "AIDE"'
    }
    const systemFormat = {
        role: 'system',
        content: 'Ton format de retour est : {"satisfaction_indicator": int}'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la question posée :  "'+question+'" (si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+response+'".'
    }
    const output = await ollama.chat({
        model: 'llama3',
        messages: [system, systemAbreviations, systemFormat, prompt],
        format: 'json'
    })

    const parsedRes = JSON.parse(output.message.content)
    return parsedRes
}

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

async function classifyData(data, themes) {
    //On regarde si les questions et les réponses sont cohérente entre elles, (et quelles ont le meme theme)
      const isQuestionResponseCohesiveOllama = await isQuestionAnswerCohesive(data.question, data.reponse, themes)
      const jsonCohesiveParsed = JSON.parse(isQuestionResponseCohesiveOllama.message.content);
      const isQuestionResponseCohesive = jsonCohesiveParsed.cohesive == "oui" ? true : false

      //on récupère le theme de la question en même temps 
      const themeOfQuestionOllama = await getThemeQuestion(data.question, themes)
      const jsonThemeQuestionParsed = JSON.parse(themeOfQuestionOllama.message.content);
      const themeOfQuestion = jsonThemeQuestionParsed.theme
      const theme = themes.find(theme => theme.name === themeOfQuestion)  //Get theme id from theme name
    
       //Si cohérente, on récupère le theme de la question(fait précedemment) et on le set à la question et a la réponse
      if(isQuestionResponseCohesive){
        data.themeQuestionId = theme.id ? theme.id : null
        data.themeReponseId = theme.id ? theme.id : null
        data.exploitable = true
      }else{
        //On set le theme de la question comme on l'a
        data.themeQuestionId = theme.id ? theme.id : null

        //on récupère le theme de la réponse si on peut mainteant
        const themeOfResponseOllama = await getThemeAnswer(data.reponse, themes)
        const jsonThemeResponseParsed = JSON.parse(themeOfResponseOllama.message.content);
        const themeOfResponse = jsonThemeResponseParsed.theme
        const themeResponse = themes.find(theme => theme.name === themeOfResponse)  //Get theme id from theme name

        //Si la question n'a pas de theme, on va voir si elle est "utilisable/compréhensible"
        if(!themeResponse){
          const isQuestionUnderstandableOllama = await doesTheAnswerIsUsable(data.question)
          const jsonUnderstandableParsed = JSON.parse(isQuestionUnderstandableOllama.message.content);
          const isQuestionUnderstandable = jsonUnderstandableParsed.usable == "oui" ? true : false
          if(isQuestionUnderstandable){
            data.exploitable = true
          }else{
            data.exploitable = false
          }
        }else{
            data.themeReponseId = themeResponse.id ? themeResponse.id : null
            data.exploitable = true
        }
      }

      return data
}

async function fetchDataFeedback(data, themes) {
  let indicator = false
  const themeReponse = themes.find(t => t.id === data.themeReponseId);
  const themeQuestion = themes.find(t => t.id === data.themeQuestionId);
  console.log("Theme response :" + themeReponse.name)
    
    switch (themeReponse.name) {
      case "HEALTH": //health
        console.log("theme reponse is HEALTH")
        if (themeReponse !== themeQuestion) {
          indicator = await fetchHealthIndicatorFromFeedback("Boujour, comment evalueriez votre état de santé?", data.reponse)
        } else {
          indicator = await fetchHealthIndicatorFromFeedback(data.question, data.reponse)
        }
        if (typeof indicator.health_indicator === 'number') {
          data.note = indicator.health_indicator
        }
        break
      
      case "SATISFACTION": //satisfaction
        console.log("theme reponse is SATISFACTION")
        if (themeReponse !== themeQuestion) {
          indicator = await fetchHealthIndicatorFromFeedback("Boujour, comment evalueriez votre satisfaction dans notre établissement?", data.reponse)
        } else {
          indicator = await fetchSatisfactionIndicatorFromFeedback(data.question, data.reponse)
        }
        if (typeof indicator.satisfaction_indicator === 'number') {
          data.note = indicator.satisfaction_indicator
        }
        break

      default:
        console.log("theme reponse is OTHER or INFORMATION")
        data.note = 0
    }

    return data
}

const dataList = await fetchDatalist()
const themes = await fetchThemes()

console.log(dataList.length + " data to classify.")
for (let i = 0; i < dataList.length; i++) {
    console.log("--------------------------------")
    try {
        const classifiedData = await classifyData(dataList[i], themes)
        //Update data in DB
        await prisma.data.update({
            where: { id: classifiedData.id },
            data: {
                themeQuestionId: classifiedData.themeQuestionId,
                themeReponseId: classifiedData.themeReponseId,
                exploitable: classifiedData.exploitable
            }
        })
    } catch (error) {
        console.log("Error while classifying data with id : "+dataList[i].id+"...\n")
        console.log(error)
    }
    console.log("Data :"+dataList[i].id+" classified.\n")
    console.log("Fetching indicator for data : " + dataList[i].id)

    try {
      const updatedData = await fetchDataFeedback(dataList[i], themes)
      await prisma.data.update({
          where: { id: updatedData.id },
          data: {
            note: updatedData.note,
          }
      })
    } catch (error) {
        console.log("Error while fetching feedback for data with id : "+dataList[i].id+"...\n")
        console.log(error)
    }
    console.log("Data :"+dataList[i].id+" have now a note.\n")
    console.log(dataList[i]) 
}
