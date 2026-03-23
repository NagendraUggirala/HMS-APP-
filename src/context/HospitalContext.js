import React, { createContext, useContext } from "react";
import Constants from 'expo-constants';

const HospitalContext = createContext();

export const HospitalProvider = ({ children }) => {
  const extra = Constants.expoConfig?.extra || {};
  const config = {
    hospitalId: extra.HOSPITAL_ID || "apollo",
    hospitalName: extra.APP_NAME || "Apollo Hospitals",
    apiBaseUrl: extra.API_BASE_URL || "https://api.apollo.example.com",
    branding: {
      primaryColor: extra.PRIMARY_COLOR,
      secondaryColor: extra.SECONDARY_COLOR,
      logoPath: extra.LOGO_PATH
    },
    features: {
      appointments: extra.FEATURE_APPOINTMENTS === 'true',
      billing: extra.FEATURE_BILLING === 'true',
    }
  };

  return (
    <HospitalContext.Provider value={config}>
      {children}
    </HospitalContext.Provider>
  );
};

export const useHospital = () => useContext(HospitalContext);
