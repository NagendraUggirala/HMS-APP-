import { Text, View } from "react-native";

export default function NotificationCard({ title, message }) {
  return (
    <View className="mb-3 rounded-3xl border border-surface-300 bg-white p-4">
      <Text className="text-base font-bold text-ink-900">{title}</Text>
      <Text className="mt-2 text-sm leading-6 text-ink-500">{message}</Text>
    </View>
  );
}
