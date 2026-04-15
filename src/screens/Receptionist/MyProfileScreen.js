import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ReceptionistLayout from "./ReceptionistLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

const InfoItem = ({ icon, label, value }) => (
  <View className="flex-row items-center mb-5">
    <View className="mr-4 w-5">
      <Ionicons name={icon} size={20} color="#3b82f6" />
    </View>
    <View className="flex-1">
      <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{label}</Text>
      <Text className="text-[14px] font-semibold text-slate-700 mt-0.5" numberOfLines={1}>{value || "N/A"}</Text>
    </View>
  </View>
);

const MetricCard = ({ label, value }) => {
  // 2-column grid calculation: (Total Width - padding - gap) / 2
  const cardWidth = (width - 32 - 40) / 2; 
  return (
    <View 
      style={{ width: cardWidth }}
      className="bg-white border border-slate-100 rounded-2xl p-4 mb-4 shadow-sm"
    >
      <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</Text>
      <Text className="text-[15px] font-bold text-slate-800" numberOfLines={1}>{value}</Text>
    </View>
  );
};

const PermissionCard = ({ label, active }) => (
  <View className={`flex-row items-center p-4 rounded-2xl mb-3 border ${active ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'} w-[48.5%]`}>
    <View className={`h-6 w-6 rounded-full items-center justify-center mr-3 ${active ? 'bg-emerald-500' : 'bg-slate-300'}`}>
      <Ionicons name={active ? "checkmark-sharp" : "ellipse"} size={12} color="white" />
    </View>
    <Text className={`text-[12px] font-bold flex-1 ${active ? 'text-blue-900' : 'text-slate-500'}`} numberOfLines={1}>
      {label}
    </Text>
  </View>
);

const ResponsibilityItem = ({ text }) => (
  <View className="bg-[#eff6ff] rounded-2xl p-4 mb-3 flex-row items-center border border-[#dbeafe]">
    <Ionicons name="checkmark-circle" size={18} color="#10b981" />
    <Text className="text-slate-700 text-[14px] font-bold ml-3">{text}</Text>
  </View>
);

const MyProfileScreen = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await api.getReceptionistProfile();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
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

  if (loading && !refreshing) {
    return (
      <ReceptionistLayout>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      </ReceptionistLayout>
    );
  }

  return (
    <ReceptionistLayout>
      <ScrollView 
        className="flex-1 bg-[#f8fafc]" 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />}
      >
        <View className="p-4 pb-12">
          
          <View className="space-y-6">
            
            {/* Profile Identity Card */}
            <View className="bg-white rounded-[32px] p-6 shadow-md shadow-slate-100 border border-slate-100">
              <View className="items-center mb-6">
                <View className="p-1 border-2 border-blue-500 rounded-[28px]">
                  <Image 
                    source={{ uri: 'https://img.freepik.com/free-photo/female-medical-professional-working-hospital_23-2148821901.jpg' }} 
                    className="h-28 w-28 rounded-[24px]"
                  />
                </View>
                <Text className="text-2xl font-black text-slate-800 mt-5">{profile?.name || "Nagendra Uggirala"}</Text>
                <Text className="text-blue-600 font-bold text-[14px] mt-1 text-center">{profile?.designation || "Front Desk Receptionist"}</Text>
                
                <View className="bg-slate-50 px-5 py-2 rounded-xl mt-3 flex-row items-center">
                  <Text className="text-slate-400 text-[11px] font-black tracking-widest uppercase">{profile?.receptionist_id || "STAFF-ID"}</Text>
                </View>

                <View className="bg-emerald-50 px-4 py-1.5 rounded-full mt-4 flex-row items-center border border-emerald-100">
                  <View className="h-2 w-2 rounded-full bg-emerald-500 mr-2" />
                  <Text className="text-emerald-700 text-[11px] font-black uppercase tracking-wider">Active Status</Text>
                </View>
              </View>

              <View className="border-t border-slate-50 pt-6">
                <InfoItem icon="mail-outline" label="Email" value={profile?.email} />
                <InfoItem icon="id-card-outline" label="Employee ID" value={profile?.employee_id} />
                <InfoItem icon="business-outline" label="Department ID" value={profile?.department_id} />
                <InfoItem icon="ribbon-outline" label="Designation" value={profile?.designation} />
                <InfoItem icon="time-outline" label="Current Shift" value={profile?.shift_type} />
                <InfoItem icon="location-outline" label="Work Area" value={profile?.work_area} />
              </View>

              <TouchableOpacity 
                style={{ height: 58 }}
                className="bg-blue-600 rounded-2xl flex-row justify-center items-center mt-6 active:bg-blue-700 shadow-lg shadow-blue-200"
              >
                <Ionicons name="create-outline" size={20} color="white" />
                <Text className="text-white font-black text-[15px] ml-3 tracking-wide uppercase">Edit Professional Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Professional Info Section with 2x2 Grid */}
            <View className="bg-[#e0f0ff] rounded-[32px] overflow-hidden border border-slate-100 shadow-sm">
              <View className="px-6 pt-7 pb-5">
                <Text className="text-2xl font-black text-slate-900">Professional Information</Text>
                <Text className="text-blue-600/60 text-[12px] font-bold mt-1 uppercase tracking-wider">Credentials & Work Status</Text>
              </View>

              <View className="bg-white p-5 rounded-t-[32px] space-y-6">
                {/* Metrics 2x2 Grid */}
                <View className="flex-row flex-wrap justify-between mt-2">
                  <MetricCard label="Employee ID" value={profile?.employee_id?.substring(0, 10)} />
                  <MetricCard label="Experience" value={`${profile?.experience_years || 0} yrs`} />
                  <MetricCard label="Shift" value={profile?.shift_type} />
                  <MetricCard label="Employment" value={profile?.employment_type?.replace('_', ' ') || "Full Time"} />
                </View>

                {/* Permissions */}
                <View>
                  <View className="flex-row items-center mb-4 px-1">
                    <Ionicons name="shield-checkmark-outline" size={20} color="#3b82f6" />
                    <Text className="text-lg font-black text-slate-800 ml-2">Access Permissions</Text>
                  </View>
                  <View className="flex-row flex-wrap justify-between">
                    <PermissionCard label="Schedule" active={profile?.permissions?.can_schedule_appointments} />
                    <PermissionCard label="Modify" active={profile?.permissions?.can_modify_appointments} />
                    <PermissionCard label="Register" active={profile?.permissions?.can_register_patients} />
                    <PermissionCard label="Payments" active={profile?.permissions?.can_collect_payments} />
                  </View>
                </View>

                {/* Responsibilities */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-4 px-1">
                    <Ionicons name="list-outline" size={20} color="#3b82f6" />
                    <Text className="text-lg font-black text-slate-800 ml-2">Main Responsibilities</Text>
                  </View>
                  <ResponsibilityItem text="Schedule and manage appointments" />
                  <ResponsibilityItem text="Modify existing appointments" />
                  <ResponsibilityItem text="Register new patients" />
                </View>
              </View>
            </View>

          </View>
        </View>
      </ScrollView>
    </ReceptionistLayout>
  );
};

export default MyProfileScreen;
