import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorLayout, { useSidebar } from "./DoctorLayout";

const LabResultCard = ({ patientName, testName, date, status, priority }) => (
  <View style={styles.card}>
    <View style={styles.cardInfo}>
      <View style={styles.testHeader}>
        <Text style={styles.testName}>{testName}</Text>
        {priority === 'High' && (
          <View style={styles.priorityBadge}>
            <Text style={styles.priorityText}>URGENT</Text>
          </View>
        )}
      </View>
      <Text style={styles.patientName}>{patientName}</Text>
      <Text style={styles.dateText}>Ordered on: {date}</Text>
    </View>
    
    <View style={styles.cardActions}>
      <View style={[styles.statusIndicator, status === 'Ready' ? styles.statusReady : styles.statusPending]}>
        <Text style={[styles.statusText, status === 'Ready' ? styles.textReady : styles.textPending]}>
          {status}
        </Text>
      </View>
      <TouchableOpacity style={styles.viewButton}>
        <Ionicons name="eye-outline" size={18} color="#2563eb" />
        <Text style={styles.viewButtonText}>View Report</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const LabResultsContent = () => {
  const { toggleSidebar } = useSidebar();

  const results = [
    { id: 1, patientName: "James Wilson", testName: "Complete Blood Count (CBC)", date: "Oct 15, 2023", status: "Ready", priority: "Normal" },
    { id: 2, patientName: "Maria Rodriguez", testName: "Lipid Panel", date: "Oct 16, 2023", status: "Pending", priority: "Normal" },
    { id: 3, patientName: "David Chen", testName: "Chest X-Ray", date: "Oct 16, 2023", status: "Ready", priority: "High" },
    { id: 4, patientName: "Sarah Taylor", testName: "Urinalysis", date: "Oct 14, 2023", status: "Ready", priority: "Normal" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lab & Imaging</Text>
        <TouchableOpacity style={styles.searchButton}>
          <Ionicons name="search-outline" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Recent Results</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Pending Orders</Text>
          </TouchableOpacity>
        </View>

        {results.map(item => (
          <LabResultCard key={item.id} {...item} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function LabResults() {
  return (
    <DoctorLayout>
      <LabResultsContent />
    </DoctorLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
  },
  menuButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  searchButton: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#2563eb",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardInfo: {
    marginBottom: 15,
  },
  testHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  testName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: "#fee2e2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#ef4444",
  },
  patientName: {
    fontSize: 14,
    color: "#334155",
    fontWeight: "600",
    marginBottom: 2,
  },
  dateText: {
    fontSize: 12,
    color: "#94a3b8",
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusReady: {
    backgroundColor: "#dcfce7",
  },
  statusPending: {
    backgroundColor: "#fef9c3",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  textReady: {
    color: "#166534",
  },
  textPending: {
    color: "#854d0e",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  viewButtonText: {
    fontSize: 13,
    color: "#2563eb",
    fontWeight: "600",
  },
});
