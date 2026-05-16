import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../../context/AppContext";
import { api } from "../../services/api";
import PharmacyLayout from "./PharmacyLayout";

// Priority Stats Card Component
const PriorityCard = ({ label, count, color, bgColor, icon }) => (
  <View
    style={{ backgroundColor: bgColor }}
    className="rounded-2xl p-3 border border-gray-100 flex-1 mx-1 items-center justify-center min-w-[80px]"
  >
    <View
      style={{ backgroundColor: "white" }}
      className="w-8 h-8 rounded-full items-center justify-center mb-1 shadow-sm"
    >
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text style={{ color }} className="text-[10px] font-bold uppercase">
      {label}
    </Text>
    <Text className="text-lg font-bold text-gray-800">{count}</Text>
  </View>
);

const TicketItem = ({ ticket, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "OPEN":
        return { text: "#b45309", bg: "#fef3c7" };
      case "IN_PROGRESS":
        return { text: "#1d4ed8", bg: "#dbeafe" };
      case "RESOLVED":
        return { text: "#15803d", bg: "#dcfce7" };
      case "CLOSED":
        return { text: "#374151", bg: "#f3f4f6" };
      default:
        return { text: "#374151", bg: "#f3f4f6" };
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "CRITICAL":
        return { text: "white", bg: "#b91c1c" };
      case "URGENT":
        return { text: "#991b1b", bg: "#fee2e2" };
      case "HIGH":
        return { text: "#9a3412", bg: "#ffedd5" };
      case "NORMAL":
        return { text: "#1d4ed8", bg: "#dbeafe" };
      case "LOW":
        return { text: "#374151", bg: "#f3f4f6" };
      default:
        return { text: "#374151", bg: "#f3f4f6" };
    }
  };

  const statusColors = getStatusColor(ticket.status);
  const priorityColors = getPriorityColor(ticket.priority);

  return (
    <TouchableOpacity
      onPress={() => onPress(ticket)}
      className="bg-white p-4 rounded-2xl mb-3 border border-gray-100 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="font-mono font-bold text-blue-600 text-xs">
          ID: {ticket.id?.substring(0, 8)}
        </Text>
        <View
          style={{ backgroundColor: statusColors.bg }}
          className="px-2 py-0.5 rounded-full"
        >
          <Text
            style={{ color: statusColors.text }}
            className="text-[10px] font-bold"
          >
            {ticket.status}
          </Text>
        </View>
      </View>
      <Text className="text-gray-900 font-bold text-sm mb-1" numberOfLines={1}>
        {ticket.subject}
      </Text>
      <Text className="text-gray-500 text-xs mb-3" numberOfLines={2}>
        {ticket.description}
      </Text>
      <View className="flex-row justify-between items-center">
        <View
          style={{ backgroundColor: priorityColors.bg }}
          className="px-2 py-0.5 rounded-full"
        >
          <Text
            style={{ color: priorityColors.text }}
            className="text-[10px] font-bold"
          >
            {ticket.priority}
          </Text>
        </View>
        <Text className="text-gray-400 text-[10px]">
          {new Date(ticket.created_at).toLocaleDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const PharmacyRaiseTicket = () => {
  const { authToken } = useAppContext();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    priority: "NORMAL",
  });
  const [submitting, setSubmitting] = useState(false);

  const [stats, setStats] = useState({
    critical: 0,
    urgent: 0,
    high: 0,
    normal: 0,
    low: 0,
  });

  const fetchTickets = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // API call using the service method
      const data = await api.getStaffTickets(0, 100);
      const ticketsList = data?.tickets || [];

      // Sort by priority
      const priorityOrder = { 'CRITICAL': 1, 'URGENT': 2, 'HIGH': 3, 'NORMAL': 4, 'LOW': 5 };
      const sortedTickets = [...ticketsList].sort((a, b) => {
        const orderA = priorityOrder[a.priority] || 99;
        const orderB = priorityOrder[b.priority] || 99;
        if (orderA !== orderB) return orderA - orderB;
        return new Date(b.created_at) - new Date(a.created_at);
      });

      setTickets(sortedTickets);

      // Update stats
      setStats({
        critical: sortedTickets.filter((t) => t.priority === "CRITICAL").length,
        urgent: sortedTickets.filter((t) => t.priority === "URGENT").length,
        high: sortedTickets.filter((t) => t.priority === "HIGH").length,
        normal: sortedTickets.filter((t) => t.priority === "NORMAL").length,
        low: sortedTickets.filter((t) => t.priority === "LOW").length,
      });
    } catch (error) {
      console.error("Fetch tickets error:", error);
      Alert.alert("Error", "Failed to fetch tickets. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async () => {
    if (!formData.subject.trim() || !formData.description.trim()) {
      Alert.alert("Validation Error", "Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await api.createSupportTicket({
        subject: formData.subject,
        description: formData.description,
        priority: formData.priority,
      });

      Alert.alert("Success", "Support ticket created successfully!");
      setShowCreateModal(false);
      setFormData({ subject: "", description: "", priority: "NORMAL" });
      fetchTickets();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? t.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        {/* Header Section */}
        <View className="p-6 pb-2">
          <Text className="text-3xl font-black text-slate-900 tracking-tight">
            Raise Ticket
          </Text>
          <Text className="text-slate-500 font-medium mt-1">
            Create and track your support requests
          </Text>
        </View>

        {/* Priority Stats Cards */}
        <View className="px-4 py-4">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            <PriorityCard
              label="Critical"
              count={stats.critical}
              color="#b91c1c"
              bgColor="#fee2e2"
              icon="alert-circle"
            />
            <PriorityCard
              label="Urgent"
              count={stats.urgent}
              color="#f97316"
              bgColor="#fff7ed"
              icon="time"
            />
            <PriorityCard
              label="High"
              count={stats.high}
              color="#eab308"
              bgColor="#fefce8"
              icon="flash"
            />
            <PriorityCard
              label="Normal"
              count={stats.normal}
              color="#2563eb"
              bgColor="#eff6ff"
              icon="document-text"
            />
            <PriorityCard
              label="Low"
              count={stats.low}
              color="#64748b"
              bgColor="#f8fafc"
              icon="checkmark-circle"
            />
          </ScrollView>
        </View>

        {/* Search & Action Bar */}
        <View className="px-6 pb-4 flex-row gap-2">
          <View className="flex-1 relative">
            <View className="absolute left-3 top-3 z-10">
              <Ionicons name="search" size={18} color="#94a3b8" />
            </View>
            <TextInput
              className="bg-white border border-slate-200 rounded-2xl py-2.5 pl-10 pr-4 text-slate-900 font-medium"
              placeholder="Search tickets..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          <TouchableOpacity
            onPress={() => setShowCreateModal(true)}
            className="bg-blue-600 w-11 h-11 rounded-2xl items-center justify-center shadow-lg shadow-blue-200"
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Tickets List */}
        <View className="flex-1 px-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#2563eb" />
            </View>
          ) : (
            <FlatList
              data={filteredTickets}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TicketItem
                  ticket={item}
                  onPress={(t) => {
                    setSelectedTicket(t);
                    setShowViewModal(true);
                  }}
                />
              )}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={() => fetchTickets(true)}
                  colors={["#2563eb"]}
                />
              }
              ListEmptyComponent={
                <View className="items-center justify-center py-20">
                  <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-4">
                    <Ionicons name="ticket-outline" size={40} color="#94a3b8" />
                  </View>
                  <Text className="text-slate-500 font-bold">No tickets found</Text>
                  <Text className="text-slate-400 text-xs mt-1">
                    Try adjusting your search or create a new ticket
                  </Text>
                </View>
              }
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          )}
        </View>

        {/* Create Ticket Modal */}
        <Modal
          visible={showCreateModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCreateModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-6 pb-10">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">
                  Create Ticket
                </Text>
                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView className="space-y-4">
                <View>
                  <Text className="text-slate-600 font-bold text-xs mb-2 uppercase tracking-widest">
                    Subject
                  </Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-medium"
                    placeholder="Brief summary of the issue"
                    value={formData.subject}
                    onChangeText={(text) => setFormData({ ...formData, subject: text })}
                  />
                </View>

                <View>
                  <Text className="text-slate-600 font-bold text-xs mb-2 uppercase tracking-widest">
                    Description
                  </Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-medium min-h-[120px]"
                    placeholder="Provide details about the problem..."
                    multiline
                    textAlignVertical="top"
                    value={formData.description}
                    onChangeText={(text) => setFormData({ ...formData, description: text })}
                  />
                </View>

                <View>
                  <Text className="text-slate-600 font-bold text-xs mb-2 uppercase tracking-widest">
                    Priority
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {["LOW", "NORMAL", "HIGH", "URGENT", "CRITICAL"].map((p) => (
                      <TouchableOpacity
                        key={p}
                        onPress={() => setFormData({ ...formData, priority: p })}
                        style={{
                          backgroundColor: formData.priority === p ? "#2563eb" : "#f1f5f9",
                        }}
                        className="px-4 py-2 rounded-xl"
                      >
                        <Text
                          style={{
                            color: formData.priority === p ? "white" : "#64748b",
                          }}
                          className="text-[10px] font-black"
                        >
                          {p}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleCreateTicket}
                  disabled={submitting}
                  className="bg-blue-600 rounded-2xl py-4 items-center justify-center shadow-lg shadow-blue-200 mt-6"
                >
                  {submitting ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white font-black uppercase tracking-widest">
                      Submit Ticket
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* View Ticket Modal */}
        <Modal
          visible={showViewModal}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowViewModal(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center p-6">
            <View className="bg-white w-full rounded-[32px] overflow-hidden">
              <View className="bg-blue-600 p-6 flex-row justify-between items-center">
                <Text className="text-white font-black text-lg">Ticket Details</Text>
                <TouchableOpacity onPress={() => setShowViewModal(false)}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </View>

              {selectedTicket && (
                <ScrollView className="p-6 max-h-[500px]">
                  <View className="flex-row justify-between items-center mb-6">
                    <View>
                      <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Ticket ID
                      </Text>
                      <Text className="text-blue-600 font-mono font-bold">
                        #{selectedTicket.id?.substring(0, 8)}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Status
                      </Text>
                      <Text className="text-slate-900 font-bold">
                        {selectedTicket.status}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-6">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                      Subject
                    </Text>
                    <Text className="text-slate-900 font-black text-base">
                      {selectedTicket.subject}
                    </Text>
                  </View>

                  <View className="mb-6">
                    <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mb-1">
                      Description
                    </Text>
                    <View className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <Text className="text-slate-700 leading-5">
                        {selectedTicket.description}
                      </Text>
                    </View>
                  </View>

                  {selectedTicket.resolution_notes && (
                    <View className="mb-6">
                      <Text className="text-green-600 font-bold text-[10px] uppercase tracking-widest mb-1">
                        Resolution Notes
                      </Text>
                      <View className="bg-green-50 p-4 rounded-2xl border border-green-100">
                        <Text className="text-green-800 leading-5">
                          {selectedTicket.resolution_notes}
                        </Text>
                      </View>
                    </View>
                  )}

                  <View className="flex-row justify-between pt-4 border-t border-slate-100">
                    <View>
                      <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Priority
                      </Text>
                      <Text className="text-slate-900 font-bold">
                        {selectedTicket.priority}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                        Created
                      </Text>
                      <Text className="text-slate-900 font-bold">
                        {new Date(selectedTicket.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity
                onPress={() => setShowViewModal(false)}
                className="bg-slate-100 py-4 items-center"
              >
                <Text className="text-slate-600 font-bold">Close Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </PharmacyLayout>
  );
};

export default PharmacyRaiseTicket;
