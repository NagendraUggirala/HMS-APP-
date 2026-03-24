import RoleHomeTemplate from "../../components/RoleHomeTemplate";
import { useAppContext } from "../../context/AppContext";

export default function PharmacyDashboardScreen({ navigation }) {
  const { currentHospital, getPatientsByHospital } = useAppContext();
  const patients = currentHospital ? getPatientsByHospital(currentHospital.id) : [];

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Pharmacy Desk"
      title="Pharmacy dashboard"
      subtitle="Coordinate prescriptions, medicine dispatch, and refill task tracking."
      stats={[
        {
          label: "Orders",
          value: patients.length,
          accent: "bg-indigo-500",
        },
        {
          label: "Refills",
          value: currentHospital ? "7" : "0",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
