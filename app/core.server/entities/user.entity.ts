export class User {
    
    constructor(
        public id: number | undefined,
        public email: string,
        public password: string,
        public role: string,
    ){}

    static ToUser(params: ToUser): User {
        return new User(
            params.id,
            params.email,
            params.password,
            params.role
        )
    }
}

export interface ToUser {
    id: number
    email: string
    password: string
    role: string
} 