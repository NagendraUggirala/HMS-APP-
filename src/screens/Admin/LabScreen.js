import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  TextInput, 
  Modal, 
  ActivityIndicator, 
  Alert, 
  Dimensions, 
  Platform,
  StyleSheet,
  Switch
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import AdminLayout, { useSidebar } from './AdminLayout';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

const MetricCard = ({ title, value, subtitle, icon, iconColor, bgColor, iconBg }) => (
  <View style={[styles.metricCard, { backgroundColor: bgColor }]} className="relative overflow-hidden">
    <View className="relative z-10">
      <View className="w-10 h-10 items-center justify-center rounded-full mb-3 shadow-sm" style={{ backgroundColor: iconBg }}>
        <FontAwesome5 name={icon} size={16} color="white" />
      </View>
      <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{title}</Text>
      <Text className="text-2xl font-black text-slate-900 mt-1">{value}</Text>
      <Text className="text-[9px] text-slate-400 font-medium mt-1">{subtitle}</Text>
    </View>
    <View className="absolute -right-4 -bottom-4 opacity-10" style={{ transform: [{ rotate: '-15deg' }] }}>
      <FontAwesome5 name={icon} size={80} color={iconColor} />
    </View>
  </View>
);

const CustomModal = ({ isOpen, onClose, title, children }) => (
  <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
    <View className="flex-1 justify-end bg-black/50">
      <View className="bg-white rounded-t-[32px] overflow-hidden shadow-lg w-full max-h-[90%] pb-8">
        <View className="flex-row justify-between items-center p-6 border-b border-gray-100 bg-white">
          <Text className="text-xl font-black text-slate-800 tracking-tight">{title}</Text>
          <TouchableOpacity onPress={onClose} className="w-10 h-10 items-center justify-center rounded-full bg-slate-50">
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        <ScrollView className="p-6" showsVerticalScrollIndicator={false}>
          {children}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    </View>
  </Modal>
);

