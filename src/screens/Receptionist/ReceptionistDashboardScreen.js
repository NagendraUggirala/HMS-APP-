import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";

const { width } = Dimensions.get("window");

const StatCard = ({ title, value, subtitle, icon, color, trendIcon, trendColor }) => (
  <View style={styles.statCard}>
    <View style={styles.statHeader}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      {trendIcon && (
        <View style={styles.trendContainer}>
           <Ionicons name={trendIcon} size={30} color={trendColor || color} />
        </View>
      )}
    </View>
    <Text style={styles.statSubtitle}>{subtitle}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </View>
);

const AppointmentItem = ({ name, doctor, time, status, statusColor, statusBg }) => (
  <View style={styles.listItem}>
    <View style={styles.listIconContainer}>
      <View style={[styles.statusIndicator, { backgroundColor: statusColor }]} />
    </View>
    <View style={styles.listContent}>
      <Text style={styles.listName}>{name}</Text>
      <Text style={styles.listSub}>{doctor}</Text>
      <Text style={styles.listThird}>General Checkup</Text>
    </View>
    <View style={styles.listRight}>
      <Text style={styles.listTime}>{time}</Text>
      <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  </View>
);

const RegistrationItem = ({ name, regId, time, status, statusColor, statusBg }) => (
  <View style={styles.listItem}>
    <View style={styles.avatar}>
      <Ionicons name="person" size={20} color="#64748b" />
    </View>
    <View style={styles.listContent}>
      <Text style={styles.listName}>{name}</Text>
      <Text style={styles.listSub}>Registration ID: {regId}</Text>
      <Text style={styles.listThird}>{status === 'Urgent' ? 'Urgent' : 'Normal'}</Text>
    </View>
    <View style={styles.listRight}>
      <Text style={styles.listTime}>{time}</Text>
       <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
        <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
      </View>
    </View>
  </View>
);

const QuickAction = ({ title, icon, color, onPress }) => (
  <TouchableOpacity onPress={onPress} style={styles.quickAction}>
    <View style={styles.quickActionLeft}>
      <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#cbd5e1" />
  </TouchableOpacity>
);

