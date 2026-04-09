import React from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import ReceptionistLayout from "./ReceptionistLayout";

const DocumentManagementScreen = () => {
  return (
    <ReceptionistLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Document Management</Text>
          <Text style={styles.subtitle}>Store and access patient digital documents</Text>
        </View>
        <ScrollView>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Upload and manage patient reports, IDs, and consent forms.</Text>
          </View>
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

export default DocumentManagementScreen;
