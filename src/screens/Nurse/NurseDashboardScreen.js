import RoleHomeTemplate from "../../components/RoleHomeTemplate";
import { useAppContext } from "../../context/AppContext";

export default function NurseDashboardScreen({ navigation }) {
  const { currentHospital, getPatientsByHospital } = useAppContext();
  const patients = currentHospital ? getPatientsByHospital(currentHospital.id) : [];

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Nurse Station"
      title="Nurse dashboard"
      subtitle="Manage shift tasks, care follow-ups, and ward handoff visibility."
      stats={[
        {
          label: "Assigned",
          value: patients.length,
          accent: "bg-amber-500",
        },
        {
          label: "Shifts",
          value: currentHospital ? "2" : "0",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
