//import { UserAttributes } from '../models/user';
declare global {
    interface Error {
        status: number;
    }
    namespace Express {
        interface User {
            user_id: number;
            email: string;
            password?: string;
            nickname: string;
            sns_id?: string;
            provider: string;
            created_at?: Date;
            admin: boolean;
        }
        interface Request {
            user: User;
        }
    }
}
export {};
