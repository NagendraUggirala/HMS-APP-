import React, { useState, createContext, useContext, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Sidebar from "./AdminsidebarScreen";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    return { isSidebarOpen: false, toggleSidebar: () => {}, closeSidebar: () => {} };
  }
  return context;
};

const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-260)).current;

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isSidebarOpen ? 0 : -260,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, toggleSidebar, closeSidebar }}>
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>{children}</View>
        
        {isSidebarOpen && (
          <TouchableOpacity
            style={styles.overlay}
            onPress={closeSidebar}
          />
        )}

        <Animated.View
          style={[
            styles.sidebarWrapper,
            { transform: [{ translateX: slideAnim }] },
          ]}
        >
          {isSidebarOpen && <Sidebar onClose={closeSidebar} />}
        </Animated.View>
      </SafeAreaView>
    </SidebarContext.Provider>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 99 },
  sidebarWrapper: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 250,
    backgroundColor: "#fff",
    zIndex: 100,
    elevation: 8,
  },
});

export default AdminLayout;
