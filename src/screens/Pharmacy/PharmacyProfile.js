import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PharmacyLayout from "./PharmacyLayout";
import { useAppContext } from "../../context/AppContext";

const ProfileContent = () => {
  const { currentUser } = useAppContext();
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>My Profile</Text>
        <Text style={styles.subtitle}>View and manage your professional account.</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarTextLarge}>
            {currentUser?.name?.substring(0, 2).toUpperCase() || "PH"}
          </Text>
        </View>
        <Text style={styles.userName}>{currentUser?.name || "Pharmacist"}</Text>
        <Text style={styles.userRole}>Head of Pharmacy Dept</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>1.2k</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>4.9</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

export default function PharmacyProfile() {
  return (
    <PharmacyLayout>
      <ProfileContent />
    </PharmacyLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  profileCard: { backgroundColor: "#fff", borderRadius: 32, padding: 32, alignItems: "center" },
  avatarLarge: { width: 100, height: 100, borderRadius: 40, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  avatarTextLarge: { fontSize: 32, fontWeight: "900", color: "#fff" },
  userName: { fontSize: 22, fontWeight: "900", color: "#1e293b" },
  userRole: { fontSize: 14, color: "#64748b", fontWeight: "600", marginTop: 4 },
  statsContainer: { flexDirection: "row", marginTop: 32, borderTopWidth: 1, borderTopColor: "#f1f5f9", width: '100%', paddingTop: 32 },
  statBox: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 20, fontWeight: "900", color: "#1e293b" },
  statLabel: { fontSize: 12, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase", marginTop: 4 }
});
