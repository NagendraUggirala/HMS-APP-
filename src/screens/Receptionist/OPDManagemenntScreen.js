import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import ReceptionistLayout from "./ReceptionistLayout";

const OPDManagemenntScreen = () => {
  return (
    <ReceptionistLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>OPD Management</Text>
          <Text style={styles.subtitle}>Manage Outpatient Department flow</Text>
        </View>
        <ScrollView>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>This section allows you to manage OPD schedules, tokens, and patient transfers to specific clinics.</Text>
          </View>
          {/* Add more OPD specific content here */}
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
  infoBox: { backgroundColor: "white", padding: 20, borderRadius: 20, borderWidth: 1, borderColor: "#f1f5f9" },
  infoText: { fontSize: 15, color: "#475569", lineHeight: 22 },
});

export default OPDManagemenntScreen;
