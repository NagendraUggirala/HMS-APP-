import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput, Dimensions, Alert } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AdminLayout, { useSidebar } from "./AdminLayout";

const { width } = Dimensions.get("window");

const inpatients = [
  {
    id: '1',
    name: 'John Doe',
    age: 45,
    gender: 'Male',
    room: '302-A',
    ward: 'Cardiology',
    admission: '2026-03-28',
    status: 'Stable',
    doctor: 'Dr. Sarah Wilson',
    contact: '+1 234 567 8901',
    vitals: { temp: '98.6°F', bp: '120/80', oxy: '98%' },
    insurance: 'Blue Cross'
  },
  {
    id: '2',
    name: 'Jane Smith',
    age: 32,
    gender: 'Female',
    room: '105-B',
    ward: 'Emergency Care',
    admission: '2026-03-31',
    status: 'Critical',
    doctor: 'Dr. Michael Chen',
    contact: '+1 234 567 8902',
    vitals: { temp: '101.2°F', bp: '145/95', oxy: '92%' },
    insurance: 'Medicare'
  },
  {
    id: '3',
    name: 'Mike Ross',
    age: 28,
    gender: 'Male',
    room: '212-C',
    ward: 'Pediatrics',
    admission: '2026-03-30',
    status: 'Improving',
    doctor: 'Dr. Rachel Zane',
    contact: '+1 234 567 8903',
    vitals: { temp: '99.1°F', bp: '115/75', oxy: '99%' },
    insurance: 'Aetna'
  },
  {
    id: '4',
    name: 'Emily Davis',
    age: 52,
    gender: 'Female',
    room: '401-D',
    ward: 'Neurology',
    admission: '2026-04-02',
    status: 'Observation',
    doctor: 'Dr. David Miller',
    contact: '+1 234 567 8904',
    vitals: { temp: '98.4°F', bp: '128/82', oxy: '97%' },
    insurance: 'UnitedHealth'
  },
];

const StatusBadge = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case 'critical': return { bg: 'bg-rose-50', text: 'text-rose-600', dot: 'bg-rose-500' };
      case 'stable': return { bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' };
      case 'improving': return { bg: 'bg-blue-50', text: 'text-blue-600', dot: 'bg-blue-500' };
      case 'observation': return { bg: 'bg-amber-50', text: 'text-amber-600', dot: 'bg-amber-500' };
      default: return { bg: 'bg-gray-50', text: 'text-gray-600', dot: 'bg-gray-500' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <View className={`${config.bg} px-2 py-1 rounded-lg flex-row items-center border border-white/20`}>
      <View className={`h-1.5 w-1.5 rounded-full mr-1.5 ${config.dot}`} />
      <Text className={`text-[10px] font-black uppercase tracking-tight ${config.text}`}>
        {status}
      </Text>
    </View>
  );
};

