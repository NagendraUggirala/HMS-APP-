import { Text, View } from "react-native";

export default function StaffCard({ name, roleLabel, specialtyOrDepartment, email, phone }) {
  return (
    <View className="mb-3 rounded-3xl border border-surface-300 bg-white p-4">
      <View className="flex-row items-center justify-between">
        <Text className="flex-1 text-base font-bold text-ink-900">{name}</Text>
        <View className="ml-3 rounded-full bg-brand-100 px-3 py-1">
          <Text className="text-xs font-semibold uppercase text-brand-700">
            {roleLabel}
          </Text>
        </View>
      </View>
      <Text className="mt-2 text-sm text-ink-700">{specialtyOrDepartment}</Text>
      <Text className="mt-2 text-sm text-ink-500">{email}</Text>
      <Text className="mt-1 text-sm text-ink-500">{phone}</Text>
    </View>
  );
}
