import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";

const Sidebar = () => {
  const [active, setActive] = useState("dashboard");
  const navigation = useNavigation();

  const adminMenu = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'chart-line', screen: 'DashboardOverview' },
    { id: 'profile', label: 'Hospital Profile', icon: 'hospital', screen: 'HospitalProfile' },
    { id: 'doctors', label: 'Doctor Management', icon: 'user-md', screen: 'DoctorManagement' },
    { id: 'staff', label: 'Staff Management', icon: 'users', screen: 'StaffManagement' },
    { id: 'departments', label: 'Department Management', icon: 'building', screen: 'DepartmentManagement' },
    { id: 'assign-departments', label: 'Department Assignment', icon: 'briefcase', screen: 'AssignDepartments' },
    { id: 'appointments', label: 'Appointment Management', icon: 'clipboard-list', screen: 'AppointmentManagement' },
    { id: 'billing', label: 'Billing & Finance', icon: 'money-bill-wave', screen: 'BillingManagement' },
    { id: 'inpatient', label: 'Inpatient Management', icon: 'bed', screen: 'InpatientManagement' },
    { id: 'pharmacy', label: 'Pharmacy Management', icon: 'prescription-bottle-alt', screen: 'PharmacyManagement' },
    { id: 'lab', label: 'Lab Management', icon: 'microscope', screen: 'LabManagement' },
    { id: 'reports', label: 'Reports', icon: 'chart-bar', screen: 'ReportsManagement' },
    { id: 'settings', label: 'Settings', icon: 'cog', screen: 'SettingsManagement' }
  ];

  const handlePress = (item) => {
    setActive(item.id);
    navigation.navigate(item.screen);
  };

  return (
    <View style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.logo}>Hospital Admin</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {adminMenu.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, active === item.id && styles.activeItem]}
              onPress={() => handlePress(item)}
            >
              <Icon name={item.icon} size={16} color="#3b82f6" style={styles.icon} />
              <Text style={[styles.menuText, active === item.id && styles.activeText]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export default Sidebar;

// Styles remain same as your current Sidebar.js


/* ✅ CSS (StyleSheet in same file) */
const styles = StyleSheet.create({

  container: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f5f7fa"
  },

  sidebar: {
    width: 250,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#ddd",
    paddingTop: 20
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    color: "#333"
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 15
  },

  icon: {
    marginRight: 12
  },

  activeItem: {
    backgroundColor: "#e0edff",
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6"
  },

  menuText: {
    fontSize: 14,
    color: "#333"
  },

  activeText: {
    color: "#2563eb",
    fontWeight: "bold"
  }

});