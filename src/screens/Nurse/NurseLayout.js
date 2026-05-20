import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Text,
  TouchableWithoutFeedback,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import NurseSidebar from "./NurseSidebar";
import { useAppContext } from "../../context/AppContext";

const { width } = Dimensions.get("window");
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { isSidebarOpen: false, toggleSidebar: () => {}, closeSidebar: () => {} };
  }
  return context;
};

const NurseLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current; 
  const navigation = useNavigation();
  const { logout, currentUser } = useAppContext();

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: isSidebarOpen ? 0 : -280,
      useNativeDriver: true,
      friction: 8,
      tension: 40,
    }).start();
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
  };

  const getInitials = () => {
    if (!currentUser?.name) return "N";
    return currentUser.name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Navbar */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100 z-50">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={toggleSidebar}
              className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50 mr-4"
            >
              <Ionicons name="menu-outline" size={24} color="#2563eb" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-gray-900">Levitica</Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">Hospital Management System</Text>
            </View>
          </View>
          <View className="flex-row items-center relative z-50">
            <TouchableOpacity 
              onPress={() => setShowDropdown(!showDropdown)}
              className="h-10 w-10 items-center justify-center rounded-full bg-blue-600"
            >
              <Text className="text-white font-bold text-xs">{getInitials()}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Dropdown Modal */}
        <Modal visible={showDropdown} transparent={true} animationType="fade">
          <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
            <View className="flex-1">
              <TouchableWithoutFeedback>
                <View className="absolute top-20 right-6 bg-white rounded-xl shadow-lg border border-gray-100 w-48 overflow-hidden z-50">
                  <View className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                    <Text className="font-bold text-gray-900">{currentUser?.name || "Nurse"}</Text>
                    <Text className="text-xs text-gray-500">{currentUser?.email}</Text>
                  </View>
                  <TouchableOpacity 
                    className="flex-row items-center px-4 py-3 border-b border-gray-100"
                    onPress={() => {
                      setShowDropdown(false);
                      navigation.navigate("NurseProfile");
                    }}
                  >
                    <Ionicons name="person-outline" size={18} color="#4b5563" />
                    <Text className="ml-3 text-gray-700 font-medium">My Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    className="flex-row items-center px-4 py-3"
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#ef4444" />
                    <Text className="ml-3 text-red-600 font-medium">Log out</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        <View style={styles.content}>{children}</View>

        {isSidebarOpen && (
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={closeSidebar}
          />
        )}

        <Animated.View
          style={[
            styles.sidebarWrapper,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          <NurseSidebar onClose={closeSidebar} />
        </Animated.View>
      </SafeAreaView>
    </SidebarContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 99,
  },
  sidebarWrapper: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 280,
    backgroundColor: "#fff",
    zIndex: 100,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});

export default NurseLayout;
