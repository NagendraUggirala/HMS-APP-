import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const departments = [
  { id: '1', name: 'Emergency Care', code: 'ER', beds: '24/30', status: 'Optimal' },
  { id: '2', name: 'Cardiology Unit', code: 'CARD', beds: '12/15', status: 'Stable' },
  { id: '3', name: 'Pediatric Wing', code: 'PED', beds: '8/20', status: 'Growth' },
  { id: '4', name: 'Diagnostics Lab', code: 'LAB', beds: 'N/A', status: 'Active' },
];

const DepartmentsContent = () => {
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
            <Text className="text-lg font-black text-gray-900">Hospital Departments</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="business" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {departments.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex-row items-center">
            <View className="h-14 w-14 bg-emerald-100 rounded-2xl items-center justify-center mr-4">
              <Text className="text-emerald-700 font-bold text-xs uppercase">{item.code}</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">{item.name}</Text>
              <Text className="text-gray-500 text-xs">Occupied Beds: {item.beds}</Text>
              <View className="flex-row items-center mt-2">
                <View className="h-2 w-2 rounded-full mr-2 bg-emerald-500" />
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.status}</Text>
              </View>
            </View>
            <TouchableOpacity className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center">
              <Ionicons name="settings-outline" size={20} color="#64748b" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const DepartmentsScreen = () => (
  <AdminLayout>
    <DepartmentsContent />
  </AdminLayout>
);

export default DepartmentsScreen;