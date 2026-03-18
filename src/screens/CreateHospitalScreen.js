import { useState } from "react";
import { Alert, Text, View } from "react-native";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppContext } from "../context/AppContext";

const initialForm = {
  name: "",
  location: "",
  email: "",
  phone: "",
};

export default function CreateHospitalScreen({ navigation, route }) {
  const { returnTo = "SuperAdminDashboard" } = route.params || {};
  const { addHospital } = useAppContext();
  const [form, setForm] = useState(initialForm);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCreateHospital = () => {
    const hasEmptyField = Object.values(form).some((value) => !value.trim());

    if (hasEmptyField) {
      Alert.alert("Missing details", "Please complete all hospital fields.");
      return;
    }

    const hospital = addHospital({
      name: form.name.trim(),
      location: form.location.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });

    setForm(initialForm);

    navigation.replace("HospitalDashboard", {
      hospitalId: hospital.id,
      returnTo,
    });
  };

  return (
    <ScreenContainer>
      <View className="rounded-[28px] bg-slate-950 p-5">
        <Text className="text-2xl font-bold text-white">Create a hospital</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          Add a new hospital so the superadmin can start assigning doctors and
          nurses immediately.
        </Text>
      </View>

      <View className="mt-6 rounded-[28px] bg-slate-950 p-5">
        <FormInput
          label="Hospital Name"
          placeholder="Enter hospital name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
        />
        <FormInput
          label="Location"
          placeholder="Enter city or address"
          value={form.location}
          onChangeText={(value) => updateField("location", value)}
        />
        <FormInput
          label="Email"
          placeholder="Enter hospital email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          keyboardType="email-address"
        />
        <FormInput
          label="Phone"
          placeholder="Enter hospital phone"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          keyboardType="phone-pad"
        />

        <PrimaryButton title="Save Hospital" onPress={handleCreateHospital} />
      </View>
    </ScreenContainer>
  );
}
