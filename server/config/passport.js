const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const sendEmail = require('../utils/email');

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

          // 4. Send Welcome Email (Non-blocking)
          sendEmail({
              email: user.email,
              subject: 'Welcome to LeetVision! 🚀 Your Journey Starts Now',
              message: `Hi ${user.name}, welcome to LeetVision! We're excited to help you conquer your DSA preparation.`,
              html: `
                  <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 0; border: 1px solid #e0e0e0; border-radius: 16px; overflow: hidden; background-color: #ffffff;">
                      <div style="background: linear-gradient(135deg, #f57c00 0%, #ff9800 100%); padding: 40px 20px; text-align: center;">
                          <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.5px;">Welcome to LeetVision, ${user.name.split(' ')[0]}!</h1>
                          <p style="color: rgba(255,255,255,0.9); margin-top: 10px; font-size: 16px;">The future of your tech career starts here.</p>
                      </div>
                      
                      <div style="padding: 30px 40px;">
                          <p style="font-size: 16px; color: #444; line-height: 1.6;">
                              We're absolutely thrilled to have you on board! You've just taken a massive step towards mastering data structures and algorithms.
                          </p>
                          
                          <div style="margin: 30px 0; background: #fff8f1; border-radius: 12px; padding: 20px;">
                              <h3 style="color: #e65100; margin-top: 0;">What's next for you?</h3>
                              <ul style="padding-left: 20px; color: #555; line-height: 1.8;">
                                  <li><strong>Explore All Platform Problems</strong>: Access curated problems from LeetCode, HackerRank, and more.</li>
                                  <li><strong>Curated Solutions</strong>: Get high-quality, step-by-step explanations for every problem.</li>
                                  <li><strong>Track Progress</strong>: Connect your LeetCode account to see your growth in real-time.</li>
                              </ul>
                          </div>

                          <div style="text-align: center; margin: 35px 0;">
                              <a href="https://leet-vision.vercel.app" style="background-color: #f57c00; color: white; padding: 14px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block; box-shadow: 0 4px 12px rgba(245, 124, 0, 0.3);">Start Solving Now</a>
                          </div>

                          <p style="font-size: 14px; color: #666; font-style: italic; text-align: center;">
                              "The best way to predict the future is to create it." - Let's build yours together.
                          </p>
                      </div>

                      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
                          <p style="font-size: 12px; color: #999; margin: 0;">
                              © 2026 LeetVision. Built with ❤️ for the Bold.<br>
                              If you have any questions, just hit reply!
                          </p>
                      </div>
                  </div>
              `
          }).catch(err => console.error('Google Welcome email failed:', err));
    
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
