import { useState } from "react";
import {
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";

const roleOptions = [
  { label: "Hospital Admin", value: "hospital_admin" },
  { label: "Doctor", value: "doctor" },
  { label: "Nurse", value: "nurse" },
  { label: "Lab Technician", value: "lab_tech" },
  { label: "Receptionist", value: "receptionist" },
  { label: "Pharmacist", value: "pharmacist" },
];

const routeByRole = {
  hospital_admin: "HospitalAdminDashboard",
  doctor: "DoctorDashboard",
  nurse: "NurseDashboard",
  lab_tech: "LabTechnicianDashboard",
  receptionist: "ReceptionistDashboard",
  pharmacist: "PharmacyDashboard",
};

export default function LoginScreen({ navigation }) {
  const { login } = useAppContext();
  const [selectedRole, setSelectedRole] = useState("hospital_admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [remember, setRemember] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsRoleMenuOpen(false);
  };

  const handleLogin = async () => {
    setIsLoading(true);
    const result = await login({
      expectedRole: selectedRole,
      email: email.trim(),
      password,
    });
    setIsLoading(false);

    if (!result.success) {
      Alert.alert("Login failed", result.message);
      return;
    }

    navigation.replace(routeByRole[result.user.role] || "HospitalAdminDashboard");
  };

  return (
    <ScrollView className="flex-1 bg-[#f7f9fb] px-6">
      <View className="mb-10 mt-40 items-center">
        <Text className="text-3xl font-bold text-[#00685f]">
          Clinical Curator
        </Text>
        <Text className="mt-2 text-center text-gray-500">
          Precision Healthcare Access
        </Text>
      </View>

      <View className="rounded-2xl bg-white p-6 shadow-sm">
        <Text className="mb-2 text-xs text-gray-400">Access Portal</Text>

        <TouchableOpacity
          className="mb-2 flex-row items-center justify-between rounded-full bg-gray-100 px-4 py-3"
          onPress={() => setIsRoleMenuOpen((currentState) => !currentState)}
          activeOpacity={0.85}
        >
          <Text>
            {roleOptions.find((option) => option.value === selectedRole)?.label}
          </Text>
          <MaterialIcons name="keyboard-arrow-down" size={20} />
        </TouchableOpacity>

        {isRoleMenuOpen ? (
          <View className="mb-4 rounded-2xl border border-gray-200 bg-white">
            {roleOptions.map((option) => (
              <TouchableOpacity
                key={option.value}
                className="border-b border-gray-100 px-4 py-3"
                onPress={() => handleRoleSelect(option.value)}
              >
                <Text>{option.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View className="mb-4" />
        )}

        <Text className="mb-2 text-xs text-gray-400">Institutional ID</Text>
        <View className="mb-4 h-14 flex-row items-center rounded-full bg-gray-100 px-4">
          <MaterialIcons name="email" size={20} color="#007bff" />
          <TextInput
            placeholder="Email or Mobile"
            className="ml-3 flex-1"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text className="mb-2 text-xs text-gray-400">Security Key</Text>
        <View className="mb-4 h-14 flex-row items-center rounded-full bg-gray-100 px-4">
          <MaterialIcons name="lock" size={20} color="#007bff" />
          <TextInput
            placeholder="Password"
            secureTextEntry={!isPasswordVisible}
            className="ml-3 flex-1"
            value={password}
            onChangeText={setPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setIsPasswordVisible((currentState) => !currentState)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={isPasswordVisible ? "visibility-off" : "visibility"}
              size={20}
              color="gray"
            />
          </TouchableOpacity>
        </View>

        <View className="mb-6 flex-row items-center justify-between">
          <Text>Remember me</Text>
          <Switch value={remember} onValueChange={setRemember} />
        </View>

        <TouchableOpacity
          className="h-14 flex-row items-center justify-center rounded-full bg-[#00685f]"
          onPress={handleLogin}
          activeOpacity={0.9}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="mr-2 text-lg font-bold text-white">
                Sign In
              </Text>
              <MaterialIcons name="arrow-forward" size={20} color="white" />
            </>
          )}
        </TouchableOpacity>

        <View className="mt-6 items-center">
          <Text className="text-sm text-gray-500">New user?</Text>
          <Text className="mt-2 font-bold text-[#00685f]">
            Request Credentials
          </Text>
          <Text className="mt-4 text-xs text-gray-500">
            Use backend credentials from PostgreSQL (manual insert)
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
