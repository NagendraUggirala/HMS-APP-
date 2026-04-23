import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";

const dummySuppliers = [
  { id: '1', name: 'PharmaCore Ltd', contact: 'John Doe', phone: '+1 234 567 890', rating: '4.8' },
  { id: '2', name: 'BioMed Supplies', contact: 'Sarah Smith', phone: '+1 987 654 321', rating: '4.5' },
];

const SupplierManagementContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Supplier Management</Text>
      <Text style={styles.subtitle}>Maintain relationships with medicine providers.</Text>
    </View>

    {dummySuppliers.map((supplier) => (
      <View key={supplier.id} style={styles.card}>
        <View style={styles.cardInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{supplier.name.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={styles.supplierName}>{supplier.name}</Text>
            <Text style={styles.contactPerson}>Contact: {supplier.contact}</Text>
          </View>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={12} color="#f59e0b" />
            <Text style={styles.ratingText}>{supplier.rating}</Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.contactBtn}>
            <Ionicons name="call" size={16} color="#2563eb" />
            <Text style={styles.contactBtnText}>Call Supplier</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.historyBtn}>
            <Text style={styles.historyBtnText}>Order History</Text>
          </TouchableOpacity>
        </View>
      </View>
    ))}
  </ScrollView>
);

export default function PharmacySupplierManagement() {
  return (
    <PharmacyLayout>
      <SupplierManagementContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 16 },
  cardInfo: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: "#eff6ff", alignItems: "center", justify: "center" },
  avatarText: { fontSize: 20, fontWeight: "900", color: "#2563eb", marginTop: 10, textAlign: 'center' },
  supplierName: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  contactPerson: { fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: "600" },
  ratingBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fffbeb", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 12, fontWeight: "800", color: "#f59e0b", marginLeft: 4 },
  cardActions: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  contactBtn: { flexDirection: "row", alignItems: "center" },
  contactBtnText: { color: "#2563eb", fontWeight: "700", marginLeft: 8, fontSize: 13 },
  historyBtn: { backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  historyBtnText: { color: "#475569", fontWeight: "700", fontSize: 12 }
});
