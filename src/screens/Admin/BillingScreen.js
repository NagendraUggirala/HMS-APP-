import React, { useState, useEffect, useMemo } from 'react';
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
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Svg, Path, Circle, Defs, LinearGradient, Stop, Line, Text as SvgText, G } from 'react-native-svg';
import AdminLayout, { useSidebar } from './AdminLayout';

const { width } = Dimensions.get('window');

// Premium Metric Card Component (matching AuditLogsScreen style)
const MetricCard = ({ label, value, icon, change, iconColor, bgColor }) => {
  const isPositive = change.startsWith('+');
  const isNegative = change.startsWith('-');

  return (
    <View style={[styles.metricCard, { backgroundColor: bgColor, borderColor: `${iconColor}20` }]}>
      {/* Decorative Background Circles */}
      <View
        style={[styles.decoratorCircle, { backgroundColor: iconColor, top: -20, right: -20, opacity: 0.1, width: 80, height: 80 }]}
      />
      <View
        style={[styles.decoratorCircle, { backgroundColor: iconColor, bottom: -20, left: -20, opacity: 0.05, width: 60, height: 60 }]}
      />

      <View className="flex-row items-center justify-between mb-4">
        <View className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-gray-50">
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <View className={`px-2 py-1 rounded-lg flex-row items-center ${
          isPositive ? 'bg-green-100' : isNegative ? 'bg-red-100' : 'bg-gray-100'
        }`}>
          <Ionicons 
            name={isPositive ? "trending-up" : isNegative ? "trending-down" : "remove"} 
            size={12} 
            color={isPositive ? "#059669" : isNegative ? "#dc2626" : "#6b7280"} 
          />
          <Text className={`text-[10px] font-black ml-1 ${
            isPositive ? 'text-green-700' : isNegative ? 'text-red-700' : 'text-gray-600'
          }`}>
            {change}
          </Text>
        </View>
      </View>

      <View>
        <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</Text>
        <Text className="text-xl font-black text-gray-900 mt-1 tracking-tighter">{value}</Text>
      </View>
    </View>
  );
};

// Signature Bill Item Card
const BillCard = ({ bill, type = 'full', openModal }) => {
  const isPaid = bill.status === 'Paid';
  const isPending = bill.status === 'Pending';
  const isOverdue = bill.status === 'Overdue';

  const statusColor = isPaid ? '#10B981' : isPending ? '#F59E0B' : '#EF4444';
  const statusBg = isPaid ? '#f0fdf4' : isPending ? '#fffbeb' : '#fef2f2';

  return (
    <TouchableOpacity 
      onPress={() => openModal('view', bill)}
      style={[styles.signatureItemCard, { backgroundColor: statusBg, borderColor: `${statusColor}10` }]}
      activeOpacity={0.7}
      className="mb-4"
    >
      {/* Decorative circles to match MetricCard */}
      <View 
        style={[styles.decoratorCircle, { backgroundColor: statusColor, top: -25, right: -25, opacity: 0.1, width: 80, height: 80 }]} 
      />
      <View 
        style={[styles.decoratorCircle, { backgroundColor: statusColor, bottom: -40, left: 40, opacity: 0.05, width: 60, height: 60 }]} 
      />
      
      <View className="flex-row items-center">
        {/* Status indicator bar */}
        <View style={{ width: 4, height: 40, backgroundColor: statusColor, borderRadius: 2, marginRight: 15 }} />
        
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-[15px] font-black text-slate-900 tracking-tight">{bill.patient}</Text>
            <Text className="text-base font-black text-slate-900">₹{bill.amount - (bill.discount || 0)}</Text>
          </View>
          
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mr-3">{bill.id}</Text>
              <View className="bg-white/60 px-2 py-0.5 rounded-md border border-slate-100">
                <Text className="text-[8px] font-black text-slate-500 uppercase">{bill.date}</Text>
              </View>
            </View>

            <View className={`px-2.5 py-1 rounded-lg ${isPaid ? 'bg-emerald-100/60' : isPending ? 'bg-amber-100/60' : 'bg-rose-100/60'}`}>
              <Text className={`text-[8px] font-black uppercase tracking-tight ${isPaid ? 'text-emerald-700' : isPending ? 'text-amber-700' : 'text-rose-700'}`}>
                {bill.status}
              </Text>
            </View>
          </View>

          {type === 'full' && (
            <View className="flex-row flex-wrap gap-1 mt-3 pt-3 border-t border-slate-200/30">
              {bill.services.slice(0, 4).map(s => (
                <View key={s} className="bg-white/80 px-2 py-0.5 rounded-md border border-slate-100">
                  <Text className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">{s}</Text>
                </View>
              ))}
              {bill.services.length > 4 && (
                <Text className="text-[8px] font-black text-slate-300 ml-1">+{bill.services.length - 4} MORE</Text>
              )}
            </View>
          )}
        </View>
        <Ionicons name="chevron-forward" size={16} color="#cbd5e1" className="ml-3" />
      </View>
    </TouchableOpacity>
  );
};

