import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const appointments = [
  { id: '1', patient: 'John Doe', doctor: 'Dr. Sarah Wilson', time: '10:30 AM', status: 'Confirmed' },
  { id: '2', patient: 'Jane Smith', doctor: 'Dr. James Miller', time: '11:45 AM', status: 'Waiting' },
  { id: '3', patient: 'Mike Ross', doctor: 'Dr. Emily Chen', time: '02:00 PM', status: 'Completed' },
  { id: '4', patient: 'Rachel Zane', doctor: 'Dr. Sarah Wilson', time: '03:30 PM', status: 'Upcoming' },
];

const AppointmentsContent = () => {
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
            <Text className="text-lg font-black text-gray-900">Patient Appointments</Text>
          </View>
        </View>
        <TouchableOpacity className="h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
          <Ionicons name="calendar-outline" size={22} color="#0052CC" />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 p-6">
        {appointments.map((item) => (
          <View key={item.id} className="mb-4 bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-row items-center">
                <View className="h-10 w-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                  <Text className="text-blue-700 font-bold">{item.patient.charAt(0)}</Text>
                </View>
                <View>
                  <Text className="text-sm font-bold text-gray-900">{item.patient}</Text>
                  <Text className="text-[10px] text-gray-500">{item.doctor}</Text>
                </View>
              </View>
              <View className={`px-3 py-1 rounded-full ${item.status === 'Confirmed' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
                <Text className={`text-[10px] font-bold ${item.status === 'Confirmed' ? 'text-emerald-600' : 'text-gray-500'}`}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
            
            <View className="flex-row items-center justify-between pt-3 border-t border-gray-50">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={14} color="#64748b" />
                <Text className="ml-1 text-xs text-gray-500 font-medium">{item.time}</Text>
              </View>
              <TouchableOpacity>
                <Text className="text-xs font-bold text-blue-700">Reschedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const AppointmentsScreen = () => (
  <AdminLayout>
    <AppointmentsContent />
  </AdminLayout>
);

export default AppointmentsScreen;