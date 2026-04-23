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
import LabLayout from "./LabLayout";

const { width } = Dimensions.get("window");

const labMenu = [
  { id: 'lab-dashboard', label: 'Lab Dashboard', icon: 'flask', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'critical-results', label: 'Critical Results', icon: 'exclamation-circle', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'test-registration', label: 'Test Registration', icon: 'vial', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'sample-tracking', label: 'Sample Tracking', icon: 'qrcode', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'report-generation', label: 'Report Generation', icon: 'file-medical', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'result-access', label: 'Result Access', icon: 'shield-alt', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'test-catalogue', label: 'Test Catalogue', icon: 'book-medical', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'equipment-tracking', label: 'Equipment Tracking', icon: 'microscope', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'quality-control', label: 'Quality Control', icon: 'chart-line', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'profile', label: 'Lab Profile', icon: 'user-md', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'raise-ticket', label: 'Raise Ticket', icon: 'envelope-open-text', color: '#2563eb', bgColor: '#eff6ff' }
];

const MenuCard = ({ label, icon, color, bgColor, onPress }) => (
  <TouchableOpacity
    style={[styles.menuCard, { backgroundColor: bgColor }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={[styles.iconContainer, { backgroundColor: 'white' }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.cardLabel}>{label}</Text>
    <View style={styles.arrowContainer}>
      <Ionicons name="chevron-forward" size={16} color={color} />
    </View>
  </TouchableOpacity>
);

const LabDashboardContent = ({ navigation }) => {
  const handlePress = (id) => {
    const screenNameMap = {
      'lab-dashboard': 'LabDashboard',
      'critical-results': 'CriticalResults',
      'test-registration': 'TestRegistration',
      'sample-tracking': 'SampleTracking',
      'report-generation': 'ReportGeneration',
      'result-access': 'ResultAccess',
      'test-catalogue': 'TestCatalogue',
      'equipment-tracking': 'EquipmentTracking',
      'quality-control': 'QualityControl',
      'profile': 'LabProfile',
      'raise-ticket': 'LabRaiseTicket'
    };
    if (screenNameMap[id]) {
      navigation.navigate(screenNameMap[id]);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Laboratory Services</Text>
        <Text style={styles.subtitle}>Select a service to manage diagnostic operations.</Text>
      </View>

      <View style={styles.grid}>
        {labMenu.map((item) => (
          <MenuCard
            key={item.id}
            label={item.label}
            icon={item.icon}
            color={item.color}
            bgColor={item.bgColor}
            onPress={() => handlePress(item.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default function LabDashboard({ navigation }) {
  return (
    <LabLayout>
      <LabDashboardContent navigation={navigation} />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
    fontWeight: "500",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuCard: {
    width: (width - 50) / 2,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardLabel: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1e293b",
    lineHeight: 20,
  },
  arrowContainer: {
    position: "absolute",
    top: 20,
    right: 20,
  }
});
