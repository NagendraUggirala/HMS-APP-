import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";

const dummyOrders = [
  { id: 'PO-9921', supplier: 'PharmaCore Ltd', date: '22 Apr 2024', amount: '$1,200', status: 'Delivered' },
  { id: 'PO-9925', supplier: 'BioMed Supplies', date: '23 Apr 2024', amount: '$4,500', status: 'Pending' },
];

const PurchaseOrdersContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Purchase Orders</Text>
      <Text style={styles.subtitle}>Manage procurement and supplier orders.</Text>
    </View>

    <TouchableOpacity style={styles.newOrderBtn}>
      <Ionicons name="add" size={24} color="#fff" />
      <Text style={styles.newOrderBtnText}>Create New Order</Text>
    </TouchableOpacity>

    {dummyOrders.map((order) => (
      <View key={order.id} style={styles.orderCard}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.orderId}>{order.id}</Text>
            <Text style={styles.supplierName}>{order.supplier}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: order.status === 'Pending' ? '#fffbeb' : '#ecfdf5' }]}>
            <Text style={[styles.statusText, { color: order.status === 'Pending' ? '#f59e0b' : '#10b981' }]}>{order.status}</Text>
          </View>
        </View>
        <View style={styles.cardFooter}>
          <View>
            <Text style={styles.footerLabel}>Total Amount</Text>
            <Text style={styles.footerValue}>{order.amount}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.footerLabel}>Order Date</Text>
            <Text style={styles.footerValue}>{order.date}</Text>
          </View>
        </View>
      </View>
    ))}
  </ScrollView>
);

export default function PharmacyPurchaseOrders() {
  return (
    <PharmacyLayout>
      <PurchaseOrdersContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  newOrderBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#1e293b", height: 56, borderRadius: 16, marginBottom: 24 },
  newOrderBtnText: { color: "#fff", fontWeight: "700", marginLeft: 10 },
  orderCard: { backgroundColor: "#fff", borderRadius: 24, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  orderId: { fontSize: 12, fontWeight: "800", color: "#2563eb" },
  supplierName: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: "800", textTransform: "uppercase" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#f1f5f9", paddingTop: 16 },
  footerLabel: { fontSize: 10, fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" },
  footerValue: { fontSize: 14, fontWeight: "800", color: "#1e293b", marginTop: 2 }
});