const InpatientContent = () => {
  const { toggleSidebar } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPatients = inpatients.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.room.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.doctor.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddPatient = () => Alert.alert("New Patient", "Open New Patient Admission form?");
  const handleFilter = () => Alert.alert("Filter", "Open patient filter options?");
  const handleFullProfile = (name) => Alert.alert("Patient Profile", `Navigating to ${name}'s full profile...`);
  const handleCall = (name, contact) => Alert.alert("Quick Call", `Dialing ${name} at ${contact}...`);
  const handleMore = (name) => Alert.alert("More Actions", `Showing more options for ${name}`);

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-6 py-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={toggleSidebar}
            className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50"
            activeOpacity={0.7}
          >
            <Ionicons name="menu-outline" size={26} color="#4F46E5" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Medical Services</Text>
            <Text className="text-xl font-black text-gray-900 leading-none">Inpatient Hub</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleAddPatient}
          className="h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 shadow-sm"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Search and Filters */}
        <View className="px-6 pt-6">
          <View className="flex-row items-center bg-gray-50 px-4 py-3 rounded-2xl border border-gray-100 mb-2">
            <Ionicons name="search-outline" size={20} color="#94A3B8" />
            <TextInput
              placeholder="Search patients, rooms, or doctors..."
              className="flex-1 ml-3 text-sm font-medium text-gray-900"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <TouchableOpacity onPress={handleFilter} className="bg-white p-2 rounded-lg shadow-sm">
              <Ionicons name="options-outline" size={18} color="#4F46E5" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center justify-between mb-6 px-1">
            <Text className="text-[11px] font-black text-indigo-600 uppercase tracking-widest">
              Showing {filteredPatients.length} Result{filteredPatients.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Quick Stats Lite */}
          <View className="flex-row justify-between mb-8">
            <View className="bg-indigo-50 w-[48%] rounded-[32px] p-5 border border-indigo-100/50 shadow-sm shadow-indigo-100/30">
              <View className="h-10 w-10 bg-white rounded-xl items-center justify-center mb-3 shadow-sm shadow-indigo-200/20">
                <Ionicons name="people" size={20} color="#4F46E5" />
              </View>
              <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Total Active</Text>
              <Text className="text-indigo-900 text-2xl font-black tracking-tighter">{inpatients.length}</Text>
            </View>
            <View className="bg-rose-50 w-[48%] rounded-[32px] p-5 border border-rose-100/50 shadow-sm shadow-rose-100/30">
              <View className="h-10 w-10 bg-white rounded-xl items-center justify-center mb-3 shadow-sm shadow-rose-200/20">
                <Ionicons name="warning" size={20} color="#F43F5E" />
              </View>
              <Text className="text-gray-400 text-[9px] font-black uppercase tracking-widest">Critical</Text>
              <Text className="text-rose-900 text-2xl font-black tracking-tighter">{inpatients.filter(p => p.status === 'Critical').length}</Text>
            </View>
          </View>

          <Text className="text-sm font-black text-gray-900 mb-4 uppercase tracking-tighter">Current Inpatients</Text>

          {filteredPatients.map((item) => (
            <View
              key={item.id}
              className="mb-5 bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden"
            >
              <View className="p-5 flex-row items-center border-b border-gray-50 bg-gray-50/50">
                <View className="h-14 w-14 bg-white rounded-2xl items-center justify-center border border-gray-100 shadow-sm mr-4">
                  <Text className="text-xl font-black text-indigo-600">{item.name.split(' ').map(n => n[0]).join('')}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between mb-1">
                    <Text className="text-lg font-black text-gray-900">{item.name}</Text>
                    <StatusBadge status={item.status} />
                  </View>
                  <View className="flex-row items-center">
                    <Text className="text-gray-500 text-[11px] font-bold">{item.age} yrs • {item.gender}</Text>
                    <View className="mx-2 h-1 w-1 rounded-full bg-gray-300" />
                    <Text className="text-indigo-600 text-[11px] font-black uppercase">Room {item.room}</Text>
                  </View>
                </View>
              </View>

              <View className="p-5">
                <View className="flex-row flex-wrap mb-4">
                  <View className="w-1/2 mb-3">
                    <Text className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Primary Doctor</Text>
                    <View className="flex-row items-center">
                      <Ionicons name="person-outline" size={12} color="#4F46E5" />
                      <Text className="text-xs font-bold text-gray-800 ml-1.5">{item.doctor}</Text>
                    </View>
                  </View>
                  <View className="w-1/2 mb-3">
                    <Text className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ward/Unit</Text>
                    <View className="flex-row items-center">
                      <MaterialCommunityIcons name="hospital-building" size={12} color="#4F46E5" />
                      <Text className="text-xs font-bold text-gray-800 ml-1.5">{item.ward}</Text>
                    </View>
                  </View>
                </View>

                {/* Vitals Quick View */}
                <View className="bg-gray-50 rounded-2xl p-4 flex-row justify-between border border-gray-100">
                  <View className="items-center">
                    <Text className="text-[8px] font-black text-gray-400 uppercase mb-1">Temp</Text>
                    <Text className="text-xs font-black text-gray-700">{item.vitals.temp}</Text>
                  </View>
                  <View className="h-8 w-[1px] bg-gray-200" />
                  <View className="items-center">
                    <Text className="text-[8px] font-black text-gray-400 uppercase mb-1">BP</Text>
                    <Text className="text-xs font-black text-gray-700">{item.vitals.bp}</Text>
                  </View>
                  <View className="h-8 w-[1px] bg-gray-200" />
                  <View className="items-center">
                    <Text className="text-[8px] font-black text-gray-400 uppercase mb-1">O2 Sat</Text>
                    <Text className="text-xs font-black text-emerald-600 uppercase">{item.vitals.oxy}</Text>
                  </View>
                </View>

                <View className="mt-5 flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => handleFullProfile(item.name)}
                    className="flex-1 bg-indigo-600 py-3.5 rounded-2xl items-center justify-center flex-row shadow-lg shadow-indigo-100"
                  >
                    <Ionicons name="eye-outline" size={18} color="white" />
                    <Text className="text-white text-xs font-black ml-2">Monitor Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleCall(item.name, item.contact)}
                    className="h-12 w-12 bg-indigo-50 rounded-2xl items-center justify-center shadow-sm"
                  >
                    <Ionicons name="call-outline" size={20} color="#4F46E5" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleMore(item.name)}
                    className="h-12 w-12 bg-gray-50 rounded-2xl items-center justify-center"
                  >
                    <Ionicons name="ellipsis-horizontal" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Main Action Button */}
      <TouchableOpacity
        onPress={handleAddPatient}
        className="absolute bottom-10 right-6 h-16 w-16 items-center justify-center rounded-[24px] bg-indigo-600 shadow-xl shadow-indigo-200"
        activeOpacity={0.8}
      >
        <Ionicons name="person-add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const InpatientScreen = () => (
  <AdminLayout>
    <InpatientContent />
  </AdminLayout>
);

export default InpatientScreen;
