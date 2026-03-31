const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

const appEnv = process.env.APP_ENV || 'apollo';

// Load .env from project root and from this file's folder (cwd can differ in IDEs / monorepos).
const envName = `.env.${appEnv}`;
const envCandidates = [
  path.resolve(process.cwd(), envName),
  path.join(__dirname, envName),
];
for (const envPath of envCandidates) {
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath, override: true });
    break;
  }
}

/** Production API; ignore stale Windows env pointing at dead ngrok tunnels. */
const DEFAULT_API_BASE_URL = 'https://hospital-backend-9mg3.onrender.com';
function resolveApiBaseUrl() {
  const raw = (process.env.API_BASE_URL || '').trim();
  if (!raw || /ngrok/i.test(raw)) {
    return DEFAULT_API_BASE_URL;
  }
  return raw.replace(/\/+$/, '');
}

module.exports = {
  expo: {
    name: process.env.APP_NAME || 'HMS App',
    slug: process.env.APP_NAME
      ? process.env.APP_NAME.toLowerCase().replace(/\s+/g, '-')
      : 'hms-app',
    version: '1.0.0',
    orientation: 'portrait',
    icon: `./assets/${process.env.LOGO_PATH || 'apollo/logo.png'}`,
    userInterfaceStyle: 'light',
    splash: {
      image: `./assets/${process.env.HOSPITAL_ID || 'apollo'}/splash.png`,
      resizeMode: 'contain',
      backgroundColor: process.env.PRIMARY_COLOR || '#ffffff',
    },
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        backgroundColor: process.env.PRIMARY_COLOR || '#E6F4FE',
        foregroundImage: `./assets/${process.env.LOGO_PATH || 'apollo/logo.png'}`,
      },
    },
    web: {
      favicon: `./assets/${process.env.LOGO_PATH || 'apollo/logo.png'}`,
    },
    extra: {
      HOSPITAL_ID: process.env.HOSPITAL_ID,
      APP_NAME: process.env.APP_NAME,
      PRIMARY_COLOR: process.env.PRIMARY_COLOR,
      SECONDARY_COLOR: process.env.SECONDARY_COLOR,
      LOGO_PATH: process.env.LOGO_PATH,
      API_BASE_URL: resolveApiBaseUrl(),
      FEATURE_APPOINTMENTS: process.env.FEATURE_APPOINTMENTS,
      FEATURE_BILLING: process.env.FEATURE_BILLING,
    },
  },
};
