import RoleHomeTemplate from "../components/RoleHomeTemplate";
import { useAppContext } from "../context/AppContext";

export default function NurseHomeScreen({ navigation }) {
  const { currentHospital, getPatientsByHospital } = useAppContext();
  const patients = currentHospital ? getPatientsByHospital(currentHospital.id) : [];

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Nurse Workspace"
      title="Nurse home"
      subtitle="Shift tasks, rounds, and patient care alerts can be connected here in the next phase."
      stats={[
        {
          label: "Assigned",
          value: patients.length,
          accent: "bg-amber-500",
        },
        {
          label: "Shifts",
          value: "2",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
