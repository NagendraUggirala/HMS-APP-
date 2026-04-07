import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, SafeAreaView, TextInput, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AdminLayout, { useSidebar } from "./AdminLayout";

const RaiseTicketContent = () => {
  const { toggleSidebar } = useSidebar();
  const navigation = useNavigation();
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technical");

  const handleSubmit = () => {
    if (!subject || !description) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    Alert.alert("Success", `Ticket "${subject}" has been created in ${category} category.`);
    setSubject("");
    setDescription("");
  };
  
  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Teal Accent Bar */}
      <View className="h-1 bg-teal-600" />

      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-teal-50">
            <Ionicons name="help-buoy" size={24} color="#0d9488" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Support Portal</Text>
            <Text className="text-lg font-black text-teal-900 uppercase">Raise Ticket</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-full bg-teal-50">
          <Ionicons name="chatbubbles-outline" size={20} color="#0d9488" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <View className="flex-row items-center mb-6">
            <View className="h-2 w-10 bg-teal-500 rounded-full mr-2" />
            <Text className="text-xs font-black text-gray-400 uppercase tracking-[2px]">Incident Report</Text>
          </View>

          <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 mb-6">
            <View className="mb-6">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Title & Subject</Text>
              <TextInput 
                className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-sm font-bold text-gray-900"
                placeholder="What is the issue?"
                placeholderTextColor="#94a3b8"
                value={subject}
                onChangeText={setSubject}
              />
            </View>

            <View className="mb-6">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Priority Level</Text>
              <View className="flex-row">
                {['Technical', 'Billing', 'Staff'].map((cat, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    onPress={() => setCategory(cat)}
                    className={`mr-2 px-6 py-3 rounded-2xl border ${category === cat ? 'bg-teal-600 border-teal-600' : 'bg-white border-gray-100'}`}
                  >
                    <Text className={`text-[10px] font-black uppercase tracking-tighter ${category === cat ? 'text-white' : 'text-gray-400'}`}>{cat}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 ml-1">Detailed Description</Text>
              <TextInput 
                className="bg-gray-50/50 p-4 rounded-3xl border border-gray-100 text-sm font-medium text-gray-900 h-40"
                placeholder="Please describe the problem in detail..."
                placeholderTextColor="#94a3b8"
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <TouchableOpacity 
              className="bg-teal-600 py-5 rounded-[24px] items-center justify-center shadow-lg shadow-teal-100"
              onPress={handleSubmit}
            >
              <Text className="text-white font-black text-sm uppercase tracking-widest">Post Request</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-teal-900 p-6 rounded-[32px] flex-row items-center">
            <View className="h-10 w-10 bg-white/20 rounded-xl items-center justify-center mr-4">
              <Ionicons name="time" size={20} color="white" />
            </View>
            <View>
              <Text className="text-white text-xs font-black">Active Waiting: 12m</Text>
              <Text className="text-teal-400 text-[10px] font-bold">Estimated response time</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Standard Bottom Tab Bar Mock */}
      <View className="w-full flex-row justify-around items-center bg-white border-t border-gray-100 py-3 pb-8">
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate("DashboardOverview")}
        >
          <Ionicons name="grid-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Home</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate("InpatientManagement")}
        >
          <Ionicons name="people-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Patients</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate("ReportsManagement")}
        >
          <Ionicons name="stats-chart-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className="items-center"
          onPress={() => navigation.navigate("SettingsManagement")}
        >
          <Ionicons name="settings-outline" size={24} color="#94a3b8" />
          <Text className="mt-1 text-[10px] font-semibold text-gray-400 uppercase">Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const RaiseTicketScreen = () => (
  <AdminLayout>
    <RaiseTicketContent />
  </AdminLayout>
);

export default RaiseTicketScreen;