const LabContent = () => {
  const { toggleSidebar } = useSidebar();
  const [activeTab, setActiveTab] = useState('tests');
  const [loading, setLoading] = useState(true);
  const [labTests, setLabTests] = useState([]);
  const [labEquipment, setLabEquipment] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('');
  
  // Report Generation API fields
  const [templateFilter, setTemplateFilter] = useState('STANDARD');
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    loadLabEquipment();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadLabTests();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, templateFilter, isDemo]);

  const loadLabTests = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (templateFilter) params.append('template', templateFilter);
      if (isDemo) params.append('demo', 'true');

      const response = await api.get(`/api/v1/lab/report-generation?${params.toString()}`);
      
      const testsList = Array.isArray(response) ? response : (Array.isArray(response.rows) ? response.rows : Array.isArray(response.reports) ? response.reports : Array.isArray(response.items) ? response.items : Array.isArray(response.data) ? response.data : []);
      
      if (testsList && testsList.length > 0) {
        const mappedList = testsList.map(test => ({
          ...test,
          id: test.report_id || test.id || test.order_id || `LAB-${Math.floor(Math.random() * 10000)}`,
          patient: test.patient_name || test.patient || test.patientName || 'Unknown',
          patientId: test.patient_id || test.patientId || test.patient_ref || 'N/A',
          testType: test.test_type || test.report_type || test.testType || test.test_name || 'Lab Report',
          result: test.result || test.conclusion || test.findings || 'Pending',
          date: test.completion_date || (test.created_at ? test.created_at.split('T')[0] : null) || test.date || test.report_date || new Date().toISOString().split('T')[0],
          reportFile: test.file_url || test.report_url || test.reportFile || test.document_url || '',
          status: test.status === 'READY' ? 'Completed' : test.status === 'PENDING_REVIEW' ? 'Pending' : (test.status || test.report_status || 'Completed'),
          doctor: test.verified_by || test.doctor_name || test.doctor || test.generated_by || test.referring_doctor || 'N/A',
          sampleType: test.sample_type || test.sampleType || test.specimen_type || 'N/A'
        }));
        setLabTests(mappedList);
      } else {
        setLabTests([]);
      }
    } catch (error) {
      console.warn('Error loading lab tests:', error);
      setLabTests([]);
    } finally {
      setLoading(false);
    }
  };


  const loadLabEquipment = async () => {
    try {
      const response = await api.get('/api/v1/lab/equipment-qc/equipment?page=1&limit=50&active_only=true');
      
      const equipmentList = Array.isArray(response.equipment) ? response.equipment : Array.isArray(response.items) ? response.items : Array.isArray(response.data) ? response.data : [];
      
      if (equipmentList && equipmentList.length > 0) {
        const mappedList = equipmentList.map(eq => ({
          ...eq,
          id: eq.equipment_code || eq.equipment_id || eq.id,
          name: eq.equipment_name || eq.name,
          type: eq.category || eq.type,
          status: eq.status === 'UNDER_MAINTENANCE' ? 'Maintenance' : eq.status === 'DOWN' ? 'Out of Service' : eq.status === 'ACTIVE' ? 'Active' : eq.status
        }));
        setLabEquipment(mappedList);
      } else {
        setLabEquipment([]);
      }
    } catch (error) {
      console.warn('Error loading lab equipment:', error);
      setLabEquipment([]);
    }
  };


  const handleUpdateEquipmentStatus = async (equipmentId, newStatus) => {
    let apiStatus = newStatus.toUpperCase();
    if (newStatus === 'Maintenance') apiStatus = 'UNDER_MAINTENANCE';
    if (newStatus === 'Out of Service') apiStatus = 'DOWN';

    try {
      await api.patch(`/api/v1/lab/equipment-qc/equipment/${equipmentId}/status`, { 
        status: apiStatus, 
        reason: 'Status updated via mobile dashboard' 
      });
      setLabEquipment(prev => prev.map(equipment => 
        equipment.id === equipmentId ? { ...equipment, status: newStatus } : equipment
      ));
    } catch (error) {
      Alert.alert('Error', 'Failed to update equipment status');
    }
  };

  const handleUpdateStatus = (testId, newStatus) => {
    setLabTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: newStatus } : test
    ));
  };

  const handleViewReport = (test) => {
    setSelectedTest(test);
    setIsViewModalOpen(true);
  };

  const getFilteredTests = () => {
    let filtered = labTests;
    if (selectedFilter !== 'All') {
      filtered = filtered.filter(test => test.status === selectedFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter(test => test.date === dateFilter);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(test =>
        test.patient.toLowerCase().includes(query) ||
        test.patientId.toLowerCase().includes(query) ||
        test.id.toLowerCase().includes(query) ||
        test.testType.toLowerCase().includes(query)
      );
    }
    return filtered;
  };

  const filteredTests = getFilteredTests();

  if (loading && activeTab === 'tests' && labTests.length === 0) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#0052CC" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50">
      {/* Header Section */}
      <View className="px-6 py-6 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
              <Ionicons name="menu-outline" size={26} color="#4F46E5" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">Lab Management</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Laboratory Command Core</Text>
            </View>
          </View>
        </View>

        {/* Tab Navigation */}
        <View className="mt-6 flex-row bg-slate-50 p-1 rounded-2xl border border-slate-100">
          <TouchableOpacity
            onPress={() => setActiveTab('tests')}
            className={`flex-1 py-3 items-center justify-center rounded-xl flex-row ${activeTab === 'tests' ? 'bg-white shadow-sm' : ''}`}
          >
            <FontAwesome5 name="flask" size={14} color={activeTab === 'tests' ? '#4F46E5' : '#64748b'} />
            <Text className={`ml-2 text-xs font-bold ${activeTab === 'tests' ? 'text-slate-900' : 'text-slate-500'}`}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('equipment')}
            className={`flex-1 py-3 items-center justify-center rounded-xl flex-row ${activeTab === 'equipment' ? 'bg-white shadow-sm' : ''}`}
          >
            <FontAwesome5 name="cogs" size={14} color={activeTab === 'equipment' ? '#4F46E5' : '#64748b'} />
            <Text className={`ml-2 text-xs font-bold ${activeTab === 'equipment' ? 'text-slate-900' : 'text-slate-500'}`}>Equipment</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'tests' ? (
          <View className="p-5">
            {/* Search & Filter */}
            <View className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100/50 mb-6">
              <View className="flex-row items-center mb-5">
                <View className="w-10 h-10 items-center justify-center rounded-full mr-3 bg-blue-50">
                  <FontAwesome5 name="filter" size={16} color="#3b82f6" />
                </View>
                <Text className="text-lg font-black text-slate-800">Filters</Text>
              </View>
              
              <View className="space-y-4">
                <View className="flex-row items-center bg-slate-50 rounded-2xl px-4 border border-slate-100">
                  <Ionicons name="search-outline" size={20} color="#94a3b8" />
                  <TextInput 
                    placeholder="Search patient, ID, or test..." 
                    className="flex-1 py-4 ml-2 text-slate-700 font-medium"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-slate-50 rounded-2xl px-4 border border-slate-100 py-1">
                    <Text className="text-[9px] font-bold text-slate-400 uppercase mt-2">Template</Text>
                    <TextInput 
                      value={templateFilter}
                      onChangeText={setTemplateFilter}
                      className="text-slate-800 font-bold py-1"
                    />
                  </View>
                  <TouchableOpacity 
                    onPress={() => setIsDemo(!isDemo)}
                    className={`flex-1 rounded-2xl px-4 border py-3 flex-row items-center justify-between ${isDemo ? 'bg-indigo-50 border-indigo-100' : 'bg-slate-50 border-slate-100'}`}
                  >
                    <Text className={`text-xs font-bold ${isDemo ? 'text-indigo-600' : 'text-slate-500'}`}>Demo Mode</Text>
                    <Switch 
                      value={isDemo} 
                      onValueChange={setIsDemo}
                      trackColor={{ false: "#e2e8f0", true: "#c7d2fe" }}
                      thumbColor={isDemo ? "#4F46E5" : "#94a3b8"}
                    />
                  </TouchableOpacity>
                </View>

                <View className="flex-row gap-3">
                  <View className="flex-1 bg-slate-50 rounded-2xl px-4 border border-slate-100 py-1">
                    <Text className="text-[9px] font-bold text-slate-400 uppercase mt-2">Date Filter</Text>
                    <TextInput 
                      placeholder="YYYY-MM-DD"
                      value={dateFilter}
                      onChangeText={setDateFilter}
                      className="text-slate-800 font-bold py-1"
                    />
                  </View>
                  <View className="flex-1 bg-slate-50 rounded-2xl px-4 border border-slate-100 py-1">
                    <Text className="text-[9px] font-bold text-slate-400 uppercase mt-2">Status</Text>
                    <TextInput 
                      value={selectedFilter}
                      onChangeText={setSelectedFilter}
                      className="text-slate-800 font-bold py-1"
                    />
                  </View>
                </View>

                <View className="flex-row gap-3">
                   <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row py-1">
                    {['All', 'Pending', 'Processing', 'Completed'].map((status) => (
                      <TouchableOpacity
                        key={status}
                        onPress={() => setSelectedFilter(status)}
                        className={`mr-2 px-5 py-2.5 rounded-full border ${selectedFilter === status ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-200'}`}
                      >
                        <Text className={`text-xs font-bold ${selectedFilter === status ? 'text-white' : 'text-slate-600'}`}>{status}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>
            </View>

            {/* Tests List */}
            <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100/50">
              <View className="px-6 py-5 bg-slate-900 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <MaterialCommunityIcons name="microscope" size={20} color="white" />
                  <Text className="text-white font-black ml-2">Lab Test Reports</Text>
                </View>
                <View className="bg-white/20 px-3 py-1 rounded-full">
                  <Text className="text-white text-[10px] font-bold">{filteredTests.length}</Text>
                </View>
              </View>

              {filteredTests.length === 0 ? (
                <View className="p-12 items-center justify-center">
                  <MaterialCommunityIcons name="flask-empty-outline" size={48} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">No lab reports found</Text>
                  <Text className="text-slate-300 text-[10px] uppercase tracking-widest mt-1">Try adjusting your filters</Text>
                </View>
              ) : filteredTests.map((row, index) => (
                <View key={row.id} className={`p-6 ${index !== filteredTests.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <View className="flex-row justify-between items-start mb-4">
                    <View>
                      <Text className="text-base font-black text-slate-800">{row.patient}</Text>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{row.patientId} • {row.testType}</Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-full ${
                      row.status === 'Completed' ? 'bg-emerald-50' :
                      row.status === 'Processing' ? 'bg-blue-50' :
                      'bg-amber-50'
                    }`}>
                      <Text className={`text-[10px] font-black uppercase ${
                        row.status === 'Completed' ? 'text-emerald-600' :
                        row.status === 'Processing' ? 'text-blue-600' :
                        'text-amber-600'
                      }`}>{row.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <Ionicons name="calendar-outline" size={14} color="#94a3b8" />
                      <Text className="text-xs text-slate-500 ml-1 font-medium">{row.date}</Text>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity 
                        onPress={() => handleViewReport(row)}
                        className="w-10 h-10 items-center justify-center rounded-xl bg-indigo-50"
                      >
                        <Ionicons name="eye" size={18} color="#4F46E5" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        className="w-10 h-10 items-center justify-center rounded-xl bg-slate-50"
                        onPress={() => Alert.alert('Download', `Downloading report: ${row.reportFile || 'report.pdf'}`)}
                      >
                        <Ionicons name="download-outline" size={18} color="#64748b" />
                      </TouchableOpacity>
                      {row.status === 'Pending' && (
                        <TouchableOpacity 
                          onPress={() => handleUpdateStatus(row.id, 'Processing')}
                          className="w-10 h-10 items-center justify-center rounded-xl bg-blue-50"
                        >
                          <Ionicons name="sync" size={18} color="#3b82f6" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View className="p-5">
            {/* KPI Cards */}
            <View className="flex-row flex-wrap justify-between mb-4">
              <MetricCard 
                title="Total" 
                value={labEquipment.length} 
                subtitle="All Inventory" 
                icon="cogs" 
                iconColor="#3b82f6" 
                bgColor="#eff6ff" 
                iconBg="#3b82f6"
              />
              <MetricCard 
                title="Active" 
                value={labEquipment.filter(e => e.status === 'Active').length} 
                subtitle="In Operation" 
                icon="check-circle" 
                iconColor="#10b981" 
                bgColor="#f0fdf4" 
                iconBg="#10b981"
              />
              <MetricCard 
                title="Service" 
                value={labEquipment.filter(e => e.status === 'Maintenance').length} 
                subtitle="Under Repair" 
                icon="tools" 
                iconColor="#f59e0b" 
                bgColor="#fffbeb" 
                iconBg="#f59e0b"
              />
              <MetricCard 
                title="Down" 
                value={labEquipment.filter(e => e.status === 'Out of Service').length} 
                subtitle="Not Functional" 
                icon="exclamation-circle" 
                iconColor="#e11d48" 
                bgColor="#fff1f2" 
                iconBg="#e11d48"
              />
            </View>

            {/* Equipment List */}
            <View className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-slate-100/50">
               <View className="px-6 py-5 bg-slate-900 flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <FontAwesome5 name="server" size={16} color="white" />
                  <Text className="text-white font-black ml-2">Equipment Inventory</Text>
                </View>
              </View>

              {labEquipment.length === 0 ? (
                <View className="p-12 items-center justify-center">
                  <MaterialCommunityIcons name="cog-off-outline" size={48} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">No equipment found</Text>
                  <Text className="text-slate-300 text-[10px] uppercase tracking-widest mt-1">Check back later or refresh</Text>
                </View>
              ) : labEquipment.map((eq, index) => (
                <View key={eq.id} className={`p-6 ${index !== labEquipment.length - 1 ? 'border-b border-slate-50' : ''}`}>
                  <View className="flex-row justify-between items-start mb-4">
                    <View className="flex-1 pr-4">
                      <Text className="text-base font-black text-slate-800">{eq.name}</Text>
                      <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{eq.id} • {eq.type}</Text>
                      <Text className="text-[10px] text-slate-500 font-medium mt-2">
                        <Ionicons name="location-outline" size={10} color="#94a3b8" /> {eq.location} • {eq.manufacturer}
                      </Text>
                    </View>
                    <View className={`px-3 py-1.5 rounded-full flex-row items-center ${
                      eq.status === 'Active' ? 'bg-emerald-50' :
                      eq.status === 'Maintenance' ? 'bg-amber-50' :
                      'bg-red-50'
                    }`}>
                      <View className={`w-1.5 h-1.5 rounded-full mr-2 ${
                        eq.status === 'Active' ? 'bg-emerald-500' :
                        eq.status === 'Maintenance' ? 'bg-amber-500' :
                        'bg-red-500'
                      }`} />
                      <Text className={`text-[10px] font-black uppercase ${
                        eq.status === 'Active' ? 'text-emerald-600' :
                        eq.status === 'Maintenance' ? 'text-amber-600' :
                        'text-red-600'
                      }`}>{eq.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row gap-2 mt-2">
                    {eq.status !== 'Active' && (
                      <TouchableOpacity 
                        onPress={() => handleUpdateEquipmentStatus(eq.id, 'Active')}
                        className="flex-1 py-3 items-center justify-center rounded-xl bg-emerald-50 flex-row"
                      >
                        <Ionicons name="checkmark-circle" size={14} color="#10b981" />
                        <Text className="ml-1 text-[10px] font-bold text-emerald-700">Activate</Text>
                      </TouchableOpacity>
                    )}
                    {eq.status !== 'Maintenance' && (
                      <TouchableOpacity 
                        onPress={() => handleUpdateEquipmentStatus(eq.id, 'Maintenance')}
                        className="flex-1 py-3 items-center justify-center rounded-xl bg-amber-50 flex-row"
                      >
                        <Ionicons name="construct" size={14} color="#f59e0b" />
                        <Text className="ml-1 text-[10px] font-bold text-amber-700">Service</Text>
                      </TouchableOpacity>
                    )}
                    {eq.status !== 'Out of Service' && (
                      <TouchableOpacity 
                        onPress={() => handleUpdateEquipmentStatus(eq.id, 'Out of Service')}
                        className="flex-1 py-3 items-center justify-center rounded-xl bg-red-50 flex-row"
                      >
                        <Ionicons name="close-circle" size={14} color="#e11d48" />
                        <Text className="ml-1 text-[10px] font-bold text-red-700">Decommission</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* View Report Modal */}
      <CustomModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title="Report Details"
      >
        {selectedTest && (
          <View className="space-y-6">
            <View className="bg-indigo-50 p-5 rounded-3xl border border-indigo-100">
               <Text className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4">Patient Information</Text>
               <View className="flex-row justify-between mb-4">
                  <View>
                    <Text className="text-xs text-slate-500 font-medium">Name</Text>
                    <Text className="text-base font-black text-slate-800">{selectedTest.patient}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-slate-500 font-medium">ID</Text>
                    <Text className="text-base font-black text-slate-800">{selectedTest.patientId}</Text>
                  </View>
               </View>
            </View>

            <View className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
               <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Test Details</Text>
               <View className="space-y-4">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 font-medium">Test Type</Text>
                    <Text className="text-xs font-bold text-slate-800">{selectedTest.testType}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 font-medium">Doctor</Text>
                    <Text className="text-xs font-bold text-slate-800">{selectedTest.doctor}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 font-medium">Date</Text>
                    <Text className="text-xs font-bold text-slate-800">{selectedTest.date}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 font-medium">Sample</Text>
                    <Text className="text-xs font-bold text-slate-800">{selectedTest.sampleType}</Text>
                  </View>
               </View>
            </View>

            <View className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
               <Text className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-4">Results</Text>
               <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-xs text-slate-500 font-medium">Status</Text>
                    <Text className="text-base font-black text-emerald-600">{selectedTest.status}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-xs text-slate-500 font-medium">Findings</Text>
                    <Text className="text-base font-black text-emerald-600">{selectedTest.result}</Text>
                  </View>
               </View>
            </View>

            <TouchableOpacity 
              className="w-full py-5 bg-slate-900 rounded-2xl flex-row items-center justify-center mt-4"
              onPress={() => setIsViewModalOpen(false)}
            >
              <Text className="text-white font-black text-base">Close View</Text>
            </TouchableOpacity>
          </View>
        )}
      </CustomModal>
    </View>
  );
};

const LabScreen = () => (
  <AdminLayout>
    <LabContent />
  </AdminLayout>
);

const styles = StyleSheet.create({
  metricCard: { 
    width: (width - 52) / 2, 
    borderRadius: 32, 
    padding: 24, 
    marginBottom: 12, 
    borderWidth: 1, 
    borderColor: "rgba(255,255,255,0.8)", 
    shadowColor: "#000", 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.04, 
    shadowRadius: 12, 
    elevation: 3 
  },
});

export default LabScreen;