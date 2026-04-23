import React from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const LabProfileContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Lab Profile</Text>
      <Text style={styles.subtitle}>Manage laboratory details and account settings.</Text>
    </View>

    <View style={styles.profileCard}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Ionicons name="business" size={40} color="#fff" />
        </View>
        <TouchableOpacity style={styles.editBtn}>
          <Ionicons name="camera" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
      <Text style={styles.labName}>Central Diagnostic Wing</Text>
      <Text style={styles.labId}>License ID: LIC-99283-X</Text>
      
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statNum}>1.2k</Text>
          <Text style={styles.statLabel}>Tests/mo</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>4.8</Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNum}>15</Text>
          <Text style={styles.statLabel}>Staff</Text>
        </View>
      </View>
    </View>

    <View style={styles.settingsSection}>
      <Text style={styles.sectionTitle}>Lab Settings</Text>
      {[
        { icon: 'time-outline', label: 'Operating Hours', val: '08:00 - 22:00' },
        { icon: 'location-outline', label: 'Lab Location', val: 'Building B, Floor 2' },
        { icon: 'mail-outline', label: 'Support Email', val: 'lab@hospital.com' },
        { icon: 'call-outline', label: 'Extension', val: '+44 (102)' },
      ].map((item, i) => (
        <TouchableOpacity key={i} style={styles.settingItem}>
          <View style={styles.settingIcon}>
            <Ionicons name={item.icon} size={20} color="#64748b" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.settingLabel}>{item.label}</Text>
            <Text style={styles.settingVal}>{item.val}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

export default function LabProfile() {
  return (
    <LabLayout>
      <LabProfileContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  profileCard: { backgroundColor: "#fff", borderRadius: 32, padding: 32, alignItems: "center", marginBottom: 32, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.05, shadowRadius: 20, elevation: 4 },
  avatarContainer: { position: "relative", marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center" },
  editBtn: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#1e293b", width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 3, borderColor: "#fff" },
  labName: { fontSize: 20, fontWeight: "900", color: "#1e293b" },
  labId: { fontSize: 12, color: "#94a3b8", marginTop: 4, fontWeight: "700" },
  statsRow: { flexDirection: "row", marginTop: 32, borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 24, width: "100%", justifyContent: "space-around" },
  stat: { alignItems: "center" },
  statNum: { fontSize: 18, fontWeight: "900", color: "#1e293b" },
  statLabel: { fontSize: 10, color: "#94a3b8", marginTop: 2, fontWeight: "700", textTransform: "uppercase" },
  settingsSection: { marginTop: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  settingItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 20, marginBottom: 12 },
  settingIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center", marginRight: 16 },
  settingLabel: { fontSize: 11, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" },
  settingVal: { fontSize: 14, fontWeight: "800", color: "#1e293b", marginTop: 2 }
});
