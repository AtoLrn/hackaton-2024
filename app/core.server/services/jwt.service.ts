
import jsonwebtoken from 'jsonwebtoken'

import { injectable } from "inversify";
import { User } from "../entities/user.entity";

const KEY = 'YU4RCK6ZgmMNZ3e4qHrug6eTPBDSqh9iocpA8DMNHMjJ5JjLGnVmVfizgWgkHdS8'

export interface IJwt {
    sign(user: User): Promise<string>
    verify(jwt: string): Promise<boolean>
}

@injectable()
export class Jwt implements IJwt {
    async sign(user: User): Promise<string> {
        return jsonwebtoken.sign(JSON.stringify(user), KEY)
    }

    async verify(jwt: string): Promise<boolean> {
        try {
            await jsonwebtoken.verify(jwt, KEY)
            return true
        } catch {
            return false
        }
        
    }
}