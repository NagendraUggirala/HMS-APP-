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

const AppointmentCard = ({ patientName, time, type, status, phone }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.patientName}>{patientName}</Text>
        <Text style={styles.appointmentTime}>{time}</Text>
      </View>
      <View style={[styles.statusBadge, status === 'Confirmed' ? styles.statusConfirmed : styles.statusPending]}>
        <Text style={[styles.statusText, status === 'Confirmed' ? styles.textConfirmed : styles.textPending]}>{status}</Text>
      </View>
    </View>
    
    <View style={styles.cardBody}>
      <View style={styles.infoRow}>
        <Ionicons name="medical-outline" size={16} color="#64748b" />
        <Text style={styles.infoText}>{type}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="call-outline" size={16} color="#64748b" />
        <Text style={styles.infoText}>{phone}</Text>
      </View>
    </View>

    <View style={styles.cardFooter}>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.btnTextSecondary}>Reschedule</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.actionButton, styles.btnPrimary]}>
        <Text style={styles.btnTextPrimary}>Check In</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const AppointmentsContent = () => {
  const { toggleSidebar } = useSidebar();

  const appointments = [
    { id: 1, patientName: "John Doe", time: "09:00 AM", type: "Follow-up", status: "Confirmed", phone: "+1 234 567 890" },
    { id: 2, patientName: "Sarah Smith", time: "10:30 AM", type: "First Visit", status: "Pending", phone: "+1 987 654 321" },
    { id: 3, patientName: "Michael Johnson", time: "11:45 AM", type: "Consultation", status: "Confirmed", phone: "+1 555 123 456" },
    { id: 4, patientName: "Emily Davis", time: "02:15 PM", type: "Routine Checkup", status: "Confirmed", phone: "+1 444 777 888" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <TouchableOpacity style={styles.filterButton}>
          <Ionicons name="filter-outline" size={20} color="#64748b" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        {appointments.map(apt => (
          <AppointmentCard key={apt.id} {...apt} />
        ))}
      </ScrollView>
    </View>
  );
};

export default function AppointmentsScreen() {
  return (
    <DoctorLayout>
      <AppointmentsContent />
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
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
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
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 15,
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  appointmentTime: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusConfirmed: {
    backgroundColor: "#f0fdf4",
  },
  statusPending: {
    backgroundColor: "#fff7ed",
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  textConfirmed: {
    color: "#15803d",
  },
  textPending: {
    color: "#c2410c",
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    paddingTop: 12,
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    fontSize: 13,
    color: "#475569",
    marginLeft: 8,
  },
  cardFooter: {
    flexDirection: "row",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
  },
  btnTextPrimary: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  btnTextSecondary: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
});
