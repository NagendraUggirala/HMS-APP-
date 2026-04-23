import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";

const dummyInventory = [
  { id: 'MED-001', name: 'Paracetamol 500mg', category: 'Analgesic', stock: 1200, unit: 'Tablets', status: 'In Stock' },
  { id: 'MED-002', name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 450, unit: 'Capsules', status: 'In Stock' },
  { id: 'MED-003', name: 'Insulin Glargine', category: 'Antidiabetic', stock: 15, unit: 'Vials', status: 'Low Stock' },
];

const InventoryContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Inventory Management</Text>
      <Text style={styles.subtitle}>Track and manage medicine stock levels.</Text>
    </View>

    <View style={styles.searchBar}>
      <Ionicons name="search-outline" size={20} color="#94a3b8" />
      <TextInput style={styles.searchInput} placeholder="Search medicine, category or ID..." />
    </View>

    {dummyInventory.map((item) => (
      <View key={item.id} style={styles.card}>
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.medName}>{item.name}</Text>
            <Text style={styles.category}>{item.category}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: item.status === 'Low Stock' ? '#fef2f2' : '#ecfdf5' }]}>
            <Text style={[styles.statusText, { color: item.status === 'Low Stock' ? '#ef4444' : '#10b981' }]}>{item.status}</Text>
          </View>
        </View>
        <View style={styles.cardBottom}>
          <View>
            <Text style={styles.stockLabel}>Available Stock</Text>
            <Text style={styles.stockValue}>{item.stock} {item.unit}</Text>
          </View>
          <TouchableOpacity style={styles.updateBtn}>
            <Text style={styles.updateBtnText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </ScrollView>
);

export default function PharmacyInventory() {
  return (
    <PharmacyLayout>
      <InventoryContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, paddingHorizontal: 16, height: 56, marginBottom: 24, borderWidth: 1, borderColor: "#e2e8f0" },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  medName: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  category: { fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  stockLabel: { fontSize: 11, fontWeight: "700", color: "#94a3b8" },
  stockValue: { fontSize: 18, fontWeight: "900", color: "#1e293b", marginTop: 2 },
  updateBtn: { backgroundColor: "#2563eb", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  updateBtnText: { color: "#fff", fontWeight: "700", fontSize: 12 }
});
