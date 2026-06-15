require('dotenv').config();

const express = require('express');
const cors = require('cors');

const sensorRoutes = require('./routes/sensorRoutes');
const batchRoutes = require('./routes/batchRoutes');
const factoryRoutes = require('./routes/factoryRoutes');
const generalRoutes = require('./routes/generalRoutes');
const fermentationRoutes = require('./routes/fermentationRoutes');

const app = express();
const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : [];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (corsOrigins.length === 0 || corsOrigins.includes('*')) return true;
  if (corsOrigins.includes(origin)) return true;
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
    || /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)
    || /^http:\/\/172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}:\d+$/.test(origin)
    || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin);
}

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin(origin, callback) {
    callback(null, isAllowedOrigin(origin));
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

// ─── Temporary Auth Migration Middleware ──────────────────────────────────────
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    
    // Attempt to temporarily parse the unverified JWT structure
    // NOTE: This is for migration/testing only. Do NOT use in production without
    // actually verifying the token signature with AWS Cognito JWKS.
    try {
      const payloadBase64 = token.split('.')[1];
      if (payloadBase64) {
        const payloadJson = Buffer.from(payloadBase64, 'base64').toString('utf8');
        const payload = JSON.parse(payloadJson);
        
        req.user = {
          cognitoGroups: payload['cognito:groups'] || [],
          username: payload['cognito:username'] || payload['sub'],
          rawToken: payload
        };
        console.log(`[Auth] Parsed test token for user: ${req.user.username}`);
      }
    } catch (err) {
      console.warn('[Auth] Failed to parse Bearer token payload, falling back to mock state.', err.message);
    }
  } else {
    // Graceful degradation: no token provided, continue as mock data layout
    console.log('[Auth] No Bearer token found. Proceeding with unauthenticated/mock layout.');
  }
  
  next();
});

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'SpectraLeaf backend is running',
    data: {
      table: process.env.DYNAMODB_TABLE_NAME || 'FermentationData',
      region: process.env.AWS_REGION || 'us-east-1',
    },
  });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/sensor', sensorRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/factories', factoryRoutes);
app.use('/api/general', generalRoutes);
app.use('/api/fermentation', fermentationRoutes);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[Unhandled error]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

module.exports = app;
