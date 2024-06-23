
import { inject, injectable } from "inversify";
import { User } from "../entities/user.entity";
import { TYPES } from "../infrastructure";
import { IBcrypt } from "./bcrypt.service";
import { IUserRepository } from "../repositories/user.repository";
import { IJwt } from "./jwt.service";

export interface IAuthentication {
    login(email: string, password: string): Promise<string>
    getUser(jwt: string): Promise<User>
}

@injectable()
export class Authentication implements IAuthentication {
    constructor(
        @inject(TYPES.BcryptService) private bcrypt: IBcrypt,
        @inject(TYPES.UserRepository) private userRepository: IUserRepository,
        @inject(TYPES.JwtService) private jwt: IJwt,
    ) {}
    
    getUser(_: string): Promise<User> {
        throw new Error("Method not implemented.");
    }

    async login(email: string, password: string): Promise<string> {
        const user = await this.userRepository.getUserByEmail(email)   

        const isMatch = await this.bcrypt.compare(user.password, password)

        if (!isMatch) {
            throw new Response(undefined, {
                status: 401
            })
        }

        return this.jwt.sign(user)
    }


    // async getUser(jwt: string): Promise<User> {
    //     const user = await this.userRepository.getUserByEmail('') 
    // }
}