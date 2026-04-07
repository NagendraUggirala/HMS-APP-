import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const labTests = [
  { id: '1', patient: 'John Doe', test: 'Blood Work (CBC)', status: 'Result Ready', code: 'T101' },
  { id: '2', patient: 'Jane Smith', test: 'MRI Scan (Brain)', status: 'Processing', code: 'T102' },
  { id: '3', patient: 'Mike Ross', test: 'X-Ray (Chest)', status: 'Pending', code: 'T103' },
];

const LabContent = () => {
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
            <Text className="text-lg font-black text-gray-900">LAB & Diagnostics</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="flask-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {labTests.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50 flex-row items-center">
            <View className="h-14 w-14 bg-amber-100 rounded-2xl items-center justify-center mr-4">
              <Ionicons name="flask" size={28} color="#d97706" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-gray-900">{item.test}</Text>
              <Text className="text-gray-500 text-xs">Patient: {item.patient} • Code: {item.code}</Text>
              <View className="flex-row items-center mt-2">
                <View className={`h-2 w-2 rounded-full mr-2 ${item.status === 'Result Ready' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{item.status}</Text>
              </View>
            </View>
            <TouchableOpacity className="h-10 w-10 bg-gray-50 rounded-xl items-center justify-center">
              <Ionicons name="download-outline" size={18} color="#64748b" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const LabScreen = () => (
  <AdminLayout>
    <LabContent />
  </AdminLayout>
);

export default LabScreen;