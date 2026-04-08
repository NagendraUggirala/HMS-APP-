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
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AdminLayout, { useSidebar } from "./AdminLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

// Premium Metric Card (Signature Series Style)
const MetricCard = ({ label, value, icon, iconColor, bgColor, subtext }) => (
  <View style={[styles.metricCard, { backgroundColor: bgColor, borderColor: `${iconColor}20` }]}>
    {/* Decorative Circles */}
    <View style={[styles.decoratorCircle, { backgroundColor: iconColor, top: -20, right: -20, opacity: 0.1, width: 80, height: 80 }]} />
    <View style={[styles.decoratorCircle, { backgroundColor: iconColor, bottom: -20, left: -20, opacity: 0.05, width: 60, height: 60 }]} />

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

// Ticket Item Card
const TicketCard = ({ ticket, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return '#EAB308';
      case 'IN_PROGRESS': return '#3B82F6';
      case 'RESOLVED': return '#22C55E';
      case 'CLOSED': return '#64748B';
      default: return '#94A3B8';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return '#EF4444';
      case 'HIGH': return '#F97316';
      case 'NORMAL': return '#3B82F6';
      case 'LOW': return '#64748B';
      default: return '#94A3B8';
    }
  };

  const statusColor = getStatusColor(ticket.status);
  const priorityColor = getPriorityColor(ticket.priority);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.ticketCard}
      className="bg-white mb-4 p-5 rounded-[24px] border border-slate-100 shadow-sm overflow-hidden"
    >
      {/* Small accent bar */}
      <View style={{ position: 'absolute', left: 0, top: 20, bottom: 20, width: 3, backgroundColor: priorityColor, borderRadius: 2 }} />

      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-4">
          <Text className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {ticket.id ? `TICKET #${String(ticket.id).padStart(6, '0')}` : 'TICKET'}
          </Text>
          <Text className="text-sm font-bold text-slate-900 leading-tight" numberOfLines={1}>{ticket.subject}</Text>
        </View>
        <View className="bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
          <Text style={{ color: statusColor }} className="text-[9px] font-black uppercase tracking-tighter">{ticket.status}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-slate-50">
        <View className="flex-row items-center">
          <View style={{ backgroundColor: `${priorityColor}15` }} className="px-2 py-1 rounded-md mr-3">
            <Text style={{ color: priorityColor }} className="text-[8px] font-black uppercase tracking-widest">{ticket.priority}</Text>
          </View>
          <Text className="text-[10px] font-medium text-slate-400">
            {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={16} color="#CBD5E1" />
      </View>
    </TouchableOpacity>
  );
};

