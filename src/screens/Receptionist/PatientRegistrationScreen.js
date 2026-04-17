import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";
import { api } from "../../services/api";

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const BLOOD_GROUP_OPTIONS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ID_TYPE_OPTIONS = ["Aadhaar Card", "PAN Card", "Passport", "Driving License", "Voter ID", "Other"];

const EMPTY_FORM = {
  first_name: "",
  last_name: "",
  gender: "",
  date_of_birth: "",
  blood_group: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  district: "",
  state: "",
  country: "",
  pincode: "",
  id_type: "",
  id_number: "",
  id_name: "",
  emergency_contact_name: "",
  emergency_contact_relation: "",
  emergency_contact_phone: "",
  medical_history: "",
  password: "",
};

const FormInput = ({
  label,
  placeholder,
  icon,
  value,
  onChangeText,
  keyboardType,
  multiline,
  secureTextEntry,
  rightElement,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color="#94a3b8" style={styles.inputIcon} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        style={[styles.input, multiline ? styles.multilineInput : null]}
        keyboardType={keyboardType || "default"}
        multiline={Boolean(multiline)}
        secureTextEntry={Boolean(secureTextEntry)}
      />
      {rightElement}
    </View>
  </View>
);

const SelectInput = ({ label, icon, value, placeholder, onPress }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity style={styles.inputWrapper} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name={icon} size={20} color="#94a3b8" style={styles.inputIcon} />
      <Text style={[styles.selectValue, !value ? styles.placeholderText : null]}>{value || placeholder}</Text>
      <Ionicons name="chevron-down-outline" size={18} color="#94a3b8" />
    </TouchableOpacity>
  </View>
);

const DateField = ({ label, value, onPress }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TouchableOpacity style={styles.inputWrapper} onPress={onPress} activeOpacity={0.8}>
      <Ionicons name="calendar-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
      <Text style={[styles.selectValue, !value ? styles.placeholderText : null]}>{value || "YYYY-MM-DD"}</Text>
      <Ionicons name="calendar-clear-outline" size={18} color="#94a3b8" />
    </TouchableOpacity>
  </View>
);

const PatientRegistrationScreen = ({ navigation }) => {
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [pickerState, setPickerState] = useState({ visible: false, title: "", field: "", options: [] });
  const [dateModalVisible, setDateModalVisible] = useState(false);

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const openPicker = (field, title, options) => {
    setPickerState({ visible: true, field, title, options });
  };

  const closePicker = () => {
    setPickerState({ visible: false, title: "", field: "", options: [] });
  };

  const selectOption = (option) => {
    if (pickerState.field) {
      updateForm(pickerState.field, option);
    }
    closePicker();
  };

  const validate = () => {
    const requiredFields = [
      "first_name",
      "last_name",
      "gender",
      "date_of_birth",
      "blood_group",
      "phone",
      "email",
      "address",
      "city",
      "district",
      "state",
      "country",
      "pincode",
      "id_type",
      "id_number",
      "emergency_contact_name",
      "emergency_contact_relation",
      "emergency_contact_phone",
      "password",
    ];

    for (const key of requiredFields) {
      if (!String(formData[key] || "").trim()) {
        Alert.alert("Missing Field", "Please fill all required fields.");
        return false;
      }
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date_of_birth)) {
      Alert.alert("Invalid Date", "Date of birth must be in YYYY-MM-DD format.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    if (!/^\d{5,10}$/.test(formData.pincode)) {
      Alert.alert("Invalid Pincode", "Pincode must be 5 to 10 digits.");
      return false;
    }

    return true;
  };

  const buildPayload = () => ({
    first_name: formData.first_name.trim(),
    last_name: formData.last_name.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim(),
    date_of_birth: formData.date_of_birth.trim(),
    gender: formData.gender.toUpperCase(),
    address: formData.address.trim(),
    city: formData.city.trim(),
    emergency_contact_name: formData.emergency_contact_name.trim(),
    emergency_contact_phone: formData.emergency_contact_phone.trim(),
    emergency_contact_relation: formData.emergency_contact_relation.trim(),
    blood_group: formData.blood_group,
    district: formData.district.trim(),
    state: formData.state.trim(),
    country: formData.country.trim(),
    pincode: formData.pincode.trim(),
    id_type: formData.id_type,
    id_number: formData.id_number.trim(),
    id_name: formData.id_name.trim() || null,
    medical_history: formData.medical_history.trim() || null,
    password: formData.password,
  });

  const handleRegisterPatient = async () => {
    if (!validate()) return;
    setSubmitLoading(true);
    try {
      const result = await api.registerPatient(buildPayload());
      Alert.alert(
        "Patient Registered",
        `Patient created successfully.\nPatient Ref: ${result?.patient_ref || "N/A"}${
          result?.temp_password ? `\nTemporary Password: ${result.temp_password}` : ""
        }`
      );
      setFormData(EMPTY_FORM);
      setShowPassword(false);
      if (navigation?.goBack) navigation.goBack();
    } catch (error) {
      Alert.alert("Registration Failed", error?.message || "Unable to register patient.");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <ReceptionistLayout>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Patient Registration</Text>
          <Text style={styles.subtitle}>Register a new patient to the system</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <FormInput
                label="First Name"
                placeholder="John"
                icon="person-outline"
                value={formData.first_name}
                onChangeText={(v) => updateForm("first_name", v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Last Name"
                placeholder="Doe"
                icon="person-outline"
                value={formData.last_name}
                onChangeText={(v) => updateForm("last_name", v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <SelectInput
                label="Gender"
                placeholder="Select gender"
                value={formData.gender}
                icon="male-female-outline"
                onPress={() => openPicker("gender", "Select Gender", GENDER_OPTIONS)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <DateField label="Date of Birth" value={formData.date_of_birth} onPress={() => setDateModalVisible(true)} />
            </View>
          </View>

          <SelectInput
            label="Blood Group"
            placeholder="Select blood group"
            value={formData.blood_group}
            icon="water-outline"
            onPress={() => openPicker("blood_group", "Select Blood Group", BLOOD_GROUP_OPTIONS)}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contact Information</Text>
          <FormInput
            label="Phone Number"
            placeholder="+91 98765 43210"
            icon="call-outline"
            keyboardType="phone-pad"
            value={formData.phone}
            onChangeText={(v) => updateForm("phone", v)}
          />
          <FormInput
            label="Email Address"
            placeholder="john.doe@example.com"
            icon="mail-outline"
            keyboardType="email-address"
            value={formData.email}
            onChangeText={(v) => updateForm("email", v)}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Address Details</Text>
          <FormInput
            label="Address Line"
            placeholder="Street, landmark, area"
            icon="location-outline"
            multiline
            value={formData.address}
            onChangeText={(v) => updateForm("address", v)}
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <FormInput
                label="City"
                placeholder="City"
                icon="business-outline"
                value={formData.city}
                onChangeText={(v) => updateForm("city", v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput
                label="District"
                placeholder="District"
                icon="map-outline"
                value={formData.district}
                onChangeText={(v) => updateForm("district", v)}
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <FormInput
                label="State"
                placeholder="State"
                icon="map-outline"
                value={formData.state}
                onChangeText={(v) => updateForm("state", v)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput
                label="Country"
                placeholder="Country"
                icon="earth-outline"
                value={formData.country}
                onChangeText={(v) => updateForm("country", v)}
              />
            </View>
          </View>

          <FormInput
            label="Pincode"
            placeholder="600001"
            icon="mail-open-outline"
            keyboardType="number-pad"
            value={formData.pincode}
            onChangeText={(v) => updateForm("pincode", v)}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Identification</Text>
          <SelectInput
            label="ID Type"
            placeholder="Select ID type"
            value={formData.id_type}
            icon="card-outline"
            onPress={() => openPicker("id_type", "Select ID Type", ID_TYPE_OPTIONS)}
          />
          <FormInput
            label="ID Number"
            placeholder="Enter ID number"
            icon="finger-print-outline"
            value={formData.id_number}
            onChangeText={(v) => updateForm("id_number", v)}
          />
          <FormInput
            label="ID Name (Optional)"
            placeholder="Name as per ID"
            icon="person-circle-outline"
            value={formData.id_name}
            onChangeText={(v) => updateForm("id_name", v)}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Emergency Contact</Text>
          <FormInput
            label="Name"
            placeholder="Emergency contact name"
            icon="person-add-outline"
            value={formData.emergency_contact_name}
            onChangeText={(v) => updateForm("emergency_contact_name", v)}
          />
          <FormInput
            label="Relationship"
            placeholder="Father / Mother / Spouse"
            icon="people-outline"
            value={formData.emergency_contact_relation}
            onChangeText={(v) => updateForm("emergency_contact_relation", v)}
          />
          <FormInput
            label="Phone"
            placeholder="+91 98765 43210"
            icon="call-outline"
            keyboardType="phone-pad"
            value={formData.emergency_contact_phone}
            onChangeText={(v) => updateForm("emergency_contact_phone", v)}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Medical Details</Text>
          <FormInput
            label="Medical History (Optional)"
            placeholder="Allergies, chronic conditions, medications..."
            icon="medkit-outline"
            multiline
            value={formData.medical_history}
            onChangeText={(v) => updateForm("medical_history", v)}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Account Setup</Text>
          <FormInput
            label="Password"
            placeholder="Create password"
            icon="lock-closed-outline"
            secureTextEntry={!showPassword}
            value={formData.password}
            onChangeText={(v) => updateForm("password", v)}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#64748b" />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity
            style={[styles.submitButton, submitLoading ? styles.submitButtonDisabled : null]}
            onPress={handleRegisterPatient}
            disabled={submitLoading}
          >
            {submitLoading ? <ActivityIndicator size="small" color="#ffffff" /> : <Text style={styles.submitButtonText}>Register Patient</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={pickerState.visible} transparent animationType="fade" onRequestClose={closePicker}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{pickerState.title}</Text>
              <TouchableOpacity onPress={closePicker}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <ScrollView style={{ maxHeight: 320 }}>
              {pickerState.options.map((option) => (
                <TouchableOpacity key={option} style={styles.optionItem} onPress={() => selectOption(option)} activeOpacity={0.8}>
                  <Text style={styles.optionText}>{option}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={dateModalVisible} transparent animationType="fade" onRequestClose={() => setDateModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Date of Birth</Text>
              <TouchableOpacity onPress={() => setDateModalVisible(false)}>
                <Ionicons name="close" size={22} color="#64748b" />
              </TouchableOpacity>
            </View>
            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="calendar-outline" size={20} color="#94a3b8" style={styles.inputIcon} />
              <TextInput
                value={formData.date_of_birth}
                onChangeText={(v) => updateForm("date_of_birth", v)}
                placeholder="1995-07-24"
                placeholderTextColor="#94a3b8"
                style={styles.input}
              />
            </View>
            <View style={styles.dateModalActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setDateModalVisible(false)}>
                <Text style={styles.secondaryBtnText}>Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ReceptionistLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#2563eb",
    paddingLeft: 12,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 14,
    color: "#1e293b",
  },
  multilineInput: {
    minHeight: 90,
    textAlignVertical: "top",
    paddingVertical: 12,
  },
  selectValue: {
    flex: 1,
    fontSize: 14,
    color: "#1e293b",
    paddingVertical: 14,
  },
  placeholderText: {
    color: "#94a3b8",
  },
  row: {
    flexDirection: "row",
  },
  eyeButton: {
    paddingLeft: 8,
  },
  submitButton: {
    backgroundColor: "#2563eb",
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  optionText: {
    fontSize: 14,
    color: "#1e293b",
  },
  dateModalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  secondaryBtn: {
    height: 40,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryBtnText: {
    color: "#334155",
    fontWeight: "600",
  },
});

export default PatientRegistrationScreen;
