import { View, Text, TouchableOpacity, ScrollView, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const doctors = [
  { id: '1', name: 'Dr. Sarah Wilson', specialty: 'Cardiology', status: 'On Duty', patients: 12 },
  { id: '2', name: 'Dr. James Miller', specialty: 'Neurology', status: 'On Break', patients: 8 },
  { id: '3', name: 'Dr. Emily Chen', specialty: 'Pediatrics', status: 'On Duty', patients: 15 },
  { id: '4', name: 'Dr. Michael Brown', specialty: 'Orthopedics', status: 'Emergency', patients: 4 },
];

const DocterContent = () => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</Text>
            <Text className="text-lg font-black text-gray-900">Hospital Doctors</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="add" size={24} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {doctors.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex-row items-center">
            <View className="h-14 w-14 bg-blue-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="person" size={28} color="#0052CC" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">{item.name}</Text>
              <Text className="text-gray-500 text-xs">{item.specialty}</Text>
              <View className="flex-row items-center mt-2">
                <View className={`h-2 w-2 rounded-full mr-2 ${item.status === 'On Duty' ? 'bg-emerald-500' : item.status === 'Emergency' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.status} • {item.patients} patients today</Text>
              </View>
            </View>
            <TouchableOpacity className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center">
              <Ionicons name="chevron-forward" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const DocterScreen = () => (
  <AdminLayout>
    <DocterContent />
  </AdminLayout>
);

export default DocterScreen;