import jwt from 'jsonwebtoken';
import User from '../models/user';

type AppTokenPayload = {
    user_id: number;
    userId: string | null;
    email: string | null;
    nickname: string;
    provider: string;
};

export const generateAppToken = (user: User): string => {
    return jwt.sign(
        {
            user_id: user.user_id,
            userId: user.userId ?? null,
            email: user.email ?? null,
            nickname: user.nickname,
            provider: user.provider,
        },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );
};

export const verifyAppTokenValue = (token: string): AppTokenPayload => {
    return jwt.verify(token, process.env.JWT_SECRET!) as AppTokenPayload;
};
