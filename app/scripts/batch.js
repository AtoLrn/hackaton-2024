import { PrismaClient } from '@prisma/client';
import { Ollama } from 'ollama';

const ollama = new Ollama({ host: 'http://localhost:11434' })
const prisma = new PrismaClient();

async function fetchHealthIndicatorFromFeedback(ollama, question, response)
{
    const system = {
        role: 'system',
        content: 'Tu es un expert de santé qui a plus de vingt ans d\'expérience et qui sait prendre en compte les retours de ses patients afin d\'en tirer des conclusions sur leur état de santé. Je vais te soumettre une question posé par un service automatique ou par un personnel de santé, et une réponse donné par un patient pouvant ne pas être à l\'aise avec la technologie. Si la question est à propos de la douleur, prends le en compte, si le patient n\'a pas ou peu de douleurs, c\'est que le health_indicator doit être très élevé. Donne moi un indicateur de 1 à 10 sur l\'état de santé du patient (1 : état de santé critique, 10: état de santé parfait),  ainsi qu\'une note de 1 à 10 qui note la compatibilité de la réponse (1: la réponse ne correspond pas du tout à la question, 10: la réponse correspond parfaitement à la question).'
    }
    const systemAbreviations = {
        role: 'system',
        content: 'Voici une lise des abréviations utilisées, prends les en compte dans ta notation : "TVB" pour "TOUT VA BIEN", "AID" pour "AIDE"'
    }
    const systemFormat = {
        role: 'system',
        content: 'Ton format de retour est : {"health_indicator": int, "compatibility": int}'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la question posée : "'+question+'"(si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+response+'".'
    }
    const output = await ollama.chat({
        model: 'mistral',
        messages: [system, systemAbreviations, systemFormat, prompt],
        format: 'json'
    })

    const parsedRes = JSON.parse(output.message.content)
    return parsedRes
}

async function fetchSatisfactionIndicatorFromFeedback(ollama, question, response) 
{
    const system = {
        role: 'system',
        content: 'Tu es un personnel d\'hôpital qui s\'occupe des patients. Tu sais prendre en compte les avis des patients sur leur séjour à l\'hôpital, la pénibilité et la facilité des différentes tâches et en tirer un indicateur de satisfaction. Je vais te poser des questions et en fonction de la réponse, donne-moi un indicateur de 1 à 10 sur l\'état de satisfaction du patient ainsi qu\'une note de 1 à 10 qui note la compatibilité de la réponse à la question.'
    }
    const systemAbreviations = {
        role: 'system',
        content: 'Voici une lise des abréviations utilisées : "TVB" pour "TOUT VA BIEN", "AID" pour "AIDE"'
    }
    const systemFormat = {
        role: 'system',
        content: 'Ton format de retour est : {"satisfaction_indicator": int, "compatibility": int}'
    }
    const prompt = {
        role: 'user',
        content : 'Voici la question posée :  "'+question+'" (si la question contient une échelle différente, ignore l\'échelle donnée dans la question ne renvoie qu\'une note de 1 à 10), et voici la réponse donnée par le patient : "'+response+'".'
    }
    const output = await ollama.chat({
        model: 'mistral',
        messages: [system, systemAbreviations, systemFormat, prompt],
        format: 'json'
    })

    const parsedRes = JSON.parse(output.message.content)
    return parsedRes
}

async function fetchDataFeedback() {
    const DBG = true
    const datas = await prisma.data.findMany({
        where: {
            exploitable: true,
            note: 0,
        }
    })

    let errorDatas = []
    let cpt = 0
    await datas.forEach(async e => {
        let indicator = false
        switch (e.themeReponseId) {
            case 1: //health
                try {
                    indicator = await fetchHealthIndicatorFromFeedback(ollama, e.question, e.reponse)
                    if ( DBG ) {
                        console.log("------------------------Data "+(cpt+1)+" / "+datas.length+" processing.------------------------");
                        console.log("HEALTH\n")
                        console.log("DataId : "+e.id+"\n")
                        console.log("Question : "+e.question+"\n")
                        console.log("Reponse : "+e.reponse+"\n")
                        console.log("Indicator : ")
                        console.log(indicator)
                        console.log("------------------------Data processed.---------------------------------------------------");
                    }
                    
                    if (typeof indicator.health_indicator === 'number') {
                        await prisma.data.update({
                            where: { id: e.id },
                            data: {
                                note: parseInt(indicator.health_indicator),
                            }
                        })
                    }
                } catch (error) {
                    errorDatas.push({
                        "element_id":e.id,
                        "error": error
                    })
                }
                break
            
            case 2: //satisfaction
                try {
                    indicator = await fetchSatisfactionIndicatorFromFeedback(ollama, e.question, e.reponse)
                    if ( DBG ) {
                        console.log("------------------------Data "+(cpt+1)+" / "+datas.length+" processing.------------------------");
                        console.log("SATISFACTION\n")
                        console.log("DataId : "+e.id+"\n")
                        console.log("Question : "+e.question+"\n")
                        console.log("Reponse : "+e.reponse+"\n")
                        console.log("Indicator : ")
                        console.log(indicator)
                        console.log("------------------------Data processed.---------------------------------------------------")
                    }
                    
                    if (typeof indicator.satisfaction_indicator === 'number') {
                        await prisma.data.update({
                            where: { id: e.id },
                            data: {
                                note: parseInt(indicator.satisfaction_indicator),
                            }
                        })
                    }
                } catch (error) {
                    datas.push(e.id)
                }
                break
    
            // case 3: //other
            //     break
    
            // case 4: //information
            //     break
        
            default:
                console.log("------------------------Data "+(cpt+1)+" / "+datas.length+" skipped.----------------------------------")
                break
        }
        cpt++
    })

    if (DBG && errorDatas.length > 0) {
        console.log("\n-----------------------------------------------------------------------------------------")
        console.log("\n-----------ErrorDatas : -----------\n")
        console.log(errorDatas)
        console.log("\n-----------------------------------------------------------------------------------------\n")
    }
    return datas
}

const datas = await fetchDataFeedback()
