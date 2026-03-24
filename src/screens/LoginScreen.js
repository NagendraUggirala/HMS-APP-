import { useMemo, useState } from "react";
import { Alert, Text, View } from "react-native";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import SectionCard from "../components/SectionCard";
import SelectField from "../components/SelectField";
import { useAppContext } from "../context/AppContext";

const roleOptions = [
  { label: "Superadmin", value: "superadmin" },
  { label: "Doctor", value: "doctor" },
  { label: "Nurse", value: "nurse" },
  { label: "Lab Technician", value: "lab_technician" },
  { label: "Receptionist", value: "receptionist" },
  { label: "Billing", value: "billing" },
  { label: "Pharmacy", value: "pharmacy" },
];

const routeByRole = {
  superadmin: "SuperAdminDashboard",
  doctor: "DoctorDashboard",
  nurse: "NurseDashboard",
  lab_technician: "LabTechnicianDashboard",
  receptionist: "ReceptionistDashboard",
  billing: "BillingDashboard",
  pharmacy: "PharmacyDashboard",
};

export default function LoginScreen({ navigation }) {
  const { authUsers, login } = useAppContext();
  const [selectedRole, setSelectedRole] = useState("superadmin");
  const [email, setEmail] = useState("superadmin@hms.com");
  const [password, setPassword] = useState("123456");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const selectedAccount = useMemo(
    () => authUsers.find((user) => user.role === selectedRole),
    [authUsers, selectedRole]
  );

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setIsRoleMenuOpen(false);

    const account = authUsers.find((user) => user.role === role);
    setEmail(account?.email || "");
    setPassword(account?.password || "123456");
  };

  const handleLogin = () => {
    const result = login({
      role: selectedRole,
      email,
      password,
    });

    if (!result.success) {
      Alert.alert("Login failed", result.message);
      return;
    }

    navigation.replace(routeByRole[selectedRole]);
  };

  return (
    <ScreenContainer>
      <View className="rounded-[32px] border border-surface-300 bg-surface-50 p-6">
        <Text className="text-sm font-semibold uppercase tracking-[3px] text-brand-700">
          Welcome Back
        </Text>
        <Text className="mt-3 text-3xl font-bold text-ink-900">
          Sign in to the HMS control center.
        </Text>
        <Text className="mt-3 text-sm leading-6 text-ink-500">
          Choose a role, use the mock account, and continue into the role-based
          experience.
        </Text>
      </View>

      <View className="mt-6 rounded-[32px] border border-surface-300 bg-surface-50 p-5">
        <SelectField
          label="Login Role"
          value={roleOptions.find((option) => option.value === selectedRole)?.label}
          placeholder="Select a role"
          options={roleOptions}
          isOpen={isRoleMenuOpen}
          onToggle={() => setIsRoleMenuOpen((currentState) => !currentState)}
          onSelect={handleRoleSelect}
        />

        <FormInput
          label="Email"
          placeholder="Enter account email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Password"
          placeholder="Enter password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <PrimaryButton title="Login" onPress={handleLogin} />
      </View>

      <SectionCard
        title="Mock Login Details"
        subtitle="These role accounts are preloaded so you can test the frontend flow quickly."
        rightLabel="Demo"
      >
        <Text className="text-sm text-ink-700">
          Role: {roleOptions.find((option) => option.value === selectedRole)?.label}
        </Text>
        <Text className="mt-2 text-sm text-ink-700">
          Email: {selectedAccount?.email || "No account available"}
        </Text>
        <Text className="mt-2 text-sm text-ink-700">
          Password: {selectedAccount?.password || "123456"}
        </Text>
        <Text className="mt-3 text-xs leading-5 text-ink-500">
          Newly created admins, doctors, nurses, and patients also receive the default
          password `123456`.
        </Text>
      </SectionCard>
    </ScreenContainer>
  );
}
