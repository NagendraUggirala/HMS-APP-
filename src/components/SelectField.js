import { Text, TouchableOpacity, View } from "react-native";

export default function SelectField({
  label,
  value,
  placeholder,
  options,
  isOpen,
  onToggle,
  onSelect,
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-sm font-semibold text-ink-700">{label}</Text>
      <TouchableOpacity
        activeOpacity={0.88}
        className="rounded-2xl border border-surface-300 bg-white px-4 py-4"
        onPress={onToggle}
      >
        <View className="flex-row items-center justify-between">
          <Text className={`${value ? "text-ink-900" : "text-ink-500"}`}>
            {value || placeholder}
          </Text>
          <Text className="text-xs font-semibold uppercase text-brand-700">
            {isOpen ? "Close" : "Open"}
          </Text>
        </View>
      </TouchableOpacity>

      {isOpen ? (
        <View className="mt-3 rounded-2xl border border-surface-300 bg-surface-50 px-3 py-2">
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              activeOpacity={0.85}
              className="rounded-2xl px-3 py-3"
              onPress={() => onSelect(option.value)}
            >
              <Text className="text-sm font-semibold text-ink-900">{option.label}</Text>
              {option.helperText ? (
                <Text className="mt-1 text-xs text-ink-500">{option.helperText}</Text>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      ) : null}
    </View>
  );
}
