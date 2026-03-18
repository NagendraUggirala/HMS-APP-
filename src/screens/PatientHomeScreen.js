import RoleHomeTemplate from "../components/RoleHomeTemplate";
import { useAppContext } from "../context/AppContext";

export default function PatientHomeScreen({ navigation }) {
  const { currentHospital } = useAppContext();

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Patient Portal"
      title="Patient home"
      subtitle="Appointments, reports, prescriptions, and billing cards can appear here next."
      stats={[
        {
          label: "Visits",
          value: "3",
          accent: "bg-violet-500",
        },
        {
          label: "Hospital",
          value: currentHospital ? "1" : "0",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
