import RoleHomeTemplate from "../components/RoleHomeTemplate";
import { useAppContext } from "../context/AppContext";

export default function DoctorHomeScreen({ navigation }) {
  const { currentHospital, getPatientsByHospital } = useAppContext();
  const patients = currentHospital ? getPatientsByHospital(currentHospital.id) : [];

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Doctor Workspace"
      title="Doctor home"
      subtitle="Review consultations, inpatient activity, and schedule widgets in the next phase."
      stats={[
        {
          label: "Patients",
          value: patients.length,
          accent: "bg-emerald-500",
        },
        {
          label: "Ward",
          value: currentHospital ? "1" : "0",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
