import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AdminLayout, { useSidebar } from './AdminLayout';

const { width } = Dimensions.get('window');

// ─── Constants & Mock Data ───────────────────────────────────────────────────

const REPORT_CATEGORIES = [
  { id: 'all', label: 'All Reports', icon: 'list' },
  { id: 'financial', label: 'Financial', icon: 'wallet' },
  { id: 'medical', label: 'Clinical', icon: 'stethoscope' },
  { id: 'staff', label: 'Staffing', icon: 'users' },
];

const HISTORICAL_REPORTS = [
  { id: '1', title: 'Monthly Revenue Audit', date: 'April 01, 2026', type: 'Financial', format: 'PDF', size: '2.4 MB', color: '#3B82F6' },
  { id: '2', title: 'Shift Attendance Log', date: 'March 28, 2026', type: 'Staffing', format: 'XLS', size: '1.1 MB', color: '#8B5CF6' },
  { id: '3', title: 'Pharmacy Inventory Q1', date: 'March 15, 2026', type: 'Inventory', format: 'PDF', size: '5.8 MB', color: '#10B981' },
  { id: '4', title: 'Patient Satisfaction Index', date: 'February 20, 2026', type: 'Survey', format: 'CSV', size: '0.5 MB', color: '#EC4899' },
  { id: '5', title: 'Critical Care Utilization', date: 'February 05, 2026', type: 'Clinical', format: 'PDF', size: '3.2 MB', color: '#F59E0B' },
];

// ─── Premium UI Components ───────────────────────────────────────────────────

const MetricCard = ({ label, value, icon, iconColor, bgColor, subtext }) => (
  <View style={[styles.metricCard, { backgroundColor: bgColor, borderColor: `${iconColor}15` }]}>
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
      <Text className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{label}</Text>
      <Text className="text-xl font-black text-gray-900 mt-0.5 tracking-tighter">{value}</Text>
    </View>
  </View>
);

const ReportItem = ({ report, onDownload }) => (
  <TouchableOpacity 
    onPress={onDownload}
    activeOpacity={0.8}
    className="bg-white rounded-[28px] p-5 mb-4 border border-slate-100 shadow-sm flex-row items-center"
    style={styles.shadowLow}
  >
    <View style={{ backgroundColor: `${report.color}15` }} className="h-14 w-14 rounded-2xl items-center justify-center mr-4">
      <FontAwesome5 name={report.format === 'PDF' ? 'file-pdf' : 'file-excel'} size={24} color={report.color} />
    </View>
    <View className="flex-1 pr-2">
      <Text className="text-sm font-black text-slate-900 leading-tight" numberOfLines={1}>{report.title}</Text>
      <View className="flex-row items-center mt-1">
        <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.type}</Text>
        <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" />
        <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{report.date}</Text>
      </View>
    </View>
    <View className="items-end">
       <View className="bg-slate-50 px-2.5 py-1 rounded-lg items-center justify-center border border-slate-100">
          <Ionicons name="cloud-download-outline" size={16} color="#64748B" />
          <Text className="text-[8px] font-black text-slate-400 uppercase mt-0.5">{report.size}</Text>
       </View>
    </View>
  </TouchableOpacity>
);

// ─── Main Content Component ───────────────────────────────────────────────────

