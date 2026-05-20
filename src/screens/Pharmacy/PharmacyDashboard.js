import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import Svg, { Path, Defs, LinearGradient, Stop, Polyline, Text as SvgText, Circle as SvgCircle } from "react-native-svg";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ActivityItem = ({ title, desc, iconName, bgClass, iconColor, time, isMci = false }) => (
  <TouchableOpacity className="flex-row items-start bg-white p-3 rounded-2xl mb-3 border border-slate-100 shadow-sm" activeOpacity={0.7}>
    <View className={`w-10 h-10 rounded-full items-center justify-center ${bgClass} mr-3`}>
      {isMci ? (
        <MaterialCommunityIcons name={iconName} size={20} color={iconColor} />
      ) : (
        <Ionicons name={iconName} size={20} color={iconColor} />
      )}
    </View>
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-0.5">
        <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>{title}</Text>
        {time ? <Text className="text-[10px] text-slate-400 font-medium">{time}</Text> : null}
      </View>
      <Text className="text-slate-500 text-xs" numberOfLines={1}>{desc}</Text>
    </View>
  </TouchableOpacity>
);

const AlertCard = ({ name, batch, days, danger, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.7}
    className={`p-4 rounded-2xl mb-3 border ${danger ? "bg-rose-50 border-rose-100" : "bg-amber-50 border-amber-100"}`}
  >
    <View className="flex-row justify-between items-center">
      <View className="flex-1 mr-2">
        <Text className={`font-bold text-sm ${danger ? "text-rose-900" : "text-amber-900"}`}>{name}</Text>
        <Text className={`text-xs mt-1 ${danger ? "text-rose-600/80" : "text-amber-700/80"}`}>Batch #{batch}</Text>
      </View>
      <View className="items-end">
        <Text className={`font-black text-xs uppercase tracking-wider ${danger ? "text-rose-600" : "text-amber-700"}`}>
          Expires In
        </Text>
        <Text className={`font-bold text-sm mt-0.5 ${danger ? "text-rose-700" : "text-amber-800"}`}>
          {days}
        </Text>
      </View>
    </View>
  </TouchableOpacity>
);

const StockRow = ({ name, category, stock, status }) => (
  <View className="flex-row items-center justify-between py-3 border-b border-slate-50">
    <View className="flex-1 mr-2">
      <Text className="font-bold text-slate-800 text-sm" numberOfLines={1}>{name}</Text>
      <Text className="text-xs text-slate-500 mt-0.5">{category}</Text>
    </View>
    <View className="items-center w-16">
      <Text className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-1">Stock</Text>
      <Text className="font-black text-slate-900">{stock}</Text>
    </View>
    <View className="items-end w-20">
      <View className={`px-2 py-1 rounded-full ${status === 'Critical' ? 'bg-rose-100' : 'bg-amber-100'}`}>
        <Text className={`text-[10px] font-black uppercase tracking-wider ${status === 'Critical' ? 'text-rose-700' : 'text-amber-700'}`}>
          {status}
        </Text>
      </View>
    </View>
  </View>
);

const AnalyticsCard = ({ title, value, percent, iconName, bgClass, isMci = false, onPress, danger = false }) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    className="bg-white rounded-[24px] p-5 mr-4 shadow-sm border border-slate-100 w-44"
  >
    <View className="flex-row justify-between items-start mb-4">
      <View className={`w-12 h-12 rounded-2xl items-center justify-center ${bgClass}`}>
        {isMci ? (
          <MaterialCommunityIcons name={iconName} size={24} color="white" />
        ) : (
          <Ionicons name={iconName} size={24} color="white" />
        )}
      </View>
      <View className={`px-2 py-1 rounded-lg ${danger ? 'bg-rose-100' : 'bg-emerald-100'}`}>
        <Text className={`text-[10px] font-black tracking-wider ${danger ? 'text-rose-700' : 'text-emerald-700'}`}>
          {percent}
        </Text>
      </View>
    </View>
    <Text className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{title}</Text>
    <Text className="text-slate-900 font-black text-2xl mt-1">{value}</Text>
  </TouchableOpacity>
);

