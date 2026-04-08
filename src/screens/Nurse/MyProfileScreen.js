import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";
import { useAppContext } from "../../context/AppContext";

const ProfileInfoItem = ({ icon, label, value, color }) => (
  <View className="flex-row items-center py-4 border-b border-gray-50">
    <View className={`h-10 w-10 rounded-xl items-center justify-center ${color} mr-4`}>
        <Ionicons name={icon} size={20} color="white" />
    </View>
    <View className="flex-1">
        <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{label}</Text>
        <Text className="text-sm font-bold text-gray-800">{value}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#cbd5e1" />
  </View>
);

const MyProfileContent = () => {
  const { currentUser } = useAppContext();

  return (
    <View className="flex-1">
      <ScrollView contentContainerStyle={{ padding: 20 }} showsVerticalScrollIndicator={false}>
        <View className="items-center mb-8">
            <View className="relative">
                <View className="h-32 w-32 rounded-full bg-blue-600 items-center justify-center border-4 border-white shadow-xl">
                    <Text className="text-white text-4xl font-black">
                        {currentUser?.name?.charAt(0) || "L"}
                    </Text>
                </View>
                <TouchableOpacity className="absolute bottom-1 right-1 h-10 w-10 bg-blue-500 rounded-full items-center justify-center border-4 border-white">
                    <Ionicons name="camera" size={18} color="white" />
                </TouchableOpacity>
            </View>
            <Text className="text-2xl font-black text-gray-900 mt-4">{currentUser?.name || "Lalith Nollu"}</Text>
            <Text className="text-sm text-gray-400 font-bold uppercase tracking-widest mt-1">Staff Senior Nurse</Text>
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">Personal Information</Text>
            <ProfileInfoItem icon="person" label="Full Name" value={currentUser?.name || "Lalith Nollu"} color="bg-blue-500" />
            <ProfileInfoItem icon="mail" label="Email Address" value="lalith.nollu@levitica.com" color="bg-violet-500" />
            <ProfileInfoItem icon="call" label="Phone Number" value="+1 (555) 000-9281" color="bg-emerald-500" />
            <ProfileInfoItem icon="location" label="Assigned Ward" value="Ward A, South Wing" color="bg-amber-500" />
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50 mb-10">
            <Text className="text-lg font-bold text-gray-900 mb-4">Staff Details</Text>
            <View className="flex-row justify-between mb-4">
                <View>
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Employee ID</Text>
                    <Text className="text-sm font-bold text-gray-800">LT-NR-9281</Text>
                </View>
                <View className="items-end">
                    <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Shift Type</Text>
                    <Text className="text-sm font-bold text-gray-800">Morning (8AM - 4PM)</Text>
                </View>
            </View>
            <TouchableOpacity className="bg-gray-50 py-4 rounded-2xl items-center border border-gray-100">
                <Text className="text-xs font-bold text-blue-600">VIEW PERFORMANCE REPORT</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity className="bg-rose-50 py-4 rounded-2xl flex-row items-center justify-center mb-10">
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text className="ml-2 text-sm font-bold text-rose-600">SIGNOUT SESSION</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

export default function MyProfileScreen() {
  return (
    <NurseLayout>
      <MyProfileContent />
    </NurseLayout>
  );
}