const ReceptionistDashboardScreen = ({ navigation }) => {
  return (
    <ReceptionistLayout>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.container}>
        <View className="px-6 py-6">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Reception Dashboard</Text>
          
          {/* Stats Row */}
          {/* Stats Section - Vertical Layout */}
          <View className="mb-6">
            <StatCard 
              title="Overall registered" 
              value="156" 
              subtitle="Total Patients" 
              icon="people" 
              color="#2563eb" 
              trendIcon="stats-chart"
            />
            <StatCard 
              title="Today" 
              value="24" 
              subtitle="Today's Appointments" 
              icon="calendar" 
              color="#10b981" 
              trendIcon="trending-up"
            />
            <StatCard 
              title="Awaiting payment" 
              value="8" 
              subtitle="Pending Bills" 
              icon="document-text" 
              color="#f59e0b" 
              trendIcon="bar-chart"
            />
            <StatCard 
              title="Recently added" 
              value="12" 
              subtitle="New Registrations" 
              icon="person-add" 
              color="#8b5cf6" 
              trendIcon="pulse"
            />
          </View>

          <View className="flex-row flex-wrap justify-between">
            {/* Today's Appointments */}
            <View style={styles.section}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-lg bg-blue-100 items-center justify-center mr-3">
                    <Ionicons name="calendar-sharp" size={18} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="text-base font-bold text-gray-900">Today's Appointments</Text>
                    <Text className="text-[10px] text-gray-400">Upcoming appointments for today</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Text className="text-xs font-bold text-blue-600">View All →</Text>
                </TouchableOpacity>
              </View>
              
              <AppointmentItem name="Ravi Kumar" doctor="Dr. Meena Rao" time="10:30 AM" status="Confirmed" statusColor="#10b981" statusBg="#ecfdf5" />
              <AppointmentItem name="Anita Sharma" doctor="Dr. Sharma" time="11:00 AM" status="Pending" statusColor="#f59e0b" statusBg="#fffbeb" />
              <AppointmentItem name="Suresh Patel" doctor="Dr. Menon" time="11:30 AM" status="Confirmed" statusColor="#10b981" statusBg="#ecfdf5" />
              <AppointmentItem name="Priya Singh" doctor="Dr. Verma" time="12:00 PM" status="In Progress" statusColor="#2563eb" statusBg="#eff6ff" />
            </View>

            {/* Recent Registrations */}
            <View style={styles.section}>
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="h-8 w-8 rounded-lg bg-green-100 items-center justify-center mr-3">
                    <Ionicons name="person-add-sharp" size={18} color="#10b981" />
                  </View>
                  <View>
                    <Text className="text-base font-bold text-gray-900">Recent Registrations</Text>
                    <Text className="text-[10px] text-gray-400">New patient registrations today</Text>
                  </View>
                </View>
                <TouchableOpacity>
                  <Text className="text-xs font-bold text-blue-600">View All →</Text>
                </TouchableOpacity>
              </View>
              
              <RegistrationItem name="Rajesh Kumar" regId="REG-001" time="09:15 AM" status="New" statusColor="#2563eb" statusBg="#eff6ff" />
              <RegistrationItem name="Priya Singh" regId="REG-002" time="09:30 AM" status="Follow-up" statusColor="#10b981" statusBg="#ecfdf5" />
              <RegistrationItem name="Amit Patel" regId="REG-003" time="10:00 AM" status="New" statusColor="#ef4444" statusBg="#fef2f2" />
            </View>

            {/* Quick Actions */}
            <View style={styles.sectionFull}>
              <View className="flex-row items-center mb-4">
                <View className="h-8 w-8 rounded-lg bg-purple-100 items-center justify-center mr-3">
                  <Ionicons name="flash-sharp" size={18} color="#8b5cf6" />
                </View>
                <Text className="text-base font-bold text-gray-900">Quick Actions</Text>
              </View>
              
              <QuickAction title="Register New Patient" icon="person-add" color="#2563eb" onPress={() => navigation.navigate('PatientRegistration')} />
              <QuickAction title="Schedule Appointment" icon="calendar" color="#10b981" onPress={() => navigation.navigate('AppointmentScheduling')} />
              <QuickAction title="Generate Bill" icon="cash" color="#f59e0b" onPress={() => navigation.navigate('Billing')} />
              <QuickAction title="Find Patient Record" icon="search" color="#8b5cf6" onPress={() => navigation.navigate('PatientRecord')} />
              <QuickAction title="OPD Management" icon="medical" color="#f97316" onPress={() => navigation.navigate('OPDManagement')} />
              <QuickAction title="IPD Management" icon="bed" color="#0ea5e9" onPress={() => navigation.navigate('IPDManagement')} />
              <QuickAction title="Document Management" icon="document-text" color="#6366f1" onPress={() => navigation.navigate('DocumentManagement')} />
            </View>
          </View>
        </View>
      </ScrollView>
      
      {/* Floating Action Button for Help/Chat as seen in image */}
      <TouchableOpacity 
        style={styles.fab}
        className="shadow-lg shadow-blue-500/50"
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>
    </ReceptionistLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 24,
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#f1f5f9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  statHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  trendContainer: {
    opacity: 0.8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 10,
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  statSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 2,
    fontWeight: "500",
  },
  section: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    width: width > 768 ? "48.5%" : "100%",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  sectionFull: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    width: "100%",
    borderWidth: 1,
    borderColor: "#f1f5f9",
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
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: "#f8fafc",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 10,
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
    fontSize: 11,
    color: "#64748b",
  },
  listThird: {
    fontSize: 10,
    color: "#94a3b8",
  },
  listRight: {
    alignItems: "end",
  },
  listTime: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 9,
    fontWeight: "700",
  },
  quickAction: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f8fafc",
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
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  }
});

export default ReceptionistDashboardScreen;
