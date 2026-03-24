import RoleHomeTemplate from "../../components/RoleHomeTemplate";
import { useAppContext } from "../../context/AppContext";

export default function DoctorDashboardScreen({ navigation }) {
  const { currentHospital, getPatientsByHospital } = useAppContext();
  const patients = currentHospital ? getPatientsByHospital(currentHospital.id) : [];

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Doctor Workspace"
      title="Doctor dashboard"
      subtitle="Track consultations, assigned caseload, and daily rounds in one role panel."
      stats={[
        {
          label: "Patients",
          value: patients.length,
          accent: "bg-emerald-500",
        },
        {
          label: "Rounds",
          value: currentHospital ? "3" : "0",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
