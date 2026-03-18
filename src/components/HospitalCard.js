import { Text, TouchableOpacity, View } from "react-native";

export default function HospitalCard({
  hospital,
  onPress,
  doctorsCount,
  nursesCount,
  patientsCount = 0,
  adminsCount = 0,
}) {
  const isActive = hospital.status === "active";

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      className="mb-4 rounded-3xl border border-surface-300 bg-white p-5"
      onPress={onPress}
    >
      <View className="mb-4 flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-lg font-bold text-ink-900">{hospital.name}</Text>
          <Text className="mt-1 text-sm text-ink-500">{hospital.location}</Text>
        </View>
        <View
          className={`rounded-full px-3 py-1 ${
            isActive ? "bg-emerald-100" : "bg-rose-100"
          }`}
        >
          <Text
            className={`text-xs font-semibold uppercase tracking-wider ${
              isActive ? "text-emerald-700" : "text-rose-700"
            }`}
          >
            {hospital.status}
          </Text>
        </View>
      </View>

      <Text className="text-sm text-ink-700">{hospital.email}</Text>
      <Text className="mt-1 text-sm text-ink-700">{hospital.phone}</Text>

      <View className="mt-4 flex-row flex-wrap">
        <View className="mr-3 rounded-2xl bg-brand-100 px-3 py-2">
          <Text className="text-xs font-semibold text-ink-500">Admins</Text>
          <Text className="mt-1 text-base font-bold text-ink-900">{adminsCount}</Text>
        </View>
        <View className="mr-3 rounded-2xl bg-brand-100 px-3 py-2">
          <Text className="text-xs font-semibold text-ink-500">Doctors</Text>
          <Text className="mt-1 text-base font-bold text-ink-900">{doctorsCount}</Text>
        </View>
        <View className="mr-3 rounded-2xl bg-brand-100 px-3 py-2">
          <Text className="text-xs font-semibold text-ink-500">Nurses</Text>
          <Text className="mt-1 text-base font-bold text-ink-900">{nursesCount}</Text>
        </View>
        <View className="mt-3 rounded-2xl bg-brand-100 px-3 py-2">
          <Text className="text-xs font-semibold text-ink-500">Patients</Text>
          <Text className="mt-1 text-base font-bold text-ink-900">{patientsCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
