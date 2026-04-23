import React from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const TestRegistrationContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Test Registration</Text>
      <Text style={styles.subtitle}>Register new samples and link them to patient records.</Text>
    </View>

    <View style={styles.formCard}>
      <Text style={styles.sectionTitle}>Patient & Sample Details</Text>
      
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Patient ID / Name</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="person-outline" size={20} color="#94a3b8" />
          <TextInput style={styles.input} placeholder="Search patient..." />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Test Type</Text>
        <View style={styles.inputWrapper}>
          <Ionicons name="flask-outline" size={20} color="#94a3b8" />
          <TextInput style={styles.input} placeholder="e.g. Complete Blood Count" />
        </View>
      </View>

      <View style={styles.row}>
        <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
          <Text style={styles.label}>Sample ID</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="LB-10293" />
          </View>
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <Text style={styles.label}>Priority</Text>
          <View style={styles.inputWrapper}>
            <TextInput style={styles.input} placeholder="Routine" />
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.submitButton}>
        <Text style={styles.submitButtonText}>Register Test</Text>
      </TouchableOpacity>
    </View>

    <View style={styles.recentSection}>
      <Text style={styles.sectionTitle}>Recently Registered</Text>
      {[1, 2].map((i) => (
        <View key={i} style={styles.recentItem}>
          <View style={styles.recentIcon}>
            <Ionicons name="checkmark" size={16} color="#10b981" />
          </View>
          <View>
            <Text style={styles.recentText}>CBC for Alice Johnson</Text>
            <Text style={styles.recentSubtext}>Registered 5 mins ago • ID: SMP-882</Text>
          </View>
        </View>
      ))}
    </View>
  </ScrollView>
);

export default function TestRegistration() {
  return (
    <LabLayout>
      <TestRegistrationContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  formCard: { backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "700", color: "#64748b", marginBottom: 8, marginLeft: 4 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 16 },
  input: { flex: 1, height: 48, marginLeft: 10, fontSize: 14, color: "#1e293b", fontWeight: "600" },
  row: { flexDirection: "row" },
  submitButton: { backgroundColor: "#2563eb", height: 54, borderRadius: 16, alignItems: "center", justifyCenter: "center", marginTop: 10, shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "800" },
  recentSection: { marginTop: 32 },
  recentItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#10b981" },
  recentIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 12 },
  recentText: { fontSize: 14, fontWeight: "700", color: "#1e293b" },
  recentSubtext: { fontSize: 12, color: "#94a3b8", marginTop: 2 }
});
