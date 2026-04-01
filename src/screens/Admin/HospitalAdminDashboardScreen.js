import { Text, View } from "react-native";
import NotificationCard from "../../components/NotificationCard";
import PrimaryButton from "../../components/PrimaryButton";
import ScreenContainer from "../../components/ScreenContainer";
import SectionCard from "../../components/SectionCard";
import StatsCard from "../../components/StatsCard";
import { useAppContext } from "../../context/AppContext";

export default function HospitalAdminDashboardScreen({ navigation }) {
  const {
    activeHospitalsCount,
    currentUser,
    getNotificationsForRole,
    hospitals,
    inactiveHospitalsCount,
    logout,
  } = useAppContext();

  const notifications = getNotificationsForRole("superadmin");

  return (
    <ScreenContainer>
      <View className="rounded-[32px] border border-surface-300 bg-surface-50 p-6">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-brand-700">
          Hospital Admin Portal
        </Text>
        <Text className="mt-3 text-3xl font-bold text-ink-900">
          Hello {currentUser?.name || "Hospital Admin"}
        </Text>
        <Text className="mt-3 text-sm leading-6 text-ink-500">
          Monitor hospitals, governance alerts, and tenant health from one place.
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
        title="Network Notifications"
        subtitle="System messages and operational updates."
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
