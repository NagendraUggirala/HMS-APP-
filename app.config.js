import 'dotenv/config';
import * as dotenv from 'dotenv';

const appEnv = process.env.APP_ENV || 'apollo';
dotenv.config({ path: `.env.${appEnv}` });

export default {
  expo: {
    name: process.env.APP_NAME || "HMS App",
    slug: process.env.APP_NAME ? process.env.APP_NAME.toLowerCase().replace(/\s+/g, '-') : "hms-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: `./assets/${process.env.LOGO_PATH || 'apollo/logo.png'}`,
    userInterfaceStyle: "light",
    splash: {
      image: `./assets/${process.env.HOSPITAL_ID || 'apollo'}/splash.png`,
      resizeMode: "contain",
      backgroundColor: process.env.PRIMARY_COLOR || "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: process.env.PRIMARY_COLOR || "#E6F4FE",
        foregroundImage: `./assets/${process.env.LOGO_PATH || 'apollo/logo.png'}`,
      }
    },
    web: {
      favicon: `./assets/${process.env.LOGO_PATH || 'apollo/logo.png'}`
    },
    extra: {
      HOSPITAL_ID: process.env.HOSPITAL_ID,
      APP_NAME: process.env.APP_NAME,
      PRIMARY_COLOR: process.env.PRIMARY_COLOR,
      SECONDARY_COLOR: process.env.SECONDARY_COLOR,
      LOGO_PATH: process.env.LOGO_PATH,
      API_BASE_URL: process.env.API_BASE_URL,
      FEATURE_APPOINTMENTS: process.env.FEATURE_APPOINTMENTS,
      FEATURE_BILLING: process.env.FEATURE_BILLING,
    }
  }
};
