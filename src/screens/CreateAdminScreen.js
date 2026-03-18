import { useState } from "react";
import { Alert, Text, View } from "react-native";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import SelectField from "../components/SelectField";
import { useAppContext } from "../context/AppContext";

const initialForm = {
  hospitalId: "",
  name: "",
  email: "",
  phone: "",
};

export default function CreateAdminScreen({ navigation, route }) {
  const { hospitalId: preselectedHospitalId, returnTo } = route.params || {};
  const { addAdmin, hospitals, getHospitalById } = useAppContext();
  const [form, setForm] = useState({
    ...initialForm,
    hospitalId: preselectedHospitalId || hospitals[0]?.id || "",
  });
  const [isHospitalMenuOpen, setIsHospitalMenuOpen] = useState(false);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleSaveAdmin = () => {
    const hasEmptyField = Object.values(form).some((value) => !value.trim());

    if (hasEmptyField) {
      Alert.alert("Missing details", "Please complete all admin fields.");
      return;
    }

    addAdmin({
      hospitalId: form.hospitalId,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });

    if (returnTo === "HospitalDashboard") {
      navigation.replace("HospitalDashboard", { hospitalId: form.hospitalId });
      return;
    }

    navigation.replace("SuperAdminDashboard");
  };

  return (
    <ScreenContainer>
      <View className="rounded-[28px] bg-slate-950 p-5">
        <Text className="text-2xl font-bold text-white">Create an admin</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          Assign an admin to a hospital with a mock login account and a default
          password of `123456`.
        </Text>
      </View>

      <View className="mt-6 rounded-[28px] bg-slate-950 p-5">
        <SelectField
          label="Hospital"
          value={getHospitalById(form.hospitalId)?.name}
          placeholder="Choose hospital"
          options={hospitals.map((hospital) => ({
            label: hospital.name,
            value: hospital.id,
            helperText: hospital.location,
          }))}
          isOpen={isHospitalMenuOpen}
          onToggle={() => setIsHospitalMenuOpen((currentState) => !currentState)}
          onSelect={(value) => {
            updateField("hospitalId", value);
            setIsHospitalMenuOpen(false);
          }}
        />

        <FormInput
          label="Admin Name"
          placeholder="Enter admin name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
        />
        <FormInput
          label="Email"
          placeholder="Enter admin email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Phone"
          placeholder="Enter admin phone"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          keyboardType="phone-pad"
        />

        <PrimaryButton title="Save Admin" onPress={handleSaveAdmin} />
      </View>
    </ScreenContainer>
  );
}
