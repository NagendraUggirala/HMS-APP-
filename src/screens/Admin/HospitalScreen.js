import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const HospitalContent = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={toggleSidebar}
            className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50"
          >
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</Text>
            <Text className="text-lg font-black text-gray-900">Hospital Profile </Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
          <Ionicons name="notifications-outline" size={22} color="#64748b" />
        </TouchableOpacity>
      </View>
       

       <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
       >
        <View className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100/50">
          <View className="h-20 w-20 bg-blue-100 rounded-[28px] items-center justify-center mb-6">
            <Ionicons name="business" size={40} color="#0052CC" />
          </View>
          <Text className="text-3xl font-black text-gray-900 mb-2">City General Hospital</Text>
          <Text className="text-gray-500 font-medium mb-8 leading-5">123 healthcare ave, Medical District, NY 10001</Text>
          
          <View className="bg-gray-50/50 rounded-2xl p-2">
            <View className="flex-row items-center p-4 border-b border-gray-100">
              <View className="h-10 w-10 bg-white rounded-xl items-center justify-center shadow-sm">
                <Ionicons name="call-outline" size={20} color="#0052CC" />
              </View>
              <View className="ml-4">
                <Text className="text-[10px] font-bold text-gray-400 uppercase track  ing-widest">Phone Number</Text>
                <Text className="text-gray-800 font-bold">+1 (234) 567-8900</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4 border-b border-gray-100">
              <View className="h-10 w-10 bg-white rounded-xl items-center justify-center shadow-sm">
                <Ionicons name="mail-outline" size={20} color="#0052CC" />
              </View>
              <View className="ml-4">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</Text>
                <Text className="text-gray-800 font-bold">contact@citygeneral.com</Text>
              </View>
            </View>

            <View className="flex-row items-center p-4">
              <View className="h-10 w-10 bg-white rounded-xl items-center justify-center shadow-sm">
                <Ionicons name="globe-outline" size={20} color="#0052CC" />
              </View>
              <View className="ml-4">
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Public Website</Text>
                <Text className="text-gray-800 font-bold">www.citygeneral.com</Text>
              </View>
            </View>
          </View>
        </View>
        
        <TouchableOpacity className="mt-8 bg-blue-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-blue-200">
          <Text className="text-white font-black text-base">Edit Profile Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>

    
  );
};

const HospitalScreen = () => {
  return (
    <AdminLayout>
      <HospitalContent />
    </AdminLayout>
  );
};

export default HospitalScreen;