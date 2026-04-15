import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import DoctorLayout from "./DoctorLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

// Premium Priority Card
const PriorityCard = ({ label, value, icon, iconColor, bgColor, subtext }) => (
  <View style={[styles.priorityCard, { backgroundColor: bgColor, borderColor: `${iconColor}20` }]}>
    <View style={[styles.decoratorCircle, { backgroundColor: iconColor, top: -20, right: -20, opacity: 0.1, width: 80, height: 80 }]} />
    <View style={[styles.decoratorCircle, { backgroundColor: iconColor, bottom: -20, left: -20, opacity: 0.05, width: 60, height: 60 }]} />

    <View className="flex-row items-center justify-between mb-3">
      <View style={{ backgroundColor: 'white' }} className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm">
        <Ionicons name={icon} size={20} color={iconColor} />
      </View>
      <View className="bg-white/50 px-2 py-0.5 rounded-md">
        <Text style={{ color: iconColor }} className="text-[8px] font-black uppercase tracking-widest">{subtext}</Text>
      </View>
    </View>

    <View>
      <Text className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</Text>
      <Text className="text-2xl font-black text-gray-900 mt-0.5 tracking-tighter">{value}</Text>
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
      case 'CRITICAL': return '#B91C1C';
      case 'URGENT': return '#EA580C';
      case 'HIGH': return '#CA8A04';
      case 'NORMAL': return '#2563EB';
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
      className="bg-white mb-4 p-5 rounded-[32px] border border-slate-100 shadow-sm overflow-hidden"
    >
      <View style={{ position: 'absolute', left: 0, top: 20, bottom: 20, width: 4, backgroundColor: priorityColor, borderRadius: 2 }} />

      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-4">
          <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
            {ticket.id ? `ID: ${String(ticket.id).substring(0, 8)}` : 'TICKET'}
          </Text>
          <Text className="text-base font-black text-slate-900 leading-tight" numberOfLines={1}>{ticket.subject}</Text>
        </View>
        <View style={{ backgroundColor: `${statusColor}10` }} className="px-3 py-1 rounded-full">
          <Text style={{ color: statusColor }} className="text-[10px] font-black uppercase tracking-tighter">{ticket.status}</Text>
        </View>
      </View>

      <View className="flex-row items-center justify-between mt-2 pt-4 border-t border-slate-50">
        <View className="flex-row items-center">
          <View style={{ backgroundColor: `${priorityColor}15` }} className="px-3 py-1 rounded-xl mr-3">
            <Text style={{ color: priorityColor }} className="text-[9px] font-black uppercase tracking-widest">{ticket.priority}</Text>
          </View>
          <Text className="text-[11px] font-bold text-slate-400">
            {new Date(ticket.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <Ionicons name="arrow-forward-circle" size={24} color="#E2E8F0" />
      </View>
    </TouchableOpacity>
  );
};

const RaiseTicketContent = () => {
  // State from Web logic
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ status: '', skip: 0, limit: 50 });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Form State
  const [formData, setFormData] = useState({ subject: '', description: '', priority: 'NORMAL' });
  const [submitting, setSubmitting] = useState(false);

  // API Calls - Using /api/v1/support/staff/tickets as per snippet
  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        skip: filters.skip,
        limit: filters.limit,
      });
      if (filters.status) queryParams.append('status', filters.status);

      const endpoint = `/api/v1/support/staff/tickets?${queryParams.toString()}`;
      const response = await api.get(endpoint);
      
      let ticketsData = response.tickets || [];
      
      // Sort logic from web
      const priorityOrder = { 'CRITICAL': 1, 'URGENT': 2, 'HIGH': 3, 'NORMAL': 4, 'LOW': 5 };
      ticketsData = [...ticketsData].sort((a, b) => {
        const orderA = priorityOrder[a.priority] || 99;
        const orderB = priorityOrder[b.priority] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setTickets(ticketsData);
    } catch (e) {
      console.error("Fetch tickets error:", e);
      setTickets([]);
      // If staff endpoint fails (e.g. legacy backend), fallback to general
      try {
         const fb = await api.get('/api/v1/support/tickets');
         setTickets(fb.tickets || []);
      } catch (fbErr) { console.warn("Fallback fetch also failed"); }
    } finally {
      if (!isRefresh) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchTickets(true);
    setRefreshing(false);
  }, [fetchTickets]);

  const handleCreateTicket = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      Alert.alert("Required", "Please provide a subject and description.");
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/api/v1/support/staff/tickets', {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      });
      Alert.alert("Success", "Support ticket raised successfully!");
      setShowCreateModal(false);
      setFormData({ subject: '', description: '', priority: 'NORMAL' });
      fetchTickets();
    } catch (e) {
      Alert.alert("Error", e.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  // Stats calculation (Priority Cards Only - exactly like web)
  const stats = useMemo(() => {
    return {
      critical: tickets.filter(t => t.priority === 'CRITICAL').length,
      urgent: tickets.filter(t => t.priority === 'URGENT').length,
      high: tickets.filter(t => t.priority === 'HIGH').length,
      normal: tickets.filter(t => t.priority === 'NORMAL').length,
      low: tickets.filter(t => t.priority === 'LOW').length
    };
  }, [tickets]);

  // Search filter
  const filteredTickets = useMemo(() => {
    if (!searchTerm) return tickets;
    const s = searchTerm.toLowerCase();
    return tickets.filter(t => 
      t.subject?.toLowerCase().includes(s) || 
      t.id?.toLowerCase().includes(s) ||
      t.priority?.toLowerCase().includes(s)
    );
  }, [tickets, searchTerm]);

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="px-6 py-5 bg-white border-b border-slate-100 shadow-sm flex-row items-center justify-between">
        <View>
          <Text className="text-2xl font-black text-slate-900 tracking-tighter">Raise Ticket</Text>
          <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Staff Raise Ticket Portal</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowCreateModal(true)}
          className="h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Global Action Bar (Search & Filter) */}
      <View className="px-4 pt-4 flex-row items-center gap-2">
        <View className="flex-1 flex-row items-center bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm">
          <Ionicons name="search" size={18} color="#94A3B8" />
          <TextInput
            placeholder="Search tickets..."
            className="flex-1 ml-3 font-bold text-slate-900 text-sm"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
        </View>
        <TouchableOpacity 
          onPress={() => {
            // Cycle through status filters
            const statuses = ['', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
            const nextIdx = (statuses.indexOf(filters.status) + 1) % statuses.length;
            setFilters({...filters, status: statuses[nextIdx]});
          }}
          style={{ backgroundColor: filters.status ? '#E0F2FE' : 'white' }}
          className="w-12 h-12 items-center justify-center rounded-2xl border border-slate-100 shadow-sm"
        >
          <Ionicons name="filter" size={20} color={filters.status ? '#0369A1' : '#64748B'} />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* ONLY 5 Priority Cards - Exactly like web snippet */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 -mx-1">
          <PriorityCard label="Critical" value={stats.critical} icon="alert-circle" iconColor="#B91C1C" bgColor="#FEF2F2" subtext="IMMEDIATE" />
          <PriorityCard label="Urgent" value={stats.urgent} icon="time" iconColor="#EA580C" bgColor="#FFF7ED" subtext="SOON" />
          <PriorityCard label="High" value={stats.high} icon="flash" iconColor="#CA8A04" bgColor="#FEFCE8" subtext="QUICK" />
          <PriorityCard label="Normal" value={stats.normal} icon="document-text" iconColor="#2563EB" bgColor="#EFF6FF" subtext="STANDARD" />
          <PriorityCard label="Low" value={stats.low} icon="checkmark-done" iconColor="#64748B" bgColor="#F8FAFC" subtext="BACKLOG" />
        </ScrollView>

        <View className="mb-4 px-2 flex-row items-center justify-between">
           <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
             {filters.status ? `Filtering: ${filters.status}` : 'All Recent Tickets'}
           </Text>
           <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{filteredTickets.length} Found</Text>
        </View>

        {/* Tickets List */}
        {loading ? (
          <View className="py-20 items-center">
            <ActivityIndicator size="large" color="#3B82F6" />
            <Text className="mt-4 text-slate-400 font-bold uppercase text-[10px]">Syncing Portal...</Text>
          </View>
        ) : (
          <View>
            {filteredTickets.length === 0 ? (
              <View className="py-20 items-center">
                <View className="w-20 h-20 bg-slate-50 rounded-full items-center justify-center mb-6">
                  <Ionicons name="documents-outline" size={40} color="#CBD5E1" />
                </View>
                <Text className="text-slate-900 font-black text-xl">No Tickets Clean</Text>
                <Text className="text-slate-400 text-xs text-center px-12 mt-2 leading-relaxed">No support requested located. Tap the '+' button above to raise a new issue.</Text>
              </View>
            ) : (
              filteredTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
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
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[48px] h-[85%] p-8 shadow-2xl">
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-3xl font-black text-slate-900 tracking-tighter">New Ticket</Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)} className="bg-slate-50 p-2 rounded-full">
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Ticket Subject</Text>
                <TextInput
                  className="bg-slate-50 p-5 rounded-3xl mb-6 font-bold text-slate-900 border border-slate-100"
                  placeholder="What can we help you with?"
                  value={formData.subject}
                  onChangeText={(t) => setFormData({ ...formData, subject: t })}
                />

                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Urgency Level</Text>
                <View className="flex-row gap-2 mb-6">
                  {['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => setFormData({ ...formData, priority: p })}
                      style={{ backgroundColor: formData.priority === p ? '#2563EB' : 'white' }}
                      className={`flex-1 py-3 items-center rounded-xl border border-slate-100 shadow-sm`}
                    >
                      <Text className={`text-[9px] font-black ${formData.priority === p ? 'text-white' : 'text-slate-500'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-2">Issue Description</Text>
                <TextInput
                  className="bg-slate-50 p-5 rounded-3xl mb-8 font-medium text-slate-900 border border-slate-100 min-h-[160px]"
                  placeholder="Describe your request in detail..."
                  multiline
                  textAlignVertical="top"
                  value={formData.description}
                  onChangeText={(t) => setFormData({ ...formData, description: t })}
                />

                <TouchableOpacity
                  onPress={handleCreateTicket}
                  disabled={submitting}
                  className="bg-blue-600 h-18 rounded-[32px] items-center justify-center shadow-xl shadow-blue-200"
                >
                  {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase text-sm tracking-[2px]">SUBMIT TICKET</Text>}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* VIEW MODAL */}
      <Modal visible={showViewModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/70 justify-center p-6">
          <View className="bg-white rounded-[48px] p-8 max-h-[85%] shadow-2xl">
            {selectedTicket && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-between items-start mb-8">
                  <View className="flex-1 mr-4">
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {selectedTicket.id}</Text>
                    <Text className="text-2xl font-black text-slate-900 mt-2 leading-tight">{selectedTicket.subject}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setShowViewModal(false)} className="bg-slate-50 p-2 rounded-full">
                    <Ionicons name="close" size={24} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <View className="bg-slate-50 p-6 rounded-[32px] mb-8 border border-slate-100">
                  <Text className="text-slate-600 font-medium leading-relaxed text-sm">{selectedTicket.description}</Text>
                </View>

                {selectedTicket.resolution_notes && (
                  <View className="bg-emerald-50 p-6 rounded-[32px] mb-8 border border-emerald-100">
                    <View className="flex-row items-center mb-3">
                       <Ionicons name="checkmark-seal" size={18} color="#059669" />
                       <Text className="text-[10px] font-black text-emerald-600 uppercase ml-2 tracking-widest">Support Feedback</Text>
                    </View>
                    <Text className="text-emerald-900 font-bold text-sm leading-relaxed">{selectedTicket.resolution_notes}</Text>
                  </View>
                )}

                <View className="flex-row justify-between items-center pt-6 border-t border-slate-50">
                   <View>
                      <Text className="text-[9px] font-black text-slate-400 uppercase mb-1">Status</Text>
                      <View className="bg-blue-50 px-4 py-1.5 rounded-full">
                         <Text className="text-blue-600 font-black text-[10px] tracking-tight">{selectedTicket.status}</Text>
                      </View>
                   </View>
                   <View className="items-end">
                      <Text className="text-[9px] font-black text-slate-400 uppercase mb-1">Priority</Text>
                      <View className="bg-slate-100 px-4 py-1.5 rounded-full">
                         <Text className="text-slate-600 font-black text-[10px] tracking-tight">{selectedTicket.priority}</Text>
                      </View>
                   </View>
                </View>
                
                <Text className="mt-8 text-center text-[10px] font-black text-slate-300 uppercase underline">
                  Raised on {new Date(selectedTicket.created_at).toLocaleDateString()}
                </Text>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  priorityCard: {
    width: (width - 60) / 2.2, // Fitting better in horizontal scroll
    padding: 20,
    borderRadius: 32,
    marginHorizontal: 6,
    borderWidth: 1,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  decoratorCircle: {
    position: "absolute",
    borderRadius: 100,
  },
  ticketCard: {
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
  }
});

const RaiseTicket = () => (
  <DoctorLayout>
    <RaiseTicketContent />
  </DoctorLayout>
);

export default RaiseTicket;
