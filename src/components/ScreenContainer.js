import { ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ScreenContainer({ children, scroll = true }) {
  const content = scroll ? (
    <ScrollView
      className="flex-1 bg-brand-900"
      contentContainerStyle={{ padding: 20, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1 bg-brand-900 px-5 py-5">{children}</View>
  );

  return <SafeAreaView className="flex-1 bg-brand-900">{content}</SafeAreaView>;
}