const BillingContent = () => {
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [periodFilter, setPeriodFilter] = useState('7days');
  const [modalState, setModalState] = useState({ view: false, generate: false, payment: false, edit: false });
  const [refreshing, setRefreshing] = useState(false);
  const [currentBill, setCurrentBill] = useState(null);
  const [editBill, setEditBill] = useState(null);
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, month: '', value: 0 });
  const [newBill, setNewBill] = useState({
    patient: '',
    services: [],
    amount: '',
    discount: '',
    paymentMethod: 'Cash',
    notes: ''
  });

  // Data constants
  const PATIENTS = ['Ravi Kumar', 'Anita Sharma', 'Suresh Patel', 'Priya Singh', 'Rajesh Kumar', 'Meena Gupta'];
  const SERVICES = ['Consultation', 'X-Ray', 'Blood Test', 'MRI Scan', 'CT Scan', 'Medication', 'Surgery', 'Lab Test'];
  const PAYMENT_METHODS = ['Cash', 'Card', 'UPI', 'Insurance', 'Bank Transfer'];

  const delay = (ms) => new Promise(res => setTimeout(res, ms));

  const loadBills = async () => {
    setLoading(true);
    await delay(1000);
    setBills([
      { id: 'INV-4001', patient: 'Ravi Kumar', doctorName: 'Dr. Rajesh Singh', services: ['Consultation', 'X-Ray'], amount: 1200, discount: 0, paymentMethod: 'Cash', status: 'Paid', date: '2023-11-15', admissionDate: '2023-11-10', dischargeDate: '2023-11-15', treatments: ['General Check-up', 'X-Ray Imaging'], tests: ['Chest X-Ray', 'BMI Check'], notes: 'Routine checkup' },
      { id: 'INV-4002', patient: 'Anita Sharma', doctorName: 'Dr. Priya Patel', services: ['Blood Test'], amount: 300, discount: 50, paymentMethod: 'Card', status: 'Paid', date: '2023-11-16', admissionDate: '2023-11-16', dischargeDate: '2023-11-16', treatments: ['Blood Examination'], tests: ['CBC', 'Diabetes Test'], notes: 'Diabetes screening' },
      { id: 'INV-4003', patient: 'Suresh Patel', doctorName: 'Dr. Vikram Kumar', services: ['MRI Scan'], amount: 2500, discount: 0, paymentMethod: 'Insurance', status: 'Pending', date: '2023-11-17', admissionDate: '2023-11-12', dischargeDate: '2023-11-17', treatments: ['MRI Scan', 'Neurology Consultation'], tests: ['Brain MRI', 'Neurological Assessment'], notes: 'Neurology referral' },
      { id: 'INV-4004', patient: 'Priya Singh', doctorName: 'Dr. Neha Gupta', services: ['Consultation', 'Medication'], amount: 650, discount: 0, paymentMethod: 'UPI', status: 'Paid', date: '2023-11-18', admissionDate: '2023-11-18', dischargeDate: '2023-11-18', treatments: ['Consultation', 'Medication Provision'], tests: ['Blood Pressure', 'Headache Assessment'], notes: 'Migraine treatment' },
      { id: 'INV-4005', patient: 'Rajesh Kumar', doctorName: 'Dr. Amit Verma', services: ['CT Scan'], amount: 1800, discount: 100, paymentMethod: 'Card', status: 'Overdue', date: '2023-11-14', admissionDate: '2023-11-08', dischargeDate: '2023-11-14', treatments: ['CT Scan', 'Injury Assessment'], tests: ['CT Abdomen', 'Trauma Evaluation'], notes: 'Accident follow-up' },
      { id: 'INV-4006', patient: 'Meena Gupta', doctorName: 'Dr. Sanjay Nair', services: ['Surgery', 'Medication'], amount: 5000, discount: 200, paymentMethod: 'Insurance', status: 'Pending', date: '2023-11-20', admissionDate: '2023-11-18', dischargeDate: '2023-11-20', treatments: ['Knee Surgery', 'Post-Op Care'], tests: ['X-Ray Pre-Op', 'Blood Test', 'ECG'], notes: 'Knee surgery' },
      { id: 'INV-3001', patient: 'Ravi Kumar', doctorName: 'Dr. Rajesh Singh', services: ['Consultation'], amount: 800, discount: 0, paymentMethod: 'Cash', status: 'Paid', date: '2023-10-10', admissionDate: '2023-10-10', dischargeDate: '2023-10-10', treatments: ['Follow-up Consultation'], tests: ['Vitals Check'], notes: 'Follow-up' },
      { id: 'INV-3002', patient: 'Anita Sharma', doctorName: 'Dr. Priya Patel', services: ['Blood Test'], amount: 300, discount: 0, paymentMethod: 'Card', status: 'Paid', date: '2023-10-12', admissionDate: '2023-10-12', dischargeDate: '2023-10-12', treatments: ['Blood Examination'], tests: ['CBC', 'General Blood Work'], notes: 'Regular checkup' },
      { id: 'INV-3003', patient: 'Suresh Patel', doctorName: 'Dr. Vikram Kumar', services: ['X-Ray'], amount: 400, discount: 0, paymentMethod: 'Cash', status: 'Paid', date: '2023-10-15', admissionDate: '2023-10-15', dischargeDate: '2023-10-15', treatments: ['Chest Imaging'], tests: ['Chest X-Ray'], notes: 'Chest X-Ray' },
      { id: 'INV-3004', patient: 'Priya Singh', doctorName: 'Dr. Neha Gupta', services: ['Consultation'], amount: 500, discount: 0, paymentMethod: 'UPI', status: 'Paid', date: '2023-10-18', admissionDate: '2023-10-18', dischargeDate: '2023-10-18', treatments: ['Consultation'], tests: ['Vitals Check'], notes: 'Headache' },
      { id: 'INV-3005', patient: 'Rajesh Kumar', doctorName: 'Dr. Amit Verma', services: ['Lab Test'], amount: 600, discount: 50, paymentMethod: 'Card', status: 'Pending', date: '2023-10-20', admissionDate: '2023-10-20', dischargeDate: '2023-10-20', treatments: ['Blood Work'], tests: ['Complete Blood Test'], notes: 'Blood test' },
    ]);
    setLoading(false);
  };

  useEffect(() => { loadBills() }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      await loadBills();
    } finally {
      setRefreshing(false);
    }
  }, []);


  const getDateRange = (monthsAgo = 0) => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsAgo + 1, 0);
    return { start, end };
  };

  const calculateStatsForMonth = (monthsAgo = 0) => {
    const { start, end } = getDateRange(monthsAgo);
    const filteredBills = bills.filter(bill => {
      const billDate = new Date(bill.date);
      return billDate >= start && billDate <= end;
    });
    
    const totalBills = filteredBills.length;
    const totalRevenue = filteredBills
      .filter(b => b.status === 'Paid')
      .reduce((sum, bill) => sum + (bill.amount - bill.discount), 0);
    const pendingAmount = filteredBills
      .filter(b => b.status === 'Pending')
      .reduce((sum, bill) => sum + (bill.amount - bill.discount), 0);
    const overdueAmount = filteredBills
      .filter(b => b.status === 'Overdue')
      .reduce((sum, bill) => sum + (bill.amount - bill.discount), 0);
    
    return { totalBills, totalRevenue, pendingAmount, overdueAmount };
  };

  const calculatePercentageChange = (current, previous) => {
    if (previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
  };

  const currentMonthStats = calculateStatsForMonth(0);
  const lastMonthStats = calculateStatsForMonth(1);

  const stats = [
    { label: 'Bills', value: currentMonthStats.totalBills, icon: 'receipt-outline', change: calculatePercentageChange(currentMonthStats.totalBills, lastMonthStats.totalBills), iconColor: '#3B82F6', bgColor: '#eff6ff' },
    { label: 'Revenue', value: `₹${currentMonthStats.totalRevenue.toLocaleString()}`, icon: 'wallet-outline', change: calculatePercentageChange(currentMonthStats.totalRevenue, lastMonthStats.totalRevenue), iconColor: '#10B981', bgColor: '#f0fdf4' },
    { label: 'Pending', value: `₹${currentMonthStats.pendingAmount.toLocaleString()}`, icon: 'hourglass-outline', change: calculatePercentageChange(currentMonthStats.pendingAmount, lastMonthStats.pendingAmount), iconColor: '#F59E0B', bgColor: '#fffbeb' },
    { label: 'Overdue', value: `₹${currentMonthStats.overdueAmount.toLocaleString()}`, icon: 'alert-circle-outline', change: calculatePercentageChange(currentMonthStats.overdueAmount, lastMonthStats.overdueAmount), iconColor: '#EF4444', bgColor: '#fef2f2' },
  ];

  const openModal = (type, bill = null) => {
    setModalState(prev => ({ ...prev, [type]: true }));
    if (type === 'view' && bill) setCurrentBill(bill);
    else if (type === 'payment' && bill) setCurrentBill(bill);
    else if (type === 'generate') resetForm();
    else if (type === 'edit' && bill) setEditBill({ ...bill });
  };

  const closeModal = (type) => {
    setModalState(prev => ({ ...prev, [type]: false }));
    if (type === 'view' || type === 'payment') setCurrentBill(null);
    if (type === 'edit') setEditBill(null);
  };

  const handleGenerateBill = () => {
    if (!newBill.patient || newBill.services.length === 0 || !newBill.amount) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    const bill = {
      id: `INV-${Math.floor(4000 + Math.random() * 9000)}`,
      patient: newBill.patient,
      services: newBill.services,
      amount: parseInt(newBill.amount, 10),
      discount: parseInt(newBill.discount || 0, 10),
      paymentMethod: newBill.paymentMethod,
      notes: newBill.notes,
      status: 'Pending',
      date: new Date().toISOString().split('T')[0],
      treatments: [], // Mock data placeholder
      tests: [],
      admissionDate: new Date().toISOString().split('T')[0],
      dischargeDate: new Date().toISOString().split('T')[0],
      doctorName: 'Dr. Assigned'
    };
    setBills(prev => [bill, ...prev]);
    closeModal('generate');
  };

  const handleMarkAsPaid = (billId) => {
    setBills(prev => prev.map(bill => bill.id === billId ? { ...bill, status: 'Paid' } : bill));
  };

  const handleUpdateBill = () => {
    if (!editBill || !editBill.patient || editBill.services.length === 0 || !editBill.amount) {
      Alert.alert('Error', 'Please fill all required fields.');
      return;
    }
    setBills(prev => prev.map(bill => bill.id === editBill.id ? { ...editBill } : bill));
    closeModal('edit');
  };

  const resetForm = () => {
    setNewBill({ patient: '', services: [], amount: '', discount: '', paymentMethod: 'Cash', notes: '' });
  };

  // Filtering
  const filteredBills = bills.filter(bill => {
    const matchesSearch = !searchTerm || [bill.patient, bill.id].some(f => f.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = !statusFilter || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const recentBills = [...filteredBills].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);

  // Chart Data Preparation (Ported from Web)
  const chartData = {
    '7days': [
      { month: 'Mon', value: 35 }, { month: 'Tue', value: 42 }, { month: 'Wed', value: 38 },
      { month: 'Thu', value: 48 }, { month: 'Fri', value: 55 }, { month: 'Sat', value: 52 }, { month: 'Sun', value: 58 }
    ],
    '30days': [
      { month: 'Wk 1', value: 38 }, { month: 'Wk 2', value: 45 }, { month: 'Wk 3', value: 42 }, { month: 'Wk 4', value: 52 }
    ],
    '3months': [
      { month: 'Jan', value: 45 }, { month: 'Feb', value: 52 }, { month: 'Mar', value: 48 }
    ],
    '12months': [
      { month: 'Jan', value: 45 }, { month: 'Feb', value: 52 }, { month: 'Mar', value: 48 },
      { month: 'Apr', value: 61 }, { month: 'May', value: 55 }, { month: 'Jun', value: 67 },
      { month: 'Jul', value: 70 }, { month: 'Aug', value: 65 }, { month: 'Sep', value: 72 },
      { month: 'Oct', value: 68 }, { month: 'Nov', value: 75 }, { month: 'Dec', value: 80 }
    ]
  };

  const currentChartData = chartData[periodFilter] || chartData['7days'];

  // SVG Chart Calculation logic for React Native
  const chartProps = useMemo(() => {
    const chartWidth = width - 48; // Padding subtracted
    const chartHeight = 180;
    const padding = { left: 40, right: 10, top: 10, bottom: 30 };
    
    const usableWidth = chartWidth - padding.left - padding.right;
    const usableHeight = chartHeight - padding.top - padding.bottom;
    
    const xStep = usableWidth / (currentChartData.length - 1 || 1);
    const maxValue = 100; // Fixed max for consistency or Math.max(...currentChartData.map(d => d.value)) * 1.2
    
    const points = currentChartData.map((d, i) => ({
      x: padding.left + i * xStep,
      y: chartHeight - padding.bottom - (d.value / maxValue) * usableHeight,
      value: d.value,
      label: d.month
    }));

    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i-1];
      const curr = points[i];
      // Simple quadratic curve for smoothness
      const cx = (prev.x + curr.x) / 2;
      path += ` Q ${prev.x} ${prev.y}, ${cx} ${(prev.y + curr.y) / 2} T ${curr.x} ${curr.y}`;
    }

    const areaPath = `${path} L ${points[points.length-1].x} ${chartHeight - padding.bottom} L ${points[0].x} ${chartHeight - padding.bottom} Z`;

    return { points, path, areaPath, chartWidth, chartHeight, padding, usableHeight };
  }, [currentChartData, periodFilter]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-[10px]">Processing Finance...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* Header */}
      <View className="px-6 py-6 bg-white border-b border-slate-100 shadow-sm">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
              <Ionicons name="menu-outline" size={26} color="#3B82F6" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-black text-slate-900 tracking-tighter">Billing Finance</Text>
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Hospital Command Center</Text>
            </View>
          </View>
          <TouchableOpacity 
            onPress={() => openModal('generate')}
            className="h-11 px-4 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-200 flex-row"
          >
            <Ionicons name="add" size={20} color="white" />
            <Text className="text-white font-black text-xs ml-1">NEW BILL</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1" 
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Metric Cards Grid */}
        <View className="flex-row flex-wrap justify-between mb-4">
          {stats.map((stat, i) => (
            <MetricCard key={i} {...stat} />
          ))}
        </View>

        {/* Revenue Trends Chart */}
        <View className="bg-white rounded-[32px] p-6 mb-6 border border-slate-100 shadow-sm">
          <View className="flex-row justify-between items-center mb-6">
            <View>
              <Text className="text-sm font-black text-slate-900 uppercase tracking-tighter">Revenue Trends</Text>
              <Text className="text-[9px] font-bold text-slate-400 uppercase">Amount in ₹ (Thousands)</Text>
            </View>
            <View className="flex-row bg-slate-50 p-1 rounded-xl">
              {['7days', '30days', '12months'].map(p => (
                <TouchableOpacity 
                  key={p} 
                  onPress={() => setPeriodFilter(p)}
                  className={`px-3 py-1.5 rounded-lg ${periodFilter === p ? 'bg-white shadow-sm' : ''}`}
                >
                  <Text className={`text-[9px] font-black uppercase ${periodFilter === p ? 'text-blue-600' : 'text-slate-400'}`}>
                    {p.replace('days', 'D').replace('months', 'M')}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: chartProps.chartHeight }}>
            <Svg width={chartProps.chartWidth} height={chartProps.chartHeight}>
              <Defs>
                <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#3B82F6" stopOpacity="0.2" />
                  <Stop offset="1" stopColor="#3B82F6" stopOpacity="0" />
                </LinearGradient>
              </Defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map(v => {
                const y = chartProps.chartHeight - chartProps.padding.bottom - (v / 100) * chartProps.usableHeight;
                return (
                  <G key={v}>
                    <Line x1={chartProps.padding.left} y1={y} x2={chartProps.chartWidth - chartProps.padding.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                    <SvgText x={chartProps.padding.left - 10} y={y + 4} fontSize="9" fill="#94a3b8" textAnchor="end" fontWeight="bold">₹{v}K</SvgText>
                  </G>
                )
              })}

              {/* Area & Path */}
              <Path d={chartProps.areaPath} fill="url(#grad)" />
              <Path d={chartProps.path} fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />

              {/* Data Points */}
              {chartProps.points.map((p, i) => (
                <G key={i}>
                  <Circle cx={p.x} cy={p.y} r="5" fill="white" stroke="#3B82F6" strokeWidth="2.5" />
                  <SvgText x={p.x} y={chartProps.chartHeight - 10} fontSize="8" fill="#94a3b8" textAnchor="middle" fontWeight="black">{p.label}</SvgText>
                </G>
              ))}
            </Svg>
          </View>
        </View>

        {/* Search & Filter Bar */}
        <View className="mb-6">
          <View className="flex-row gap-3">
            <View className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex-row items-center px-4 h-12">
              <Ionicons name="search-outline" size={18} color="#94a3b8" />
              <TextInput
                placeholder="Search patient or invoice..."
                className="flex-1 ml-2 text-sm font-medium text-slate-800"
                value={searchTerm}
                onChangeText={setSearchTerm}
              />
            </View>
            <TouchableOpacity 
              className="bg-white w-12 h-12 rounded-2xl border border-slate-100 shadow-sm items-center justify-center"
              onPress={() => setStatusFilter(statusFilter === 'Paid' ? 'Pending' : statusFilter === 'Pending' ? '' : 'Paid')}
            >
              <Ionicons 
                name="funnel-outline" 
                size={18} 
                color={statusFilter ? "#3B82F6" : "#94a3b8"} 
              />
            </TouchableOpacity>
          </View>
          {statusFilter ? (
            <View className="flex-row mt-2 px-1">
              <View className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100 flex-row items-center">
                <Text className="text-[10px] font-black text-blue-600 uppercase">Status: {statusFilter}</Text>
                <TouchableOpacity onPress={() => setStatusFilter('')} className="ml-2">
                  <Ionicons name="close-circle" size={12} color="#3B82F6" />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        {/* Recent Bills Section */}
        <View className="mb-8">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-lg font-black text-slate-900 tracking-tighter">Recent Bills</Text>
            <TouchableOpacity onPress={() => {/* Mock Export */ Alert.alert('Export', 'Report exported to PDF') }}>
              <Text className="text-xs font-bold text-blue-600">Export Report</Text>
            </TouchableOpacity>
          </View>
          
          {recentBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} type="simple" openModal={openModal} />
          ))}
        </View>

        {/* All Bills List (Replaces Table) */}
        <View className="mb-4">
          <View className="flex-row justify-between items-center mb-4 px-1">
            <Text className="text-lg font-black text-slate-900 tracking-tighter">Transaction Ledger</Text>
            <View className="bg-blue-100 px-2 py-0.5 rounded-full">
              <Text className="text-[8px] font-black text-blue-600 uppercase">{filteredBills.length} TOTAL</Text>
            </View>
          </View>

          {filteredBills.map((bill) => (
            <BillCard key={bill.id} bill={bill} type="full" openModal={openModal} />
          ))}
        </View>


        <View className="mt-8 flex-row items-center justify-center opacity-30">
          <Ionicons name="shield-checkmark" size={14} color="#64748b" />
          <Text className="text-[8px] font-black text-slate-500 uppercase ml-2 tracking-widest">Secure Financial Gateway</Text>
        </View>

      </ScrollView>

      {/* Modals Implementation */}
      <BillingModals 
        modalState={modalState} 
        closeModal={closeModal} 
        currentBill={currentBill}
        editBill={editBill}
        setEditBill={setEditBill}
        newBill={newBill}
        setNewBill={setNewBill}
        PATIENTS={PATIENTS}
        SERVICES={SERVICES}
        PAYMENT_METHODS={PAYMENT_METHODS}
        handleGenerateBill={handleGenerateBill}
        handleUpdateBill={handleUpdateBill}
        handleMarkAsPaid={handleMarkAsPaid}
      />
    </View>
  );
};

