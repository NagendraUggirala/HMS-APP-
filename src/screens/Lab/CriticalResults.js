import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const dummyCriticalResults = [
  { id: '1', patient: 'John Doe', test: 'Blood Glucose', value: '450 mg/dL', status: 'Immediate Action', time: '10:30 AM' },
  { id: '2', patient: 'Jane Smith', test: 'Hemoglobin', value: '6.2 g/dL', status: 'Urgent', time: '11:15 AM' },
  { id: '3', patient: 'Robert Brown', test: 'Potassium', value: '6.5 mmol/L', status: 'Critical', time: '11:45 AM' },
];

const CriticalResultsContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Critical Results</Text>
      <Text style={styles.subtitle}>Alerts requiring immediate clinician notification.</Text>
    </View>

    {dummyCriticalResults.map((item) => (
      <View key={item.id} style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{item.patient}</Text>
            <Text style={styles.testName}>{item.test}</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <View style={styles.valueRow}>
          <Text style={styles.valueLabel}>Measured Value:</Text>
          <Text style={styles.valueText}>{item.value}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.timeText}>Detected at {item.time}</Text>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Notify Doctor</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </ScrollView>
);

export default function CriticalResults() {
  return (
    <LabLayout>
      <CriticalResultsContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  alertCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fee2e2",
    shadowColor: "#ef4444",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  alertHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  patientName: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  testName: { fontSize: 12, color: "#64748b", fontWeight: "600", textTransform: "uppercase", marginTop: 2 },
  statusBadge: { backgroundColor: "#fef2f2", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#ef4444", fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  valueRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  valueLabel: { fontSize: 14, color: "#64748b", marginRight: 8 },
  valueText: { fontSize: 18, fontWeight: "900", color: "#ef4444" },
  footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  timeText: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  actionButton: { backgroundColor: "#ef4444", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  actionButtonText: { color: "#fff", fontSize: 12, fontWeight: "700" }
});
