import React from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";

const RaiseTicketContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Raise Support Ticket</Text>
      <Text style={styles.subtitle}>Get help with technical issues in the pharmacy module.</Text>
    </View>

    <View style={styles.form}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Issue Subject</Text>
        <TextInput style={styles.input} placeholder="e.g., Inventory sync issue" />
      </View>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Detailed Description</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          placeholder="Describe the issue in detail..." 
          multiline 
          numberOfLines={4} 
        />
      </View>
      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitBtnText}>Submit Support Request</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

export default function PharmacyRaiseTicket() {
  return (
    <PharmacyLayout>
      <RaiseTicketContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  form: { backgroundColor: "#fff", borderRadius: 24, padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "800", color: "#1e293b", marginBottom: 8 },
  input: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 16, fontSize: 14, fontWeight: "600", borderWidth: 1, borderColor: "#e2e8f0" },
  textArea: { height: 120, textAlignVertical: 'top' },
  submitBtn: { backgroundColor: "#2563eb", height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 8 },
  submitBtnText: { color: "#fff", fontWeight: "700" }
});
