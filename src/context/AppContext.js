import { createContext, useContext, useMemo, useState } from "react";
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
const enabledRoles = new Set([
  "superadmin",
  "doctor",
  "nurse",
  "lab_technician",
  "receptionist",
  "billing",
  "pharmacy",
]);

const createId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [authUsers, setAuthUsers] = useState(mockUsers);
  const [hospitals, setHospitals] = useState(initialHospitals);
  const [admins, setAdmins] = useState(initialAdmins);
  const [doctors, setDoctors] = useState(initialDoctors);
  const [nurses, setNurses] = useState(initialNurses);
  const [patients, setPatients] = useState(initialPatients);
  const [notifications, setNotifications] = useState(initialNotifications);

  const login = ({ role, email, password }) => {
    if (!enabledRoles.has(role)) {
      return {
        success: false,
        message: "This role is not enabled in the current mobile flow.",
      };
    }

    const matchedUser = authUsers.find(
      (user) =>
        user.role === role &&
        user.email.toLowerCase() === email.trim().toLowerCase() &&
        user.password === password
    );

    if (!matchedUser) {
      return {
        success: false,
        message: "Use one of the mock login accounts shown on the login screen.",
      };
    }

    setCurrentUser(matchedUser);
    return { success: true, user: matchedUser };
  };

  const logout = () => {
    setCurrentUser(null);
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
      hospitals,
      admins,
      doctors,
      nurses,
      patients,
      notifications,
      adminConfigSections,
      authUsers,
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
      admins,
      currentHospital,
      currentUser,
      doctors,
      hospitals,
      nurses,
      notifications,
      authUsers,
      patients,
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
