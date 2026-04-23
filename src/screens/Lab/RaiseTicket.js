import React from "react";
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import LabLayout from "./LabLayout";

const RaiseTicketContent = () => (
  <ScrollView style={styles.container} contentContainerStyle={styles.content}>
    <View style={styles.header}>
      <Text style={styles.title}>Raise Ticket</Text>
      <Text style={styles.subtitle}>Report issues with equipment, software, or samples.</Text>
    </View>

    <View style={styles.formCard}>
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Issue Category</Text>
        <View style={styles.pickerPlaceholder}>
          <Text style={styles.pickerText}>Select a category...</Text>
          <Ionicons name="chevron-down" size={16} color="#94a3b8" />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subject</Text>
        <TextInput style={styles.textInput} placeholder="Brief summary of the issue" />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Description</Text>
        <TextInput 
          style={[styles.textInput, styles.textArea]} 
          placeholder="Provide detailed information..." 
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Priority</Text>
        <View style={styles.priorityRow}>
          {['Low', 'Medium', 'High'].map((p) => (
            <TouchableOpacity key={p} style={[styles.priorityBtn, p === 'Medium' && styles.priorityBtnActive]}>
              <Text style={[styles.priorityBtnText, p === 'Medium' && styles.priorityBtnTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.submitBtn}>
        <Text style={styles.submitBtnText}>Submit Ticket</Text>
        <Ionicons name="send" size={18} color="#fff" />
      </TouchableOpacity>
    </View>

    <Text style={styles.sectionTitle}>My Recent Tickets</Text>
    <View style={styles.ticketItem}>
      <View style={styles.ticketStatus} />
      <View style={{ flex: 1 }}>
        <Text style={styles.ticketSubject}>Analyzer Error Code 404</Text>
        <Text style={styles.ticketMeta}>#TKT-1029 • Open • 2 hours ago</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
    </View>
  </ScrollView>
);

export default function RaiseTicket() {
  return (
    <LabLayout>
      <RaiseTicketContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  formCard: { backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: "700", color: "#64748b", marginBottom: 8, marginLeft: 4 },
  pickerPlaceholder: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 16, height: 50 },
  pickerText: { color: "#94a3b8", fontSize: 14, fontWeight: "600" },
  textInput: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 14, fontWeight: "600", color: "#1e293b" },
  textArea: { height: 120, paddingTop: 16, textAlignVertical: "top" },
  priorityRow: { flexDirection: "row", justifyContent: "space-between" },
  priorityBtn: { flex: 1, height: 44, backgroundColor: "#f8fafc", borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 8, borderWidth: 1, borderColor: "#e2e8f0" },
  priorityBtnActive: { backgroundColor: "#1e293b", borderColor: "#1e293b" },
  priorityBtnText: { fontSize: 13, fontWeight: "700", color: "#64748b" },
  priorityBtnTextActive: { color: "#fff" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#f97316", height: 56, borderRadius: 16, marginTop: 10 },
  submitBtnText: { color: "#fff", fontWeight: "800", fontSize: 16, marginRight: 10 },
  sectionTitle: { fontSize: 14, fontWeight: "800", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 },
  ticketItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 16, borderRadius: 16, marginBottom: 12 },
  ticketStatus: { width: 4, height: 32, backgroundColor: "#f97316", borderRadius: 2, marginRight: 16 },
  ticketSubject: { fontSize: 14, fontWeight: "800", color: "#1e293b" },
  ticketMeta: { fontSize: 12, color: "#94a3b8", marginTop: 2, fontWeight: "600" }
});
