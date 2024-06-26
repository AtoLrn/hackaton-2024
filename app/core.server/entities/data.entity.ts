export class Data {
    
    constructor(
        public id: number | undefined,
        public question: string,
        public reponse: string | null,
        public exploitable: boolean,
        public themeQuestionId: number | null,
        public themeReponseId: number | null,
        public note: number,
        public isReponseConsistent: boolean,
    ){}

    static ToData(params: ToData): Data {
        return new Data(
            params.id,
            params.question,
            params.reponse,
            params.exploitable,
            params.themeQuestionId,
            params.themeReponseId,
            params.note,
            params.isReponseConsistent,
        )
    }
}

export interface ToData {
    id: number
    question: string
    reponse: string | null
    exploitable: boolean
    themeQuestionId: number | null
    themeReponseId: number | null
    note: number
    isReponseConsistent: boolean
} 
