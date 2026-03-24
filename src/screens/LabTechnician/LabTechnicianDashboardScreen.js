import RoleHomeTemplate from "../../components/RoleHomeTemplate";
import { useAppContext } from "../../context/AppContext";

export default function LabTechnicianDashboardScreen({ navigation }) {
  const { currentHospital, getPatientsByHospital } = useAppContext();
  const patients = currentHospital ? getPatientsByHospital(currentHospital.id) : [];

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Laboratory"
      title="Lab technician dashboard"
      subtitle="Review pending investigations, sample queues, and completed reports."
      stats={[
        {
          label: "Queued",
          value: patients.length,
          accent: "bg-violet-500",
        },
        {
          label: "Reports",
          value: currentHospital ? "6" : "0",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
