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
import { NavigationContext } from "@react-navigation/native";
import { useAppContext } from "../../context/AppContext";
import LabSidebar from "./LabSidebar";

const { width } = Dimensions.get("window");
const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { isSidebarOpen: false, toggleSidebar: () => {}, closeSidebar: () => {} };
  }
  return context;
};

const LabLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const slideAnim = useRef(new Animated.Value(-280)).current; 
  const { currentUser, logout } = useAppContext();
  const navigation = React.useContext(NavigationContext);

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
              <Text className="text-xl font-bold text-gray-900">LabPortal</Text>
              <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest -mt-1">Laboratory Management</Text>
            </View>
          </View>
          
          {/* Profile Icon with Dropdown Menu */}
          <View className="flex-row items-center relative z-50">
            <TouchableOpacity 
              onPress={() => setShowProfileMenu(!showProfileMenu)}
              className="h-10 w-10 items-center justify-center rounded-full bg-blue-600 shadow-sm"
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-xs">
                {currentUser?.name?.substring(0, 2).toUpperCase() || "LB"}
              </Text>
            </TouchableOpacity>

            {showProfileMenu && (
              <View 
                className="absolute right-0 top-12 bg-white rounded-2xl border border-slate-100 shadow-2xl p-2 w-48 z-[999]"
                style={{
                  elevation: 10,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                }}
              >
                <TouchableOpacity
                  onPress={() => {
                    setShowProfileMenu(false);
                    if (navigation) navigation.navigate("LabProfile");
                  }}
                  className="flex-row items-center p-3 rounded-xl active:bg-slate-50"
                >
                  <Ionicons name="person-outline" size={16} color="#475569" />
                  <Text className="ml-2.5 text-xs font-extrabold text-slate-700">View Profile</Text>
                </TouchableOpacity>

                <View className="h-[1px] bg-slate-100 my-1" />

                <TouchableOpacity
                  onPress={async () => {
                    setShowProfileMenu(false);
                    await logout();
                    if (navigation) navigation.replace("Login");
                  }}
                  className="flex-row items-center p-3 rounded-xl active:bg-rose-50"
                >
                  <Ionicons name="log-out-outline" size={16} color="#ef4444" />
                  <Text className="ml-2.5 text-xs font-extrabold text-rose-600">Logout</Text>
                </TouchableOpacity>
              </View>
            )}
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
          <LabSidebar onClose={closeSidebar} />
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

export default LabLayout;
