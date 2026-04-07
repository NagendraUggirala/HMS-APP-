import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DoctorLayout, { useSidebar } from "./DoctorLayout";

const PatientRecordCard = ({ name, age, gender, bloodType, lastVisit }) => (
  <TouchableOpacity style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.split(' ').map(n=>n[0]).join('')}</Text>
      </View>
      <View style={styles.headerInfo}>
        <Text style={styles.patientName}>{name}</Text>
        <Text style={styles.patientMeta}>{age} yrs • {gender} • {bloodType}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
    </View>
    <View style={styles.cardFooter}>
      <Text style={styles.lastVisitLabel}>Last Visit:</Text>
      <Text style={styles.lastVisitValue}>{lastVisit}</Text>
    </View>
  </TouchableOpacity>
);

const PatientRecordsContent = () => {
  const { toggleSidebar } = useSidebar();

  const patients = [
    { id: 1, name: "Alice Johnson", age: 28, gender: "Female", bloodType: "O+", lastVisit: "Oct 10, 2023" },
    { id: 2, name: "Bob Smith", age: 45, gender: "Male", bloodType: "A-", lastVisit: "Sep 25, 2023" },
    { id: 3, name: "Charlie Brown", age: 10, gender: "Male", bloodType: "B+", lastVisit: "Oct 12, 2023" },
    { id: 4, name: "Diana Prince", age: 32, gender: "Female", bloodType: "AB+", lastVisit: "Oct 05, 2023" },
    { id: 5, name: "Ethan Hunt", age: 50, gender: "Male", bloodType: "O-", lastVisit: "Aug 30, 2023" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Patient Records</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="options-outline" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <TextInput 
            placeholder="Search by name, ID or phone..." 
            style={styles.searchInput} 
            placeholderTextColor="#94a3b8" 
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryNumber}>1,248</Text>
            <Text style={styles.summaryLabel}>Total Records</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: '#eff6ff' }]}>
            <Text style={[styles.summaryNumber, { color: '#2563eb' }]}>42</Text>
            <Text style={styles.summaryLabel}>New this month</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Recently Accessed</Text>
        {patients.map(patient => (
          <PatientRecordCard key={patient.id} {...patient} />
        ))}
        
        <TouchableOpacity style={styles.loadMoreButton}>
          <Text style={styles.loadMoreText}>View All Records</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default function PatientRecordsScree() {
  return (
    <DoctorLayout>
      <PatientRecordsContent />
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
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 48,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: "#1e293b",
  },
  scrollContent: {
    padding: 20,
  },
  summaryContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 25,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  summaryLabel: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  headerInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  patientMeta: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
  },
  lastVisitLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginRight: 6,
  },
  lastVisitValue: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  loadMoreButton: {
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  loadMoreText: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "700",
  },
});
