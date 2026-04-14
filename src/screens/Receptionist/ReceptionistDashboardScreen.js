import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

const StatCard = ({ title, value, subtitle, icon, color, trendIcon, trendColor }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      {trendIcon && (
        <View style={styles.trendContainer}>
           <Ionicons name={trendIcon} size={20} color={trendColor || color} />
        </View>
      )}
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statSubtitle}>{subtitle}</Text>
    </View>
    <View style={styles.statFooter}>
      <Text style={styles.statTitle}>{title}</Text>
      <Ionicons name="chevron-forward" size={12} color="#94a3b8" />
    </View>
  </View>
);

const AppointmentItem = ({ name, doctor, time, status, detail = "General Checkup" }) => {
  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return { color: '#10b981', bg: '#ecfdf5' };
      case 'pending': return { color: '#f59e0b', bg: '#fffbeb' };
      case 'in progress': return { color: '#2563eb', bg: '#eff6ff' };
      case 'cancelled': return { color: '#ef4444', bg: '#fef2f2' };
      default: return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const colors = getStatusColors(status);

  return (
    <View style={styles.listItem}>
      <View style={styles.listIconContainer}>
        <View style={[styles.statusIndicator, { backgroundColor: colors.color }]} />
      </View>
      <View style={styles.listContent}>
        <Text style={styles.listName}>{name}</Text>
        <Text style={styles.listSub}>{doctor}</Text>
        <Text style={styles.listThird}>{detail}</Text>
      </View>
      <View style={styles.listRight}>
        <Text style={styles.listTime}>{time}</Text>
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.color }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
};

const RegistrationItem = ({ name, regId, time, status }) => {
  const getStatusColors = (status) => {
    switch (status?.toLowerCase()) {
      case 'new': return { color: '#2563eb', bg: '#eff6ff' };
      case 'follow-up': return { color: '#10b981', bg: '#ecfdf5' };
      case 'urgent': return { color: '#ef4444', bg: '#fef2f2' };
      default: return { color: '#64748b', bg: '#f1f5f9' };
    }
  };

  const colors = getStatusColors(status);

  return (
    <View style={styles.listItem}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={20} color="#64748b" />
      </View>
      <View style={styles.listContent}>
        <Text style={styles.listName}>{name}</Text>
        <Text style={styles.listSub}>ID: {regId}</Text>
      </View>
      <View style={styles.listRight}>
        <Text style={styles.listTime}>{time}</Text>
        <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
          <Text style={[styles.statusText, { color: colors.color }]}>{status}</Text>
        </View>
      </View>
    </View>
  );
};

