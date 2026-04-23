import React from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";

const { width } = Dimensions.get("window");

const SalesTrackingContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Sales Tracking</Text>
      <Text style={styles.subtitle}>Analyze pharmacy sales and revenue trends.</Text>
    </View>

    <View style={styles.statGrid}>
      <View style={[styles.statCard, { backgroundColor: '#eff6ff' }]}>
        <Text style={styles.statLabel}>Today's Sales</Text>
        <Text style={styles.statValue}>$4,250</Text>
        <View style={styles.trendContainer}>
          <Ionicons name="trending-up" size={14} color="#10b981" />
          <Text style={styles.trendText}>+12% vs yesterday</Text>
        </View>
      </View>
      <View style={[styles.statCard, { backgroundColor: '#fdf2f8' }]}>
        <Text style={styles.statLabel}>Total Bills</Text>
        <Text style={styles.statValue}>128</Text>
        <View style={styles.trendContainer}>
          <Ionicons name="trending-down" size={14} color="#ef4444" />
          <Text style={styles.trendText}>-3% vs yesterday</Text>
        </View>
      </View>
    </View>

    <View style={styles.recentTransactions}>
      <Text style={styles.sectionTitle}>Recent Transactions</Text>
      {[1, 2, 3].map((i) => (
        <View key={i} style={styles.transactionItem}>
          <View style={styles.transactionIcon}>
            <Ionicons name="receipt-outline" size={20} color="#2563eb" />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.transactionId}>Invoice #INV-204{i}</Text>
            <Text style={styles.transactionDate}>23 Apr 2024, 02:30 PM</Text>
          </View>
          <Text style={styles.transactionAmount}>$45.00</Text>
        </View>
      ))}
    </View>
  </ScrollView>
);

export default function PharmacySalesTracking() {
  return (
    <PharmacyLayout>
      <SalesTrackingContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  statGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 24 },
  statCard: { width: (width - 52) / 2, padding: 20, borderRadius: 24 },
  statLabel: { fontSize: 11, fontWeight: "700", color: "#64748b", textTransform: "uppercase" },
  statValue: { fontSize: 22, fontWeight: "900", color: "#1e293b", marginTop: 8 },
  trendContainer: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  trendText: { fontSize: 10, fontWeight: "700", color: "#64748b", marginLeft: 4 },
  recentTransactions: { backgroundColor: "#fff", borderRadius: 24, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b", marginBottom: 16 },
  transactionItem: { flexDirection: "row", alignItems: "center", marginBottom: 16, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  transactionIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  transactionId: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  transactionDate: { fontSize: 11, color: "#94a3b8", marginTop: 2, fontWeight: "600" },
  transactionAmount: { fontSize: 15, fontWeight: "900", color: "#10b981" }
});
