import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";

const dummyAlerts = [
  { id: '1', medicine: 'Cough Syrup (Child)', expiry: '15 May 2024', daysLeft: 22, severity: 'Critical' },
  { id: '2', medicine: 'Vitamin C 500mg', expiry: '10 Jun 2024', daysLeft: 48, severity: 'Warning' },
];

const ExpiryAlertsContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Expiry Alerts</Text>
      <Text style={styles.subtitle}>Monitor medicines nearing expiration dates.</Text>
    </View>

    {dummyAlerts.map((alert) => (
      <View key={alert.id} style={styles.alertCard}>
        <View style={styles.alertHeader}>
          <View style={[styles.iconBox, { backgroundColor: alert.severity === 'Critical' ? '#fef2f2' : '#fffbeb' }]}>
            <Ionicons 
              name={alert.severity === 'Critical' ? "alert-circle" : "warning"} 
              size={24} 
              color={alert.severity === 'Critical' ? "#ef4444" : "#f59e0b"} 
            />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.medName}>{alert.medicine}</Text>
            <Text style={styles.expiryDate}>Expires on: {alert.expiry}</Text>
          </View>
        </View>
        <View style={styles.alertFooter}>
          <Text style={[styles.daysLeft, { color: alert.severity === 'Critical' ? '#ef4444' : '#f59e0b' }]}>
            {alert.daysLeft} days remaining
          </Text>
          <TouchableOpacity style={styles.actionBtn}>
            <Text style={styles.actionBtnText}>Remove from Stock</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </ScrollView>
);

export default function PharmacyExpiryAlerts() {
  return (
    <PharmacyLayout>
      <ExpiryAlertsContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  alertCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 16 },
  alertHeader: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  medName: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  expiryDate: { fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: "600" },
  alertFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  daysLeft: { fontSize: 13, fontWeight: "800" },
  actionBtn: { backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  actionBtnText: { color: "#475569", fontWeight: "700", fontSize: 11 }
});
