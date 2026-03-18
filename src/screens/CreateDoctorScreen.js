import { useState } from "react";
import { Alert, Text, View } from "react-native";
import FormInput from "../components/FormInput";
import PrimaryButton from "../components/PrimaryButton";
import ScreenContainer from "../components/ScreenContainer";
import { useAppContext } from "../context/AppContext";

const initialForm = {
  name: "",
  specialty: "",
  email: "",
  phone: "",
};

export default function CreateDoctorScreen({ navigation, route }) {
  const { hospitalId, returnTo = "HospitalDashboard" } = route.params;
  const { addDoctor, getHospitalById } = useAppContext();
  const [form, setForm] = useState(initialForm);
  const hospital = getHospitalById(hospitalId);

  const updateField = (field, value) => {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  };

  const handleCreateDoctor = () => {
    const hasEmptyField = Object.values(form).some((value) => !value.trim());

    if (hasEmptyField) {
      Alert.alert("Missing details", "Please complete all doctor fields.");
      return;
    }

    addDoctor({
      hospitalId,
      name: form.name.trim(),
      specialty: form.specialty.trim(),
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
        <Text className="text-2xl font-bold text-white">Create a doctor</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          Add a doctor profile for {hospital?.name || "the selected hospital"}.
        </Text>
      </View>

      <View className="mt-6 rounded-[28px] bg-slate-950 p-5">
        <FormInput
          label="Doctor Name"
          placeholder="Enter doctor name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
        />
        <FormInput
          label="Specialty"
          placeholder="Enter specialty"
          value={form.specialty}
          onChangeText={(value) => updateField("specialty", value)}
        />
        <FormInput
          label="Email"
          placeholder="Enter doctor email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          keyboardType="email-address"
        />
        <FormInput
          label="Phone"
          placeholder="Enter doctor phone"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          keyboardType="phone-pad"
        />

        <PrimaryButton title="Save Doctor" onPress={handleCreateDoctor} />
      </View>
    </ScreenContainer>
  );
}