const RaiseTicketContent = () => {
  const { toggleSidebar } = useSidebar();

  // State
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'completed'
  const [tickets, setTickets] = useState([]);
  const [completedTickets, setCompletedTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState(null);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ subject: '', description: '', priority: 'NORMAL' });
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({ status: '', notes: '' });

  // Load User Data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AsyncStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData));
      } catch (e) { console.error(e); }
    };
    loadUser();
  }, []);

  // API Calls
  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const response = await api.get('/api/v1/support/hospital-admin/tickets');
      // The API returns { tickets: [], total: ... }
      setTickets(response.tickets || []);
    } catch (e) {
      console.error("Fetch tickets error:", e);
      Alert.alert("Connection Error", "Could not fetch active tickets.");
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, []);

  const fetchCompletedTickets = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/support/hospital-admin/tickets/completed');
      setCompletedTickets(response.tickets || []);
    } catch (e) {
      console.error("Fetch completed tickets error:", e);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    fetchCompletedTickets();
  }, [fetchTickets, fetchCompletedTickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchTickets(true), fetchCompletedTickets()]);
    setRefreshing(false);
  }, [fetchTickets, fetchCompletedTickets]);

  const handleCreateTicket = async () => {
    if (!formData.subject || !formData.description) {
      Alert.alert("Required", "Please provide a subject and description.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/v1/support/hospital-admin/tickets', {
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority
      });
      Alert.alert("Success", "Ticket raised successfully! Our support team will review it.");
      setShowCreateModal(false);
      setFormData({ subject: '', description: '', priority: 'NORMAL' });
      fetchTickets();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusUpdate.status) return;
    setSubmitting(true);
    try {
      await api.patch(`/api/v1/support/hospital-admin/tickets/${selectedTicket.id}/status`, {
        status: statusUpdate.status,
        resolution_notes: statusUpdate.notes
      });
      Alert.alert("Updated", "Ticket status has been updated.");
      setShowStatusModal(false);
      setShowViewModal(false);
      fetchTickets();
      fetchCompletedTickets();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to update status.");
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation
  const stats = {
    total: tickets.length + completedTickets.length,
    open: tickets.filter(t => t.status === 'OPEN').length,
    inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
    completed: completedTickets.length + tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length
  };

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="px-6 py-6 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
              <Ionicons name="menu-outline" size={26} color="#0052CC" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">RaiseTicket</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hospital Admin Gateway</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="h-11 px-4 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 flex-row"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-black text-xs ml-1">NEW TICKET</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Metric Cards Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <MetricCard label="Total Submissions" value={stats.total} icon="documents" iconColor="#3B82F6" bgColor="#EFF6FF" subtext="HOSPITAL WIDE" />
          <MetricCard label="Pending Review" value={stats.open} icon="time" iconColor="#EAB308" bgColor="#FEFCE8" subtext="RESPONSE SOON" />
          <MetricCard label="Under Action" value={stats.inProgress} icon="hammer" iconColor="#8B5CF6" bgColor="#F5F3FF" subtext="IN PROGRESS" />
          <MetricCard label="Resolved" value={stats.completed} icon="checkmark-circle" iconColor="#22C55E" bgColor="#F0FDF4" subtext="FINALIZED" />
        </View>

        {/* Custom Tab Switcher */}
        <View className="flex-row bg-slate-100 p-1.5 rounded-[24px] mb-6">
          <TouchableOpacity
            onPress={() => setActiveTab('active')}
            className={`flex-1 py-3 items-center rounded-2xl ${activeTab === 'active' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-[11px] font-black uppercase ${activeTab === 'active' ? 'text-blue-600' : 'text-slate-400'}`}>Active Feedback</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('completed')}
            className={`flex-1 py-3 items-center rounded-2xl ${activeTab === 'completed' ? 'bg-white shadow-sm' : ''}`}
          >
            <Text className={`text-[11px] font-black uppercase ${activeTab === 'completed' ? 'text-green-600' : 'text-slate-400'}`}>Closed Archive</Text>
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-slate-400 font-bold uppercase text-[10px]">Synchronizing Tickets...</Text>
          </View>
        ) : (
          <View>
            {(activeTab === 'active' ? tickets : completedTickets).length === 0 ? (
              <View className="py-20 items-center">
                <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-4">
                  <Ionicons name="folder-open-outline" size={32} color="#94A3B8" />
                </View>
                <Text className="text-slate-900 font-black text-lg">No Tickets Found</Text>
                <Text className="text-slate-400 text-xs text-center px-10 mt-2">Any official requests or issues will appear here for tracking.</Text>
              </View>
            ) : (
              (activeTab === 'active' ? tickets : completedTickets).map((ticket) => (
                <TicketCard
                  key={ticket.id || ticket.ticket_id}
                  ticket={ticket}
                  onPress={() => { setSelectedTicket(ticket); setShowViewModal(true); }}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* CREATE MODAL */}
      <Modal visible={showCreateModal} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] h-[90%] p-6">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-black text-slate-900">New Support Ticket</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close-circle" size={32} color="#E2E8F0" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Subject</Text>
                <TextInput
                  className="bg-slate-50 p-5 rounded-3xl mb-6 font-bold text-slate-900 border border-slate-100"
                  placeholder="Summary of your request"
                  value={formData.subject}
                  onChangeText={(t) => setFormData({ ...formData, subject: t })}
                />

                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Priority</Text>
                <View className="flex-row mb-6">
                  {['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 py-3 items-center rounded-xl border border-slate-100 mr-2 ${formData.priority === p ? 'bg-blue-600' : 'bg-white'}`}
                    >
                      <Text className={`text-[9px] font-black ${formData.priority === p ? 'text-white' : 'text-slate-500'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</Text>
                <TextInput
                  className="bg-slate-50 p-5 rounded-3xl mb-8 font-medium text-slate-900 border border-slate-100 min-h-[150px]"
                  placeholder="Provide all relevant details..."
                  multiline
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(t) => setFormData({ ...formData, description: t })}
                />

                <TouchableOpacity
                  onPress={handleCreateTicket}
                  disabled={submitting}
                  className="bg-blue-600 h-16 rounded-[24px] items-center justify-center shadow-lg shadow-blue-200"
                >
                  {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase tracking-widest">SEND REQUEST</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* VIEW MODAL */}
      <Modal visible={showViewModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 justify-center p-6">
          <View className="bg-white rounded-[40px] p-6 max-h-[85%]">
            {selectedTicket && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-between items-start mb-6">
                  <View>
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ticket #{selectedTicket.id}</Text>
                    <Text className="text-xl font-black text-slate-900 mt-1">{selectedTicket.subject}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowViewModal(false)}>
                    <Ionicons name="close-circle" size={32} color="#F1F5F9" />
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-50 p-5 rounded-3xl mb-6">
                  <Text className="text-slate-600 font-medium leading-relaxed">{selectedTicket.description}</Text>
                </View>

                {selectedTicket.resolution_notes && (
                  <View className="bg-green-50 p-5 rounded-3xl mb-6 border border-green-100">
                    <Text className="text-[10px] font-black text-green-600 uppercase mb-2">Support Response</Text>
                    <Text className="text-green-800 font-bold">{selectedTicket.resolution_notes}</Text>
                  </View>
                )}

                <View className="flex-row justify-between mb-8">
                  <View>
                    <Text className="text-[9px] font-black text-slate-400 uppercase">Created On</Text>
                    <Text className="text-slate-900 font-bold text-xs">{new Date(selectedTicket.created_at).toLocaleDateString()}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[9px] font-black text-slate-400 uppercase">Current Status</Text>
                    <View className="bg-blue-50 px-3 py-1 rounded-full mt-1">
                      <Text className="text-blue-600 font-black text-[9px]">{selectedTicket.status}</Text>
                    </View>
                  </View>
                </View>

                {isSuperAdmin && (
                  <TouchableOpacity
                    onPress={() => { setShowStatusModal(true); setStatusUpdate({ status: selectedTicket.status, notes: '' }); }}
                    className="bg-slate-900 h-14 rounded-2xl items-center justify-center flex-row"
                  >
                    <Ionicons name="create-outline" size={20} color="white" className="mr-2" />
                    <Text className="text-white font-black uppercase text-xs">UPDATE TICKET</Text>
                  </TouchableOpacity>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* STATUS UPDATE MODAL */}
      <Modal visible={showStatusModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[40px] p-6">
            <Text className="text-xl font-black text-slate-900 mb-6">Update Status</Text>

            <View className="flex-row flex-wrap gap-2 mb-6">
              {['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setStatusUpdate({ ...statusUpdate, status: s })}
                  className={`px-4 py-3 rounded-xl border ${statusUpdate.status === s ? 'bg-blue-600 border-blue-600' : 'bg-slate-50 border-slate-100'}`}
                >
                  <Text className={`text-[10px] font-black ${statusUpdate.status === s ? 'text-white' : 'text-slate-500'}`}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              className="bg-slate-50 p-5 rounded-3xl mb-8 font-medium text-slate-900 h-32"
              placeholder="Resolution notes..."
              multiline
              value={statusUpdate.notes}
              onChangeText={(t) => setStatusUpdate({ ...statusUpdate, notes: t })}
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setShowStatusModal(false)} className="flex-1 h-14 bg-slate-100 rounded-2xl items-center justify-center">
                <Text className="font-bold text-slate-500">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleUpdateStatus} className="flex-2 h-14 bg-green-600 rounded-2xl items-center justify-center px-8">
                <Text className="font-black text-white uppercase tracking-widest">Save Changes</Text>
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
  ticketCard: {
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
  }
});

const RaiseTicketScreen = () => (
  <AdminLayout>
    <RaiseTicketContent />
  </AdminLayout>
);

export default RaiseTicketScreen;
