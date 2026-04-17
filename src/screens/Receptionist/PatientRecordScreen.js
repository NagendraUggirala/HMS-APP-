import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";
import { api } from "../../services/api";

const formatDate = (isoDate) => {
  if (!isoDate) return "N/A";
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const RecordItem = ({ patient }) => (
  <View style={styles.recordCard}>
    <View style={styles.avatar}>
      <Ionicons name="person" size={24} color="#2563eb" />
    </View>
    <View style={styles.recordInfo}>
      <Text style={styles.recordName}>{patient.name || "Unnamed Patient"}</Text>
      <Text style={styles.recordId}>ID: {patient.patient_id || "N/A"}</Text>
      <Text style={styles.recordEmail}>{patient.email || "No email available"}</Text>
      <Text style={styles.lastVisit}>Registered: {formatDate(patient.created_at)}</Text>
    </View>
    <TouchableOpacity style={styles.viewBtn}>
      <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
    </TouchableOpacity>
  </View>
);

const PatientRecordScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [patients, setPatients] = useState([]);
  const [totalPatients, setTotalPatients] = useState(0);

  const fetchPatients = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError("");
    try {
      const response = await api.getAllPatientsDebug();
      const list = Array.isArray(response?.patients) ? response.patients : [];
      setPatients(list);
      setTotalPatients(
        Number.isFinite(response?.total_patients) ? response.total_patients : list.length
      );
    } catch (err) {
      setError(err?.message || "Unable to fetch patient records.");
      setPatients([]);
      setTotalPatients(0);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filteredPatients = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return patients;
    return patients.filter((item) =>
      [item?.name, item?.patient_id, item?.email]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    );
  }, [patients, searchTerm]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPatients(true);
  };

  if (loading && !refreshing) {
    return (
      <ReceptionistLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading patient records...</Text>
        </View>
      </ReceptionistLayout>
    );
  }

  return (
    <ReceptionistLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Patient Records</Text>
          <Text style={styles.subtitle}>Access and manage registered patient records</Text>
          <Text style={styles.countText}>Total Patients: {totalPatients}</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Search by name, patient ID or email..."
            style={styles.searchInput}
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {searchTerm ? (
            <TouchableOpacity onPress={() => setSearchTerm("")}>
              <Ionicons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          ) : null}
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle-outline" size={18} color="#ef4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchPatients()}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {filteredPatients.length > 0 ? (
            filteredPatients.map((patient) => (
              <RecordItem key={patient.patient_id || `${patient.name}-${patient.created_at}`} patient={patient} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={32} color="#94a3b8" />
              <Text style={styles.emptyTitle}>No patient records found</Text>
              <Text style={styles.emptySub}>
                {searchTerm ? "Try changing your search query." : "No patients available yet."}
              </Text>
            </View>
          )}
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
  countText: { fontSize: 12, color: "#2563eb", marginTop: 6, fontWeight: "700" },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "white", borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: "#f1f5f9", marginBottom: 20 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: "#1e293b" },
  recordCard: { flexDirection: "row", alignItems: "center", backgroundColor: "white", padding: 16, borderRadius: 20, marginBottom: 16, borderWidth: 1, borderColor: "#f1f5f9" },
  avatar: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 16 },
  recordInfo: { flex: 1 },
  recordName: { fontSize: 16, fontWeight: "bold", color: "#1e293b" },
  recordId: { fontSize: 12, color: "#64748b", marginTop: 3 },
  recordEmail: { fontSize: 12, color: "#334155", marginTop: 3 },
  lastVisit: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  viewBtn: { padding: 8 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748b",
    fontSize: 14,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff1f2",
    borderColor: "#fecdd3",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: "#be123c",
  },
  retryBtn: {
    backgroundColor: "#ffe4e6",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  retryText: {
    color: "#be123c",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  emptyTitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: "700",
    color: "#334155",
  },
  emptySub: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
  },
});

export default PatientRecordScreen;
