import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import PharmacySidebar from "./PharmacySidebar";

const { width } = Dimensions.get("window");
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { isSidebarOpen: false, toggleSidebar: () => {}, closeSidebar: () => {} };
  }
  return context;
};

const PharmacyLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current; 
  const { currentUser } = useAppContext();

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

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        {/* Navbar */}
        <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={toggleSidebar}
              className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50 mr-4"
            >
              <Ionicons name="menu-outline" size={24} color="#2563eb" />
            </TouchableOpacity>
            <View>
              <Text className="text-xl font-bold text-gray-900">Pharmacy</Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">Inventory Management</Text>
            </View>
          </View>
          <View className="flex-row items-center">
            <TouchableOpacity className="h-8 w-8 items-center justify-center rounded-xl bg-gray-50 mr-3">
              <Ionicons name="notifications-outline" size={18} color="#64748b" />
            </TouchableOpacity>
            <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-blue-600">
              <Text className="text-white font-bold text-xs">
                {currentUser?.name?.substring(0, 2).toUpperCase() || "PH"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

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
          <PharmacySidebar onClose={closeSidebar} />
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

export default PharmacyLayout;
