import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  RefreshControl,
  Platform
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- COMPONENTS ---

const AnalyticsStat = ({ title, value, percent, icon, iconBg, color = "#4f46e5" }) => (
  <View className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm mr-4" style={{ width: SCREEN_WIDTH * 0.7 }}>
    <View className="flex-row justify-between items-start">
      <View className={`${iconBg} w-12 h-12 rounded-2xl items-center justify-center shadow-sm`}>
        <MaterialCommunityIcons name={icon} size={24} color="white" />
      </View>
      <View className="bg-emerald-100 px-2 py-1 rounded-lg">
        <Text className="text-emerald-700 text-[10px] font-black">{percent}</Text>
      </View>
    </View>
    <View className="mt-4">
      <Text className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{title}</Text>
      <Text className="text-2xl font-black text-slate-900 mt-1">{value}</Text>
    </View>
  </View>
);

const TransactionItem = ({ item, onViewReceipt, onComplete }) => {
  const isCompleted = item.status === 'COMPLETED';
  const isVoided = item.status === 'VOIDED';

  return (
    <View className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-indigo-600 font-black text-xs uppercase">
            {item.sale_number || `#${(item.id || '').slice(0, 8)}`}
          </Text>
          <Text className="text-slate-900 font-bold text-sm mt-1">
            {item.patient_ref || "OTC Customer"}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-slate-900 font-black text-base">
            ₹{Number(item.grand_total || 0).toLocaleString()}
          </Text>
          <View className={`px-2 py-0.5 rounded-lg mt-1 ${isCompleted ? 'bg-emerald-50' : isVoided ? 'bg-rose-50' : 'bg-amber-50'}`}>
            <Text className={`text-[9px] font-black uppercase ${isCompleted ? 'text-emerald-600' : isVoided ? 'text-rose-600' : 'text-amber-600'}`}>
              {item.status}
            </Text>
          </View>
        </View>
      </View>

      <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
        <View className="flex-row items-center">
          <Ionicons name="time-outline" size={14} color="#94a3b8" />
          <Text className="text-slate-400 text-[10px] font-bold ml-1">
            {new Date(item.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </Text>
        </View>
        <View className="flex-row gap-2">
          {item.status === 'DRAFT' && (
            <TouchableOpacity
              onPress={() => onComplete(item.id)}
              className="w-8 h-8 rounded-xl bg-emerald-50 items-center justify-center"
            >
              <Ionicons name="checkmark" size={18} color="#10b981" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => onViewReceipt(item.id)}
            className="w-8 h-8 rounded-xl bg-indigo-50 items-center justify-center"
          >
            <Ionicons name="receipt-outline" size={18} color="#4f46e5" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = "default", icon }) => (
  <View className="mb-4">
    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2 ml-1">{label}</Text>
    <View className="bg-slate-50 border border-slate-200 rounded-2xl flex-row items-center px-4 py-3">
      {icon && <Ionicons name={icon} size={18} color="#94a3b8" className="mr-3" />}
      <TextInput
        className="flex-1 text-slate-900 font-bold text-sm ml-2"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#94a3b8"
      />
    </View>
  </View>
);

const ChartBar = ({ label, value, maxValue, color }) => {
  const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <View className="items-center justify-end h-32 w-8 mx-1">
      <View
        className="w-full rounded-t-lg"
        style={{ height: `${height}%`, backgroundColor: color }}
      />
      <Text className="text-slate-400 text-[8px] font-bold mt-2" numberOfLines={1}>{label}</Text>
    </View>
  );
};

// --- MAIN SCREEN ---

export default function PharmacySalesTracking({ navigation, route }) {
  const [sales, setSales] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);

  // Modals
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [medSearch, setMedSearch] = useState("");

  // New Sale State
  const [newSale, setNewSale] = useState({
    sale_type: "OTC",
    patient_ref: "",
    prescription_id: "",
    billed_via: "PHARMACY_COUNTER",
    payment_method: "CASH",
    notes: "",
    items: [{ medicine_id: "", qty: "1", unit_price: 0, discount: "0" }],
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const [salesData, medsData, statsData] = await Promise.all([
        pharmacyApi.getSales(),
        pharmacyApi.getMedicines(0, 1000),
        pharmacyApi.getDashboardOverview()
      ]);

      setSales(salesData.sales || salesData.items || (Array.isArray(salesData) ? salesData : []));

      const rawMeds = medsData.medicines || medsData.items || (Array.isArray(medsData) ? medsData : []);
      setMedicines(rawMeds.map(m => ({
        id: m.id || m._id,
        name: m.brand_name || m.name,
        price: m.sale_price || 0,
        stock: m.stock_level ?? m.qty_on_hand ?? m.quantity ?? 0
      })));

      setDashboardData(statsData);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Failed to fetch sales data");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatError = (message) => {
    if (!message || typeof message !== "string") return message;
    const stockErrorMatch = message.match(/Insufficient stock for medicine ([\w-]+)/i);
    if (stockErrorMatch) {
      const medId = stockErrorMatch[1];
      const med = medicines.find(m => m.id === medId);
      return `Insufficient stock for ${med ? med.name : `Medicine (${medId.slice(0, 8)})`}. Please check inventory.`;
    }
    return message;
  };

  const handleCreateSale = async () => {
    if (newSale.items.some(it => !it.medicine_id)) {
      Alert.alert("Validation", "Please select a medicine for all items");
      return;
    }

    setIsActionLoading(true);
    try {
      const payload = {
        ...newSale,
        idempotency_key: `sale_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        items: newSale.items.map(it => ({
          medicine_id: it.medicine_id,
          qty: parseInt(it.qty),
          unit_price: it.unit_price,
          discount: parseFloat(it.discount || 0)
        }))
      };

      const response = await pharmacyApi.createSale(payload);
      const saleId = response?.id || response?._id || response?.sale_id || response?.sale?.id;

      if (saleId) {
        await pharmacyApi.completeSale(saleId);
      }

      Alert.alert("Success", "Sale completed successfully");
      setIsNewSaleModalOpen(false);
      fetchData();
    } catch (error) {
      Alert.alert("Error", formatError(error.message) || "Failed to complete sale");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewReceipt = async (id) => {
    setIsActionLoading(true);
    try {
      const data = await pharmacyApi.getSaleReceipt(id);
      setSelectedReceipt(data.receipt || data);
      setIsReceiptModalOpen(true);
    } catch (error) {
      // Fallback
      try {
        const data = await pharmacyApi.getSale(id);
        setSelectedReceipt(data.sale || data);
        setIsReceiptModalOpen(true);
      } catch (err) {
        Alert.alert("Error", "Failed to load receipt");
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleCompleteSaleAction = async (id) => {
    try {
      await pharmacyApi.completeSale(id);
      Alert.alert("Success", "Sale marked as completed");
      fetchData();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to complete sale");
    }
  };

  const addItem = () => {
    setNewSale(prev => ({
      ...prev,
      items: [...prev.items, { medicine_id: "", qty: "1", unit_price: 0, discount: "0" }]
    }));
  };

  const removeItem = (idx) => {
    const items = [...newSale.items];
    items.splice(idx, 1);
    setNewSale(prev => ({ ...prev, items }));
  };

  const updateItem = (idx, field, value) => {
    const items = [...newSale.items];
    if (field === 'medicine_id') {
      const med = medicines.find(m => m.id === value);
      items[idx].unit_price = med ? med.price : 0;
    }

    if (field === 'qty') {
      const med = medicines.find(m => m.id === items[idx].medicine_id);
      if (med && parseInt(value) > med.stock) {
        Alert.alert("Stock Warning", `Only ${med.stock} units available for ${med.name}`);
      }
    }

    items[idx][field] = value;
    setNewSale(prev => ({ ...prev, items }));
  };

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    let todaySales = 0;
    let weekSales = 0;
    let count = 0;

    sales.forEach(s => {
      if (s.status !== 'COMPLETED') return;
      const amt = Number(s.grand_total || 0);
      count++;
      if (s.created_at && s.created_at.startsWith(todayStr)) todaySales += amt;
      // Simple week check (last 7 days)
      const date = new Date(s.created_at);
      if (new Date() - date < 7 * 24 * 60 * 60 * 1000) weekSales += amt;
    });

    return {
      today: `₹${todaySales.toLocaleString()}`,
      week: `₹${weekSales.toLocaleString()}`,
      total: count.toString(),
      avg: `₹${count > 0 ? Math.round((todaySales + weekSales) / 2 / count).toLocaleString() : 0}`
    };
  }, [sales]);

  const chartData = useMemo(() => {
    const trend = {};
    const catMap = {};

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
      trend[key] = { label, amount: 0 };
    }

    sales.forEach(s => {
      if (s.status !== 'COMPLETED') return;

      const key = (s.created_at || '').split('T')[0];
      const amt = Number(s.grand_total || 0);
      if (trend[key]) trend[key].amount += amt;

      // Category tracking (Deep dive into items for specific categories)
      const saleItems = s.items || s.sale_items || s.items_sold || [];
      if (Array.isArray(saleItems) && saleItems.length > 0) {
        saleItems.forEach(item => {
          const cat = item.medicine?.category || item.category || item.medicine_category || s.sale_type || 'General';
          const itemAmt = Number(item.qty || item.quantity || 1) * Number(item.unit_price || 0);
          if (!catMap[cat]) catMap[cat] = { name: cat, amount: 0, count: 0 };
          catMap[cat].amount += itemAmt;
          catMap[cat].count += 1;
        });
      } else {
        const cat = s.sale_type || 'OTC';
        if (!catMap[cat]) catMap[cat] = { name: cat, amount: 0, count: 0 };
        catMap[cat].amount += amt;
        catMap[cat].count += 1;
      }
    });

    const values = Object.values(trend);
    const max = Math.max(...values.map(v => v.amount), 1);

    const categories = Object.values(catMap)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    const maxCat = Math.max(...categories.map(c => c.amount), 1);

    return { values, max, categories, maxCat };
  }, [sales]);

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />}
        >
          {/* Header */}
          <View className="p-6 flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-black text-slate-900 tracking-tight">Sales</Text>
              <Text className="text-slate-500 font-medium mt-1">Dispensing & Revenue</Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => setIsNewSaleModalOpen(true)}
                className="bg-indigo-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
              >
                <Ionicons name="add" size={30} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => Alert.alert("Export", "Exporting sales report...")}
                className="bg-white w-12 h-12 rounded-2xl items-center justify-center border border-slate-200 shadow-sm"
              >
                <Ionicons name="download-outline" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats Cards */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="pl-6 mb-8"
            contentContainerStyle={{ paddingRight: 24 }}
          >
            <AnalyticsStat
              title="Today's Sales"
              value={stats.today}
              percent="+8%"
              icon="cash-multiple"
              iconBg="bg-emerald-500"
            />
            <AnalyticsStat
              title="This Week"
              value={stats.week}
              percent="+12%"
              icon="trending-up"
              iconBg="bg-indigo-500"
            />
            <AnalyticsStat
              title="Transactions"
              value={stats.total}
              percent="+15%"
              icon="cart-outline"
              iconBg="bg-purple-500"
            />
            <AnalyticsStat
              title="Avg. Transaction"
              value={stats.avg}
              percent="+5%"
              icon="wallet-outline"
              iconBg="bg-amber-500"
            />
          </ScrollView>

          {/* Charts Row */}
          <View className="px-6 mb-6">
            <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <Text className="text-slate-800 font-black text-sm mb-6">Revenue Trend (7 Days)</Text>
              <View className="flex-row justify-between items-end h-40">
                {chartData.values.map((v, i) => (
                  <ChartBar key={i} label={v.label} value={v.amount} maxValue={chartData.max} color="#4f46e5" />
                ))}
              </View>
            </View>
          </View>

          {/* Top Categories */}
          <View className="px-6 mb-8">
            <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
              <Text className="text-slate-800 font-black text-sm mb-4">Top Categories</Text>
              {chartData.categories.length === 0 ? (
                <Text className="text-slate-400 font-bold text-center py-4">No data available</Text>
              ) : (
                chartData.categories.map((cat, i) => (
                  <View key={i} className="mb-4">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-slate-600 font-bold text-xs">{cat.name}</Text>
                      <Text className="text-slate-900 font-black text-xs">₹{cat.amount.toLocaleString()}</Text>
                    </View>
                    <View className="h-2 bg-slate-50 rounded-full overflow-hidden">
                      <View
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${(cat.amount / chartData.maxCat) * 100}%` }}
                      />
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>

          {/* Transactions List */}
          <View className="px-6 mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-black text-slate-900">Recent Transactions</Text>
              <TouchableOpacity className="bg-slate-100 px-3 py-1.5 rounded-xl">
                <Text className="text-slate-600 font-bold text-[10px] uppercase">View All</Text>
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <ActivityIndicator size="large" color="#4f46e5" className="py-10" />
            ) : sales.length === 0 ? (
              <View className="py-10 items-center">
                <Ionicons name="receipt-outline" size={48} color="#cbd5e1" />
                <Text className="text-slate-400 font-bold mt-2">No transactions found</Text>
              </View>
            ) : (
              sales.slice(0, 10).map((item) => (
                <TransactionItem
                  key={item.id}
                  item={item}
                  onViewReceipt={handleViewReceipt}
                  onComplete={handleCompleteSaleAction}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* New Sale Modal */}
        <Modal
          visible={isNewSaleModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsNewSaleModalOpen(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-6 h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">New Dispense</Text>
                <TouchableOpacity onPress={() => setIsNewSaleModalOpen(false)}>
                  <Ionicons name="close-circle" size={28} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">Sale Type</Text>
                    <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-4">
                      {['OTC', 'PRESCRIPTION'].map(t => (
                        <TouchableOpacity
                          key={t}
                          onPress={() => setNewSale({ ...newSale, sale_type: t })}
                          className={`flex-1 py-2 items-center rounded-xl ${newSale.sale_type === t ? 'bg-white shadow-sm' : ''}`}
                        >
                          <Text className={`text-[10px] font-black uppercase ${newSale.sale_type === t ? 'text-indigo-600' : 'text-slate-400'}`}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                <FormInput
                  label="Patient Ref"
                  value={newSale.patient_ref}
                  onChangeText={t => setNewSale({ ...newSale, patient_ref: t })}
                  placeholder="PAT-1001"
                  icon="person-outline"
                />

                <FormInput
                  label="Prescription ID"
                  value={newSale.prescription_id}
                  onChangeText={t => setNewSale({ ...newSale, prescription_id: t })}
                  placeholder="RX-2001 (Optional)"
                  icon="document-text-outline"
                />

                <View className="mb-6">
                  <View className="flex-row justify-between items-center mb-3">
                    <Text className="text-slate-800 font-black text-sm">Cart Items</Text>
                    <TouchableOpacity onPress={addItem} className="bg-indigo-50 px-3 py-1.5 rounded-xl flex-row items-center">
                      <Ionicons name="add" size={14} color="#4f46e5" />
                      <Text className="text-indigo-600 font-bold text-[10px] uppercase ml-1">Add</Text>
                    </TouchableOpacity>
                  </View>

                  <View className="bg-slate-100 rounded-2xl px-3 py-2 flex-row items-center mb-4">
                    <Ionicons name="search" size={16} color="#94a3b8" />
                    <TextInput
                      className="flex-1 ml-2 text-xs font-bold text-slate-700"
                      placeholder="Filter medicines list..."
                      value={medSearch}
                      onChangeText={setMedSearch}
                    />
                    {medSearch !== "" && (
                      <TouchableOpacity onPress={() => setMedSearch("")}>
                        <Ionicons name="close-circle" size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    )}
                  </View>

                  {newSale.items.map((item, idx) => (
                    <View key={idx} className="bg-slate-50 p-4 rounded-3xl mb-3 border border-slate-100">
                      <View className="flex-row gap-2 mb-3">
                        <View className="flex-1">
                          <Text className="text-slate-400 text-[9px] font-bold uppercase mb-1">Medicine</Text>
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                            {medicines.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase())).slice(0, 10).map(m => (
                              <TouchableOpacity
                                key={m.id}
                                onPress={() => updateItem(idx, 'medicine_id', m.id)}
                                style={{ backgroundColor: item.medicine_id === m.id ? "#4f46e5" : "white" }}
                                className="px-3 py-1.5 rounded-xl mr-2 border border-slate-200 shadow-sm"
                              >
                                <Text style={{ color: item.medicine_id === m.id ? "white" : "#64748b" }} className="text-[9px] font-bold">
                                  {m.name} {m.stock <= 5 ? `(Low: ${m.stock})` : `(₹${m.price})`}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        </View>
                        <TouchableOpacity onPress={() => removeItem(idx)} className="mt-6">
                          <Ionicons name="trash-outline" size={20} color="#ef4444" />
                        </TouchableOpacity>
                      </View>

                      <View className="flex-row gap-4">
                        <View className="flex-1">
                          <Text className="text-slate-400 text-[9px] font-bold uppercase mb-1">Qty</Text>
                          <TextInput
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                            value={item.qty}
                            onChangeText={t => updateItem(idx, 'qty', t)}
                            keyboardType="numeric"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-slate-400 text-[9px] font-bold uppercase mb-1">Price</Text>
                          <Text className="text-slate-900 font-black text-sm pt-2">₹{(item.unit_price * (parseInt(item.qty) || 0)).toLocaleString()}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <View className="mb-4">
                  <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">Payment Method</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {['CASH', 'UPI', 'CARD', 'CREDIT'].map(m => (
                      <TouchableOpacity
                        key={m}
                        onPress={() => setNewSale({ ...newSale, payment_method: m })}
                        className={`px-4 py-2 rounded-xl border ${newSale.payment_method === m ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-100'}`}
                      >
                        <Text className={`text-[10px] font-bold ${newSale.payment_method === m ? 'text-white' : 'text-slate-600'}`}>{m}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <FormInput
                  label="Internal Notes"
                  value={newSale.notes}
                  onChangeText={t => setNewSale({ ...newSale, notes: t })}
                  placeholder="Notes..."
                  multiline
                />

                <TouchableOpacity
                  onPress={handleCreateSale}
                  disabled={isActionLoading}
                  className="bg-indigo-600 rounded-[24px] py-4 items-center shadow-lg shadow-indigo-100 mt-4 mb-10"
                >
                  <Text className="text-white font-black uppercase tracking-widest text-xs">
                    {isActionLoading ? "Processing..." : "Complete Sale & Print"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Receipt Modal */}
        <Modal
          visible={isReceiptModalOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsReceiptModalOpen(false)}
        >
          <View className="flex-1 bg-black/60 justify-center p-6">
            <View className="bg-white rounded-[40px] p-6 max-h-[80%] overflow-hidden">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">Receipt</Text>
                <TouchableOpacity onPress={() => setIsReceiptModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {selectedReceipt && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="items-center mb-6 border-b border-slate-100 pb-6">
                    <Text className="text-lg font-black text-slate-900">HOSPITAL PHARMACY</Text>
                    <Text className="text-slate-400 text-xs mt-1">{selectedReceipt.sale_number}</Text>
                    <Text className="text-slate-500 font-bold text-[10px] mt-2 uppercase tracking-widest">
                      {new Date(selectedReceipt.created_at).toLocaleString()}
                    </Text>
                  </View>

                  <View className="mb-6">
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-slate-400 font-bold text-[10px] uppercase">Patient</Text>
                      <Text className="text-slate-800 font-bold text-xs">{selectedReceipt.patient_ref || 'OTC Customer'}</Text>
                    </View>
                    <View className="flex-row justify-between mb-2">
                      <Text className="text-slate-400 font-bold text-[10px] uppercase">Method</Text>
                      <Text className="text-slate-800 font-bold text-xs">{selectedReceipt.payment_method}</Text>
                    </View>
                  </View>

                  <View className="mb-6">
                    {(selectedReceipt.items || selectedReceipt.sale_items || []).map((it, idx) => (
                      <View key={idx} className="flex-row justify-between py-2 border-b border-slate-50">
                        <View className="flex-1">
                          <Text className="text-slate-800 font-bold text-xs">{it.medicine?.name || it.medicine_name || 'Item'}</Text>
                          <Text className="text-slate-400 text-[10px]">{it.qty} x ₹{it.unit_price}</Text>
                        </View>
                        <Text className="text-slate-900 font-black text-xs">₹{(it.qty * it.unit_price).toLocaleString()}</Text>
                      </View>
                    ))}
                  </View>

                  <View className="items-end pt-4 border-t-2 border-slate-100 border-dashed">
                    <Text className="text-slate-400 text-[10px] font-bold uppercase mb-1">Total Amount</Text>
                    <Text className="text-3xl font-black text-indigo-600">₹{Number(selectedReceipt.grand_total || 0).toLocaleString()}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert("Print", "Connecting to pharmacy printer...");
                      setIsReceiptModalOpen(false);
                    }}
                    className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-100 mt-8 mb-4"
                  >
                    <View className="flex-row items-center">
                      <Ionicons name="print-outline" size={18} color="white" className="mr-2" />
                      <Text className="text-white font-black uppercase tracking-widest text-xs ml-2">Print Receipt</Text>
                    </View>
                  </TouchableOpacity>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </PharmacyLayout>
  );
}
