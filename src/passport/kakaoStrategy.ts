import passport from 'passport';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import User from '../models/user';

export default () => {
    passport.use(
        new KakaoStrategy(
            {
                clientID: process.env.KAKAO_ID!,
                callbackURL: '/auth/kakao/callback',
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const exUser = await User.findOne({
                        where: { sns_id: profile.id, provider: 'kakao' },
                    });
                    if (exUser) {
                        return done(null, exUser);
                    } else {
                        const newUser = await User.create({
                            email: profile._json?.kakao_account?.email || null,
                            nickname: profile.displayName,
                            sns_id: profile.id,
                            provider: 'kakao',
                        });
                        return done(null, newUser);
                    }
                } catch (error) {
                    console.error(error);
                    return done(error);
                }
            }
        )
    );
};
