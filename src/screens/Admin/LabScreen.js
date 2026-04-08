import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  StatusBar, 
  TextInput, 
  Dimensions, 
  ActivityIndicator,
  Modal as RNModal,
  Alert,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Rect, Defs, LinearGradient, Stop } from "react-native-svg";
import AdminLayout, { useSidebar } from "./AdminLayout";

const { width } = Dimensions.get("window");

const MetricCard = ({ title, value, subtitle, icon, iconColor, bgColor }) => (
  <View style={[styles.metricCard, { backgroundColor: bgColor }]} className="relative overflow-hidden">
    <View className="relative z-10">
      <View className="w-10 h-10 items-center justify-center rounded-full mb-3 shadow-sm" style={{ backgroundColor: iconColor }}>
        <Ionicons name={icon} size={18} color="white" />
      </View>
      <Text className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{title}</Text>
      <Text className="text-2xl font-black text-slate-900 mt-1">{value}</Text>
      <Text className="text-[9px] text-slate-400 font-medium mt-1">{subtitle}</Text>
    </View>
    <View className="absolute -right-4 -bottom-4 opacity-10" style={{ transform: [{ rotate: '-15deg' }] }}>
      <Ionicons name={icon} size={80} color={iconColor} />
    </View>
  </View>
);

const DashSection = ({ title, subtitle, children, icon, iconColor, iconBg }) => (
  <View className="mb-6 bg-white rounded-[32px] p-6 shadow-sm border border-slate-100/50">
    <View className="flex-row items-center mb-6">
      <View className="w-10 h-10 items-center justify-center rounded-full mr-3 shadow-sm" style={{ backgroundColor: iconBg }}>
        <Ionicons name={icon} size={20} color="white" />
      </View>
      <View>
        <Text className="text-lg font-black text-slate-800 tracking-tight">{title}</Text>
        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{subtitle}</Text>
      </View>
    </View>
    {children}
  </View>
);

const LabContent = () => {
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  const stats = [
    { title: "Investigations", value: "842", subtitle: "Diagnostic Total", icon: "flask", iconColor: "#3b82f6", bgColor: "#eff6ff" },
    { title: "Result Ready", value: "24", subtitle: "Pending Release", icon: "checkmark-circle", iconColor: "#10b981", bgColor: "#f0fdf4" },
    { title: "In Progress", value: "12", subtitle: "Processing Flow", icon: "sync", iconColor: "#f59e0b", bgColor: "#fffbeb" },
    { title: "Critical", value: "3", subtitle: "Emergency Alert", icon: "flash", iconColor: "#e11d48", bgColor: "#fff1f2" },
  ];

  const renderBarChart = () => {
    const chartHeight = 100;
    const barData = [60, 45, 80, 55, 90, 70, 85];
    const spacing = (width - 130) / (barData.length - 1);
    return (
      <DashSection title="Diagnostic Load" subtitle="Investigation Spikes" icon="pulse" iconBg="#8b5cf6">
        <View className="h-32 justify-end flex-row px-2">
            <Svg height={chartHeight} width={width - 80}>
               <Rect x={0} y={0} width={width-80} height={chartHeight} fill="transparent" />
               {barData.map((v, i) => (
                 <Rect key={i} x={i * spacing} y={chartHeight - (v/100*chartHeight)} width={14} height={(v/100*chartHeight)} fill="#0052CC" rx={4} />
               ))}
            </Svg>
        </View>
      </DashSection>
    );
  };

  if (loading) return <View className="flex-1 justify-center items-center bg-slate-50"><ActivityIndicator size="large" color="#0052CC" /></View>;

  return (
    <View className="flex-1 bg-slate-50">
      <StatusBar barStyle="dark-content" />
      <View className="px-6 py-6 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50" activeOpacity={0.7}>
              <Ionicons name="menu-outline" size={26} color="#4F46E5" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">Diagnostics</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Laboratory Command Core</Text>
            </View>
          </View>
          <TouchableOpacity className="h-11 w-11 items-center justify-center rounded-full bg-slate-50 border border-slate-100">
            <Ionicons name="notifications-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
        <View className="flex-row mt-6 gap-3">
          <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-blue-600 py-4 rounded-2xl">
            <Ionicons name="add" size={18} color="white" />
            <Text className="ml-2 text-xs font-black text-white">New Sample</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-slate-50 border border-slate-100 py-4 rounded-2xl">
            <Ionicons name="print" size={18} color="#64748b" />
            <Text className="ml-2 text-xs font-black text-slate-700">Batch Print</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        <View className="flex-row flex-wrap justify-between mb-2">
           {stats.map((s, i) => (<MetricCard key={i} {...s} />))}
        </View>
        {renderBarChart()}
        <DashSection title="Active Ledger" subtitle="Registry Stream" icon="flask" iconBg="#10b981">
           <View className="bg-slate-50/50 rounded-[24px] border border-slate-100 overflow-hidden">
             {[1,2,3,4].map((i) => (
               <View key={i} className="px-5 py-5 flex-row items-center justify-between border-b border-slate-100">
                 <View className="flex-row items-center flex-1">
                   <View className="w-10 h-10 items-center justify-center bg-white rounded-xl shadow-sm mr-4 border border-slate-100">
                      <Ionicons name="beaker-outline" size={18} color="#0052CC" />
                   </View>
                   <View>
                     <Text className="text-sm font-black text-slate-800">Sample #{900+i}</Text>
                     <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">April 0{i}, 2026 • 10:30 AM</Text>
                   </View>
                 </View>
                 <Text className="text-[8px] font-black text-emerald-600 uppercase bg-emerald-50 px-2 py-1 rounded-md">Ready</Text>
               </View>
             ))}
           </View>
        </DashSection>
      </ScrollView>
    </View>
  );
};

const LabScreen = () => (<AdminLayout><LabContent /></AdminLayout>);

const styles = StyleSheet.create({
  metricCard: { width: (width - 52) / 2, borderRadius: 32, padding: 24, marginBottom: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.8)", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.04, shadowRadius: 12, elevation: 3 },
});

export default LabScreen;