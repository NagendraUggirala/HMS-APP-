import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function ForgetScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Back Button */}
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#00685f" />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Header Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBg}>
                <MaterialIcons 
                  name={isSubmitted ? "mark-email-read" : "lock-reset"} 
                  size={50} 
                  color="white" 
                />
              </View>
            </View>

            <Text style={styles.title}>
              {isSubmitted ? "Reset Link Sent" : "Forgot Password?"}
            </Text>
            
            <Text style={styles.description}>
              {isSubmitted 
                ? `An institutional password recovery link has been sent to ${email}. Please check your inbox.`
                : "Enter your registered institutional email address below and we'll send you a secure link to reset your security key."
              }
            </Text>

            {!isSubmitted ? (
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Institutional Email</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="alternate-email" size={20} color="#00685f" />
                    <TextInput
                      style={styles.input}
                      placeholder="admin@hospital.com"
                      value={email}
                      onChangeText={setEmail}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      placeholderTextColor="#94a3b8"
                    />
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.submitButton}
                  onPress={handleSubmit}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Text style={styles.submitButtonText}>Request Reset Link</Text>
                      <MaterialIcons name="send" size={18} color="white" style={{marginLeft: 8}} />
                    </>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.successContainer}>
                <TouchableOpacity 
                  style={styles.backToLoginButton}
                  onPress={() => navigation.navigate("Login")}
                >
                  <Text style={styles.backToLoginText}>Back to Sign In</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.resendButton}
                  onPress={() => setIsSubmitted(false)}
                >
                  <Text style={styles.resendText}>Didn't receive link? Try again</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Footer branding */}
          <View style={styles.footer}>
            <FontAwesome5 name="hospital-alt" size={16} color="#94a3b8" />
            <Text style={styles.footerText}>Clinical Curator Security</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 32,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    marginBottom: 32,
  },
  iconBg: {
    width: 100,
    height: 100,
    borderRadius: 35,
    backgroundColor: "#00685f",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00685f",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1e293b",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 10,
    marginLeft: 4,
  },
  inputWrapper: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  submitButton: {
    height: 56,
    backgroundColor: "#00685f",
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#00685f",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  successContainer: {
    width: "100%",
    alignItems: "center",
  },
  backToLoginButton: {
    height: 56,
    width: "100%",
    backgroundColor: "#00685f",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  backToLoginText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
  resendButton: {
    paddingVertical: 12,
  },
  resendText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "auto",
    paddingTop: 40,
    gap: 8,
  },
  footerText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#94a3b8",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
