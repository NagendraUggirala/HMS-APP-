import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const { width } = Dimensions.get("window");

const testCategories = [
  { id: '1', name: 'Hematology', count: 42, icon: 'water-outline' },
  { id: '2', name: 'Biochemistry', count: 128, icon: 'beaker-outline' },
  { id: '3', name: 'Microbiology', count: 56, icon: 'bug-outline' },
  { id: '4', name: 'Immunology', count: 34, icon: 'shield-outline' },
];

const TestCatalogueContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Test Catalogue</Text>
      <Text style={styles.subtitle}>Browse and manage the directory of available tests.</Text>
    </View>

    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={20} color="#94a3b8" />
      <TextInput style={styles.searchInput} placeholder="Search for a test name or code..." />
    </View>

    <Text style={styles.sectionTitle}>Categories</Text>
    <View style={styles.categoryGrid}>
      {testCategories.map((cat) => (
        <TouchableOpacity key={cat.id} style={styles.categoryCard}>
          <View style={styles.categoryIcon}>
            <Ionicons name={cat.icon} size={24} color="#6366f1" />
          </View>
          <Text style={styles.categoryName}>{cat.name}</Text>
          <Text style={styles.categoryCount}>{cat.count} Tests</Text>
        </TouchableOpacity>
      ))}
    </View>

    <View style={styles.ctaBox}>
      <View style={{ flex: 1 }}>
        <Text style={styles.ctaTitle}>Can't find a test?</Text>
        <Text style={styles.ctaDesc}>Request to add a new diagnostic test to the catalogue.</Text>
      </View>
      <TouchableOpacity style={styles.ctaBtn}>
        <Text style={styles.ctaBtnText}>Request New</Text>
      </TouchableOpacity>
    </View>
  </ScrollView>
);

export default function TestCatalogue() {
  return (
    <LabLayout>
      <TestCatalogueContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 32, borderWidth: 1, borderColor: "#e2e8f0" },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  categoryCard: { width: (width - 56) / 2, backgroundColor: "#fff", padding: 20, borderRadius: 24, marginBottom: 16, alignItems: "center", borderBottomWidth: 4, borderBottomColor: "#6366f1" },
  categoryIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#eef2ff", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  categoryName: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  categoryCount: { fontSize: 11, color: "#94a3b8", marginTop: 4, fontWeight: "600" },
  ctaBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#1e293b", padding: 24, borderRadius: 24, marginTop: 20 },
  ctaTitle: { color: "#fff", fontSize: 16, fontWeight: "800" },
  ctaDesc: { color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 4 },
  ctaBtn: { backgroundColor: "#6366f1", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, marginLeft: 16 },
  ctaBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 }
});
