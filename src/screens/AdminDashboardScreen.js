import { Text, View } from "react-native";
import NotificationCard from "../components/NotificationCard";
import PrimaryButton from "../components/PrimaryButton";
import QuickActionCard from "../components/QuickActionCard";
import ScreenContainer from "../components/ScreenContainer";
import SectionCard from "../components/SectionCard";
import StatsCard from "../components/StatsCard";
import { useAppContext } from "../context/AppContext";

export default function AdminDashboardScreen({ navigation }) {
  const {
    adminConfigSections,
    currentHospital,
    currentUser,
    getDoctorsByHospital,
    getEmployeeCountByHospital,
    getNotificationsForRole,
    getNursesByHospital,
    getPatientsByHospital,
    logout,
  } = useAppContext();

  const hospitalId = currentUser?.hospitalId;
  const doctors = hospitalId ? getDoctorsByHospital(hospitalId) : [];
  const nurses = hospitalId ? getNursesByHospital(hospitalId) : [];
  const patients = hospitalId ? getPatientsByHospital(hospitalId) : [];
  const employeeCount = hospitalId ? getEmployeeCountByHospital(hospitalId) : 0;
  const notifications = getNotificationsForRole("admin", hospitalId);

  return (
    <ScreenContainer>
      <View className="rounded-[32px] border border-surface-300 bg-surface-50 p-6">
        <Text className="text-sm font-semibold uppercase tracking-[3px] text-brand-700">
          Hello
        </Text>
        <Text className="mt-2 text-3xl font-bold text-ink-900">
          {currentUser?.name || "Hospital Admin"}
        </Text>
        <Text className="mt-2 text-sm leading-6 text-ink-500">
          Manage staff, patients, and configuration modules for{" "}
          {currentHospital?.name || "your hospital"}.
        </Text>
      </View>

      <View className="mt-6 flex-row">
        <StatsCard label="Doctors" value={doctors.length} accent="bg-emerald-500" />
        <StatsCard label="Nurses" value={nurses.length} accent="bg-amber-500" />
      </View>
      <View className="mt-3 flex-row">
        <StatsCard label="Patients" value={patients.length} accent="bg-violet-500" />
        <StatsCard
          label="Employees"
          value={employeeCount}
          accent="bg-brand-500"
          helperText="Admins + care staff"
        />
      </View>

      <SectionCard
        title="Quick Actions"
        subtitle="Create staff and patient accounts for the selected hospital."
        rightLabel={currentHospital?.status || "active"}
      >
        <QuickActionCard
          title="Create Doctor"
          subtitle="Add a doctor profile and prepare a login account."
          badge="Staff"
          onPress={() =>
            navigation.navigate("CreateDoctor", {
              hospitalId,
              returnTo: "AdminDashboard",
            })
          }
        />
        <QuickActionCard
          title="Create Nurse"
          subtitle="Register a nurse and connect them to hospital operations."
          badge="Staff"
          onPress={() =>
            navigation.navigate("CreateNurse", {
              hospitalId,
              returnTo: "AdminDashboard",
            })
          }
        />
        <QuickActionCard
          title="Create Patient"
          subtitle="Add a patient record for the care and appointment flow."
          badge="Patient"
          onPress={() =>
            navigation.navigate("CreatePatient", {
              hospitalId,
              returnTo: "AdminDashboard",
            })
          }
        />
        <PrimaryButton
          title="Open Hospital View"
          variant="secondary"
          onPress={() => navigation.navigate("HospitalDashboard", { hospitalId })}
        />
      </SectionCard>

      <SectionCard
        title="Notifications"
        subtitle="Operational alerts and summaries for the admin panel."
        rightLabel={`${notifications.length} items`}
      >
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            title={notification.title}
            message={notification.message}
          />
        ))}
      </SectionCard>

      <SectionCard
        title="Admin Configuration Panel"
        subtitle="Mobile versions of branding, content, master data, and analytics modules."
        rightLabel="2.2.4"
      >
        {adminConfigSections.map((section) => (
          <QuickActionCard
            key={section.id}
            title={section.title}
            subtitle={`${section.description} ${section.items}`}
            badge="Mock"
          />
        ))}
      </SectionCard>

      <PrimaryButton
        title="Logout"
        variant="ghost"
        onPress={() => {
          logout();
          navigation.replace("Login");
        }}
      />
    </ScreenContainer>
  );
}
