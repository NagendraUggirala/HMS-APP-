import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";
import { useAppContext } from "../../context/AppContext";

const ProfileItem = ({ icon, label, value }) => (
  <View style={styles.profileItem}>
    <View style={styles.profileIconBg}>
      <Ionicons name={icon} size={20} color="#2563eb" />
    </View>
    <View style={styles.profileTextContent}>
      <Text style={styles.profileLabel}>{label}</Text>
      <Text style={styles.profileValue}>{value}</Text>
    </View>
  </View>
);

const MyProfileScreen = () => {
  const { currentUser } = useAppContext();

  return (
    <ReceptionistLayout>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <Text style={styles.subtitle}>Manage your personal information</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarLarge}>
              <Text style={styles.avatarText}>
                {currentUser?.name?.substring(0, 2).toUpperCase() || "NU"}
              </Text>
            </View>
            <Text style={styles.userName}>{currentUser?.name || "Nagendra Uggirala"}</Text>
            <Text style={styles.userRole}>Senior Receptionist</Text>
          </View>

          <View style={styles.divider} />

          <ProfileItem icon="mail-outline" label="Email" value={currentUser?.email || "nagendra@levitica.com"} />
          <ProfileItem icon="call-outline" label="Phone" value="+91 98765 43210" />
          <ProfileItem icon="business-outline" label="Department" value="Front Desk / Admin" />
          <ProfileItem icon="calendar-outline" label="Joined Date" value="12 Feb 2024" />

          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ReceptionistLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 14, color: "#64748b", marginTop: 4 },
  profileCard: { backgroundColor: "white", borderRadius: 24, padding: 24, borderWidth: 1, borderColor: "#f1f5f9", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 2 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#2563eb", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  avatarText: { color: "white", fontSize: 28, fontWeight: "bold" },
  userName: { fontSize: 20, fontWeight: "bold", color: "#1e293b" },
  userRole: { fontSize: 14, color: "#64748b", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 20 },
  profileItem: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  profileIconBg: { width: 40, height: 40, borderRadius: 10, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 16 },
  profileTextContent: { flex: 1 },
  profileLabel: { fontSize: 11, color: "#94a3b8", fontWeight: "700", textTransform: "uppercase" },
  profileValue: { fontSize: 15, color: "#1e293b", fontWeight: "600", marginTop: 2 },
  editBtn: { backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  editBtnText: { color: "#64748b", fontWeight: "700", fontSize: 14 },
});

export default MyProfileScreen;
