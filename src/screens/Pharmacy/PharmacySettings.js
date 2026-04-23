import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";

const PharmacySettingsContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Configure pharmacy module preferences.</Text>
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Notifications</Text>
      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Low Stock Alerts</Text>
          <Text style={styles.settingSub}>Notify when medicine stock falls below threshold.</Text>
        </View>
        <Switch value={true} trackColor={{ true: '#2563eb' }} />
      </View>
      <View style={styles.settingRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.settingLabel}>Expiry Reminders</Text>
          <Text style={styles.settingSub}>Notify 30 days before medicine expiry.</Text>
        </View>
        <Switch value={true} trackColor={{ true: '#2563eb' }} />
      </View>
    </View>

    <TouchableOpacity style={styles.saveBtn}>
      <Text style={styles.saveBtnText}>Save Configuration</Text>
    </TouchableOpacity>
  </ScrollView>
);

export default function PharmacySettings() {
  return (
    <PharmacyLayout>
      <PharmacySettingsContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  section: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginBottom: 20 },
  settingRow: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  settingLabel: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  settingSub: { fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: "600", paddingRight: 20 },
  saveBtn: { backgroundColor: "#1e293b", height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" }
});
