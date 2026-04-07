import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import DoctorLayout, { useSidebar } from "./DoctorLayout";

const InpatientCard = ({ patientName, ward, room, admissionDate, condition }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{patientName.split(' ')[0][0]}{patientName.split(' ')[1][0]}</Text>
      </View>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{patientName}</Text>
        <Text style={styles.roomInfo}>Ward: {ward} | Room: {room}</Text>
      </View>
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={20} color="#64748b" />
      </TouchableOpacity>
    </View>

    <View style={styles.detailsContainer}>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Admission Date</Text>
        <Text style={styles.detailValue}>{admissionDate}</Text>
      </View>
      <View style={styles.detailItem}>
        <Text style={styles.detailLabel}>Current Condition</Text>
        <View style={styles.conditionBadge}>
          <Text style={styles.conditionText}>{condition}</Text>
        </View>
      </View>
    </View>

    <View style={styles.actions}>
      <TouchableOpacity style={styles.secondaryAction}>
        <Text style={styles.secondaryActionText}>View Vitals</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.primaryAction}>
        <Text style={styles.primaryActionText}>Record Visit</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const InpatientVisitsContent = () => {
  const { toggleSidebar } = useSidebar();

  const patients = [
    { id: 1, patientName: "Robert Wilson", ward: "Cardiology", room: "302-A", admissionDate: "Oct 12, 2023", condition: "Stable" },
    { id: 2, patientName: "Linda Garcia", ward: "General Surgery", room: "215-B", admissionDate: "Oct 14, 2023", condition: "Critical" },
    { id: 3, patientName: "William Taylor", ward: "Orthopedics", room: "108", admissionDate: "Oct 10, 2023", condition: "Improving" },
    { id: 4, patientName: "Emma Brown", ward: "Neurology", room: "405-C", admissionDate: "Oct 15, 2023", condition: "Stable" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={toggleSidebar} style={styles.menuButton}>
          <Ionicons name="menu-outline" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Inpatient Visits</Text>
        <TouchableOpacity style={styles.addButton}>
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>18</Text>
          <Text style={styles.statLabel}>Total Patients</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: "#f43f5e" }]}>4</Text>
          <Text style={styles.statLabel}>Critical</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={[styles.statNumber, { color: "#10b981" }]}>12</Text>
          <Text style={styles.statLabel}>Recovering</Text>
        </View>
      </View>

      <FlatList
        data={patients}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <InpatientCard {...item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default function InpatientVisits() {
  return (
    <DoctorLayout>
      <InpatientVisitsContent />
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
  statsRow: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#1e293b",
  },
  statLabel: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#2563eb",
    fontWeight: "700",
    fontSize: 14,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1e293b",
  },
  roomInfo: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  detailsContainer: {
    flexDirection: "row",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#f1f5f9",
    marginBottom: 16,
  },
  detailItem: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: "#94a3b8",
    marginBottom: 4,
    fontWeight: "600",
  },
  detailValue: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "600",
  },
  conditionBadge: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  conditionText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryActionText: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "600",
  },
});
