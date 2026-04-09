import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";

const BillCard = ({ patientName, billId, amount, date, status }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.billId}>{billId}</Text>
        <Text style={styles.patientName}>{patientName}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: status === 'Paid' ? '#ecfdf5' : '#fef2f2' }]}>
        <Text style={[styles.statusText, { color: status === 'Paid' ? '#10b981' : '#ef4444' }]}>{status}</Text>
      </View>
    </View>
    <View style={styles.cardFooter}>
      <Text style={styles.amount}>₹{amount}</Text>
      <Text style={styles.date}>{date}</Text>
      <TouchableOpacity style={styles.payButton}>
        <Text style={styles.payButtonText}>{status === 'Paid' ? 'Receipt' : 'Collect'}</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const BillingScreen = () => {
  return (
    <ReceptionistLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Billing Management</Text>
          <Text style={styles.subtitle}>Track payments and generate invoices</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Pending Bills</Text>
            <Text style={styles.statValue}>8</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statLabel}>Today's Collection</Text>
            <Text style={[styles.statValue, { color: '#10b981' }]}>₹45,200</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <Text style={styles.sectionTitle}>Recent Bills</Text>
          <BillCard patientName="Rajesh Kumar" billId="INV-2024-001" amount="1,500" date="09 Apr 2026" status="Paid" />
          <BillCard patientName="Priya Singh" billId="INV-2024-002" amount="3,200" date="09 Apr 2026" status="Unpaid" />
          <BillCard patientName="Amit Patel" billId="INV-2024-003" amount="800" date="09 Apr 2026" status="Unpaid" />
          <BillCard patientName="Sunita Devi" billId="INV-2024-004" amount="12,500" date="08 Apr 2026" status="Paid" />
        </ScrollView>
      </View>
    </ReceptionistLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0f172a",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  billId: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "bold",
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    paddingTop: 16,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  date: {
    fontSize: 12,
    color: "#94a3b8",
  },
  payButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  payButtonText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
  },
});

export default BillingScreen;
