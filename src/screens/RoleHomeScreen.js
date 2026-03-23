import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAppContext } from "../context/AppContext";
import ScreenContainer from "../components/ScreenContainer";
import PrimaryButton from "../components/PrimaryButton";

export default function RoleHomeScreen({ navigation }) {
  const { currentUser, logout } = useAppContext();

  return (
    <ScreenContainer>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome {currentUser?.name}</Text>
        <Text style={styles.subtitle}>Role: {currentUser?.role}</Text>
        <Text style={styles.info}>Hospital: {currentUser?.hospitalId}</Text>
        
        <View style={styles.actions}>
          <PrimaryButton 
            title="Logout" 
            onPress={() => {
              logout();
              navigation.replace("Login");
            }} 
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 4,
  },
  info: {
    fontSize: 16,
    color: "#888",
    marginBottom: 32,
  },
  actions: {
    marginTop: 20,
  }
});
