import express from "express";
import { connectDB } from "./db/connectDB.js";
import authRoutes from "./routes/auth.route.js";
import cookieParser from 'cookie-parser';
import taskRoutes from './routes/task.route.js';
import solutionRoutes from './routes/solution.route.js';
import classesRoutes from './routes/classroom.route.js';
import friendListRoutes from './routes/friendlist.route.js';
import notificationRoutes from './routes/notification.route.js';
import leaderboardRoutes from './routes/leaderboard.route.js';
import imageRoutes from './routes/image.route.js';
import badgeRoutes from './routes/badge.route.js';
import ssoRoutes from './routes/sso.route.js';
import { getDocsStructure, getDocContent } from './controllers/docsFetcher.controller.js';
import cors from "cors";
import path from "path";

// SSO OpenID Configuration
import passport from 'passport';
import { Strategy as OpenIDConnectStrategy } from 'passport-openidconnect';

// SSO Passport Strategy
passport.use(new OpenIDConnectStrategy({
  issuer: 'https://sso2.kpi.fei.tuke.sk/realms/testing',
  authorizationURL: 'https://sso2.kpi.fei.tuke.sk/realms/testing/protocol/openid-connect/auth',
  tokenURL: 'https://sso2.kpi.fei.tuke.sk/realms/testing/protocol/openid-connect/token',
  userInfoURL: 'https://sso2.kpi.fei.tuke.sk/realms/testing/protocol/openid-connect/userinfo',
  clientID: 'testing',
  clientSecret: 's49Y8cHbGA9aYj9c15lxMJIOcuU9wzfr',
  callbackURL: 'http://localhost:5000/api/auth/sso/callback',
  scope: ['openid', 'profile', 'email']
}, (issuer, sub, profile, jwtClaims, accessToken, refreshToken, done) => {
  return done(null, { 
      profile, 
      accessToken, 
      refreshToken, 
      jwtClaims 
  });
}));


// Serialization & Deserialization
passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

const app = express();

// Enable CORS with credentials
app.use(cors({
    origin: 'http://localhost:3000', // Allow requests from the frontend
    credentials: true, // Allow sending cookies and credentials
}));

// Add session middleware
import session from 'express-session';
app.use(session({
    secret: 's49Y8cHbGA9aYj9c15lxMJIOcuU9wzfr', // Use a secure, unique secret
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Change this to true if you're using HTTPS
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Middleware setup
app.use(express.json());
app.use(cookieParser());

// Authentication Routes
app.use("/api/auth", authRoutes);

// Application routes
app.use("/api/taskHandler", taskRoutes);
app.use('/api/solutionHandler', solutionRoutes);
app.use('/api/classroom', classesRoutes);
app.use('/api/friendList', friendListRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/image', imageRoutes);
app.use('/api/badgeHandler', badgeRoutes);
app.use('/api/auth/sso', ssoRoutes);

// Static file route for uploaded images
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Documentation Routes
app.get('/api/docs/structure', getDocsStructure);
app.get('/api/docs/*', getDocContent);


// Start the server
app.listen(5000, () => {
    connectDB();
    console.log("Server running on http://localhost:5000");
});
