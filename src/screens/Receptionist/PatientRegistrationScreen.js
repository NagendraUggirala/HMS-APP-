import React from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";

const FormInput = ({ label, placeholder, icon }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.inputWrapper}>
      <Ionicons name={icon} size={20} color="#94a3b8" style={styles.inputIcon} />
      <TextInput placeholder={placeholder} placeholderTextColor="#94a3b8" style={styles.input} />
    </View>
  </View>
);

const PatientRegistrationScreen = ({ navigation }) => {
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
              <FormInput label="First Name" placeholder="John" icon="person-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput label="Last Name" placeholder="Doe" icon="person-outline" />
            </View>
          </View>

          <FormInput label="Date of Birth" placeholder="DD/MM/YYYY" icon="calendar-outline" />
          
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <FormInput label="Gender" placeholder="Male/Female" icon="male-female-outline" />
            </View>
            <View style={{ flex: 1 }}>
              <FormInput label="Blood Group" placeholder="O+" icon="water-outline" />
            </View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Contact Information</Text>
          <FormInput label="Phone Number" placeholder="+91 98765 43210" icon="call-outline" />
          <FormInput label="Email Address" placeholder="john.doe@example.com" icon="mail-outline" />
          <FormInput label="Full Address" placeholder="Street, City, State" icon="location-outline" />

          <TouchableOpacity style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Register Patient</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  row: {
    flexDirection: "row",
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
});

export default PatientRegistrationScreen;