const ReportsContent = () => {
  const { toggleSidebar } = useSidebar();
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const handleDownload = (title) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert("Download Complete", `${title} has been encrypted and saved to your device cache.`);
    }, 1500);
  };

  return (
    <View className="flex-1 bg-white">
      {/* ── Header ── */}
      <View className="px-6 py-6 bg-white border-b border-slate-50 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
              <Ionicons name="menu-outline" size={26} color="#4F46E5" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">AnalyticsHub</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Data & Insights Gateway</Text>
            </View>
          </View>
          <TouchableOpacity className="h-11 w-11 bg-slate-900 rounded-2xl items-center justify-center shadow-lg">
            <Ionicons name="options-vertical" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        
        {/* ── Stats ── */}
        <View className="flex-row flex-wrap justify-between mb-8">
           <MetricCard label="System Reports" value="1,280" icon="bar-chart" iconColor="#4F46E5" bgColor="#EEF2FF" subtext="HOSPITAL WIDE" />
           <MetricCard label="Audit Compliance" value="100%" icon="shield-checkmark" iconColor="#10B981" bgColor="#F0FDF4" subtext="VERIFIED" />
        </View>

        {/* ── Dynamic Category Switcher ── */}
        <View className="mb-8">
           <Text className="text-[11px] font-black text-slate-400 uppercase tracking-[2px] mb-4 ml-2">Intelligence Stream</Text>
           <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {REPORT_CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat.id}
                  onPress={() => setActiveCategory(cat.id)}
                  className={`flex-row items-center px-6 py-4 rounded-[24px] mr-3 border ${activeCategory === cat.id ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-50 border-slate-100'}`}
                >
                   <FontAwesome5 name={cat.icon} size={14} color={activeCategory === cat.id ? 'white' : '#94A3B8'} />
                   <Text className={`ml-3 text-[11px] font-black uppercase tracking-widest ${activeCategory === cat.id ? 'text-white' : 'text-slate-500'}`}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
           </ScrollView>
        </View>

        {/* ── Featured Visual Section ── */}
        <TouchableOpacity 
          activeOpacity={0.9}
          className="bg-indigo-50 rounded-[40px] p-8 mb-10 border border-indigo-100 overflow-hidden"
          onPress={() => Alert.alert("Visual Analytics", "Switching to interactive cloud charts...")}
        >
           <View style={[styles.decoratorCircle, { backgroundColor: '#4F46E5', top: -40, right: -40, opacity: 0.05, width: 140, height: 140 }]} />
           <View className="flex-row justify-between items-start mb-6">
              <View className="bg-white h-14 w-14 rounded-3xl items-center justify-center shadow-sm">
                 <Ionicons name="stats-chart" size={24} color="#4F46E5" />
              </View>
              <View className="bg-indigo-600 px-3 py-1.5 rounded-xl">
                 <Text className="text-white text-[10px] font-black uppercase tracking-widest">LIVE Q2</Text>
              </View>
           </View>
           <Text className="text-xl font-black text-slate-900 tracking-tighter mb-2">Hospital Health Visualizer</Text>
           <Text className="text-sm font-bold text-indigo-600 tracking-tight leading-relaxed">Touch to analyze patient velocity and occupancy trends for the current quarter.</Text>
           <View className="flex-row mt-6 items-center">
              <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Powered by HMS Analytics</Text>
              <Ionicons name="arrow-forward" size={12} color="#4F46E5" className="ml-2" />
           </View>
        </TouchableOpacity>

        {/* ── Historical List ── */}
        <View className="flex-row items-center justify-between mb-6 px-2">
           <Text className="text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Archive Explorer</Text>
           <TouchableOpacity className="bg-slate-100 px-3 py-1.5 rounded-xl">
              <Text className="text-slate-600 text-[9px] font-black uppercase">Filter Year</Text>
           </TouchableOpacity>
        </View>

        {HISTORICAL_REPORTS.map(report => (
          <ReportItem key={report.id} report={report} onDownload={() => handleDownload(report.title)} />
        ))}

        {loading && (
          <View className="absolute inset-0 bg-white/80 items-center justify-center rounded-[40px] z-50">
             <ActivityIndicator size="large" color="#4F46E5" />
             <Text className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Fetching Encrypted File...</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  metricCard: {
    width: (width - 60) / 2,
    padding: 24,
    borderRadius: 36,
    marginBottom: 10,
    borderWidth: 1.5,
    overflow: "hidden",
  },
  decoratorCircle: {
    position: "absolute",
    borderRadius: 100,
  },
  shadowLow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 1,
  }
});

const ReportsScreen = () => (
  <AdminLayout>
    <ReportsContent />
  </AdminLayout>
);

export default ReportsScreen;