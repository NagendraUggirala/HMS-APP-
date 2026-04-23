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
import PharmacyLayout from "./PharmacyLayout";

const { width } = Dimensions.get("window");

const pharmacyMenu = [
  { id: 'dashboard', label: 'Dashboard', icon: 'grid-outline', color: '#2563eb', bgColor: '#eff6ff' },
  { id: 'inventory', label: 'Inventory', icon: 'cube-outline', color: '#10b981', bgColor: '#ecfdf5' },
  { id: 'purchaseorders', label: 'Purchase Orders', icon: 'cart-outline', color: '#f59e0b', bgColor: '#fffbeb' },
  { id: 'salestracking', label: 'Sales Tracking', icon: 'bar-chart-outline', color: '#8b5cf6', bgColor: '#f5f3ff' },
  { id: 'expiryalerts', label: 'Expiry Alerts', icon: 'alert-circle-outline', color: '#ef4444', bgColor: '#fef2f2' },
  { id: 'suppliermanagement', label: 'Supplier Management', icon: 'truck-outline', color: '#06b6d4', bgColor: '#ecfeff' },
  { id: 'medicinedatabase', label: 'Medicine Database', icon: 'medical-outline', color: '#6366f1', bgColor: '#eef2ff' },
  { id: 'settings', label: 'Settings', icon: 'settings-outline', color: '#64748b', bgColor: '#f8fafc' },
  { id: 'raise-ticket', label: 'Raise Ticket', icon: 'mail-outline', color: '#f97316', bgColor: '#fff7ed' }
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

const PharmacyDashboardContent = ({ navigation }) => {
  const handlePress = (id) => {
    const screenNameMap = {
      'dashboard': 'PharmacyDashboard',
      'inventory': 'PharmacyInventory',
      'purchaseorders': 'PharmacyPurchaseOrders',
      'salestracking': 'PharmacySalesTracking',
      'expiryalerts': 'PharmacyExpiryAlerts',
      'suppliermanagement': 'PharmacySupplierManagement',
      'medicinedatabase': 'PharmacyMedicineDatabase',
      'settings': 'PharmacySettings',
      'raise-ticket': 'PharmacyRaiseTicket'
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
        <Text style={styles.title}>Pharmacy Services</Text>
        <Text style={styles.subtitle}>Manage inventory, sales, and supplier operations.</Text>
      </View>

      <View style={styles.grid}>
        {pharmacyMenu.map((item) => (
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

export default function PharmacyDashboard({ navigation }) {
  return (
    <PharmacyLayout>
      <PharmacyDashboardContent navigation={navigation} />
    </PharmacyLayout>
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
