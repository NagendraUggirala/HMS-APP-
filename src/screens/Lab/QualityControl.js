import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const { width } = Dimensions.get("window");

const QualityControlContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Quality Control</Text>
      <Text style={styles.subtitle}>Maintain diagnostic accuracy and regulatory standards.</Text>
    </View>

    <View style={styles.chartPlaceholder}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartTitle}>Daily QC Performance</Text>
        <Text style={styles.chartDate}>23 Apr 2024</Text>
      </View>
      <View style={styles.barContainer}>
        {[0.8, 0.95, 0.9, 1.0, 0.85, 0.92].map((val, i) => (
          <View key={i} style={[styles.bar, { height: val * 100 }]} />
        ))}
      </View>
      <Text style={styles.chartLabel}>Accuracy: 98.4% (Pass)</Text>
    </View>

    <Text style={styles.sectionTitle}>Required Tasks</Text>
    <View style={styles.taskCard}>
      <View style={styles.taskIcon}>
        <Ionicons name="shield-checkmark" size={24} color="#14b8a6" />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.taskTitle}>Monthly Calibration</Text>
        <Text style={styles.taskDesc}>Standardize all analyzers for May 2024 cycle.</Text>
        <View style={styles.tagRow}>
          <View style={styles.tag}><Text style={styles.tagText}>HIGH PRIORITY</Text></View>
          <View style={[styles.tag, { backgroundColor: '#f1f5f9' }]}><Text style={[styles.tagText, { color: '#64748b' }]}>DUE IN 2D</Text></View>
        </View>
      </View>
    </View>

    <View style={styles.statsGrid}>
      <View style={styles.smallStat}>
        <Text style={styles.smallStatLabel}>Pending QC</Text>
        <Text style={styles.smallStatValue}>04</Text>
      </View>
      <View style={styles.smallStat}>
        <Text style={styles.smallStatLabel}>Audits Passed</Text>
        <Text style={styles.smallStatValue}>12</Text>
      </View>
    </View>
  </ScrollView>
);

export default function QualityControl() {
  return (
    <LabLayout>
      <QualityControlContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  chartPlaceholder: { backgroundColor: "#fff", padding: 24, borderRadius: 24, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  chartHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 30 },
  chartTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  chartDate: { fontSize: 12, color: "#94a3b8", fontWeight: "600" },
  barContainer: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: 100, marginBottom: 20 },
  bar: { width: (width - 120) / 6, backgroundColor: "#14b8a6", borderRadius: 4 },
  chartLabel: { fontSize: 13, fontWeight: "700", color: "#14b8a6", textAlign: "center" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  taskCard: { flexDirection: "row", backgroundColor: "#fff", padding: 20, borderRadius: 24, marginBottom: 24 },
  taskIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#f0fdfa", alignItems: "center", justifyContent: "center" },
  taskTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  taskDesc: { fontSize: 12, color: "#64748b", marginTop: 4, lineHeight: 18 },
  tagRow: { flexDirection: "row", marginTop: 12 },
  tag: { backgroundColor: "#fef2f2", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 8 },
  tagText: { fontSize: 9, fontWeight: "800", color: "#ef4444" },
  statsGrid: { flexDirection: "row", justifyContent: "space-between" },
  smallStat: { width: (width - 56) / 2, backgroundColor: "#fff", padding: 20, borderRadius: 20, alignItems: "center" },
  smallStatLabel: { fontSize: 11, fontWeight: "700", color: "#94a3b8" },
  smallStatValue: { fontSize: 20, fontWeight: "900", color: "#1e293b", marginTop: 4 }
});
