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
import ReceptionistLayout from "./ReceptionistLayout";

const AppointmentCard = ({ patientName, doctorName, time, type, status }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View>
        <Text style={styles.patientName}>{patientName}</Text>
        <Text style={styles.doctorName}>with {doctorName}</Text>
      </View>
      <View style={[styles.statusBadge, { backgroundColor: status === 'Confirmed' ? '#ecfdf5' : '#fffbeb' }]}>
        <Text style={[styles.statusText, { color: status === 'Confirmed' ? '#10b981' : '#f59e0b' }]}>{status}</Text>
      </View>
    </View>
    <View style={styles.cardFooter}>
      <View style={styles.footerItem}>
        <Ionicons name="time-outline" size={16} color="#64748b" />
        <Text style={styles.footerText}>{time}</Text>
      </View>
      <View style={styles.footerItem}>
        <Ionicons name="medical-outline" size={16} color="#64748b" />
        <Text style={styles.footerText}>{type}</Text>
      </View>
      <TouchableOpacity style={styles.actionButton}>
        <Text style={styles.actionButtonText}>Edit</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const AppointmentSchedulingScreen = () => {
  return (
    <ReceptionistLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Appointment Scheduling</Text>
          <Text style={styles.subtitle}>Manage and schedule patient visits</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput placeholder="Search appointments..." style={styles.searchInput} />
          <TouchableOpacity style={styles.filterBtn}>
            <Ionicons name="options-outline" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          <View style={styles.tabContainer}>
            <TouchableOpacity style={[styles.tab, styles.activeTab]}>
              <Text style={[styles.tabText, styles.activeTabText]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tab}>
              <Text style={styles.tabText}>Upcoming</Text>
            </TouchableOpacity>
          </View>

          <AppointmentCard patientName="Ravi Kumar" doctorName="Dr. Meena Rao" time="10:30 AM" type="Check-up" status="Confirmed" />
          <AppointmentCard patientName="Anita Sharma" doctorName="Dr. Sharma" time="11:00 AM" type="Consultation" status="Pending" />
          <AppointmentCard patientName="Suresh Patel" doctorName="Dr. Menon" time="11:30 AM" type="Follow-up" status="Confirmed" />
          <AppointmentCard patientName="Priya Singh" doctorName="Dr. Verma" time="12:00 PM" type="Lab Test" status="Confirmed" />
          <AppointmentCard patientName="Karan Johar" doctorName="Dr. Reddy" time="01:30 PM" type="Surgery" status="Confirmed" />
        </ScrollView>

        <TouchableOpacity style={styles.fab}>
          <Ionicons name="add" size={32} color="white" />
        </TouchableOpacity>
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
    marginBottom: 20,
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
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    color: "#1e293b",
  },
  filterBtn: {
    backgroundColor: "#2563eb",
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  activeTabText: {
    color: "#2563eb",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
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
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  doctorName: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f8fafc",
    paddingTop: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#475569",
    marginLeft: 6,
    fontWeight: "500",
  },
  actionButton: {
    marginLeft: "auto",
    backgroundColor: "#f8fafc",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default AppointmentSchedulingScreen;
