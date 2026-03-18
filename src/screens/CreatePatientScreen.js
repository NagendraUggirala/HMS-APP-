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
  condition: "",
  email: "",
  phone: "",
};

export default function CreatePatientScreen({ navigation, route }) {
  const { hospitalId: preselectedHospitalId, returnTo } = route.params || {};
  const { addPatient, hospitals, getHospitalById } = useAppContext();
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

  const handleSavePatient = () => {
    const hasEmptyField = Object.values(form).some((value) => !value.trim());

    if (hasEmptyField) {
      Alert.alert("Missing details", "Please complete all patient fields.");
      return;
    }

    addPatient({
      hospitalId: form.hospitalId,
      name: form.name.trim(),
      condition: form.condition.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
    });

    if (returnTo === "AdminDashboard") {
      navigation.replace("AdminDashboard");
      return;
    }

    navigation.replace("HospitalDashboard", { hospitalId: form.hospitalId });
  };

  return (
    <ScreenContainer>
      <View className="rounded-[28px] bg-slate-950 p-5">
        <Text className="text-2xl font-bold text-white">Create a patient</Text>
        <Text className="mt-2 text-sm leading-6 text-slate-400">
          Add a patient record and prepare a placeholder patient login for the mobile
          app flow.
        </Text>
      </View>

      <View className="mt-6 rounded-[28px] bg-slate-950 p-5">
        {!preselectedHospitalId ? (
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
        ) : null}

        <FormInput
          label="Patient Name"
          placeholder="Enter patient name"
          value={form.name}
          onChangeText={(value) => updateField("name", value)}
        />
        <FormInput
          label="Condition"
          placeholder="Enter condition or visit reason"
          value={form.condition}
          onChangeText={(value) => updateField("condition", value)}
        />
        <FormInput
          label="Email"
          placeholder="Enter patient email"
          value={form.email}
          onChangeText={(value) => updateField("email", value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <FormInput
          label="Phone"
          placeholder="Enter patient phone"
          value={form.phone}
          onChangeText={(value) => updateField("phone", value)}
          keyboardType="phone-pad"
        />

        <PrimaryButton title="Save Patient" onPress={handleSavePatient} />
      </View>
    </ScreenContainer>
  );
}
