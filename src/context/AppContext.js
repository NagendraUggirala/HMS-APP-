import { createContext, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from "../services/api";
import {
  adminConfigSections,
  initialAdmins,
  initialDoctors,
  initialHospitals,
  initialNurses,
  initialNotifications,
  initialPatients,
  mockUsers,
} from "../data/mockData";

const AppContext = createContext(null);
const BACKEND_ROLE_TO_APP_ROLE = {
 
  HOSPITAL_ADMIN: "hospital_admin",
  DOCTOR: "doctor",
  NURSE: "nurse",
  LAB_TECH: "lab_tech",
  RECEPTIONIST: "receptionist",
  PHARMACIST: "pharmacist",
};

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [authUsers, setAuthUsers] = useState(mockUsers);
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [admins, setAdmins] = useState(initialAdmins);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [nurses, setNurses] = useState(initialNurses);
  const [patients, setPatients] = useState(initialPatients);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isInitializing, setIsInitializing] = useState(true);

  // Load persisted auth data on mount
  useEffect(() => {
    async function loadStoredAuth() {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const storedUser = await AsyncStorage.getItem('currentUser');
        
        if (storedToken && storedUser) {
          setAuthToken(storedToken);
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error loading stored auth:", error);
      } finally {
        // Add a small delay for a smoother splash experience if needed
        setTimeout(() => setIsInitializing(false), 1500);
      }
    }
    loadStoredAuth();
  }, []);

  // Set up global 401 handler
  useEffect(() => {
    api.setUnauthorizedCallback(() => {
      console.warn("[AppContext] Unauthorized access detected, logging out...");
      logout();
    });
  }, []);

  const login = async ({ expectedRole, email, password }) => {
    try {
      const authData = await api.adminStaffLogin(email, password);
      console.log("[AppContext:Login] AuthData result successfully received.");
      const backendRoles = authData?.user?.roles || [];
      const primaryBackendRole = backendRoles[0];
      
      // Robust mapping: handle potentially different casing or unexpected variations
      const normalizedRole = primaryBackendRole?.toString().toUpperCase();
      const appRole = BACKEND_ROLE_TO_APP_ROLE[normalizedRole] || BACKEND_ROLE_TO_APP_ROLE[primaryBackendRole];
      
      console.log(`[AppContext:Login] BackendRole: ${primaryBackendRole}, AppRole: ${appRole}`);

      if (!appRole) {
        return {
          success: false,
          message: "This account role is not supported in the mobile app yet.",
        };
      }

      if (expectedRole && appRole !== expectedRole) {
        console.warn(`[AppContext:Login] Role mismatch: ${appRole} vs expected ${expectedRole}`);
        return {
          success: false,
          message: `Selected role does not match account role (${appRole}).`,
        };
      }

      const user = {
        id: authData?.user?.id,
        role: appRole,
        name: `${authData?.user?.first_name || ""} ${authData?.user?.last_name || ""}`.trim(),
        email: authData?.user?.email || email,
        hospitalId: authData?.user?.hospital_id || null,
        backendRoles,
      };

      setAuthToken(authData?.access_token || null);
      setCurrentUser(user);

      // Persist to storage
      if (authData?.access_token) {
        await AsyncStorage.setItem('authToken', authData.access_token);
        await AsyncStorage.setItem('currentUser', JSON.stringify(user));
      }

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        message: error?.message || "Login failed. Please check credentials.",
      };
    }
  };

  const logout = async () => {
    try {
      setAuthToken(null);
      setCurrentUser(null);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('currentUser');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const addHospital = (hospital) => {
    const newHospital = {
      id: createId("hospital"),
      status: "active",
      adminIds: [],
      branding: `${hospital.name} Care`,
      lastAudit: "Just now",
      ...hospital,
    };

    setHospitals((currentHospitals) => [newHospital, ...currentHospitals]);
    return newHospital;
  };

  const addAdmin = (admin) => {
    const newAdmin = {
      id: createId("admin"),
      ...admin,
    };

    setAdmins((currentAdmins) => [newAdmin, ...currentAdmins]);
    setAuthUsers((currentAuthUsers) => [
      ...currentAuthUsers,
      {
        id: createId("admin-user"),
        role: "admin",
        name: admin.name,
        email: admin.email,
        password: "123456",
        hospitalId: admin.hospitalId,
      },
    ]);
    setHospitals((currentHospitals) =>
      currentHospitals.map((hospital) =>
        hospital.id === admin.hospitalId
          ? {
              ...hospital,
              adminIds: [...(hospital.adminIds || []), newAdmin.id],
            }
          : hospital
      )
    );

    return newAdmin;
  };

  const addDoctor = (doctor) => {
    const newDoctor = {
      id: createId("doctor"),
      ...doctor,
    };

    setDoctors((currentDoctors) => [newDoctor, ...currentDoctors]);
    setAuthUsers((currentAuthUsers) => [
      ...currentAuthUsers,
      {
        id: createId("doctor-user"),
        role: "doctor",
        name: doctor.name,
        email: doctor.email,
        password: "123456",
        hospitalId: doctor.hospitalId,
      },
    ]);
    return newDoctor;
  };

  const addNurse = (nurse) => {
    const newNurse = {
      id: createId("nurse"),
      ...nurse,
    };

    setNurses((currentNurses) => [newNurse, ...currentNurses]);
    setAuthUsers((currentAuthUsers) => [
      ...currentAuthUsers,
      {
        id: createId("nurse-user"),
        role: "nurse",
        name: nurse.name,
        email: nurse.email,
        password: "123456",
        hospitalId: nurse.hospitalId,
      },
    ]);
    return newNurse;
  };

  const addPatient = (patient) => {
    const newPatient = {
      id: createId("patient"),
      ...patient,
    };

    setPatients((currentPatients) => [newPatient, ...currentPatients]);
    setAuthUsers((currentAuthUsers) => [
      ...currentAuthUsers,
      {
        id: createId("patient-user"),
        role: "patient",
        name: patient.name,
        email: patient.email,
        password: "123456",
        hospitalId: patient.hospitalId,
      },
    ]);
    return newPatient;
  };

  const toggleHospitalStatus = (hospitalId) => {
    setHospitals((currentHospitals) =>
      currentHospitals.map((hospital) =>
        hospital.id === hospitalId
          ? {
              ...hospital,
              status: hospital.status === "active" ? "inactive" : "active",
            }
          : hospital
      )
    );
  };

  const getHospitalById = (hospitalId) =>
    hospitals.find((hospital) => hospital.id === hospitalId);

  const getAdminsByHospital = (hospitalId) =>
    admins.filter((admin) => admin.hospitalId === hospitalId);

  const getDoctorsByHospital = (hospitalId) =>
    doctors.filter((doctor) => doctor.hospitalId === hospitalId);

  const getNursesByHospital = (hospitalId) =>
    nurses.filter((nurse) => nurse.hospitalId === hospitalId);

  const getPatientsByHospital = (hospitalId) =>
    patients.filter((patient) => patient.hospitalId === hospitalId);

  const getNotificationsForRole = (role, hospitalId) =>
    notifications.filter(
      (notification) =>
        notification.role === role &&
        (!notification.hospitalId || notification.hospitalId === hospitalId)
    );

  const getEmployeeCountByHospital = (hospitalId) =>
    getAdminsByHospital(hospitalId).length +
    getDoctorsByHospital(hospitalId).length +
    getNursesByHospital(hospitalId).length;

  const activeHospitalsCount = hospitals.filter(
    (hospital) => hospital.status === "active"
  ).length;
  const inactiveHospitalsCount = hospitals.length - activeHospitalsCount;
  const currentHospital = currentUser?.hospitalId
    ? getHospitalById(currentUser.hospitalId)
    : null;

  const value = useMemo(
    () => ({
      currentUser,
      currentRole: currentUser?.role || null,
      authToken,
      hospitals,
      admins,
      doctors,
      nurses,
      patients,
      notifications,
      adminConfigSections,
      authUsers,
      isInitializing,
      login,
      logout,
      addHospital,
      addAdmin,
      addDoctor,
      addNurse,
      addPatient,
      toggleHospitalStatus,
      getHospitalById,
      getAdminsByHospital,
      getDoctorsByHospital,
      getNursesByHospital,
      getPatientsByHospital,
      getNotificationsForRole,
      getEmployeeCountByHospital,
      activeHospitalsCount,
      inactiveHospitalsCount,
      currentHospital,
    }),
    [
      activeHospitalsCount,
      authToken,
      admins,
      currentHospital,
      currentUser,
      doctors,
      hospitals,
      nurses,
      notifications,
      authUsers,
      patients,
      isInitializing,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }

  return context;
}
