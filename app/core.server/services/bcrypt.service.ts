
import bcryptjs from "bcryptjs";
import { injectable } from "inversify";

export interface IBcrypt {
    hash(password: string): Promise<string>
    compare(hash: string, password: string): Promise<boolean>
}

@injectable()
export class Bcrypt implements IBcrypt {
    hash(password: string): Promise<string> {
        return bcryptjs.hash(password, 10)
    }
    compare(hash: string, password: string): Promise<boolean> {
        return bcryptjs.compare(password, hash)
    }

}