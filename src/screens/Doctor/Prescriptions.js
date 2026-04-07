import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import DoctorLayout, { useSidebar } from "./DoctorLayout";

const PrescriptionItem = ({ patientName, medicine, dosage, duration, date, active }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.medicIcon}>
        <MaterialCommunityIcons name="pill" size={20} color="#2563eb" />
      </View>
      <View style={styles.mainInfo}>
        <Text style={styles.medicineName}>{medicine}</Text>
        <Text style={styles.patientName}>{patientName}</Text>
      </View>
      <View style={[styles.activeBadge, active ? styles.activeBg : styles.inactiveBg]}>
        <Text style={[styles.activeText, active ? styles.activeColor : styles.inactiveColor]}>
          {active ? 'Active' : 'Completed'}
        </Text>
      </View>
    </View>

    <View style={styles.metaRow}>
      <View style={styles.metaItem}>
        <Ionicons name="time-outline" size={14} color="#94a3b8" />
        <Text style={styles.metaText}>{dosage}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
        <Text style={styles.metaText}>{duration}</Text>
      </View>
      <View style={styles.metaItem}>
        <Ionicons name="document-text-outline" size={14} color="#94a3b8" />
        <Text style={styles.metaText}>{date}</Text>
      </View>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity style={styles.actionBtn}>
        <Ionicons name="repeat-outline" size={18} color="#64748b" />
        <Text style={styles.actionBtnText}>Renewal</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionBtn, styles.editBtn]}>
        <Ionicons name="create-outline" size={18} color="#2563eb" />
        <Text style={[styles.actionBtnText, { color: '#2563eb' }]}>Edit</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const PrescriptionsContent = () => {
  const { toggleSidebar } = useSidebar();

  const prescriptions = [
    { id: 1, patientName: "Sarah Connor", medicine: "Amlodipine 5mg", dosage: "Once daily", duration: "30 Days", date: "Oct 12, 2023", active: true },
    { id: 2, patientName: "John Smith", medicine: "Amoxicillin 500mg", dosage: "Three times daily", duration: "7 Days", date: "Oct 14, 2023", active: true },
    { id: 3, patientName: "Michael Brown", medicine: "Metformin 500mg", dosage: "Twice daily", duration: "90 Days", date: "Sep 01, 2023", active: false },
    { id: 4, patientName: "Emily Davis", medicine: "Ibuprofen 400mg", dosage: "As needed", duration: "14 Days", date: "Oct 15, 2023", active: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Prescriptions</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color="#94a3b8" />
          <Text style={styles.searchPlaceholder}>Search prescriptions...</Text>
        </View>

        <View style={styles.quickFilters}>
          <TouchableOpacity style={[styles.filterChip, styles.activeChip]}>
            <Text style={[styles.chipText, styles.activeChipText]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.chipText}>Active</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterChip}>
            <Text style={styles.chipText}>Recent</Text>
          </TouchableOpacity>
        </View>

        {prescriptions.map(item => (
          <PrescriptionItem key={item.id} {...item} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function Prescriptions() {
  return (
    <DoctorLayout>
      <PrescriptionsContent />
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
  addButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: "#2563eb",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  searchPlaceholder: {
    marginLeft: 10,
    fontSize: 14,
    color: "#94a3b8",
  },
  quickFilters: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  activeChip: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  chipText: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "600",
  },
  activeChipText: {
    color: "#fff",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  medicIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#eff6ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  mainInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 2,
  },
  patientName: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  activeBg: {
    backgroundColor: "#f0fdf4",
  },
  inactiveBg: {
    backgroundColor: "#f1f5f9",
  },
  activeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  activeColor: {
    color: "#16a34a",
  },
  inactiveColor: {
    color: "#64748b",
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f8fafc",
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "600",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    gap: 6,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748b",
  },
  editBtn: {
    backgroundColor: "#eff6ff",
    borderColor: "#dbeafe",
  },
});
