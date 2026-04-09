import React from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";

const RecordItem = ({ name, id, gender, age, lastVisit }) => (
  <View style={styles.recordCard}>
    <View style={styles.avatar}>
       <Ionicons name="person" size={24} color="#2563eb" />
    </View>
    <View style={styles.recordInfo}>
      <Text style={styles.recordName}>{name}</Text>
      <Text style={styles.recordId}>ID: {id} • {gender}, {age}</Text>
      <Text style={styles.lastVisit}>Last Visit: {lastVisit}</Text>
    </View>
    <TouchableOpacity style={styles.viewBtn}>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  </View>
);

const PatientRecordScreen = () => {
  return (
    <ReceptionistLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Patient Records</Text>
          <Text style={styles.subtitle}>Access and manage patient medical history</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput placeholder="Search by name or ID..." style={styles.searchInput} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <RecordItem name="Ravi Kumar" id="P-1001" gender="Male" age="34" lastVisit="Today" />
          <RecordItem name="Anita Sharma" id="P-1002" gender="Female" age="28" lastVisit="Today" />
          <RecordItem name="Suresh Patel" id="P-1003" gender="Male" age="52" lastVisit="Yesterday" />
          <RecordItem name="Priya Singh" id="P-1004" gender="Female" age="24" lastVisit="07 Apr 2026" />
          <RecordItem name="Rajesh Kumar" id="P-1005" gender="Male" age="45" lastVisit="05 Apr 2026" />
        </ScrollView>
      </View>
    </ReceptionistLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: "#1e293b" },
  recordCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  avatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 16 },
  recordInfo: { flex: 1 },
  recordName: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  recordId: { fontSize: 12, color: "#64748b", marginTop: 2 },
  lastVisit: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  viewBtn: { padding: 8 },
});

export default PatientRecordScreen;
