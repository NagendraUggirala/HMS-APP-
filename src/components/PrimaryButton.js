import { Text, TouchableOpacity } from "react-native";

export default function PrimaryButton({
  title,
  onPress,
  variant = "primary",
  disabled = false,
}) {
  const buttonClasses =
    variant === "secondary"
      ? "bg-white border border-surface-300"
      : variant === "ghost"
        ? "bg-brand-100 border border-brand-200"
        : "bg-brand-500";

  const textClasses =
    variant === "primary" ? "text-white" : "text-brand-700";

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      className={`rounded-2xl px-4 py-4 ${buttonClasses} ${
        disabled ? "opacity-50" : ""
      }`}
      onPress={onPress}
      disabled={disabled}
    >
      <Text className={`text-center text-base font-semibold ${textClasses}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}
