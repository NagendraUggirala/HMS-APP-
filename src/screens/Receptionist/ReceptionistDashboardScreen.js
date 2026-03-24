import RoleHomeTemplate from "../../components/RoleHomeTemplate";
import { useAppContext } from "../../context/AppContext";

export default function ReceptionistDashboardScreen({ navigation }) {
  const { currentHospital, getPatientsByHospital } = useAppContext();
  const patients = currentHospital ? getPatientsByHospital(currentHospital.id) : [];

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Front Desk"
      title="Receptionist dashboard"
      subtitle="Handle check-ins, appointment desk flow, and patient communication."
      stats={[
        {
          label: "Check-ins",
          value: patients.length,
          accent: "bg-cyan-500",
        },
        {
          label: "Queue",
          value: currentHospital ? "5" : "0",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
