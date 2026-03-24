import RoleHomeTemplate from "../../components/RoleHomeTemplate";
import { useAppContext } from "../../context/AppContext";

export default function BillingDashboardScreen({ navigation }) {
  const { currentHospital, getPatientsByHospital } = useAppContext();
  const patients = currentHospital ? getPatientsByHospital(currentHospital.id) : [];

  return (
    <RoleHomeTemplate
      navigation={navigation}
      roleLabel="Billing Center"
      title="Billing dashboard"
      subtitle="Track invoices, settlement status, and payment workload by shift."
      stats={[
        {
          label: "Invoices",
          value: patients.length,
          accent: "bg-rose-500",
        },
        {
          label: "Pending",
          value: currentHospital ? "4" : "0",
          accent: "bg-brand-500",
        },
      ]}
    />
  );
}