const QuickAction = ({ title, icon, color, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.quickAction}>
    <View style={styles.quickActionLeft}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </View>
    <Ionicons name="add-circle-outline" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

const ReceptionistDashboardScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: {
      totalPatients: "0",
      todayAppointments: "0",
      pendingBills: "0",
      newRegistrations: "0"
    },
    todayAppointments: [],
    recentRegistrations: []
  });

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);
    try {
      const response = await api.getReceptionistDashboard();
      console.log("[Dashboard] API Response Data:", JSON.stringify(response, null, 2));

      // Extract statistics from the response (matches screenshot format)
      const stats = response?.statistics || response?.stats || {};
      
      setData({
        stats: {
          totalPatients: String(stats.patients_registered_today ?? stats.overall_patients ?? "0"),
          todayAppointments: String(stats.todays_appointments ?? stats.today_appointments ?? "0"),
          pendingBills: String(stats.pending_checkins ?? stats.pending_bills ?? "0"),
          newRegistrations: String(stats.patients_registered_today ?? stats.new_registrations ?? "0")
        },
        todayAppointments: response?.today_appointments || response?.todayAppointments || [],
        recentRegistrations: response?.recent_registrations || response?.recentRegistrations || []
      });
    } catch (err) {
      console.error("[Dashboard] Fetch failed:", err);
      if (err.message.includes("token")) {
        setError("Invalid or expired session. Please login again.");
      } else {
        setError(err.message || "Failed to connect to server.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true);
  };

  if (loading && !refreshing) {
    return (
      <ReceptionistLayout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading Dashboard...</Text>
        </View>
      </ReceptionistLayout>
    );
  }

  return (
    <ReceptionistLayout>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />
        }
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View>
              <Text style={styles.welcomeText}>Receptionist Portal</Text>
              <Text style={styles.titleText}>Dashboard Overview</Text>
            </View>
            
          </View>
          
          {error && (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={18} color="#ef4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatCard 
                title="Patients" 
                value={data.stats.totalPatients} 
                subtitle="Overall Total" 
                icon="people" 
                color="#3b82f6" 
                trendIcon="trending-up"
              />
              <StatCard 
                title="Appointments" 
                value={data.stats.todayAppointments} 
                subtitle="Due Today" 
                icon="calendar" 
                color="#10b981" 
                trendIcon="time-outline"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard 
                title="Billing" 
                value={data.stats.pendingBills} 
                subtitle="Pending Bills" 
                icon="card" 
                color="#f59e0b" 
                trendIcon="alert-circle-outline"
              />
              <StatCard 
                title="New Registrations" 
                value={data.stats.newRegistrations} 
                subtitle="Recent" 
                icon="person-add" 
                color="#8b5cf6" 
                trendIcon="add-outline"
              />
            </View>
          </View>

          <View style={styles.mainContent}>
            {/* Today's Appointments */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="today" size={18} color="#2563eb" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Today's Appointments</Text>
                    <Text style={styles.sectionSub}>Manage upcoming visits</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
              </View>
              
              {data.todayAppointments.map((item, index) => (
                <AppointmentItem key={index} {...item} />
              ))}
            </View>

            {/* Quick Actions - Horizontally Scrolling */}
            <View style={styles.sectionFull}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#f5f3ff' }]}>
                    <Ionicons name="flash" size={18} color="#8b5cf6" />
                  </View>
                  <Text style={styles.sectionTitle}>Quick Actions</Text>
                </View>
              </View>
              
              <View style={styles.quickActionsGrid}>
                <QuickAction title="Register" icon="person-add" color="#2563eb" onPress={() => navigation.navigate('PatientRegistration')} />
                <QuickAction title="Schedule" icon="calendar" color="#10b981" onPress={() => navigation.navigate('AppointmentScheduling')} />
                <QuickAction title="Billing" icon="cash" color="#f59e0b" onPress={() => navigation.navigate('Billing')} />
                <QuickAction title="OPD Manage" icon="medical" color="#f97316" onPress={() => navigation.navigate('OPDManagement')} />
              </View>
            </View>

            {/* Recent Registrations */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionTitleContainer}>
                  <View style={[styles.sectionIcon, { backgroundColor: '#ecfdf5' }]}>
                    <Ionicons name="person-add-sharp" size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text style={styles.sectionTitle}>Recent Patients</Text>
                    <Text style={styles.sectionSub}>Latest registrations</Text>
                  </View>
                </View>
              </View>
              
              {data.recentRegistrations.map((item, index) => (
                <RegistrationItem key={index} {...item} />
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      
      <TouchableOpacity 
        style={styles.fab}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </ReceptionistLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  content: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#64748b",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  titleText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0f172a",
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  notificationBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1.5,
    borderColor: "white",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#fee2e2",
  },
  errorText: {
    marginLeft: 8,
    fontSize: 13,
    color: "#ef4444",
    fontWeight: "500",
  },
  statsGrid: {
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 20,
    width: "48.5%",
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  trendContainer: {
    opacity: 0.6,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
  },
  statSubtitle: {
    fontSize: 11,
    color: "#64748b",
    fontWeight: "500",
    marginTop: 2,
  },
  statFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  statTitle: {
    fontSize: 9,
    fontWeight: "800",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mainContent: {
    gap: 20,
  },
  section: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionFull: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  sectionSub: {
    fontSize: 11,
    color: "#94a3b8",
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#2563eb",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
  },
  listIconContainer: {
    marginRight: 12,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "white",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  listContent: {
    flex: 1,
  },
  listName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1e293b",
  },
  listSub: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 1,
  },
  listThird: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 1,
  },
  listRight: {
    alignItems: "flex-end",
  },
  listTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "capitalize",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickAction: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  quickActionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickActionIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }
});

export default ReceptionistDashboardScreen;
