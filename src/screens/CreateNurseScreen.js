import { useState } from "react";
import { Alert, Text, View } from "react-native";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppContext } from "../context/AppContext";

const initialForm = {
  name: "",
  department: "",
  email: "",
  phone: "",
};

export default function CreateNurseScreen({ navigation, route }) {
  const { hospitalId, returnTo = "HospitalDashboard" } = route.params;
  const { addNurse, getHospitalById } = useAppContext();
  const [form, setForm] = useState(initialForm);
  const hospital = getHospitalById(hospitalId);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCreateNurse = () => {
    const hasEmptyField = Object.values(form).some((value) => !value.trim());

    if (hasEmptyField) {
      Alert.alert("Missing details", "Please complete all nurse fields.");
      return;
    }

    addNurse({
      hospitalId,
      name: form.name.trim(),
      department: form.department.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });

    setForm(initialForm);

    if (returnTo === "AdminDashboard") {
      navigation.replace("AdminDashboard");
      return;
    }

    navigation.replace("HospitalDashboard", {
      hospitalId,
    });
  };

  return (
    <ScreenContainer>
      <View className="rounded-[28px] bg-slate-950 p-5">
        <Text className="text-2xl font-bold text-white">Create a nurse</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          Add a nurse profile for {hospital?.name || "the selected hospital"}.
        </Text>
      </View>

      <View className="mt-6 rounded-[28px] bg-slate-950 p-5">
        <FormInput
          label="Nurse Name"
          placeholder="Enter nurse name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
        />
        <FormInput
          label="Department"
          placeholder="Enter department"
          value={form.department}
          onChangeText={(value) => updateField("department", value)}
        />
        <FormInput
          label="Email"
          placeholder="Enter nurse email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          keyboardType="email-address"
        />
        <FormInput
          label="Phone"
          placeholder="Enter nurse phone"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          keyboardType="phone-pad"
        />

        <PrimaryButton title="Save Nurse" onPress={handleCreateNurse} />
      </View>
    </ScreenContainer>
  );
}
