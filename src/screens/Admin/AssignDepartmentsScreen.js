import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const AssignDepartmentsContent = () => {
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const { toggleSidebar } = useSidebar();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const mockAssignments = [
      {
        id: "1",
        staffName: "Dr. Rajesh Kumar",
        role: "Doctor",
        department: "Cardiology",
        status: "active",
        date: "2024-01-15",
      },
      {
        id: "2",
        staffName: "Nurse Anjali",
        role: "Nurse",
        department: "Pediatrics",
        status: "active",
        date: "2024-02-10",
      },
      {
        id: "3",
        staffName: "Dr. Sarah Wilson",
        role: "Doctor",
        department: "Emergency Care",
        status: "active",
        date: "2024-03-01",
      },
    ];

    setAssignments(mockAssignments);
    setLoading(false);
  };

  const filteredData = assignments.filter((item) =>
    item.staffName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View className="bg-white p-5 rounded-3xl mb-4 shadow-sm border border-gray-100">
      <View className="flex-row items-center justify-between mb-2">
        <View className="flex-row items-center">
            <View className="h-10 w-10 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Text className="text-blue-700 font-bold">{item.staffName.charAt(0)}</Text>
            </View>
            <View>
                <Text className="text-base font-bold text-gray-900">{item.staffName}</Text>
                <Text className="text-xs text-gray-500">{item.role}</Text>
            </View>
        </View>
        <View className="bg-emerald-50 px-2 py-0.5 rounded-lg">
            <Text className="text-[10px] font-bold text-emerald-600 uppercase tracking-tighter">{item.status}</Text>
        </View>
      </View>

      <View className="flex-row items-center mt-2 pt-3 border-t border-gray-50">
        <View className="flex-row items-center flex-1">
            <Ionicons name="business-outline" size={14} color="#64748b" />
            <Text className="ml-1.5 text-xs font-bold text-blue-700">{item.department}</Text>
        </View>
        <TouchableOpacity className="bg-rose-50 px-4 py-2 rounded-xl">
          <Text className="text-xs font-bold text-rose-600">Unassign</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-[#F8FAFC]">
        <ActivityIndicator size="large" color="#0052CC" />
        <Text className="mt-4 text-gray-500 font-medium tracking-widest">LOADING ASSIGNMENTS...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#F8FAFC]">
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
            <Text className="text-lg font-black text-gray-900">Assignments</Text>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => setModalVisible(true)}
          className="h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View className="px-6 pt-6 flex-1">
        {/* Search */}
        <View className="bg-white rounded-2xl px-4 py-3 mb-6 flex-row items-center border border-gray-100 shadow-sm">
          <Ionicons name="search-outline" size={20} color="#94a3b8" />
          <TextInput
            placeholder="Search staff members..."
            value={searchTerm}
            onChangeText={setSearchTerm}
            className="ml-3 flex-1 text-gray-900 font-medium"
            placeholderTextColor="#94a3b8"
          />
        </View>

        {/* List */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View className="items-center justify-center py-20">
                <Ionicons name="search" size={48} color="#e2e8f0" />
                <Text className="mt-4 text-gray-400 font-medium">No assignments found</Text>
            </View>
          }
        />
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-8 h-[80%]">
                <View className="flex-row justify-between items-center mb-8">
                    <Text className="text-2xl font-black text-gray-900">Assign Staff</Text>
                    <TouchableOpacity 
                        onPress={() => setModalVisible(false)}
                        className="h-10 w-10 items-center justify-center rounded-full bg-gray-100"
                    >
                        <Ionicons name="close" size={20} color="#64748b" />
                    </TouchableOpacity>
                </View>

                <View className="space-y-6">
                    <View>
                        <Text className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest px-1">Select Employee</Text>
                        <TouchableOpacity className="h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 flex-row items-center justify-between">
                            <Text className="text-gray-400">Search for a staff member</Text>
                            <Ionicons name="chevron-down" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <View className="mt-4">
                        <Text className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest px-1">Target Department</Text>
                        <TouchableOpacity className="h-14 bg-gray-50 rounded-2xl border border-gray-100 px-4 flex-row items-center justify-between">
                            <Text className="text-gray-400">Select department</Text>
                            <Ionicons name="chevron-down" size={18} color="#94a3b8" />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity className="mt-10 bg-blue-600 h-16 rounded-2xl items-center justify-center shadow-lg shadow-blue-200">
                        <Text className="text-white font-black text-lg">Confirm Assignment</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const AssignDepartmentsScreen = () => (
  <AdminLayout>
    <AssignDepartmentsContent />
  </AdminLayout>
);

export default AssignDepartmentsScreen;