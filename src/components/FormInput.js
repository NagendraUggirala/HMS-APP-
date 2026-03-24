import { Text, TextInput, View } from "react-native";

export default function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType = "default",
  secureTextEntry = false,
  autoCapitalize = "sentences",
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-ink-700">{label}</Text>
      <TextInput
        className="rounded-2xl border border-surface-300 bg-white px-4 py-4 text-base text-ink-900"
        placeholder={placeholder}
        placeholderTextColor="#9b90ad"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}