// Sub-component for Modals to keep BillingContent cleaner
const BillingModals = ({ 
  modalState, closeModal, currentBill, editBill, setEditBill, 
  newBill, setNewBill, PATIENTS, SERVICES, PAYMENT_METHODS, 
  handleGenerateBill, handleUpdateBill, handleMarkAsPaid 
}) => {
  
  const renderModalHeader = (title, type) => (
    <View className="flex-row justify-between items-center p-6 border-b border-slate-100">
      <Text className="text-lg font-black text-slate-900 uppercase tracking-tighter">{title}</Text>
      <TouchableOpacity onPress={() => closeModal(type)} className="h-8 w-8 items-center justify-center rounded-full bg-slate-50">
        <Ionicons name="close" size={20} color="#64748b" />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      {/* View Bill Modal */}
      <Modal visible={modalState.view} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px] max-h-[90%]">
            {renderModalHeader('Bill Details', 'view')}
            <ScrollView className="p-6">
              {currentBill && (
                <View className="space-y-6">
                  <View className="bg-blue-50/50 p-6 rounded-[32px] border border-blue-100 items-center">
                    <Text className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">Total Bill Amount</Text>
                    <Text className="text-4xl font-black text-blue-600 tracking-tighter">₹{currentBill.amount - currentBill.discount}</Text>
                    <View className="flex-row mt-2 bg-white px-3 py-1 rounded-full border border-blue-100">
                      <Text className="text-[9px] font-bold text-blue-400">{currentBill.id} • {currentBill.status}</Text>
                    </View>
                  </View>

                  <View className="flex-row flex-wrap justify-between mt-6">
                    <DetailBox label="Patient" value={currentBill.patient} />
                    <DetailBox label="Doctor" value={currentBill.doctorName} />
                    <DetailBox label="Date" value={currentBill.date} />
                    <DetailBox label="Method" value={currentBill.paymentMethod} />
                  </View>

                  <View className="mt-4">
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] mb-3">Items & Services</Text>
                    <View className="bg-slate-50 rounded-2xl p-4">
                      {currentBill.services.map((s, i) => (
                        <View key={i} className="flex-row justify-between py-2 border-b border-slate-200/50 last:border-b-0">
                          <Text className="text-sm font-bold text-slate-700">{s}</Text>
                          <Text className="text-sm font-black text-slate-900">INCL.</Text>
                        </View>
                      ))}
                    </View>
                  </View>

                  {currentBill.status !== 'Paid' && (
                    <TouchableOpacity 
                      onPress={() => { handleMarkAsPaid(currentBill.id); closeModal('view'); }}
                      className="bg-green-600 h-14 rounded-2xl items-center justify-center mt-6 shadow-lg shadow-green-200"
                    >
                      <Text className="text-white font-black uppercase tracking-widest">Process Payment</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Generate Bill Modal */}
      <Modal visible={modalState.generate} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px] h-[95%]">
            {renderModalHeader('Generate Invoice', 'generate')}
            <ScrollView className="p-6">
              <View className="space-y-4">
                <InputLabel label="Select Patient" />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-6 py-2">
                  {PATIENTS.map(p => (
                    <TouchableOpacity 
                      key={p} 
                      onPress={() => setNewBill({...newBill, patient: p})}
                      style={{ width: 100, height: 100 }}
                      className={`mr-3 p-4 rounded-[32px] border items-center justify-center ${newBill.patient === p ? 'bg-blue-600 border-blue-600 shadow-lg shadow-blue-200' : 'bg-white border-slate-100'}`}
                    >
                      <View className={`w-10 h-10 rounded-full items-center justify-center mb-2 ${newBill.patient === p ? 'bg-white/20' : 'bg-blue-50'}`}>
                        <Ionicons name="person" size={18} color={newBill.patient === p ? 'white' : '#3B82F6'} />
                      </View>
                      <Text className={`text-[9px] font-black text-center uppercase tracking-tighter ${newBill.patient === p ? 'text-white' : 'text-slate-500'}`}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <InputLabel label="Services Provided" />
                <View className="flex-row flex-wrap gap-3 mb-6">
                  {SERVICES.map(s => {
                    const isSelected = newBill.services.includes(s);
                    return (
                      <TouchableOpacity 
                        key={s} 
                        onPress={() => {
                          const services = isSelected 
                            ? newBill.services.filter(item => item !== s) 
                            : [...newBill.services, s];
                          setNewBill({...newBill, services});
                        }}
                        style={{ width: '31%', height: 75 }}
                        className={`p-3 rounded-2xl border items-center justify-center ${isSelected ? 'bg-blue-50 border-blue-500' : 'bg-white border-slate-100'}`}
                      >
                        <Ionicons name="medical" size={16} color={isSelected ? '#3B82F6' : '#94a3b8'} className="mb-1" />
                        <Text className={`text-[8px] font-black text-center uppercase ${isSelected ? 'text-blue-700' : 'text-slate-400'}`}>{s}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                <View className="flex-row gap-4 mb-4">
                  <View className="flex-1">
                    <InputLabel label="Base Amount (₹)" />
                    <TextInput 
                      className="bg-slate-50 h-12 rounded-2xl px-4 font-black text-slate-900 border border-slate-100"
                      keyboardType="numeric"
                      value={String(newBill.amount)}
                      onChangeText={(v) => setNewBill({...newBill, amount: v})}
                    />
                  </View>
                  <View className="flex-1">
                    <InputLabel label="Discount (₹)" />
                    <TextInput 
                      className="bg-slate-50 h-12 rounded-2xl px-4 font-black text-slate-900 border border-slate-100"
                      keyboardType="numeric"
                      value={String(newBill.discount)}
                      onChangeText={(v) => setNewBill({...newBill, discount: v})}
                    />
                  </View>
                </View>

                <InputLabel label="Payment Method" />
                <View className="flex-row flex-wrap gap-2 mb-6">
                  {PAYMENT_METHODS.map(m => (
                    <TouchableOpacity 
                      key={m} 
                      onPress={() => setNewBill({...newBill, paymentMethod: m})}
                      className={`px-4 py-2 rounded-xl border ${newBill.paymentMethod === m ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-100'}`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${newBill.paymentMethod === m ? 'text-white' : 'text-slate-400'}`}>{m}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <TouchableOpacity 
                  onPress={handleGenerateBill}
                  className="bg-blue-600 h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-200"
                >
                  <Text className="text-white font-black uppercase tracking-widest">Generate Bill</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Edit Bill Modal */}
      <Modal visible={modalState.edit} animationType="slide" transparent>
        <View className="flex-1 bg-black/40 justify-end">
          <View className="bg-white rounded-t-[40px] h-[95%]">
            {renderModalHeader('Edit Invoice', 'edit')}
            <ScrollView className="p-6">
              {editBill && (
                <View className="space-y-4">
                  <InputLabel label="Patient Name" />
                  <TextInput 
                    className="bg-slate-50 h-12 rounded-2xl px-4 font-black text-slate-900 border border-slate-100"
                    value={editBill.patient}
                    onChangeText={(v) => setEditBill({...editBill, patient: v})}
                  />
                  
                  <InputLabel label="Services" />
                  <View className="flex-row flex-wrap gap-3 mb-6">
                    {SERVICES.map(s => {
                      const isSelected = editBill.services.includes(s);
                      return (
                        <TouchableOpacity 
                          key={s} 
                          onPress={() => {
                            const services = isSelected 
                              ? editBill.services.filter(item => item !== s) 
                              : [...editBill.services, s];
                            setEditBill({...editBill, services});
                          }}
                          style={{ width: '31%', height: 75 }}
                          className={`p-3 rounded-2xl border items-center justify-center ${isSelected ? 'bg-orange-50 border-orange-500' : 'bg-white border-slate-100'}`}
                        >
                          <Ionicons name="medical" size={16} color={isSelected ? '#F59E0B' : '#94a3b8'} className="mb-1" />
                          <Text className={`text-[8px] font-black text-center uppercase ${isSelected ? 'text-orange-700' : 'text-slate-400'}`}>{s}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  <View className="flex-row gap-4 mb-4">
                    <View className="flex-1">
                      <InputLabel label="Amount (₹)" />
                      <TextInput 
                        className="bg-slate-50 h-12 rounded-2xl px-4 font-black text-slate-900 border border-slate-100"
                        keyboardType="numeric"
                        value={String(editBill.amount)}
                        onChangeText={(v) => setEditBill({...editBill, amount: parseInt(v) || 0})}
                      />
                    </View>
                    <View className="flex-1">
                      <InputLabel label="Discount (₹)" />
                      <TextInput 
                        className="bg-slate-50 h-12 rounded-2xl px-4 font-black text-slate-900 border border-slate-100"
                        keyboardType="numeric"
                        value={String(editBill.discount)}
                        onChangeText={(v) => setEditBill({...editBill, discount: parseInt(v) || 0})}
                      />
                    </View>
                  </View>

                  <InputLabel label="Status" />
                  <View className="flex-row gap-2 mb-8">
                    {['Paid', 'Pending', 'Overdue'].map(s => (
                      <TouchableOpacity 
                        key={s} 
                        onPress={() => setEditBill({...editBill, status: s})}
                        className={`flex-1 h-12 rounded-2xl border items-center justify-center ${editBill.status === s ? 'bg-slate-900 border-slate-900' : 'bg-white border-slate-100'}`}
                      >
                        <Text className={`text-[10px] font-black uppercase ${editBill.status === s ? 'text-white' : 'text-slate-400'}`}>{s}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity 
                    onPress={handleUpdateBill}
                    className="bg-orange-500 h-14 rounded-2xl items-center justify-center shadow-lg shadow-orange-200"
                  >
                    <Text className="text-white font-black uppercase tracking-widest">Update Bill</Text>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Helper components for Modals
const DetailBox = ({ label, value }) => (
  <View style={{ width: '48%', marginBottom: 16 }}>
    <Text className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{label}</Text>
    <Text className="text-sm font-black text-slate-800 mt-1">{value || 'N/A'}</Text>
  </View>
);

const InputLabel = ({ label }) => (
  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-[1px] mb-2">{label}</Text>
);

const BillingScreen = () => (
  <AdminLayout>
    <BillingContent />
  </AdminLayout>
);

const styles = StyleSheet.create({
  metricCard: {
    width: (width - 50) / 2,
    borderRadius: 32,
    padding: 20,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    position: 'relative',
    overflow: 'hidden',
  },
  signatureItemCard: {
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 5,
    elevation: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  decoratorCircle: {
    position: 'absolute',
    borderRadius: 99,
  },
});

export default BillingScreen;
