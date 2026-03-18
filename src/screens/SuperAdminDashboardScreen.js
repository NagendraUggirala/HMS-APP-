import { Text, View } from "react-native";
import HospitalCard from "../components/HospitalCard";
import NotificationCard from "../components/NotificationCard";
import PrimaryButton from "../components/PrimaryButton";
import QuickActionCard from "../components/QuickActionCard";
import ScreenContainer from "../components/ScreenContainer";
import SectionCard from "../components/SectionCard";
import StatsCard from "../components/StatsCard";
import { useAppContext } from "../context/AppContext";

export default function SuperAdminDashboardScreen({ navigation }) {
  const {
    activeHospitalsCount,
    currentUser,
    getAdminsByHospital,
    getDoctorsByHospital,
    getNotificationsForRole,
    getNursesByHospital,
    getPatientsByHospital,
    hospitals,
    inactiveHospitalsCount,
    logout,
  } = useAppContext();

  const notifications = getNotificationsForRole("superadmin");

  return (
    <ScreenContainer>
      <View className="rounded-[32px] border border-surface-300 bg-surface-50 p-6">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-brand-700">
          HMS Control Center
        </Text>
        <Text className="mt-3 text-3xl font-bold text-ink-900">
          Hello {currentUser?.name || "Superadmin"}
        </Text>
        <Text className="mt-3 text-sm leading-6 text-ink-500">
          Monitor hospitals, create admins, review notifications, and keep the HMS
          network active from one mobile dashboard.
        </Text>
      </View>

      <View className="mt-6 flex-row">
        <StatsCard label="Hospitals" value={hospitals.length} helperText="Total" />
        <StatsCard
          label="Active"
          value={activeHospitalsCount}
          accent="bg-emerald-500"
        />
      </View>
      <View className="mt-3 flex-row">
        <StatsCard
          label="Inactive"
          value={inactiveHospitalsCount}
          accent="bg-rose-500"
        />
        <StatsCard
          label="Alerts"
          value={notifications.length}
          accent="bg-amber-500"
        />
      </View>

      <SectionCard
        title="Quick Actions"
        subtitle="Create new hospitals and assign admins for onboarding."
        rightLabel="Control"
      >
        <QuickActionCard
          title="Create New Hospital"
          subtitle="Register a hospital and open its dashboard immediately."
          badge="Hospital"
          onPress={() =>
            navigation.navigate("CreateHospital", {
              returnTo: "SuperAdminDashboard",
            })
          }
        />
        <QuickActionCard
          title="Create Hospital Admin"
          subtitle="Assign a hospital admin and generate a mock login account."
          badge="Admin"
          onPress={() =>
            navigation.navigate("CreateAdmin", {
              returnTo: "SuperAdminDashboard",
            })
          }
        />
      </SectionCard>

      <SectionCard
        title="Notifications"
        subtitle="Recent updates about hospital health and staffing."
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
        title="Hospitals"
        subtitle="Tap any hospital to review status, staff, and operational details."
        rightLabel={`${hospitals.length} listed`}
      >
        {hospitals.map((hospital) => (
          <HospitalCard
            key={hospital.id}
            hospital={hospital}
            adminsCount={getAdminsByHospital(hospital.id).length}
            doctorsCount={getDoctorsByHospital(hospital.id).length}
            nursesCount={getNursesByHospital(hospital.id).length}
            patientsCount={getPatientsByHospital(hospital.id).length}
            onPress={() =>
              navigation.navigate("HospitalDashboard", {
                hospitalId: hospital.id,
              })
            }
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
