import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const dummyReports = [
  { id: 'R-992', patient: 'Michael Scott', date: '23 Apr 2024', tests: 'Liver Function Test', status: 'Draft' },
  { id: 'R-991', patient: 'Dwight Schrute', date: '22 Apr 2024', tests: 'Vitamin D', status: 'Pending Review' },
  { id: 'R-990', patient: 'Jim Halpert', date: '22 Apr 2024', tests: 'Thyroid Profile', status: 'Ready' },
];

const ReportGenerationContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Report Generation</Text>
      <Text style={styles.subtitle}>Finalize and validate diagnostic reports.</Text>
    </View>

    <View style={styles.actionCard}>
      <View style={styles.actionIcon}>
        <Ionicons name="document-text" size={24} color="#f59e0b" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.actionTitle}>Pending Validation</Text>
        <Text style={styles.actionDesc}>12 reports require your signature.</Text>
      </View>
      <TouchableOpacity style={styles.primaryAction}>
        <Text style={styles.primaryActionText}>Start</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.sectionTitle}>Recent Reports</Text>
    {dummyReports.map((report) => (
      <View key={report.id} style={styles.reportCard}>
        <View style={styles.reportInfo}>
          <Text style={styles.reportId}>{report.id}</Text>
          <Text style={styles.patientName}>{report.patient}</Text>
          <Text style={styles.testList}>{report.tests}</Text>
        </View>
        <View style={styles.reportMeta}>
          <View style={[styles.statusTag, { backgroundColor: report.status === 'Ready' ? '#ecfdf5' : '#fffbeb' }]}>
            <Text style={[styles.statusTagText, { color: report.status === 'Ready' ? '#10b981' : '#f59e0b' }]}>{report.status}</Text>
          </View>
          <Text style={styles.dateText}>{report.date}</Text>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="download-outline" size={18} color="#2563eb" />
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </ScrollView>
);

export default function ReportGeneration() {
  return (
    <LabLayout>
      <ReportGenerationContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  actionCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 20, borderRadius: 24, marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  actionIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#fffbeb", alignItems: "center", justifyContent: "center", marginRight: 16 },
  actionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  actionDesc: { fontSize: 12, color: "#64748b", marginTop: 2 },
  primaryAction: { backgroundColor: "#f59e0b", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  primaryActionText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  reportCard: { backgroundColor: "#fff", borderRadius: 20, padding: 16, marginBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reportInfo: { flex: 1 },
  reportId: { fontSize: 10, fontWeight: "800", color: "#94a3b8" },
  patientName: { fontSize: 15, fontWeight: "800", color: "#1e293b", marginTop: 2 },
  testList: { fontSize: 12, color: "#64748b", marginTop: 2 },
  reportMeta: { alignItems: "flex-end" },
  statusTag: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 6 },
  statusTagText: { fontSize: 9, fontWeight: "900", textTransform: "uppercase" },
  dateText: { fontSize: 10, color: "#94a3b8", fontWeight: "600", marginBottom: 6 },
  iconBtn: { padding: 4 }
});