export default function PharmacyDashboard({ navigation, route }) {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [suppliersListState, setSuppliersListState] = useState([]);
  const [medicinesListState, setMedicinesListState] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSuppliersCount, setActiveSuppliersCount] = useState(0);

  const fetchDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);

      const fromDate = sevenDaysAgo.toISOString().split('T')[0];
      const toDate = today.toISOString().split('T')[0];

      const safeFetch = async (promise, name) => {
        try {
          const res = await promise;
          return res;
        } catch (e) {
          console.error(`[Dashboard] ${name} API failed:`, e);
          return null;
        }
      };

      const [response, suppliersRes, medicinesRes, salesRes, salesSummaryRes, alertsRes, lowStockRes] = await Promise.all([
        safeFetch(pharmacyApi.getDashboardOverview(), "Overview"),
        safeFetch(pharmacyApi.getSuppliers(), "Suppliers"),
        safeFetch(pharmacyApi.getMedicines(0, 1000), "Medicines"),
        safeFetch(pharmacyApi.getSales("", "Completed", "", "", 0, 5), "Sales"),
        safeFetch(pharmacyApi.getSalesSummary(fromDate, toDate, 'day'), "SalesSummary"),
        safeFetch(pharmacyApi.getAlerts(0, 5, 'EXPIRY', 'PENDING'), "Alerts"),
        safeFetch(pharmacyApi.getStockBatches(undefined, true, null, 0, 1000), "LowStock")
      ]);

      const data = response?.overview || response?.stats || response?.data || response || {};

      const rawLowStock = lowStockRes?.batches || lowStockRes?.items || (Array.isArray(lowStockRes) ? lowStockRes : []) || [];
      const medicineList = medicinesRes?.medicines || medicinesRes?.items || (Array.isArray(medicinesRes) ? medicinesRes : []) || [];
      
      const formattedLowStock = rawLowStock
        .filter(item => (item.qty_on_hand ?? item.quantity ?? 0) <= 10)
        .slice(0, 5)
        .map(item => {
           const medId = item.medicine_id || item.id;
           const masterMed = medicineList.find(m => (m.id || m._id) === medId);
           return {
              name: item.brand_name || item.medicine_name || item.medicine?.brand_name || item.medicine?.name || item.item_name || item.name || masterMed?.name || masterMed?.brand_name || `Medicine (${(medId || '').toString().slice(-6)})`,
              category: item.medicine?.category || item.category || masterMed?.category || 'General',
              stock: item.qty_on_hand ?? item.quantity ?? 0,
              status: (item.qty_on_hand ?? item.quantity) <= 5 ? 'Critical' : 'Low'
           };
        });

      const apiActivity = Array.isArray(data.recent_activity || data.recentActivity) ? (data.recent_activity || data.recentActivity) : [];
      const medicineActivity = (Array.isArray(medicineList) ? medicineList : []).slice(0, 3).map(m => ({
        title: "New Medicine Added",
        desc: `${m?.brand_name || m?.name || 'Unknown medicine'} added`,
        type: "medicine",
        time: "Recently"
      }));
      const salesList = salesRes?.sales || salesRes?.items || (Array.isArray(salesRes) ? salesRes : []) || [];
      const saleActivity = (Array.isArray(salesList) ? salesList : []).slice(0, 3).map(s => ({
        title: "Medicine Sold",
        desc: `Sale #${s?.id?.toString().slice(-6) || 'N/A'} for ₹${s?.total_amount || 0}`,
        type: "sale",
        time: "Recently"
      }));
      const combinedActivity = [...apiActivity, ...medicineActivity, ...saleActivity].slice(0, 8);

      const salesSummary = salesSummaryRes?.summary || (Array.isArray(salesSummaryRes) ? salesSummaryRes : []) || [];
      const chartSalesData = (Array.isArray(salesSummary) ? salesSummary : []).map(item => ({
        day: item?.period || item?.day || item?.date || "N/A",
        sales: Number(item?.total_sales || item?.sales || item?.amount || 0)
      }));

      const rawAlerts = alertsRes?.items || alertsRes?.data || (Array.isArray(alertsRes) ? alertsRes : []) || [];
      const sortedAlerts = [...rawAlerts].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      const formattedAlerts = sortedAlerts.slice(0, 5).map(item => {
        const meta = item.metadata || {};
        const daysLeft = meta.days_left ?? item.days_left ?? item.days_until_expiry ?? 0;
        return {
          name: meta.medicine_name || item.name || item.item_name || 'Unknown',
          batch: meta.batch_number || item.batch_number || item.batch || 'N/A',
          days: `${daysLeft} days`,
          danger: daysLeft <= 15
        };
      });

      const totalLowStock = rawLowStock.filter(item => (item.qty_on_hand ?? item.quantity ?? 0) <= 10).length;

      setDashboardData({
        ...data,
        recent_activity: combinedActivity,
        sales_data: chartSalesData,
        low_stock_count: totalLowStock,
        expiry_alerts: formattedAlerts.length > 0 ? formattedAlerts : (data.expiry_alerts || data.expiryAlerts || []),
        low_stock_list: formattedLowStock.length > 0 ? formattedLowStock : (data.low_stock_list || data.lowStockList || [])
      });

      const suppliersList = suppliersRes?.suppliers || suppliersRes?.items || suppliersRes?.data || (Array.isArray(suppliersRes) ? suppliersRes : []) || [];
      setSuppliersListState(suppliersList);
      setMedicinesListState(medicineList);
      const activeCount = suppliersList.filter(s => s && !s.is_deleted && s.status !== 'Inactive' && s.status !== 'Deleted' && s.status !== 'Archived').length;
      setActiveSuppliersCount(activeCount);

    } catch (err) {
      console.error("[Dashboard] Processing Error:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const dData = dashboardData || {};
  const tMedicines = dData.medicines_count ?? dData.total_medicines_count ?? dData.total_medicines ?? dData.totalMedicines ?? "0";
  const tSales = dData.sales_today_count ?? dData.todays_sales ?? dData.todaysSales ?? "0";
  const lStock = dData.low_stock_count ?? dData.low_stock_items ?? dData.lowStockItems ?? "0";
  const aSuppliers = activeSuppliersCount || "0";

  const rawChartData = dData.sales_data || dData.salesData || [];
  const processedChartData = rawChartData.map(item => ({
    ...item,
    sales: Number(item.sales ?? item.amount ?? item.total ?? item.revenue ?? 0),
    day: item.day ?? item.date ?? item.label ?? "N/A"
  }));

  const displayData = processedChartData.length > 0 ? processedChartData : [
    { day: 'Mon', sales: 0 }, { day: 'Tue', sales: 0 }, { day: 'Wed', sales: 0 },
    { day: 'Thu', sales: 0 }, { day: 'Fri', sales: 0 }, { day: 'Sat', sales: 0 }, { day: 'Sun', sales: 0 },
  ];
  const lsItems = dData.low_stock_list || dData.lowStockList || [];
  const eAlerts = dData.expiry_alerts || dData.expiryAlerts || [];
  const rActivity = dData.recent_activity || dData.recentActivity || [];

  // Chart rendering with axes and grid
  const rawMaxSales = Math.max(...displayData.map(d => d.sales), 1);
  // Calculate a nice round number for max value on Y axis
  const niceMaxSales = rawMaxSales <= 10 ? 10 : Math.ceil(rawMaxSales / 10) * 10;
  const yTicks = [niceMaxSales, niceMaxSales * 0.75, niceMaxSales * 0.5, niceMaxSales * 0.25, 0];

  const chartHeight = 160;
  const paddingTop = 15; // top padding so circles and top grid line don't clip
  const paddingBottom = 15; // bottom padding so circles don't clip
  const drawHeight = chartHeight - paddingTop - paddingBottom;
  const paddingLeft = 35; // Space for Y axis labels
  const chartWidth = SCREEN_WIDTH - 80 - paddingLeft;
  
  const points = displayData.map((d, i) => {
    const x = paddingLeft + (i / Math.max(displayData.length - 1, 1)) * chartWidth;
    const y = paddingTop + drawHeight - (d.sales / niceMaxSales) * drawHeight;
    return `${x},${y}`;
  }).join(' ');
  const polygonPoints = `${paddingLeft},${chartHeight} ${points} ${paddingLeft + chartWidth},${chartHeight}`;

  const calculateTotal = () => orderItems.reduce((total, item) => total + (item.quantity * item.price), 0);
  const handleAddItem = () => {
    setOrderItems([...orderItems, { id: Date.now(), medicine_id: "", name: "", price: 0, quantity: 1 }]);
  };
  const updateQuantity = (id, delta) => {
    setOrderItems(items => items.map(item => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item));
  };
  
  const handleSubmitOrder = async () => {
    if (!selectedSupplier || calculateTotal() === 0) return;
    setIsSubmitting(true);
    try {
      const payload = {
        supplier_id: selectedSupplier,
        expected_date: new Date().toISOString().split('T')[0],
        notes: "Mobile order",
        items: orderItems.map(item => ({
          medicine_id: item.medicine_id,
          ordered_qty: Number(item.quantity),
          purchase_rate: Number(item.price)
        }))
      };
      await pharmacyApi.createPurchaseOrder(payload);
      Alert.alert("Success", "Purchase Order submitted successfully!");
      setIsModalOpen(false);
      setOrderItems([]);
      setSelectedSupplier("");
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to create purchase order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PharmacyLayout navigation={navigation} route={route}>
      <View className="flex-1 bg-[#F8FAFC]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchDashboard(true)} />}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {isLoading && !refreshing && (
            <View className="absolute inset-0 bg-white/50 z-10 items-center justify-center pt-20">
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          )}

          {/* Header */}
          <View className="px-6 pt-6 pb-2">
            <Text className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</Text>
            <Text className="text-slate-500 font-medium mt-1">Overview of your pharmacy management</Text>
          </View>

          {/* Quick Stats Horizontal Scroll */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 16 }}>
            <AnalyticsCard
              title="Total Medicines"
              value={tMedicines}
              percent="+12%"
              iconName="pill"
              isMci
              bgClass="bg-indigo-600"
              onPress={() => navigation.navigate("PharmacyMedicineDatabase")}
            />
            <AnalyticsCard
              title="Today's Sales"
              value={tSales}
              percent="+8%"
              iconName="currency-inr"
              isMci
              bgClass="bg-emerald-600"
              onPress={() => navigation.navigate("PharmacySalesTracking")}
            />
            <AnalyticsCard
              title="Low Stock Items"
              value={lStock}
              percent="-5%"
              danger
              iconName="warning-outline"
              bgClass="bg-amber-500"
              onPress={() => navigation.navigate("PharmacyInventory")}
            />
            <AnalyticsCard
              title="Active Suppliers"
              value={aSuppliers}
              percent="+25%"
              iconName="truck-outline"
              isMci
              bgClass="bg-purple-600"
              onPress={() => navigation.navigate("PharmacySupplierManagement")}
            />
          </ScrollView>

          <View className="px-6 space-y-6">
            
            {/* Sales Chart */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="font-bold text-lg text-slate-800">Sales Overview</Text>
                <View className="bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                  <Text className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last 7 Days</Text>
                </View>
              </View>
              <View className="relative">
                <Svg width={SCREEN_WIDTH - 80} height={chartHeight}>
                  <Defs>
                    <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                      <Stop offset="0" stopColor="#4f46e5" stopOpacity="0.2" />
                      <Stop offset="1" stopColor="#4f46e5" stopOpacity="0" />
                    </LinearGradient>
                  </Defs>
                  
                  {/* Grid Lines and Y-Axis Labels */}
                  {yTicks.map((tick, i) => {
                    const y = paddingTop + drawHeight - (tick / niceMaxSales) * drawHeight;
                    return (
                      <React.Fragment key={i}>
                        <SvgText x={paddingLeft - 8} y={y + 4} fill="#94a3b8" fontSize="10" fontWeight="bold" textAnchor="end">
                          {tick >= 1000 ? `${(tick/1000).toFixed(1)}k` : Math.round(tick)}
                        </SvgText>
                        <Polyline points={`${paddingLeft},${y} ${paddingLeft + chartWidth},${y}`} stroke="#f1f5f9" strokeWidth="1" />
                      </React.Fragment>
                    )
                  })}

                  <Polyline points={polygonPoints} fill="url(#grad)" />
                  <Polyline points={points} fill="none" stroke="#4f46e5" strokeWidth="3" />
                  
                  {/* Data Points */}
                  {displayData.map((d, i) => {
                    const x = paddingLeft + (i / Math.max(displayData.length - 1, 1)) * chartWidth;
                    const y = paddingTop + drawHeight - (d.sales / niceMaxSales) * drawHeight;
                    return (
                       <SvgCircle key={`dot-${i}`} cx={x} cy={y} r={4} fill="#ffffff" stroke="#4f46e5" strokeWidth="2" />
                    );
                  })}
                </Svg>
                
                {/* X-Axis Labels */}
                <View className="flex-row justify-between mt-2" style={{ paddingLeft: paddingLeft }}>
                  {displayData.map((d, idx) => (
                    <Text 
                      key={idx} 
                      className="text-[10px] font-bold text-slate-400 uppercase text-center" 
                      style={{ 
                        width: chartWidth / Math.max(displayData.length - 1, 1), 
                        marginLeft: idx === 0 ? 0 : -(chartWidth / Math.max(displayData.length - 1, 1))/2 
                      }}
                    >
                      {d.day.substring(0,3)}
                    </Text>
                  ))}
                </View>
              </View>
            </View>

            {/* Low Stock Items */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-lg text-slate-800">Low Stock</Text>
                <TouchableOpacity onPress={() => navigation.navigate("PharmacyInventory")}>
                  <Text className="text-indigo-600 font-bold text-xs">View all</Text>
                </TouchableOpacity>
              </View>
              {lsItems.length > 0 ? (
                lsItems.map((item, index) => (
                  <StockRow key={index} name={item.name} category={item.category} stock={item.stock} status={item.status} />
                ))
              ) : (
                <Text className="text-slate-400 italic text-sm py-4 text-center">No low stock items</Text>
              )}
            </View>

            {/* Expiry Alerts & Purchase Order */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-bold text-lg text-slate-800">Alerts & Orders</Text>
                <TouchableOpacity onPress={() => navigation.navigate("PharmacyPurchaseOrders")}>
                  <Text className="text-indigo-600 font-bold text-xs">View all</Text>
                </TouchableOpacity>
              </View>

              {eAlerts.length > 0 ? (
                eAlerts.map((alert, index) => (
                  <AlertCard key={index} name={alert.name} batch={alert.batch} days={alert.days} danger={alert.danger} onPress={() => Alert.alert('Expiry Alert', `${alert.name} expires in ${alert.days}`)} />
                ))
              ) : (
                <Text className="text-slate-400 italic text-sm py-2 text-center mb-4">No recent alerts</Text>
              )}

              <TouchableOpacity
                onPress={() => setIsModalOpen(true)}
                className="bg-indigo-600 py-3.5 rounded-2xl flex-row justify-center items-center mt-2 shadow-sm"
              >
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-bold ml-2">New Purchase Order</Text>
              </TouchableOpacity>
            </View>

            {/* Recent Activity */}
            <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <Text className="font-bold text-lg text-slate-800 mb-4">Recent Activity</Text>
              {rActivity.length > 0 ? (
                rActivity.map((act, i) => {
                  let iconName = 'checkmark-circle-outline';
                  let isMci = false;
                  let bgClass = "bg-blue-100";
                  let iconColor = "#2563eb";

                  const title = (act.title || "").toLowerCase();
                  if (title.includes("medicine") || title.includes("pill") || title.includes("drug")) {
                    iconName = 'pill'; isMci = true; bgClass = "bg-indigo-100"; iconColor = "#4f46e5";
                  } else if (title.includes("sale") || title.includes("sold") || title.includes("order")) {
                    iconName = 'cart-outline'; isMci = false; bgClass = "bg-emerald-100"; iconColor = "#059669";
                  } else if (title.includes("stock") || title.includes("inventory") || title.includes("batch")) {
                    iconName = 'cube-outline'; isMci = false; bgClass = "bg-amber-100"; iconColor = "#d97706";
                  } else if (title.includes("supplier") || title.includes("truck") || title.includes("delivery")) {
                    iconName = 'truck-outline'; isMci = true; bgClass = "bg-purple-100"; iconColor = "#9333ea";
                  }

                  return (
                    <ActivityItem
                      key={i}
                      title={act.title}
                      desc={act.desc}
                      iconName={iconName}
                      isMci={isMci}
                      bgClass={bgClass}
                      iconColor={iconColor}
                      time={act.time}
                    />
                  );
                })
              ) : (
                <Text className="text-slate-400 italic text-sm py-4 text-center">No recent activity</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* New Purchase Order Modal */}
        <Modal visible={isModalOpen} animationType="slide" transparent={true}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl h-[85%] overflow-hidden">
              <View className="p-5 border-b border-slate-100 flex-row justify-between items-center bg-white z-10">
                <Text className="text-xl font-bold text-slate-800">New Purchase Order</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)} className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center">
                  <Ionicons name="close" size={20} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <ScrollView className="p-5" contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Supplier Picker UI Mock (Since RN doesn't have native select) */}
                <Text className="font-bold text-slate-700 text-sm mb-2">Supplier</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row">
                  {suppliersListState.map(s => (
                    <TouchableOpacity
                      key={s.id}
                      onPress={() => setSelectedSupplier(s.id)}
                      className={`px-4 py-2 rounded-xl mr-2 border ${selectedSupplier === s.id ? 'bg-indigo-50 border-indigo-600' : 'bg-white border-slate-200'}`}
                    >
                      <Text className={`font-bold ${selectedSupplier === s.id ? 'text-indigo-700' : 'text-slate-600'}`}>{s.name || s.supplier_name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View className="flex-row justify-between items-center mb-4">
                  <Text className="font-bold text-slate-800 text-lg">Order Items</Text>
                  <TouchableOpacity onPress={handleAddItem} className="flex-row items-center bg-indigo-50 px-3 py-1.5 rounded-lg">
                    <Ionicons name="add" size={16} color="#4f46e5" />
                    <Text className="text-indigo-600 font-bold text-xs ml-1">Add</Text>
                  </TouchableOpacity>
                </View>

                {orderItems.map((item, idx) => (
                  <View key={item.id} className="bg-slate-50 p-4 rounded-2xl mb-3 border border-slate-100">
                    <View className="flex-row justify-between items-center mb-3">
                      <Text className="font-bold text-slate-500 text-xs uppercase tracking-widest">Item {idx + 1}</Text>
                      <TouchableOpacity onPress={() => setOrderItems(items => items.filter(i => i.id !== item.id))}>
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                    
                    {/* Basic Item Input mapped to medicines list */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                      {medicinesListState.slice(0, 10).map(m => ( // Showing top 10 for simplicity in modal
                         <TouchableOpacity
                         key={m.id}
                         onPress={() => {
                           setOrderItems(items => items.map(i => i.id === item.id ? { ...i, medicine_id: m.id, name: m.name || m.brand_name, price: m.unit_price || m.price || 0 } : i));
                         }}
                         className={`px-3 py-1.5 rounded-lg mr-2 border ${item.medicine_id === m.id ? 'bg-emerald-50 border-emerald-500' : 'bg-white border-slate-200'}`}
                       >
                         <Text className={`text-xs font-bold ${item.medicine_id === m.id ? 'text-emerald-700' : 'text-slate-600'}`}>{m.name || m.brand_name}</Text>
                       </TouchableOpacity>
                      ))}
                    </ScrollView>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-3">
                        <Text className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Price (₹)</Text>
                        <TextInput
                          value={String(item.price)}
                          onChangeText={(val) => setOrderItems(items => items.map(i => i.id === item.id ? { ...i, price: Number(val) || 0 } : i))}
                          keyboardType="numeric"
                          className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-slate-800 font-bold"
                        />
                      </View>
                      <View className="items-center">
                        <Text className="text-[10px] text-slate-400 font-black uppercase mb-1 tracking-widest">Quantity</Text>
                        <View className="flex-row items-center bg-white border border-slate-200 rounded-xl overflow-hidden">
                          <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} className="px-3 py-2 bg-slate-50"><Text className="font-black text-slate-600">-</Text></TouchableOpacity>
                          <Text className="px-3 font-bold text-slate-800">{item.quantity}</Text>
                          <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} className="px-3 py-2 bg-slate-50"><Text className="font-black text-slate-600">+</Text></TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </View>
                ))}

                <View className="bg-indigo-50 p-4 rounded-2xl flex-row justify-between items-center mb-6 border border-indigo-100">
                  <Text className="font-bold text-indigo-900">Total Amount</Text>
                  <Text className="text-xl font-black text-indigo-600">₹{calculateTotal()}</Text>
                </View>

                <TouchableOpacity
                  onPress={handleSubmitOrder}
                  disabled={!selectedSupplier || calculateTotal() === 0 || isSubmitting}
                  className={`py-4 rounded-2xl items-center flex-row justify-center shadow-sm ${!selectedSupplier || calculateTotal() === 0 || isSubmitting ? 'bg-slate-300' : 'bg-indigo-600'}`}
                >
                  {isSubmitting ? <ActivityIndicator color="white" className="mr-2" /> : null}
                  <Text className="text-white font-bold text-base">Submit Order</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </PharmacyLayout>
  );
}
