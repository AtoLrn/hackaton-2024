import { injectable, multiInject } from "inversify"
import { Patient } from "../entities/patient.entity"
import { TYPES } from "../infrastructure"
import { ICompareService, ICompareSingleService } from "./compare.service"
import { MemoryLruService } from "./lru.service"

export interface IOffuscateService {
    offuscate(patient: Patient, message: string): Promise<string>
}

export type IOffuscateServiceComparaisonFunction = (stringA: string, stringB: string) => IOffuscateServiceComparaison | undefined  

export interface IOffuscateServiceComparaison {
    rate: number
    matched: string
}

// https://fr.wikipedia.org/wiki/Distance_de_Levenshtein
@injectable()
export class OffuscateService implements IOffuscateService {
    private lru: MemoryLruService<string>
    private comparaisonsFunctions: ICompareService['compare'][] = []
    private comparaisonsSingleFunctions: ICompareSingleService['compare'][] = []

    public constructor(
        @multiInject(TYPES.CompareService) comparaisons: ICompareService[],
        @multiInject(TYPES.CompareSingleService) singleComparaisons: ICompareSingleService[]
    ) {
        this.lru = new MemoryLruService<string>()
        this.comparaisonsSingleFunctions = singleComparaisons.map(({ compare }) => compare)
        this.comparaisonsFunctions = comparaisons.map(({ compare }) => compare)
    }
    
    replaceIfNeeded(map: [string, unknown], message: string): string {
        return this.comparaisonsFunctions.reduce((acc, val) => {
            const results = val(`${map[1]}`, message)
            if (!results) {
                return acc
            }

            return results.reduce((accR, valR) => {
                if (valR.rate < 0.5) {
                    return accR
                }

                return accR.replaceAll(valR.matched, `[${map[0].toUpperCase()}]`)        
            }, acc)
        }, message)
    }
   
    async offuscate(patient: Patient, message: string): Promise<string> {
        const cached = this.lru.get(message)

        if (cached) {
            return cached
        }

        const mapping = Object.entries(patient)
        const mappingKeys = Object.keys(patient).map(s => s.toUpperCase())

        const firstRoundMessage = mapping.reduce<string>((acc, val) => {
            if (typeof val[1] !== 'number' && typeof val[1] !== 'string') {
                return acc
            }
            return this.replaceIfNeeded(val, acc)
        }, message)  
        
        
        const result = await this.comparaisonsSingleFunctions.reduce(async (acc, val) => {
            const results = await val(await acc)

            if (!results) {
                return acc
            }

            return await results.reduce(async (accR, valR) => {
                if (mappingKeys.includes(valR.matched)) {
                    return await accR

                }

                if (valR.rate < 0.5) {
                    return await accR
                }

                return (await accR).replaceAll(valR.matched, `[AI]`)        
            }, acc)
        }, Promise.resolve(firstRoundMessage))

        this.lru.set(message, result)
        return result
    }    
}
