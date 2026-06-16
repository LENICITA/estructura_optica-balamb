// config/passport.js

const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const passport = require('passport');
const Keys = require('./keys');
const Usuario = require('../models/usuario');

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: Keys.secretOrKey
};

passport.use(new JwtStrategy(opts, (jwt_payload, done) => {
  Usuario.findById(jwt_payload.id_usuario, (err, usuario) => {
    if (err) {
      return done(err, false);
    }
    if (usuario) {
      return done(null, usuario);
    }
    else{
      return done(null, false);
    }
  });
}));

module.exports = passport;