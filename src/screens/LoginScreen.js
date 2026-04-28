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
  Linking,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";

const roleOptions = [

  { label: "Hospital Admin", value: "hospital_admin", icon: "admin-panel-settings" },
  { label: "Doctor", value: "doctor", icon: "medical-services" },
  { label: "Nurse", value: "nurse", icon: "health-and-safety" },
  { label: "Lab Technician", value: "lab_tech", icon: "biotech" },
  { label: "Receptionist", value: "receptionist", icon: "receipt-long" },
  { label: "Pharmacist", value: "pharmacist", icon: "local-pharmacy" },
];

const DEMO_USERS = [
  { email: 'admin@dcm.demo', password: 'admin123', role: 'hospital_admin', name: 'Admin User' },
  { email: 'doctor@dcm.demo', password: 'doc@1234', role: 'doctor', name: 'Dr. Aparna' },
  { email: 'nurse@dcm.demo', password: 'nurse123', role: 'nurse', name: 'Nurse Staff' },
  { email: 'reception@dcm.demo', password: 'reception123', role: 'receptionist', name: 'Receptionist' },
  { email: 'lab@dcm.demo', password: 'lab123', role: 'lab_tech', name: 'Lab Technician' },
  { email: 'pharmacy@dcm.demo', password: 'pharma123', role: 'pharmacist', name: 'Pharmacy Staff' },
];

const routeByRole = {
  hospital_admin: "DashboardOverview",
  doctor: "DoctorDashboard",
  nurse: "NurseDashboard",
  lab_tech: "LabDashboard",
  receptionist: "ReceptionistDashboard",
  pharmacist: "PharmacyDashboard",
  billing: "BillingDashboard",
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

  const fillDemoCredentials = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    setSelectedRole(user.role);
    setRemember(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({
        expectedRole: selectedRole,
        email: email.trim(),
        password,
      });

      if (!result.success) {
        Alert.alert("Login failed", result.message);
        return;
      }

      const targetRoute = routeByRole[result.user.role];
      console.log(`[LoginScreen] Login success. User role: ${result.user.role}, Navigating to: ${targetRoute || "DashboardOverview"}`);

      if (targetRoute) {
        navigation.replace(targetRoute);
      } else {
        console.warn(`[LoginScreen] No route found for role: ${result.user.role}. Falling back to default.`);
        navigation.replace("DashboardOverview");
      }
    } catch (error) {
      Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#F8FAFC]" showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View className="bg-[#00685f] pt-20 pb-12 px-6 rounded-b-[40px] shadow-lg">
        <View className="items-center">
          <View className="bg-white/20 p-4 rounded-3xl mb-4">
            <FontAwesome5 name="hospital-alt" size={40} color="white" />
          </View>
          <Text className="text-3xl font-bold text-white tracking-tight">Clinical Curator</Text>
          <Text className="text-white/80 mt-1 text-lg font-medium">Precision Healthcare Access</Text>
        </View>
      </View>

      <View className="px-6 -mt-8">
        <View className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <Text className="text-2xl font-bold text-gray-900 mb-2">Welcome back</Text>
          <Text className="text-gray-500 mb-8">Select your role and sign in to continue</Text>

          {/* Role Selector */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Account category</Text>
            <TouchableOpacity
              className="flex-row items-center justify-between rounded-2xl bg-gray-50 border border-gray-200 px-4 py-4"
              onPress={() => setIsRoleMenuOpen((currentState) => !currentState)}
              activeOpacity={0.7}
            >
              <View className="flex-row items-center">
                <MaterialIcons 
                  name={roleOptions.find((opt) => opt.value === selectedRole)?.icon} 
                  size={20} 
                  color="#00685f" 
                />
                <Text className="ml-3 text-gray-900 font-medium">
                  {roleOptions.find((option) => option.value === selectedRole)?.label}
                </Text>
              </View>
              <MaterialIcons 
                name={isRoleMenuOpen ? "keyboard-arrow-up" : "keyboard-arrow-down"} 
                size={24} 
                color="gray" 
              />
            </TouchableOpacity>

            {isRoleMenuOpen && (
              <View className="mt-2 rounded-2xl border border-gray-100 bg-white shadow-lg overflow-hidden">
                {roleOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    className={`flex-row items-center px-4 py-4 border-b border-gray-50 ${selectedRole === option.value ? 'bg-blue-50' : ''}`}
                    onPress={() => handleRoleSelect(option.value)}
                  >
                    <MaterialIcons 
                      name={option.icon} 
                      size={20} 
                      color={selectedRole === option.value ? "#00685f" : "gray"} 
                    />
                    <Text className={`ml-3 font-medium ${selectedRole === option.value ? 'text-[#00685f]' : 'text-gray-700'}`}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Login Fields */}
          <View className="space-y-4">
            <View>
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Institutional Email</Text>
              <View className="h-14 flex-row items-center rounded-2xl bg-gray-50 border border-gray-200 px-4">
                <MaterialIcons name="alternate-email" size={20} color="#00685f" />
                <TextInput
                  placeholder="admin@hospital.com"
                  className="ml-3 flex-1 text-gray-900"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2 ml-1">Security Key (Password)</Text>
              <View className="h-14 flex-row items-center rounded-2xl bg-gray-50 border border-gray-200 px-4">
                <MaterialIcons name="lock-outline" size={20} color="#00685f" />
                <TextInput
                  placeholder="••••••••"
                  secureTextEntry={!isPasswordVisible}
                  className="ml-3 flex-1 text-gray-900"
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible((currentState) => !currentState)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <MaterialIcons
                    name={isPasswordVisible ? "visibility-off" : "visibility"}
                    size={20}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View className="mt-6 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Switch 
                value={remember} 
                onValueChange={setRemember}
                trackColor={{ false: "#E2E8F0", true: "#99f6e4" }}
                thumbColor={remember ? "#00685f" : "#f4f3f4"}
              />
              <Text className="ml-2 text-sm text-gray-600 font-medium">Keep me signed in</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate("ForgetPassword")}>
              <Text className="text-sm font-bold text-[#00685f]">Forgot?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="mt-8 h-14 flex-row items-center justify-center rounded-2xl bg-[#00685f] shadow-lg shadow-[#00685f]/30"
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Text className="text-white text-lg font-bold mr-2">Sign into Dashboard</Text>
                <MaterialIcons name="login" size={22} color="white" />
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo Accounts Section */}
        <View className="mt-10 mb-12">
         

          
          <View className="items-center">
            <Text className="text-sm text-gray-500">Need administrative access?</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://hms-backend-t9m3.onrender.com/docs')}>
              <Text className="mt-2 text-sm font-bold text-[#00685f]">Request New Credentials</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
