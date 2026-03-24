import { useEffect } from "react";
import { Text, View } from "react-native";
import ScreenContainer from "../components/ScreenContainer";

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace("Login");
    }, 3000);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <ScreenContainer scroll={false}>
      <View className="flex-1 items-center justify-center">
        <View className="absolute left-6 top-16 h-20 w-20 rounded-full bg-[#f9e7a8]/50" />
        <View className="absolute right-10 top-32 h-14 w-14 rounded-full bg-[#cfe5ff]/70" />
        <View className="absolute bottom-28 left-10 h-16 w-16 rounded-full bg-[#f6d7e8]/60" />

        <View className="w-full items-center rounded-[34px] border border-surface-300 bg-surface-50 px-6 py-10">
          <View className="mb-8 h-56 w-full items-center justify-center rounded-[32px] bg-brand-100">
            <View className="absolute left-10 top-8 h-4 w-4 rounded-full bg-[#7ed3f6]" />
            <View className="absolute right-12 top-10 h-3 w-3 rounded-full bg-[#f9a8d4]" />
            <View className="absolute bottom-10 left-12 h-5 w-5 rounded-full bg-[#fde68a]" />
            <View className="absolute right-16 bottom-12 h-4 w-4 rounded-full bg-[#c4b5fd]" />
            <Text className="text-7xl">🏥</Text>
            <Text className="mt-4 text-base text-ink-500">Care starts here</Text>
          </View>

          <Text className="text-center text-sm font-semibold uppercase tracking-[3px] text-brand-700">
            HMS Mobile
          </Text>
          <Text className="mt-4 text-center text-4xl font-bold text-ink-900">
            Hospital Management System
          </Text>
          <Text className="mt-4 text-center text-sm leading-6 text-ink-500">
            Smart access for superadmin, admin, doctor, nurse, and patient roles.
          </Text>
          <View className="mt-8 rounded-3xl bg-brand-500 px-5 py-4">
            <Text className="text-center text-base font-semibold text-white">
              Launching secure workspace...
            </Text>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
