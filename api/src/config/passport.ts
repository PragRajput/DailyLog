import passport from 'passport';
import { Strategy as GoogleStrategy, Profile } from 'passport-google-oauth20';
import { User, IUser } from '../models/User';

// Augment Express.User so req.user is typed as IUser everywhere
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

passport.use(
  new GoogleStrategy(
    {
      clientID:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL:  process.env.GOOGLE_CALLBACK_URL!,
    },
    async (_accessToken, _refreshToken, profile: Profile, done) => {
      try {
        const googleAvatar = profile.photos?.[0]?.value;
        // Always upsert so avatar stays fresh and existing users get their photo populated
        const user = await User.findOneAndUpdate(
          { googleId: profile.id },
          {
            $set: {
              email:  profile.emails![0].value,
              name:   profile.displayName,
              ...(googleAvatar ? { avatar: googleAvatar } : {}),
            },
            $setOnInsert: { googleId: profile.id },
          },
          { upsert: true, new: true }
        );
        return done(null, user!);
      } catch (err) {
        return done(err as Error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, String((user as IUser)._id));
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});
