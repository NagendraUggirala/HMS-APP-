import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NurseLayout from './NurseLayout';
import { api } from '../../services/api';

const NurseRaiseTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form Data
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'NORMAL'
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [errorMsg, setErrorMsg] = useState(null);

  const [stats, setStats] = useState({
    critical: 0,
    urgent: 0,
    high: 0,
    normal: 0,
    low: 0
  });

  const fetchTickets = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Use the provided endpoint
      const res = await api.get('/api/v1/support/staff/tickets?skip=0&limit=50&completed_only=false');
      
      let ticketsData = res?.tickets || [];
      
      // Sort by priority
      const priorityOrder = { 'CRITICAL': 1, 'URGENT': 2, 'HIGH': 3, 'NORMAL': 4, 'LOW': 5 };
      ticketsData = [...ticketsData].sort((a, b) => {
        const orderA = priorityOrder[a.priority] || 99;
        const orderB = priorityOrder[b.priority] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at) - new Date(a.created_at);
      });
      
      setTickets(ticketsData);
      
      setStats({
        critical: ticketsData.filter(t => t.priority === 'CRITICAL').length,
        urgent: ticketsData.filter(t => t.priority === 'URGENT').length,
        high: ticketsData.filter(t => t.priority === 'HIGH').length,
        normal: ticketsData.filter(t => t.priority === 'NORMAL').length,
        low: ticketsData.filter(t => t.priority === 'LOW').length,
      });

    } catch (err) {
      console.error("Fetch tickets error:", err);
      setErrorMsg(err.message || "Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.subject.trim()) {
      errors.subject = "Subject is required";
    } else if (formData.subject.trim().length < 3) {
      errors.subject = "Subject must be at least 3 characters";
    }
    
    if (!formData.description.trim()) {
      errors.description = "Description is required";
    } else if (formData.description.trim().length < 5) {
      errors.description = "Description must be at least 5 characters";
    }
    
    if (!formData.priority) {
      errors.priority = "Priority is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateTicket = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const payload = {
        subject: formData.subject.trim(),
        description: formData.description.trim(),
        priority: formData.priority
      };
      
      await api.post('/api/v1/support/staff/tickets', payload);
      
      setFormData({ subject: '', description: '', priority: 'NORMAL' });
      setShowCreateModal(false);
      fetchTickets();
      
    } catch (err) {
      console.error("Create ticket error:", err);
      alert(err.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const getFilteredTickets = () => {
    if (!searchTerm) return tickets;
    const lower = searchTerm.toLowerCase();
    return tickets.filter(t => 
      t.id?.toLowerCase().includes(lower) ||
      t.subject?.toLowerCase().includes(lower) ||
      t.status?.toLowerCase().includes(lower) ||
      t.priority?.toLowerCase().includes(lower)
    );
  };

  const filteredTickets = getFilteredTickets();

  // Helpers
  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'CRITICAL': return 'bg-red-600 text-white';
      case 'URGENT': return 'bg-red-100 text-red-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'NORMAL': return 'bg-blue-100 text-blue-800';
      case 'LOW': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const StatCard = ({ label, count, icon, colors, textColor, desc }) => (
    <View className={`rounded-2xl p-4 border mb-4 w-[48%] ${colors}`}>
      <View className="w-10 h-10 rounded-full items-center justify-center mb-2 shadow-sm" style={{ backgroundColor: 'rgba(255,255,255,0.4)' }}>
        <Ionicons name={icon} size={20} color={textColor} />
      </View>
      <Text className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: textColor }}>{label}</Text>
      <Text className="text-3xl font-black mb-1" style={{ color: textColor }}>{count}</Text>
      <Text className="text-[10px]" style={{ color: textColor }}>{desc}</Text>
    </View>
  );

  return (
    <NurseLayout>
      <ScrollView className="flex-1 bg-[#f8fafc]">
        <View className="p-6 pb-20">
          
          {/* Header */}
          <View className="mb-6 flex-row justify-between items-end">
            <View>
              <Text className="text-3xl font-black text-gray-900">Raise Ticket</Text>
              <Text className="text-gray-500 text-sm mt-1">Create and track your support requests</Text>
            </View>
            <TouchableOpacity 
              onPress={() => setShowCreateModal(true)}
              className="bg-blue-600 px-3 py-1.5 rounded-xl flex-row items-center shadow-sm"
            >
              <Ionicons name="add-circle-outline" size={14} color="white" />
              <Text className="text-white font-bold text-[10px] ml-1.5">New Ticket</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Grid (2x2) */}
          <View className="flex-row flex-wrap justify-between mb-2">
            <StatCard label="CRITICAL" count={stats.critical} icon="warning" colors="bg-red-50 border-red-200" textColor="#b91c1c" desc="Immediate attention" />
            <StatCard label="URGENT" count={stats.urgent} icon="alert-circle" colors="bg-orange-50 border-orange-200" textColor="#c2410c" desc="Address soon" />
            <StatCard label="HIGH" count={stats.high} icon="trending-up" colors="bg-yellow-50 border-yellow-200" textColor="#a16207" desc="Needs quick action" />
            <StatCard label="NORMAL" count={stats.normal} icon="remove" colors="bg-blue-50 border-blue-200" textColor="#1d4ed8" desc="Standard priority" />
            <StatCard label="LOW" count={stats.low} icon="arrow-down" colors="bg-gray-50 border-gray-200" textColor="#4b5563" desc="Can wait" />
          </View>

          {/* Search Bar */}
          <View className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex-row items-center mb-6">
            <View className="pl-3">
              <Ionicons name="search" size={20} color="#9ca3af" />
            </View>
            <TextInput
              placeholder="Search tickets by ID, subject, status..."
              className="flex-1 py-3 px-3 text-gray-800"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Error Message */}
          {errorMsg && (
            <View className="bg-red-50 p-4 rounded-xl border border-red-200 mb-6 flex-row items-center">
              <Ionicons name="alert-circle" size={20} color="#ef4444" />
              <Text className="text-red-600 ml-2 font-medium flex-1">{errorMsg}</Text>
              <TouchableOpacity onPress={fetchTickets}>
                <Text className="text-red-700 font-bold">Retry</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Tickets List */}
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#2563eb" />
              <Text className="text-gray-400 mt-4 font-medium">Loading tickets...</Text>
            </View>
          ) : filteredTickets.length === 0 ? (
            <View className="items-center justify-center py-12 bg-white rounded-2xl border border-gray-100">
              <View className="w-16 h-16 bg-gray-50 rounded-full items-center justify-center mb-4">
                <Ionicons name="ticket-outline" size={32} color="#9ca3af" />
              </View>
              <Text className="text-gray-800 font-bold text-lg mb-1">No tickets found</Text>
              <Text className="text-gray-500 mb-4 text-center px-6">You don't have any support tickets matching your criteria.</Text>
              <TouchableOpacity 
                onPress={() => setShowCreateModal(true)}
                className="bg-blue-50 px-6 py-2 rounded-lg border border-blue-100"
              >
                <Text className="text-blue-600 font-semibold">Create First Ticket</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="space-y-4">
              {filteredTickets.map(ticket => (
                <TouchableOpacity 
                  key={ticket.id}
                  onPress={() => setSelectedTicket(ticket)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex-row items-center"
                >
                  <View className="flex-1">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="font-mono text-blue-600 font-semibold text-xs">{(ticket.id || '').substring(0, 8)}</Text>
                      <View className="flex-row items-center gap-2">
                        <Text className={`text-[10px] px-2 py-1 rounded font-bold ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </Text>
                        <Text className={`text-[10px] px-2 py-1 rounded font-bold ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-gray-900 font-semibold mb-1" numberOfLines={1}>{ticket.subject}</Text>
                    <Text className="text-gray-400 text-xs">{formatDate(ticket.created_at)}</Text>
                  </View>
                  
                  {/* Action Icon View */}
                  <View className="ml-3 w-10 h-10 bg-blue-50 rounded-xl items-center justify-center border border-blue-100">
                    <Ionicons name="eye-outline" size={20} color="#2563eb" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </View>
      </ScrollView>

      {/* ── Create Modal ── */}
      <Modal visible={showCreateModal} animationType="slide" transparent={true}>
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 h-[80%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-gray-900">Create Ticket</Text>
              <TouchableOpacity onPress={() => setShowCreateModal(false)} className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="close" size={20} color="black" />
              </TouchableOpacity>
            </View>
            
            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
              {/* Subject */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Subject *</Text>
                <TextInput
                  value={formData.subject}
                  onChangeText={(text) => { setFormData({...formData, subject: text}); setFormErrors({...formErrors, subject: null}) }}
                  className={`border ${formErrors.subject ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 bg-gray-50 text-gray-900`}
                  placeholder="Ticket subject"
                />
                {formErrors.subject && <Text className="text-red-500 text-xs mt-1">{formErrors.subject}</Text>}
              </View>

              {/* Description */}
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Description *</Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(text) => { setFormData({...formData, description: text}); setFormErrors({...formErrors, description: null}) }}
                  className={`border ${formErrors.description ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 bg-gray-50 text-gray-900`}
                  placeholder="Detailed description"
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                {formErrors.description && <Text className="text-red-500 text-xs mt-1">{formErrors.description}</Text>}
              </View>

              {/* Priority */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-gray-700 mb-2">Priority *</Text>
                <View className="flex-row flex-wrap gap-2">
                  {['CRITICAL', 'URGENT', 'HIGH', 'NORMAL', 'LOW'].map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => setFormData({...formData, priority: p})}
                      className={`px-4 py-2 rounded-lg border ${formData.priority === p ? 'bg-blue-50 border-blue-500' : 'bg-white border-gray-200'}`}
                    >
                      <Text className={`text-xs font-bold ${formData.priority === p ? 'text-blue-700' : 'text-gray-500'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity 
                disabled={submitting}
                onPress={handleCreateTicket}
                className={`bg-blue-600 rounded-xl py-4 items-center flex-row justify-center mb-10 ${submitting ? 'opacity-70' : ''}`}
              >
                {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-base">Submit Ticket</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── View Modal ── */}
      <Modal visible={!!selectedTicket} animationType="fade" transparent={true}>
        <View className="flex-1 justify-center bg-black/50 p-4">
          <View className="bg-white rounded-3xl p-6 max-h-[80%]">
            <View className="flex-row justify-between items-start mb-4">
              <View className="flex-1 pr-4">
                <Text className="font-mono text-blue-600 font-semibold text-xs mb-1">ID: {(selectedTicket?.id || '').substring(0, 8)}</Text>
                <Text className="text-xl font-bold text-gray-900">{selectedTicket?.subject}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedTicket(null)} className="p-2 bg-gray-100 rounded-full">
                <Ionicons name="close" size={20} color="black" />
              </TouchableOpacity>
            </View>

            <View className="flex-row gap-2 mb-4">
              <Text className={`text-[10px] px-3 py-1 rounded-full font-bold ${getPriorityColor(selectedTicket?.priority)}`}>{selectedTicket?.priority}</Text>
              <Text className={`text-[10px] px-3 py-1 rounded-full font-bold ${getStatusColor(selectedTicket?.status)}`}>{selectedTicket?.status}</Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View className="bg-gray-50 p-4 rounded-2xl mb-4 border border-gray-100">
                <Text className="text-xs font-semibold text-gray-500 mb-2">Description</Text>
                <Text className="text-gray-800 leading-5">{selectedTicket?.description}</Text>
              </View>

              {selectedTicket?.resolution_notes && (
                <View className="bg-green-50 p-4 rounded-2xl mb-4 border border-green-100">
                  <Text className="text-xs font-semibold text-green-700 mb-2">Resolution Notes</Text>
                  <Text className="text-green-900 leading-5">{selectedTicket?.resolution_notes}</Text>
                </View>
              )}

              <View className="flex-row justify-between pt-4 border-t border-gray-100 mt-2">
                <View>
                  <Text className="text-[10px] text-gray-400 font-semibold uppercase">Created</Text>
                  <Text className="text-xs text-gray-700 font-medium mt-1">{formatDate(selectedTicket?.created_at)}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-[10px] text-gray-400 font-semibold uppercase">Updated</Text>
                  <Text className="text-xs text-gray-700 font-medium mt-1">{formatDate(selectedTicket?.updated_at)}</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

    </NurseLayout>
  );
};

export default NurseRaiseTicket;
