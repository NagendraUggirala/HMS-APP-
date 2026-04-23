import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const dummyEquipment = [
  { id: '1', name: 'Auto-Analyzer 5000', status: 'Operational', maintenance: 'Due in 12 days', icon: 'speedometer-outline' },
  { id: '2', name: 'Hematology System X', status: 'Maintenance', maintenance: 'Ongoing', icon: 'flask-outline' },
  { id: '3', name: 'Centrifuge Prime', status: 'Operational', maintenance: 'Due in 45 days', icon: 'sync-outline' },
];

const EquipmentTrackingContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Equipment Tracking</Text>
      <Text style={styles.subtitle}>Monitor laboratory hardware status and maintenance.</Text>
    </View>

    <View style={styles.summaryGrid}>
      <View style={styles.summaryItem}>
        <Text style={styles.summaryLabel}>Total Units</Text>
        <Text style={styles.summaryValue}>24</Text>
      </View>
      <View style={[styles.summaryItem, { borderLeftWidth: 1, borderLeftColor: '#f1f5f9' }]}>
        <Text style={styles.summaryLabel}>Active Now</Text>
        <Text style={[styles.summaryValue, { color: '#10b981' }]}>21</Text>
      </View>
    </View>

    {dummyEquipment.map((eq) => (
      <View key={eq.id} style={styles.equipmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.eqIcon}>
            <Ionicons name={eq.icon} size={24} color="#ec4899" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.eqName}>{eq.name}</Text>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: eq.status === 'Operational' ? '#10b981' : '#f59e0b' }]} />
              <Text style={styles.statusText}>{eq.status}</Text>
            </View>
          </View>
          <TouchableOpacity>
            <Ionicons name="ellipsis-vertical" size={20} color="#cbd5e1" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.maintenanceInfo}>
            <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
            <Text style={styles.maintenanceText}>{eq.maintenance}</Text>
          </View>
          <TouchableOpacity style={styles.logBtn}>
            <Text style={styles.logBtnText}>Service Log</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}

    <TouchableOpacity style={styles.addBtn}>
      <Ionicons name="add" size={24} color="#fff" />
      <Text style={styles.addBtnText}>Register Equipment</Text>
    </TouchableOpacity>
  </ScrollView>
);

export default function EquipmentTracking() {
  return (
    <LabLayout>
      <EquipmentTrackingContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  summaryGrid: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 20, paddingVertical: 20, marginBottom: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 1 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryLabel: { fontSize: 10, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase" },
  summaryValue: { fontSize: 24, fontWeight: "900", color: "#1e293b", marginTop: 4 },
  equipmentCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 16, borderLeftWidth: 6, borderLeftColor: "#ec4899" },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  eqIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#fdf2f8", alignItems: "center", justifyContent: "center" },
  eqName: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  statusRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  statusText: { fontSize: 12, fontWeight: "700", color: "#64748b" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  maintenanceInfo: { flexDirection: "row", alignItems: "center" },
  maintenanceText: { fontSize: 12, color: "#94a3b8", marginLeft: 6, fontWeight: "600" },
  logBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0" },
  logBtnText: { fontSize: 11, fontWeight: "700", color: "#475569" },
  addBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1e293b", height: 56, borderRadius: 16, marginTop: 10 },
  addBtnText: { color: "#fff", fontWeight: "700", marginLeft: 10 }
});
