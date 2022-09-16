import passport from 'passport';
import passportLocal from 'passport-local';
import { models } from '../models/index.js'

// configure passport for login use
// control will later flow to this strategy, from our login api controller
// so let's just write the algorithm and save in passport
passport.use(new passportLocal.Strategy({
    usernameField: 'email' // from req.body
}, (username, password, done) => {
    models.User.loginUsing(username, password)
        .then(user => {
            if (!user)
                // null means no internal error in the line below,
                // even though login did not succeed
                return done(null, false, { message: 'Incorrect email or password' });
            else
                return done(null, user);
        })
}));