import { injectable, multiInject } from "inversify"
import { Patient } from "../entities/patient.entity"
import { TYPES } from "../infrastructure"
import { ICompareService, ICompareServiceResults } from "./compare.service"

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
    private comparaisonsFunctions: ICompareService['compare'][] = []

    public constructor(
        @multiInject(TYPES.CompareService) comparaisons: ICompareService[]
    ) {
        this.comparaisonsFunctions = comparaisons.map(({ compare }) => compare)
    }
    
    replaceIfNeeded(map: [string, unknown], message: string): string {
        return this.comparaisonsFunctions.reduce((acc, val) => {
            const results = val(map[0], message)
            if (!results) {
                return acc
            }


            if (results.rate < 0.5) {
                return acc
            }

            return acc.replaceAll(message, results.matched)        
        }, message)
    }
   
    async offuscate(patient: Patient, message: string): Promise<string> {
        const mapping = Object.entries(patient)

        return mapping.reduce<string>((acc, val) => {
            return this.replaceIfNeeded(val, acc)
        }, message)         
    }    
}
