import React from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";

const MedicineDatabaseContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Medicine Database</Text>
      <Text style={styles.subtitle}>Browse and search pharmacological information.</Text>
    </View>

    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={20} color="#94a3b8" />
      <TextInput style={styles.searchInput} placeholder="Search 5000+ medicines..." />
    </View>

    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Recently Accessed</Text>
      {[1, 2, 3].map((i) => (
        <TouchableOpacity key={i} style={styles.medItem}>
          <View style={styles.medIcon}>
            <Ionicons name="medical-outline" size={20} color="#6366f1" />
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.medName}>Atorvastatin Calcium</Text>
            <Text style={styles.medSub}>Statin Medication • 20mg Tablets</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
);

export default function PharmacyMedicineDatabase() {
  return (
    <PharmacyLayout>
      <MedicineDatabaseContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 24 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: "600" },
  section: { marginTop: 8 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginBottom: 16 },
  medItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 20, marginBottom: 12 },
  medIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center" },
  medName: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  medSub: { fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: "600" }
});
