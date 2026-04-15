import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import NurseLayout from "./NurseLayout";
import { api } from "../../services/api";

const ProfileInfoItem = ({ icon, label, value, color }) => (
  <View className="flex-row items-center py-4 border-b border-gray-50 last:border-0">
    <View className={`h-11 w-11 rounded-2xl items-center justify-center ${color} mr-4 shadow-sm`}>
        <Ionicons name={icon} size={22} color="white" />
    </View>
    <View className="flex-1">
        <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</Text>
        <Text className="text-[15px] font-bold text-gray-800 mt-0.5">{value || "Not Set"}</Text>
    </View>
    <Ionicons name="chevron-forward" size={16} color="#e2e8f0" />
  </View>
);

const PermissionChip = ({ label, status }) => (
  <View className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 mb-2 ${status ? 'bg-emerald-50' : 'bg-rose-50'}`}>
    <View className={`h-1.5 w-1.5 rounded-full mr-2 ${status ? 'bg-emerald-500' : 'bg-rose-500'}`} />
    <Text className={`text-[11px] font-bold ${status ? 'text-emerald-700' : 'text-rose-700'}`}>
      {label.replace(/_/g, ' ').toUpperCase()}
    </Text>
  </View>
);

const MyProfileContent = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.getNurseProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching nurse profile:", error);
      Alert.alert("Error", "Failed to load profile details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const getInitials = (name) => {
    if (!name) return "NR";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-10">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="text-gray-400 mt-4 font-bold">Loading Professional Profile...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#f8fafc]">
      <ScrollView 
        contentContainerStyle={{ padding: 20 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />
        }
      >
        <View className="items-center mb-8 relative">
            <View className="relative">
                <View className="h-32 w-32 rounded-full bg-blue-600 items-center justify-center border-4 border-white shadow-2xl">
                    <Text className="text-white text-4xl font-black">
                        {getInitials(profile?.name)}
                    </Text>
                </View>
                <TouchableOpacity className="absolute bottom-1 right-1 h-10 w-10 bg-indigo-500 rounded-full items-center justify-center border-4 border-white shadow-md">
                    <Ionicons name="camera" size={18} color="white" />
                </TouchableOpacity>
            </View>
            <Text className="text-2xl font-black text-slate-900 mt-4">{profile?.name || "Access Restricted"}</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-blue-100 px-3 py-1 rounded-full border border-blue-200">
                <Text className="text-[10px] text-blue-700 font-black uppercase tracking-widest">
                  {profile?.designation || "Staff Nurse"}
                </Text>
              </View>
            </View>
        </View>

        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-6">
            <Text className="text-lg font-black text-slate-900 mb-5">Identity & Contact</Text>
            <ProfileInfoItem icon="finger-print" label="Staff/Nurse ID" value={profile?.nurse_id || profile?.employee_id} color="bg-indigo-500" />
            <ProfileInfoItem icon="mail" label="Institutional Email" value={profile?.email} color="bg-violet-500" />
            <ProfileInfoItem icon="briefcase" label="Professional Experience" value={`${profile?.experience_years || 0} Years`} color="bg-blue-500" />
            <ProfileInfoItem icon="location" label="Assigned Work Area" value={profile?.work_area || "General Ward"} color="bg-amber-500" />
        </View>

        <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-6">
            <Text className="text-lg font-black text-slate-900 mb-5">Employment Details</Text>
            <View className="flex-row justify-between mb-6">
                <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Employee Ref</Text>
                    <Text className="text-[15px] font-bold text-slate-800 mt-1">{profile?.employee_id || "N/A"}</Text>
                </View>
                <View className="items-end flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Shift Schedule</Text>
                    <View className="bg-orange-50 px-2 py-0.5 rounded-md mt-1 border border-orange-100">
                      <Text className="text-[13px] font-bold text-orange-700">{profile?.shift_type || "Day Shift"}</Text>
                    </View>
                </View>
            </View>
            <View className="flex-row justify-between pt-4 border-t border-slate-50">
                <View className="flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Contract Status</Text>
                    <Text className="text-[15px] font-bold text-slate-800 mt-1">{profile?.employment_type?.replace(/_/g, ' ') || "Full Time"}</Text>
                </View>
                <View className="items-end flex-1">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</Text>
                    <Text className="text-[14px] font-bold text-emerald-600 mt-1">Active Duty</Text>
                </View>
            </View>
        </View>

        {profile?.permissions && (
          <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 mb-10">
              <Text className="text-lg font-black text-slate-900 mb-5">System Permissions</Text>
              <View className="flex-row flex-wrap">
                {Object.entries(profile.permissions).map(([key, value]) => (
                  <PermissionChip key={key} label={key.replace('can_', '')} status={value} />
                ))}
              </View>
              <TouchableOpacity className="bg-slate-50 py-4 rounded-2xl items-center border border-slate-100 mt-4">
                  <Text className="text-xs font-black text-blue-600 tracking-widest">REQUEST PERMISSION ACCESS</Text>
              </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity 
          className="bg-rose-50 py-5 rounded-[24px] flex-row items-center justify-center mb-10 border border-rose-100 shadow-sm shadow-rose-200"
          onPress={() => Alert.alert("Logout", "Are you sure you want to end your current nurse session?", [
            { text: "Cancel", style: "cancel" },
            { text: "Secure Logout", style: "destructive", onPress: () => console.log("Logout triggered") }
          ])}
        >
            <Ionicons name="log-out" size={20} color="#ef4444" />
            <Text className="ml-2 text-sm font-black text-rose-600 tracking-widest uppercase">Secure Signout</Text>
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
