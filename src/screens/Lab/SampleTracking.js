import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const { width } = Dimensions.get("window");

const dummySamples = [
  { id: 'SMP-101', patient: 'Alice Johnson', test: 'CBC', stage: 'Processing', status: 'In Lab', time: '10 mins ago' },
  { id: 'SMP-102', patient: 'Bob Wilson', test: 'Lipid Profile', stage: 'Collection', status: 'Transit', time: '25 mins ago' },
  { id: 'SMP-103', patient: 'Charlie Brown', test: 'Urinalysis', stage: 'Reporting', status: 'Completed', time: '1 hour ago' },
];

const SampleTrackingContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Sample Tracking</Text>
      <Text style={styles.subtitle}>Monitor the lifecycle of diagnostic samples.</Text>
    </View>

    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={20} color="#94a3b8" />
      <TextInput style={styles.searchInput} placeholder="Track Sample ID or Patient..." />
      <TouchableOpacity style={styles.scanButton}>
        <Ionicons name="qr-code-outline" size={20} color="#fff" />
      </TouchableOpacity>
    </View>

    <View style={styles.statsRow}>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>42</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>12</Text>
        <Text style={styles.statLabel}>Delayed</Text>
      </View>
      <View style={styles.statBox}>
        <Text style={styles.statValue}>156</Text>
        <Text style={styles.statLabel}>Today</Text>
      </View>
    </View>

    {dummySamples.map((sample) => (
      <View key={sample.id} style={styles.sampleCard}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.sampleId}>{sample.id}</Text>
            <Text style={styles.patientName}>{sample.patient}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: sample.status === 'Completed' ? '#ecfdf5' : '#eff6ff' }]}>
            <Text style={[styles.statusText, { color: sample.status === 'Completed' ? '#10b981' : '#2563eb' }]}>{sample.status}</Text>
          </View>
        </View>
        
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: sample.stage === 'Reporting' ? '100%' : sample.stage === 'Processing' ? '66%' : '33%' }]} />
          </View>
          <View style={styles.stageRow}>
            <Text style={styles.stageText}>Stage: {sample.stage}</Text>
            <Text style={styles.timeText}>{sample.time}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.detailsButton}>
          <Text style={styles.detailsButtonText}>View Timeline</Text>
          <Ionicons name="arrow-forward" size={14} color="#64748b" />
        </TouchableOpacity>
      </View>
    ))}
  </ScrollView>
);

export default function SampleTracking() {
  return (
    <LabLayout>
      <SampleTrackingContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  scanButton: { backgroundColor: "#2563eb", width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  statsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statBox: { width: (width - 60) / 3, backgroundColor: "#fff", padding: 16, borderRadius: 20, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  statLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", marginTop: 2 },
  sampleCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  sampleId: { fontSize: 12, fontWeight: "800", color: "#2563eb", textTransform: "uppercase" },
  patientName: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  progressSection: { marginBottom: 16 },
  progressBar: { height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, marginBottom: 10, overflow: "hidden" },
  progressFill: { height: "100%", backgroundColor: "#2563eb" },
  stageRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stageText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  timeText: { fontSize: 11, color: "#94a3b8", fontWeight: "500" },
  detailsButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 8, borderTopWidth: 1, borderTopColor: "#f1f5f9", marginTop: 4 },
  detailsButtonText: { fontSize: 12, fontWeight: "700", color: "#64748b", marginRight: 6 }
});
