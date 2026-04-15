import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    ScrollView, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet, 
    ActivityIndicator, 
    Alert,
    RefreshControl,
    Modal,
    Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ReceptionistLayout from "./ReceptionistLayout";
import { api } from "../../services/api";

const { width } = Dimensions.get("window");

const PriorityCard = ({ label, count, subtext, icon, color, bgColor, iconColor }) => {
    const cardWidth = (width - 48) / 2;
    return (
        <View style={[styles.priorityCard, { backgroundColor: bgColor, width: cardWidth }]}>
            <View style={[styles.priorityIcon, { backgroundColor: iconColor }]}>
                <Ionicons name={icon} size={18} color="white" />
            </View>
            <Text style={[styles.priorityLabel, { color: color }]}>{label}</Text>
            <Text style={styles.priorityCount}>{count}</Text>
            <Text style={[styles.prioritySub, { color: color }]}>{subtext}</Text>
        </View>
    );
};

const TicketCard = ({ ticket, onPress }) => (
    <TouchableOpacity 
        style={styles.ticketCard} 
        onPress={onPress}
        activeOpacity={0.7}
    >
        <View style={styles.ticketCardHeader}>
            <View className="flex-row items-center">
                <View className="h-8 w-8 rounded-full bg-blue-50 items-center justify-center mr-2">
                    <Ionicons name="ticket-outline" size={16} color="#2563eb" />
                </View>
                <Text style={styles.ticketIdText}>#{ticket.id.substring(0, 8).toUpperCase()}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: ticket.status === 'OPEN' ? '#fefce8' : '#f0fdf4' }]}>
                <Text style={[styles.statusText, { color: ticket.status === 'OPEN' ? '#a16207' : '#15803d' }]}>
                    {ticket.status}
                </Text>
            </View>
        </View>

        <View style={styles.ticketCardBody}>
            <Text style={styles.ticketSubject} numberOfLines={2}>{ticket.subject}</Text>
            <View style={styles.ticketMetaRow}>
                <View style={[styles.priorityBadge, { backgroundColor: '#eff6ff' }]}>
                    <Ionicons name="flag-outline" size={12} color="#1d4ed8" style={{marginRight: 4}} />
                    <Text style={[styles.priorityText, { color: '#1d4ed8' }]}>{ticket.priority}</Text>
                </View>
                <View className="flex-row items-center ml-4">
                    <Ionicons name="time-outline" size={12} color="#94a3b8" />
                    <Text className="text-[11px] text-gray-400 ml-1 font-medium">
                        {new Date(ticket.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>
        </View>

        <View style={styles.ticketCardFooter}>
            <Text style={styles.viewLink}>View Detailed History</Text>
            <Ionicons name="chevron-forward" size={14} color="#3b82f6" />
        </View>
    </TouchableOpacity>
);

const RaiseTicketRecpScreen = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    
    // modal states
    const [createModalVisible, setCreateModalVisible] = useState(false);
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState(null);
    
    // new ticket states
    const [newSubject, setNewSubject] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPriority, setNewPriority] = useState("NORMAL");

    const fetchTickets = async () => {
        try {
            const data = await api.getStaffTickets();
            setTickets(data.tickets || []);
        } catch (error) {
            console.error("Error fetching tickets:", error);
            Alert.alert("Error", "Failed to load tickets.");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTickets();
    };

    const handleCreateTicket = async () => {
        if (!newSubject || !newDescription) {
            Alert.alert("Required", "Please fill in all mandatory fields.");
            return;
        }

        try {
            await api.createSupportTicket({
                subject: newSubject,
                description: newDescription,
                priority: newPriority
            });
            Alert.alert("Success", "Ticket raised successfully.");
            setCreateModalVisible(false);
            setNewSubject("");
            setNewDescription("");
            setNewPriority("NORMAL");
            fetchTickets();
        } catch (error) {
            Alert.alert("Error", "Failed to create ticket.");
        }
    };

    const getPriorityCount = (priority) => {
        return tickets.filter(t => t.priority === priority).length;
    };

    const filteredTickets = tickets.filter(t => 
        t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.status.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const formatDate = (dateStr) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + 
               ", " + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    if (loading && !refreshing) {
        return (
            <ReceptionistLayout>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                </View>
            </ReceptionistLayout>
        );
    }

    return (
        <ReceptionistLayout>
            <ScrollView 
                style={styles.container}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#2563eb"]} />}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Raise Ticket</Text>
                    <Text style={styles.subtitle}>Create and track your support requests</Text>
                </View>

                {/* Priority Cards Grid */}
                <View style={styles.priorityGrid}>
                    <PriorityCard 
                        label="CRITICAL" count={getPriorityCount("CRITICAL")} 
                        subtext="Immediate attention" icon="alert-circle" 
                        color="#b91c1c" bgColor="#fef2f2" iconColor="#ef4444" 
                    />
                    <PriorityCard 
                        label="URGENT" count={getPriorityCount("URGENT")} 
                        subtext="Address soon" icon="time" 
                        color="#c2410c" bgColor="#fff7ed" iconColor="#f97316" 
                    />
                    <PriorityCard 
                        label="HIGH" count={getPriorityCount("HIGH")} 
                        subtext="Needs quick action" icon="flash" 
                        color="#a16207" bgColor="#fefce8" iconColor="#eab308" 
                    />
                    <PriorityCard 
                        label="NORMAL" count={getPriorityCount("NORMAL")} 
                        subtext="Standard priority" icon="document-text" 
                        color="#1d4ed8" bgColor="#eff6ff" iconColor="#3b82f6" 
                    />
                    <PriorityCard 
                        label="LOW" count={getPriorityCount("LOW")} 
                        subtext="Can wait" icon="checkmark-circle" 
                        color="#475569" bgColor="#f8fafc" iconColor="#94a3b8" 
                    />
                </View>

                {/* Search & Action Bar */}
                <View style={styles.actionBar}>
                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={18} color="#94a3b8" style={{marginLeft: 10}} />
                        <TextInput 
                            style={styles.searchInput}
                            placeholder="Search tickets..."
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <TouchableOpacity style={styles.createBtn} onPress={() => setCreateModalVisible(true)}>
                        <Ionicons name="add" size={20} color="white" />
                    </TouchableOpacity>
                </View>

                {/* Results Count */}
                <View className="mb-4 px-1">
                    <Text className="text-[12px] text-gray-400 font-bold uppercase tracking-widest">
                        Total {filteredTickets.length} Results Found
                    </Text>
                </View>

                {/* Ticket Cards List */}
                <View style={styles.ticketListContainer}>
                    {filteredTickets.map((ticket) => (
                        <TicketCard 
                            key={ticket.id} 
                            ticket={ticket} 
                            onPress={() => {
                                setSelectedTicket(ticket);
                                setDetailsModalVisible(true);
                            }}
                        />
                    ))}
                    
                    {filteredTickets.length === 0 && (
                        <View className="bg-white p-10 rounded-[32px] items-center border border-slate-100">
                            <Ionicons name="search-outline" size={48} color="#e2e8f0" />
                            <Text className="text-slate-400 font-bold mt-4 text-center">No tickets match your search criteria</Text>
                        </View>
                    )}
                </View>
                
                <View style={{height: 100}} />
            </ScrollView>

            {/* CREATE TICKET MODAL */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={createModalVisible}
                onRequestClose={() => setCreateModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Create Support Ticket</Text>
                            <TouchableOpacity onPress={() => setCreateModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody}>
                            <Text style={styles.inputLabel}>Subject *</Text>
                            <TextInput 
                                style={styles.modalInput}
                                placeholder="Enter ticket subject"
                                value={newSubject}
                                onChangeText={setNewSubject}
                            />
                            
                            <Text style={styles.inputLabel}>Description *</Text>
                            <TextInput 
                                style={[styles.modalInput, styles.textArea]}
                                placeholder="Enter detailed description"
                                multiline
                                numberOfLines={6}
                                value={newDescription}
                                onChangeText={setNewDescription}
                            />
                            
                            <Text style={styles.inputLabel}>Priority *</Text>
                            <View style={styles.prioritySelector}>
                                {["NORMAL", "HIGH", "URGENT", "CRITICAL"].map((p) => (
                                    <TouchableOpacity 
                                        key={p} 
                                        style={[styles.pOption, newPriority === p && styles.pOptionActive]}
                                        onPress={() => setNewPriority(p)}
                                    >
                                        <Text style={[styles.pOptionText, newPriority === p && styles.pOptionTextActive]}>{p}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </ScrollView>
                        
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModalVisible(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.submitBtn} onPress={handleCreateTicket}>
                                <Ionicons name="add" size={18} color="white" />
                                <Text style={styles.submitBtnText}>Create Ticket</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* DETAILS MODAL remains same */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={detailsModalVisible}
                onRequestClose={() => setDetailsModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Ticket Details</Text>
                            <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                                <Ionicons name="close" size={24} color="#64748b" />
                            </TouchableOpacity>
                        </View>
                        
                        <ScrollView style={styles.modalBody}>
                            <View style={styles.detailRow}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.detailLabel}>Ticket ID</Text>
                                    <Text style={styles.detailValueID}>{selectedTicket?.id}</Text>
                                </View>
                                <View>
                                    <Text style={styles.detailLabel}>Status</Text>
                                    <View style={[styles.statusBadge, {backgroundColor: '#fefce8'}]}>
                                        <Text style={[styles.statusText, {color: '#a16207'}]}>{selectedTicket?.status}</Text>
                                    </View>
                                </View>
                            </View>
                            
                            <View style={styles.detailRow}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.detailLabel}>Priority</Text>
                                    <View style={[styles.priorityBadge, {backgroundColor: '#eff6ff', alignSelf: 'flex-start'}]}>
                                        <Text style={[styles.priorityText, {color: '#1d4ed8'}]}>{selectedTicket?.priority}</Text>
                                    </View>
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={styles.detailLabel}>Hospital ID</Text>
                                    <Text style={styles.detailValue}>{selectedTicket?.hospital_id?.substring(0, 10)}...</Text>
                                </View>
                            </View>
                            
                            <Text style={styles.detailLabel}>Subject</Text>
                            <View style={styles.detailBox}>
                                <Text style={styles.detailValueText}>{selectedTicket?.subject}</Text>
                            </View>
                            
                            <Text style={styles.detailLabel}>Description</Text>
                            <View style={[styles.detailBox, {minHeight: 100}]}>
                                <Text style={styles.detailValueText}>{selectedTicket?.description}</Text>
                            </View>
                            
                            <Text style={styles.detailLabel}>Created Date</Text>
                            <Text style={styles.detailValue}>{formatDate(selectedTicket?.created_at)}</Text>
                        </ScrollView>
                        
                        <View style={styles.modalFooter}>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailsModalVisible(false)}>
                                <Text style={styles.closeBtnText}>Close</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ReceptionistLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: '#f8fafc' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 24, paddingLeft: 4 },
    title: { fontSize: 28, fontBlack: 'bold', color: '#0f172a' },
    subtitle: { fontSize: 13, color: '#64748b', marginTop: 4, fontWeight: '500' },
    
    priorityGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 24 },
    priorityCard: { borderRadius: 20, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.02, shadowRadius: 5 },
    priorityIcon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    priorityLabel: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
    priorityCount: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginVertical: 4 },
    prioritySub: { fontSize: 10, fontWeight: '600' },
    
    actionBar: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
    searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#f1f5f9', marginRight: 12, height: 52, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.03, shadowRadius: 10 },
    searchInput: { flex: 1, height: '100%', paddingHorizontal: 12, color: '#1e293b', fontSize: 14, fontWeight: '500' },
    createBtn: { width: 52, height: 52, backgroundColor: '#2563eb', borderRadius: 16, alignItems: 'center', justifyContent: 'center', shadowColor: '#2563eb', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 10 },
    
    ticketListContainer: { spaceY: 16 },
    ticketCard: { backgroundColor: 'white', borderRadius: 24, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: '#f1f5f9', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.03, shadowRadius: 15, elevation: 2 },
    ticketCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    ticketIdText: { fontSize: 13, fontWeight: 'bold', color: '#1e293b' },
    ticketCardBody: { marginBottom: 16 },
    ticketSubject: { fontSize: 16, fontWeight: 'bold', color: '#334155', lineHeight: 22 },
    ticketMetaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
    ticketCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#f8fafc', pt: 14, marginTop: 14 },
    viewLink: { fontSize: 12, color: '#3b82f6', fontWeight: 'bold' },

    statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    statusText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
    priorityBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    priorityText: { fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },

    // MODAL STYLES
    modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalContent: { backgroundColor: 'white', borderRadius: 32, width: '100%', maxHeight: '85%', shadowColor: '#000', shadowOffset: {width: 0, height: 20}, shadowOpacity: 0.1, shadowRadius: 30 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f8fafc' },
    modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#1e293b' },
    modalBody: { padding: 24 },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#94a3b8', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
    modalInput: { backgroundColor: '#f8fafc', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, padding: 16, fontSize: 15, color: '#1e293b', marginBottom: 24 },
    textArea: { height: 140, textAlignVertical: 'top' },
    prioritySelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
    pOption: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: '#f1f5f9', marginRight: 10, marginBottom: 10 },
    pOptionActive: { backgroundColor: '#2563eb' },
    pOptionText: { fontSize: 12, color: '#64748b', fontWeight: 'bold' },
    pOptionTextActive: { color: 'white' },
    modalFooter: { flexDirection: 'row', justifyContent: 'flex-end', padding: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
    cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, marginRight: 8 },
    cancelBtnText: { color: '#64748b', fontWeight: 'bold' },
    submitBtn: { flexDirection: 'row', backgroundColor: '#2563eb', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, alignItems: 'center', shadowColor: '#2563eb', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.2, shadowRadius: 10 },
    submitBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 8 },
    
    // DETAIL MODAL STYLES
    detailRow: { flexDirection: 'row', marginBottom: 24 },
    detailLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 1 },
    detailValueID: { fontSize: 15, color: '#2563eb', fontWeight: 'bold' },
    detailValue: { fontSize: 15, color: '#1e293b', fontWeight: 'bold' },
    detailBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#f1f5f9' },
    detailValueText: { fontSize: 14, color: '#334155', lineHeight: 22, fontWeight: '500' },
    closeBtn: { backgroundColor: '#1e293b', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
    closeBtnText: { color: 'white', fontWeight: 'bold' }
});

export default RaiseTicketRecpScreen;