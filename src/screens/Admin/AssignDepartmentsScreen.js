import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdminLayout, { useSidebar } from "./AdminLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");



// Premium Metric Card
const MetricCard = ({ label, value, icon, iconColor, bgColor, subtext }) => (
  <View style={[styles.metricCard, { backgroundColor: bgColor, borderColor: `${iconColor}20` }]}>
    <View style={[styles.decoratorCircle, { backgroundColor: iconColor, top: -20, right: -20, opacity: 0.1, width: 80, height: 80 }]} />
    
    <View className="flex-row items-center justify-between mb-4">
      <View className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="bg-white/50 px-2 py-0.5 rounded-md">
        <Text className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{subtext}</Text>
      </View>
    </View>

    <View>
      <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</Text>
      <Text className="text-xl font-black text-gray-900 mt-1 tracking-tighter">{value}</Text>
    </View>
  </View>
);

const AssignDepartmentsContent = () => {
  const { toggleSidebar } = useSidebar();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState([]);
  const [staff, setStaff] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' or 'active'
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("staffName");

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUnassignModal, setShowUnassignModal] = useState(false);
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState(null);
  const [selectedDeptForAssign, setSelectedDeptForAssign] = useState(null);
  const [currentAssignment, setCurrentAssignment] = useState(null);

  const [submitting, setSubmitting] = useState(false);

  // Helper: map role to display
  const toDisplayRole = (role) => {
    const value = String(role || "").toUpperCase();
    if (value === "LAB_TECH") return "Lab Tech";
    if (value === "PHARMACIST") return "Pharmacist";
    if (value === "DOCTOR") return "Doctor";
    if (value === "NURSE") return "Nurse";
    if (!value) return "Unknown";
    return value.charAt(0) + value.slice(1).toLowerCase();
  };

  // Fetch all assignments across all departments
  const fetchAllAssignments = useCallback(async (deptList) => {
    const list = deptList || departments;
    if (list.length === 0) return [];

    try {
      const results = await Promise.allSettled(
        list.map((dept) => api.get(`/api/v1/hospital-admin/departments/${dept.name}/staff`))
      );

      const allAssignments = [];
      results.forEach((res, index) => {
        if (res.status === "fulfilled") {
          const deptName = list[index].name;
          const staffList = res.value.staff || res.value || [];
          staffList.forEach((s, idx) => {
            allAssignments.push({
              id: `${deptName}-${s.id || s.staff_id || idx}`,
              staffId: s.id || s.staff_id || "N/A",
              staffName: s.name || s.staff_name || `${s.first_name} ${s.last_name}`.trim() || "Unknown",
              staffRole: s.role || s.user_role || "Unknown",
              staffRoleLabel: toDisplayRole(s.role || s.user_role),
              departmentName: deptName,
              status: s.is_active === false ? "inactive" : "active",
              assignedDate: s.assigned_at || s.created_at || new Date().toISOString(),
            });
          });
        }
      });
      return allAssignments;
    } catch (e) {
      console.error("Fetch assignments failed", e);
      return [];
    }
  }, [departments]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [deptRes, staffRes] = await Promise.all([
        api.get("/api/v1/hospital-admin/departments?limit=100"),
        api.get("/api/v1/hospital-admin/staff?limit=100")
      ]);

      const deptList = (deptRes.items || deptRes.departments || deptRes || []).filter(d => d.name);
      const staffList = (staffRes.items || staffRes.staff || staffRes || []).map(s => ({
        id: s.id || s.staff_id || s.user_id,
        name: s.name || s.staff_name || `${s.first_name} ${s.last_name}`.trim() || "Unnamed",
        role: s.role || s.user_role,
        roleLabel: toDisplayRole(s.role || s.user_role),
        status: s.is_active === false ? "inactive" : "active"
      }));

      setDepartments(deptList);
      setStaff(staffList);

      const rows = await fetchAllAssignments(deptList);
      setAssignments(rows);
    } catch (e) {
      Alert.alert("Error", "Failed to load management data.");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    const rows = await fetchAllAssignments();
    setAssignments(rows);
    setRefreshing(false);
  };

  const handleAssignStaff = async () => {
    if (!selectedStaffForAssign || !selectedDeptForAssign) {
      Alert.alert("Required", "Please select both a staff member and a department.");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/api/v1/hospital-admin/departments/assign-staff", {
        staff_name: selectedStaffForAssign.name,
        department_name: selectedDeptForAssign.name
      });
      Alert.alert("Success", `${selectedStaffForAssign.name} assigned to ${selectedDeptForAssign.name}`);
      setShowAssignModal(false);
      setSelectedStaffForAssign(null);
      setSelectedDeptForAssign(null);
      onRefresh();
    } catch (e) {
      Alert.alert("Error", e.message || "Assignment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUnassignStaff = async () => {
    if (!currentAssignment) return;

    setSubmitting(true);
    try {
      await api.post("/api/v1/hospital-admin/departments/unassign-staff", {
        staff_name: currentAssignment.staffName,
        department_name: currentAssignment.departmentName
      });
      Alert.alert("Success", "Staff member unassigned.");
      setShowUnassignModal(false);
      onRefresh();
    } catch (e) {
      Alert.alert("Error", e.message || "Unassignment failed");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssignments = assignments
    .filter((a) => {
      const matchesSearch = !searchTerm || 
        a.staffName.toLowerCase().includes(searchTerm.toLowerCase()) || 
        a.departmentName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = activeFilter === "all" || a.status === activeFilter;
      const matchesRole = roleFilter === "all" || a.staffRole.toUpperCase() === roleFilter.toUpperCase();
      return matchesSearch && matchesStatus && matchesRole;
    })
    .sort((a, b) => {
      if (sortBy === "staffName") return a.staffName.localeCompare(b.staffName);
      if (sortBy === "department") return a.departmentName.localeCompare(b.departmentName);
      return new Date(b.assignedDate) - new Date(a.assignedDate);
    });

  // Stats
  const stats = {
    total: assignments.length,
    staffCount: new Set(assignments.map(a => a.staffName)).size,
    deptCount: new Set(assignments.map(a => a.departmentName)).size,
    unassigned: staff.filter(s => !assignments.find(a => a.staffName === s.name)).length
  };

  const renderAssignmentRow = ({ item }) => (
    <View style={styles.recordCard} className="bg-white mx-4 mb-4 p-4 rounded-3xl border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-3">
            <Ionicons name="person" size={20} color="#3B82F6" />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-bold text-slate-900">{item.staffName}</Text>
            <View className="flex-row items-center mt-1">
              <View className="bg-purple-100 px-2 py-0.5 rounded-md mr-2">
                <Text className="text-[9px] font-black text-purple-700 uppercase">{item.staffRoleLabel}</Text>
              </View>
              <Text className="text-[10px] text-slate-400 font-medium">#{item.staffId.slice(-6)}</Text>
            </View>
          </View>
        </View>
        <TouchableOpacity 
          onPress={() => { setCurrentAssignment(item); setShowUnassignModal(true); }}
          className="w-10 h-10 bg-rose-50 rounded-xl items-center justify-center"
        >
          <Ionicons name="trash-outline" size={18} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View className="mt-4 pt-4 border-t border-slate-50 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <MaterialCommunityIcons name="office-building" size={16} color="#64748B" />
          <Text className="text-xs font-bold text-slate-700 ml-1">{item.departmentName}</Text>
        </View>
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={14} color="#94A3B8" />
          <Text className="text-[10px] font-medium text-slate-400 ml-1">
            {new Date(item.assignedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header (Fixed) */}
      <View className="px-6 py-6 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
              <Ionicons name="menu-outline" size={26} color="#0052CC" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">Dept Assign</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Staff Allocation Gateway</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowAssignModal(true)}
            className="h-11 px-4 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 flex-row"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-black text-xs ml-1">ASSIGN</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main List with Scrollable Header */}
      {loading ? (
        <View className="flex-1 items-center justify-center p-20">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cross-referencing staff...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredAssignments}
          renderItem={renderAssignmentRow}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <View className="pt-5">
              {/* Stats Cards */}
              <View className="flex-row flex-wrap justify-between px-5">
                <MetricCard label="Total Links" value={stats.total} icon="link" iconColor="#3B82F6" bgColor="#EFF6FF" subtext="TOTAL" />
                <MetricCard label="Staff Linked" value={stats.staffCount} icon="people" iconColor="#22C55E" bgColor="#F0FDF4" subtext="DISTINCT" />
                <MetricCard label="Depts Covered" value={stats.deptCount} icon="business" iconColor="#8B5CF6" bgColor="#F5F3FF" subtext="ACTIVE" />
                <MetricCard label="Unlinked Staff" value={stats.unassigned} icon="warning" iconColor="#F97316" bgColor="#FFF7ED" subtext="WAITING" />
              </View>

              {/* Filters Section */}
              <View className="px-5 mb-4">
                <View className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100">
                  <View className="relative">
                    <Ionicons name="search" size={18} color="#94A3B8" style={{ position: 'absolute', left: 15, top: 12, zIndex: 1 }} />
                    <TextInput
                      placeholder="Search staff or department..."
                      className="bg-slate-50 pl-11 pr-4 py-3 rounded-2xl font-medium text-slate-900 text-sm border border-slate-100"
                      value={searchTerm}
                      onChangeText={setSearchTerm}
                    />
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                    <View className="flex-row gap-2 pr-4">
                      {['all', 'DOCTOR', 'NURSE', 'LAB_TECH', 'PHARMACIST'].map(role => (
                        <TouchableOpacity
                          key={role}
                          onPress={() => setRoleFilter(role)}
                          className={`px-4 py-2 rounded-xl border ${roleFilter === role ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-100'}`}
                        >
                          <Text className={`text-[10px] font-black uppercase ${roleFilter === role ? 'text-white' : 'text-slate-500'}`}>
                            {role === 'all' ? 'All Roles' : toDisplayRole(role)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <View className="flex-row gap-2 mt-3">
                    {['all', 'active'].map(status => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setActiveFilter(status)}
                        className={`flex-1 py-2.5 rounded-xl border items-center ${activeFilter === status ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-50'}`}
                      >
                        <Text className={`text-[9px] font-black uppercase ${activeFilter === status ? 'text-white' : 'text-slate-400'}`}>
                          {status === 'all' ? 'Status: All' : 'Active Only'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity
                      onPress={() => setSortBy(sortBy === 'staffName' ? 'department' : 'staffName')}
                      className="flex-1 py-2.5 rounded-xl bg-slate-50 items-center flex-row justify-center"
                    >
                      <Ionicons name="swap-vertical" size={12} color="#64748B" />
                      <Text className="text-[9px] font-black uppercase text-slate-500 ml-1">Sort: {sortBy === 'staffName' ? 'Name' : 'Dept'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                {filteredAssignments.length > 0 && (
                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-6 mb-2 ml-1">
                    Current Assignments ({filteredAssignments.length})
                  </Text>
                )}
              </View>
            </View>
          }
          ListEmptyComponent={
            <View className="py-20 items-center">
              <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                <Ionicons name="file-tray-outline" size={32} color="#94A3B8" />
              </View>
              <Text className="text-slate-900 font-black text-lg">No Links Found</Text>
              <Text className="text-slate-400 text-xs text-center px-10 mt-2">Try adjusting your filters or assign new staff.</Text>
            </View>
          }
        />
      )
}

      {/* ASSIGN MODAL */}
      <Modal visible={showAssignModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[40px] h-[90%] p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-slate-900">New Assignment</Text>
              <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                <Ionicons name="close-circle" size={32} color="#E2E8F0" />
              </TouchableOpacity>
            </View>

            <View className="flex-1">
              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">1. SELECT STAFF MEMBER</Text>
              <View style={{ maxHeight: '40%' }} className="mb-6">
                <FlatList
                  data={staff}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setSelectedStaffForAssign(item)}
                      className={`flex-row items-center p-3 mb-2 rounded-2xl border ${selectedStaffForAssign?.id === item.id ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-slate-50 border-slate-50'}`}
                    >
                      <View className={`w-10 h-10 rounded-xl items-center justify-center mr-3 ${selectedStaffForAssign?.id === item.id ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <Text className="text-white font-black text-xs">{item.name.charAt(0)}</Text>
                      </View>
                      <View className="flex-1">
                        <Text className={`text-sm font-bold ${selectedStaffForAssign?.id === item.id ? 'text-blue-700' : 'text-slate-700'}`}>{item.name}</Text>
                        <Text className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{item.roleLabel}</Text>
                      </View>
                      {selectedStaffForAssign?.id === item.id && <Ionicons name="checkmark-circle" size={20} color="#2563EB" />}
                    </TouchableOpacity>
                  )}
                />
              </View>

              <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">2. SELECT DEPARTMENT</Text>
              <View style={{ maxHeight: '40%' }}>
                <FlatList
                  data={departments}
                  keyExtractor={(item) => item.id || item.name}
                  numColumns={2}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() => setSelectedDeptForAssign(item)}
                      className={`flex-1 p-3 mb-2 mx-1 rounded-2xl border items-center ${selectedDeptForAssign?.name === item.name ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-50'}`}
                    >
                      <View className={`w-8 h-8 rounded-lg items-center justify-center mb-2 ${selectedDeptForAssign?.name === item.name ? 'bg-purple-600' : 'bg-slate-200'}`}>
                        <Ionicons name="business" size={14} color="white" />
                      </View>
                      <Text className={`text-[10px] font-black text-center ${selectedDeptForAssign?.name === item.name ? 'text-purple-700' : 'text-slate-700'}`} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>

              <View className="mt-auto pt-6">
                <TouchableOpacity
                  onPress={handleAssignStaff}
                  disabled={submitting || !selectedStaffForAssign || !selectedDeptForAssign}
                  className={`h-16 rounded-[24px] items-center justify-center shadow-lg flex-row ${!selectedStaffForAssign || !selectedDeptForAssign ? 'bg-slate-200' : 'bg-blue-600 shadow-blue-200'}`}
                >
                  {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase tracking-widest">CONFIRM ALLOCATION</Text>}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* UNASSIGN MODAL */}
      <Modal visible={showUnassignModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 justify-center p-6">
          <View className="bg-white rounded-[40px] p-6 overflow-hidden">
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-rose-50 rounded-full items-center justify-center mb-4">
                <View className="w-14 h-14 bg-rose-500 rounded-full items-center justify-center shadow-lg shadow-rose-200">
                  <Ionicons name="trash" size={28} color="white" />
                </View>
              </View>
              <Text className="text-xl font-black text-slate-900">Unassign Staff?</Text>
              <Text className="text-slate-400 text-xs text-center mt-2 px-6 leading-relaxed">This will remove the link between this staff member and the department. They will lose access to its data.</Text>
            </View>

            {currentAssignment && (
              <View className="bg-slate-50 rounded-3xl p-5 mb-8 border border-slate-100">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="person" size={16} color="#3B82F6" />
                    <Text className="text-sm font-bold text-slate-700 ml-2">{currentAssignment.staffName}</Text>
                  </View>
                  <Ionicons name="arrow-forward" size={14} color="#CBD5E1" />
                  <View className="flex-row items-center">
                    <Ionicons name="business" size={16} color="#8B5CF6" />
                    <Text className="text-sm font-bold text-slate-700 ml-2">{currentAssignment.departmentName}</Text>
                  </View>
                </View>
                <View className="bg-rose-100/50 p-2 rounded-xl">
                  <Text className="text-[9px] text-rose-600 font-bold text-center uppercase">Removing department privileges</Text>
                </View>
              </View>
            )}

            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowUnassignModal(false)}
                className="flex-1 h-14 bg-slate-100 rounded-2xl items-center justify-center"
              >
                <Text className="font-bold text-slate-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUnassignStaff}
                disabled={submitting}
                className="flex-2 h-14 bg-rose-600 rounded-2xl items-center justify-center px-8 shadow-lg shadow-rose-200"
              >
                {submitting ? <ActivityIndicator color="white" /> : <Text className="font-black text-white uppercase tracking-widest text-xs">UNASSIGN</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    width: (width - 60) / 2,
    padding: 20,
    borderRadius: 32,
    marginBottom: 20,
    borderWidth: 1,
    overflow: "hidden",
  },
  decoratorCircle: {
    position: "absolute",
    borderRadius: 100,
  },
  recordCard: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  }
});

const AssignDepartmentsScreen = () => (
  <AdminLayout>
    <AssignDepartmentsContent />
  </AdminLayout>
);

export default AssignDepartmentsScreen;