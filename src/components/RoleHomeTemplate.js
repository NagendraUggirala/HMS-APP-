import { Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import PrimaryButton from "./PrimaryButton";
import ScreenContainer from "./ScreenContainer";
import SectionCard from "./SectionCard";
import StatsCard from "./StatsCard";

export default function RoleHomeTemplate({
  navigation,
  title,
  roleLabel,
  subtitle,
  stats,
}) {
  const { currentUser, currentHospital, logout } = useAppContext();

  return (
    <ScreenContainer>
      <View className="rounded-[28px] border border-surface-300 bg-surface-50 p-5">
        <Text className="text-sm font-semibold uppercase tracking-[2px] text-brand-700">
          {roleLabel}
        </Text>
        <Text className="mt-3 text-3xl font-bold text-ink-900">{title}</Text>
        <Text className="mt-2 text-sm leading-6 text-ink-500">{subtitle}</Text>
        <Text className="mt-4 text-sm text-ink-500">
          Signed in as {currentUser?.name || "Mock User"}
          {currentHospital ? ` • ${currentHospital.name}` : ""}
        </Text>
      </View>

      <View className="mt-6 flex-row">
        {stats.map((stat) => (
          <StatsCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            accent={stat.accent}
            helperText={stat.helperText}
          />
        ))}
      </View>

      <SectionCard
        title="Coming Soon"
        subtitle="This role home is a styled placeholder for the next phase of HMS screens."
        rightLabel="Mock"
      >
        <Text className="text-sm leading-6 text-ink-500">
          Navigation, daily tasks, appointments, and role-specific workflows can be
          connected here once the backend and role modules are ready.
        </Text>
      </SectionCard>

      <PrimaryButton
        title="Back To Login"
        variant="secondary"
        onPress={() => {
          logout();
          navigation.replace("Login");
        }}
      />
    </ScreenContainer>
  );
}
