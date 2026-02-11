const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.BACKEND_URL || "http://localhost:5000"}/api/auth/google/callback`,
        proxy: true
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          // 1. Check if user already exists with this googleId
          let user = await User.findOne({ googleId: profile.id });
          
          if (user) {
            return done(null, user);
          }
    
          // 2. Check if user exists with this email but no googleId
          const email = profile.emails[0].value;
          user = await User.findOne({ email });
    
          if (user) {
            // Link google account to existing email account
            user.googleId = profile.id;
            user.avatar = profile.photos[0].value;
            await user.save();
            return done(null, user);
          }
    
          // 3. Create new user
          user = await User.create({
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            avatar: profile.photos[0].value
          });
    
          done(null, user);
        } catch (err) {
          done(err, null);
        }
      }
    ));
} else {
    console.warn('⚠️ Google OAuth credentials missing (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET). Google Login will be disabled.');
}

// Not using sessions as we use JWT
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
