import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const dummyAccessLogs = [
  { id: '1', user: 'Dr. Sarah Wilson', patient: 'Alice Johnson', time: '10 mins ago', action: 'Viewed' },
  { id: '2', user: 'Receptionist John', patient: 'Bob Brown', time: '25 mins ago', action: 'Downloaded' },
  { id: '3', user: 'Dr. Mike Ross', patient: 'Clara Oswald', time: '1 hour ago', action: 'Viewed' },
];

const ResultAccessContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Result Access</Text>
      <Text style={styles.subtitle}>Control and monitor who can view patient results.</Text>
    </View>

    <View style={styles.securityBanner}>
      <Ionicons name="shield-checkmark" size={24} color="#fff" />
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.bannerTitle}>Data Protection Active</Text>
        <Text style={styles.bannerSubtitle}>All access is being logged for HIPAA compliance.</Text>
      </View>
    </View>

    <View style={styles.searchContainer}>
      <TextInput style={styles.searchBox} placeholder="Search by patient ID..." />
      <TouchableOpacity style={styles.searchBtn}>
        <Text style={styles.searchBtnText}>Search</Text>
      </TouchableOpacity>
    </View>

    <Text style={styles.sectionTitle}>Recent Access Activity</Text>
    {dummyAccessLogs.map((log) => (
      <View key={log.id} style={styles.logCard}>
        <View style={styles.logIcon}>
          <Ionicons name={log.action === 'Viewed' ? 'eye-outline' : 'download-outline'} size={18} color="#64748b" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.logText}>
            <Text style={styles.boldText}>{log.user}</Text> {log.action.toLowerCase()} 
            <Text style={styles.boldText}> {log.patient}'s</Text> report
          </Text>
          <Text style={styles.logTime}>{log.time}</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="information-circle-outline" size={20} color="#cbd5e1" />
        </TouchableOpacity>
      </View>
    ))}

    <TouchableOpacity style={styles.permissionBtn}>
      <Text style={styles.permissionBtnText}>Manage Permissions</Text>
      <Ionicons name="settings-outline" size={18} color="#fff" />
    </TouchableOpacity>
  </ScrollView>
);

export default function ResultAccess() {
  return (
    <LabLayout>
      <ResultAccessContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  securityBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#06b6d4", padding: 20, borderRadius: 20, marginBottom: 24 },
  bannerTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  bannerSubtitle: { color: "rgba(255,255,255,0.8)", fontSize: 12, marginTop: 2 },
  searchContainer: { flexDirection: "row", marginBottom: 32 },
  searchBox: { flex: 1, backgroundColor: "#fff", height: 50, borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: "#e2e8f0", marginRight: 10, fontWeight: "600" },
  searchBtn: { backgroundColor: "#1e293b", paddingHorizontal: 20, borderRadius: 12, justifyContent: "center" },
  searchBtnText: { color: "#fff", fontWeight: "700" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  logCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 10 },
  logIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginRight: 16 },
  logText: { fontSize: 13, color: "#475569" },
  boldText: { fontWeight: "700", color: "#1e293b" },
  logTime: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  permissionBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1e293b", height: 56, borderRadius: 16, marginTop: 20 },
  permissionBtnText: { color: "#fff", fontWeight: "700", marginRight: 10 }
});
