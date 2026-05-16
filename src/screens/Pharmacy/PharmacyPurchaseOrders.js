import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Dimensions,
  RefreshControl
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const PO_STATUSES = [
  { value: "DRAFT", label: "Draft", color: "bg-slate-100", textColor: "text-slate-700", borderColor: "border-slate-200" },
  { value: "PENDING", label: "Submitted", color: "bg-amber-100", textColor: "text-amber-700", borderColor: "border-amber-200" },
  { value: "SUBMITTED", label: "Submitted", color: "bg-amber-100", textColor: "text-amber-700", borderColor: "border-amber-200" },
  { value: "APPROVED", label: "Approved", color: "bg-emerald-100", textColor: "text-emerald-700", borderColor: "border-emerald-200" },
  { value: "SENT", label: "Sent", color: "bg-blue-100", textColor: "text-blue-700", borderColor: "border-blue-200" },
  { value: "RECEIVED", label: "Received", color: "bg-purple-100", textColor: "text-purple-700", borderColor: "border-purple-200" },
  { value: "CANCELLED", label: "Cancelled", color: "bg-rose-100", textColor: "text-rose-700", borderColor: "border-rose-200" }
];

const getStatusDisplay = (status) => {
  return PO_STATUSES.find(s => s.value === status) || { label: status || "UNKNOWN", color: "bg-gray-100", textColor: "text-gray-700", borderColor: "border-gray-200" };
};

const StatusBadge = ({ status }) => {
  const s = getStatusDisplay(status);
  return (
    <View className={`px-2.5 py-1 rounded-full border ${s.color} ${s.borderColor}`}>
      <Text className={`${s.textColor} text-[9px] font-black uppercase`}>{s.label}</Text>
    </View>
  );
};

const AnalyticsStat = ({ title, value, percent, icon, iconBg, gradient }) => (
  <View
    className="bg-white p-5 rounded-[24px] border border-slate-100 shadow-sm mb-4"
    style={{ width: (SCREEN_WIDTH - 60) / 2 }}
  >
    <View className="flex-row justify-between items-start">
      <View>
        <View className={`${iconBg} w-10 h-10 rounded-2xl items-center justify-center mb-3 shadow-sm`}>
          <Ionicons name={icon} size={20} color="white" />
        </View>
        <Text className="text-slate-400 text-[9px] font-bold uppercase tracking-widest">{title}</Text>
        <Text className="text-xl font-black text-slate-900 mt-1" numberOfLines={1}>{value}</Text>
      </View>
      <View className="bg-emerald-50 px-2 py-1 rounded-lg">
        <Text className="text-[10px] font-bold text-emerald-600">{percent}</Text>
      </View>
    </View>
  </View>
);

const PurchaseOrderItem = ({ item, onView, onEdit, onDelete, getSupplierName }) => {
  const status = getStatusDisplay(item.status);
  return (
    <View className="bg-white p-5 rounded-[24px] mb-4 border border-slate-100 shadow-sm">
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1">
          <Text className="text-indigo-600 font-black text-xs uppercase font-mono tracking-tighter">
            {item.po_number || `#${(item.id || item._id || '').slice(-6).toUpperCase()}`}
          </Text>
          <Text className="text-slate-800 font-black text-base mt-1" numberOfLines={1}>
            {item.supplier_name || getSupplierName(item.supplier_id) || "Unknown Supplier"}
          </Text>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Expected Date</Text>
          <Text className="text-slate-600 font-bold text-[10px] mt-0.5">
            {(item.expected_delivery_date || item.expected_date)
              ? new Date(item.expected_delivery_date || item.expected_date).toLocaleDateString()
              : 'N/A'}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Amount</Text>
          <Text className="text-slate-800 font-black text-sm">
            ₹{Number(item.total_amount || 0).toLocaleString()}
          </Text>
        </View>
      </View>

      <View className="flex-row justify-end items-center gap-2 pt-4 mt-4 border-t border-slate-50">
        <TouchableOpacity
          onPress={() => onView(item.id || item._id)}
          className="p-2 bg-indigo-50 rounded-lg flex-row items-center gap-1"
        >
          <Ionicons name="eye-outline" size={16} color="#6366f1" />
        </TouchableOpacity>
        {item.status === 'DRAFT' && (
          <>
            <TouchableOpacity
              onPress={() => onEdit(item)}
              className="p-2 bg-emerald-50 rounded-lg"
            >
              <Ionicons name="pencil-outline" size={16} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(item.id || item._id)}
              className="p-2 bg-rose-50 rounded-lg"
            >
              <Ionicons name="trash-outline" size={16} color="#f43f5e" />
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
};

export default function PharmacyPurchaseOrders({ navigation, route }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false); // Used for Create/Edit
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [mode, setMode] = useState("create"); // 'create' | 'edit'
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Data
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);

  // Form
  const [formData, setFormData] = useState({
    supplier_id: "",
    expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: "",
    items: [{ medicine_id: "", ordered_qty: "1", purchase_rate: "0" }]
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      const [ordersData, supData, medData] = await Promise.all([
        pharmacyApi.getPurchaseOrders(),
        pharmacyApi.getSuppliers(0, 1000),
        pharmacyApi.getMedicines(0, 1000)
      ]);

      const items = Array.isArray(ordersData) ? ordersData : (ordersData?.purchase_orders || ordersData?.items || []);
      const sItems = Array.isArray(supData) ? supData : (supData?.suppliers || supData?.items || []);
      const mItems = Array.isArray(medData) ? medData : (medData?.medicines || medData?.items || []);

      setOrders(items);
      setSuppliers(sItems);
      setMedicines(mItems);
    } catch (error) {
      console.error("Fetch error:", error);
      Alert.alert("Error", "Failed to load purchase orders");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getSupplierName = (id) => {
    const sup = suppliers.find(s => (s.id || s._id) === id);
    return sup ? (sup.name || sup.supplier_name) : null;
  };

  const handleOpenCreateModal = () => {
    setMode("create");
    setFormData({
      supplier_id: "",
      expected_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: "",
      items: [{ medicine_id: "", ordered_qty: "1", purchase_rate: "0" }]
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = async (order) => {
    setMode("edit");
    let fullOrder = order;
    if (!order.items || order.items.length === 0) {
      setIsActionLoading(true);
      try {
        const data = await pharmacyApi.getPurchaseOrder(order.id || order._id);
        fullOrder = data.purchase_order || data;
      } catch (error) {
        Alert.alert("Error", "Failed to fetch full order details for editing");
        setIsActionLoading(false);
        return;
      }
      setIsActionLoading(false);
    }

    setSelectedOrder(fullOrder);
    setFormData({
      supplier_id: fullOrder.supplier_id || "",
      expected_date: (fullOrder.expected_date || fullOrder.expected_delivery_date) ? (fullOrder.expected_date || fullOrder.expected_delivery_date).split('T')[0] : "",
      notes: fullOrder.notes || "",
      items: (fullOrder.items || []).map(it => ({
        medicine_id: it.medicine_id,
        ordered_qty: (it.ordered_qty || it.qty || 1).toString(),
        purchase_rate: (it.purchase_rate || it.unit_cost || 0).toString()
      }))
    });
    setIsModalOpen(true);
  };

  const handleItemChange = (index, field, value) => {
    const items = [...formData.items];
    if (field === 'medicine_id') {
      const med = medicines.find(m => (m.id || m._id) === value);
      items[index] = {
        ...items[index],
        [field]: value,
        purchase_rate: (med?.unit_price || med?.purchase_price || med?.price || 0).toString()
      };
    } else {
      items[index] = { ...items[index], [field]: value };
    }
    setFormData({ ...formData, items });
  };

  const handleSaveOrder = async () => {
    if (!formData.supplier_id) {
      Alert.alert("Validation", "Please select a supplier");
      return;
    }
    if (formData.items.some(it => !it.medicine_id)) {
      Alert.alert("Validation", "Please select medicine for all items");
      return;
    }

    const payload = {
      ...formData,
      items: formData.items.map(it => ({
        medicine_id: it.medicine_id,
        qty: parseInt(it.ordered_qty) || 0,
        unit_cost: parseFloat(it.purchase_rate) || 0
      }))
    };

    setIsActionLoading(true);
    try {
      if (mode === "edit") {
        await pharmacyApi.updatePurchaseOrder(selectedOrder.id || selectedOrder._id, payload);
        Alert.alert("Success", "Purchase order updated");
      } else {
        await pharmacyApi.createPurchaseOrder(payload);
        Alert.alert("Success", "Purchase order created as DRAFT");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save order");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleViewOrder = async (id) => {
    setIsActionLoading(true);
    try {
      const data = await pharmacyApi.getPurchaseOrder(id);
      setSelectedOrder(data.purchase_order || data);
      setIsViewModalOpen(true);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch order details");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handlePOAction = async (action, id) => {
    if (action === 'delete') {
      Alert.alert(
        "Confirm Delete",
        "Are you sure? This action cannot be undone.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              setIsActionLoading(true);
              try {
                await pharmacyApi.deletePurchaseOrder(id);
                Alert.alert("Success", "Order deleted successfully");
                setIsViewModalOpen(false);
                fetchData();
              } catch (error) {
                Alert.alert("Error", error.message || "Failed to delete order");
              } finally {
                setIsActionLoading(false);
              }
            }
          }
        ]
      );
      return;
    }

    setIsActionLoading(true);
    try {
      if (action === 'submit') await pharmacyApi.submitPurchaseOrder(id);
      else if (action === 'approve') await pharmacyApi.approvePurchaseOrder(id);
      else if (action === 'send') await pharmacyApi.sendPurchaseOrder(id);
      else if (action === 'cancel') await pharmacyApi.cancelPurchaseOrder(id, "Cancelled by user");

      Alert.alert("Success", `Order ${action}ed successfully`);
      setIsViewModalOpen(false);
      fetchData();
    } catch (error) {
      Alert.alert("Error", error.message || `Failed to ${action} order`);
    } finally {
      setIsActionLoading(false);
    }
  };

  const stats = useMemo(() => {
    const total = orders.length;
    const pendingApproval = orders.filter(o => ['SUBMITTED', 'PENDING'].includes(o.status)).length;
    const expected = orders.filter(o => ['APPROVED', 'SENT'].includes(o.status)).length;
    const totalVal = orders.reduce((acc, o) => acc + Number(o.total_amount || 0), 0);
    return {
      total: total.toString(),
      pending: pendingApproval.toString(),
      expected: expected.toString(),
      value: `₹${totalVal.toLocaleString()}`
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const oStatus = String(o.status || '').toUpperCase();
      let matchesFilter = activeFilter === 'ALL' || oStatus === activeFilter;

      if (!matchesFilter) {
        if (activeFilter === 'PENDING' && oStatus === 'SUBMITTED') matchesFilter = true;
        if (activeFilter === 'SUBMITTED' && oStatus === 'PENDING') matchesFilter = true;
      }

      if (!matchesFilter) return false;

      const searchLower = search.toLowerCase();
      const num = (o.po_number || '').toLowerCase();
      const supName = (o.supplier_name || getSupplierName(o.supplier_id) || '').toLowerCase();
      return num.includes(searchLower) || supName.includes(searchLower);
    });
  }, [orders, search, activeFilter, suppliers]);

  return (
    <PharmacyLayout navigation={navigation} route={route}>
      <View className="flex-1 bg-[#F8FAFC]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />}
        >
          {/* Header */}
          <View className="p-6 pb-2">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-bold text-slate-800 tracking-tight">Purchase Orders</Text>
                <Text className="text-slate-500 text-sm">Create and track procurement orders</Text>
              </View>
              <TouchableOpacity
                onPress={handleOpenCreateModal}
                className="flex-row items-center bg-indigo-600 px-4 py-3 rounded-xl shadow-lg shadow-indigo-100"
              >
                <Ionicons name="add" size={20} color="white" />
                <Text className="text-white font-bold text-xs ml-2 hidden sm:flex">New Order</Text>
              </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View className="flex-row flex-wrap justify-between">
              <AnalyticsStat
                title="Total Orders"
                value={stats.total}
                percent="+12%"
                icon="cart-outline"
                iconBg="bg-blue-500"
              />
              <AnalyticsStat
                title="Pending Approval"
                value={stats.pending}
                percent="+5%"
                icon="time-outline"
                iconBg="bg-amber-500"
              />
              <AnalyticsStat
                title="Expected Deliveries"
                value={stats.expected}
                percent="+8%"
                icon="bus-outline"
                iconBg="bg-emerald-500"
              />
              <AnalyticsStat
                title="Total PO Value"
                value={stats.value}
                percent="+15%"
                icon="cash-outline"
                iconBg="bg-indigo-500"
              />
            </View>

            {/* Search & Filters */}
            <View className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex-row items-center shadow-sm mb-4">
              <Ionicons name="search" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-slate-700 font-bold text-sm"
                placeholder="Search PO number or supplier..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <View className="mb-6">
              <TouchableOpacity
                onPress={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 flex-row items-center justify-between shadow-sm"
              >
                <View className="flex-row items-center">
                  <Ionicons name="filter" size={18} color="#4f46e5" />
                  <Text className="ml-3 text-slate-800 font-black text-[10px] uppercase tracking-widest">
                    {activeFilter === 'ALL' ? 'ALL ORDERS' : (activeFilter === 'PENDING' ? 'SUBMITTED' : activeFilter)}
                  </Text>
                </View>
                <Ionicons name={isFilterDropdownOpen ? "chevron-up" : "chevron-down"} size={18} color="#94a3b8" />
              </TouchableOpacity>

              {isFilterDropdownOpen && (
                <View className="mt-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  {['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'SENT', 'RECEIVED', 'CANCELLED'].map(f => (
                    <TouchableOpacity
                      key={f}
                      onPress={() => {
                        setActiveFilter(f);
                        setIsFilterDropdownOpen(false);
                      }}
                      className={`px-4 py-3 border-b border-slate-50 ${activeFilter === f ? 'bg-indigo-50' : 'bg-white'}`}
                    >
                      <Text className={`text-[10px] font-black uppercase tracking-widest ${activeFilter === f ? 'text-indigo-600' : 'text-slate-500'}`}>
                        {f === 'PENDING' ? 'SUBMITTED' : (f === 'ALL' ? 'ALL ORDERS' : f)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* List */}
            {isLoading ? (
              <ActivityIndicator size="large" color="#4f46e5" className="py-20" />
            ) : filteredOrders.length === 0 ? (
              <View className="py-20 items-center justify-center bg-white rounded-3xl border border-slate-100">
                <MaterialCommunityIcons name="cart-off" size={60} color="#cbd5e1" />
                <Text className="text-slate-400 font-bold mt-4">No purchase orders found</Text>
              </View>
            ) : (
              filteredOrders.map((item, idx) => (
                <PurchaseOrderItem
                  key={item.id || item._id || idx}
                  item={item}
                  onView={handleViewOrder}
                  onEdit={handleOpenEditModal}
                  onDelete={() => handlePOAction('delete', item.id || item._id)}
                  getSupplierName={getSupplierName}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Create/Edit Modal */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-6 h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">
                  {mode === 'edit' ? 'Modify Purchase Order' : 'Create New Purchase Order'}
                </Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Ionicons name="close-circle" size={28} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="mb-6">
                  <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">Select Supplier</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                    {suppliers.map(s => (
                      <TouchableOpacity
                        key={s.id || s._id}
                        onPress={() => setFormData({ ...formData, supplier_id: s.id || s._id })}
                        style={{ backgroundColor: formData.supplier_id === (s.id || s._id) ? "#4f46e5" : "white" }}
                        className="px-4 py-3 rounded-2xl mr-2 border border-slate-100 shadow-sm"
                      >
                        <Text style={{ color: formData.supplier_id === (s.id || s._id) ? "white" : "#64748b" }} className="text-xs font-bold">
                          {s.name || s.supplier_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View className="mb-6">
                  <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">Expected Delivery Date</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold"
                    placeholder="YYYY-MM-DD"
                    value={formData.expected_date}
                    onChangeText={t => setFormData({ ...formData, expected_date: t })}
                  />
                </View>

                <View className="mb-6">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-800 font-black text-sm">Order Items</Text>
                    <TouchableOpacity
                      onPress={() => setFormData(prev => ({ ...prev, items: [...prev.items, { medicine_id: "", ordered_qty: "1", purchase_rate: "0" }] }))}
                      className="bg-indigo-50 px-3 py-1.5 rounded-xl flex-row items-center"
                    >
                      <Ionicons name="add" size={14} color="#4f46e5" />
                      <Text className="text-indigo-600 font-bold text-[10px] uppercase ml-1">Add Line</Text>
                    </TouchableOpacity>
                  </View>

                  {formData.items.map((item, idx) => (
                    <View key={idx} className="bg-slate-50 p-4 rounded-3xl mb-3 border border-slate-100">
                      <View className="mb-3">
                        <Text className="text-slate-400 text-[9px] font-bold uppercase mb-1">Medicine</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                          {medicines.map(m => (
                            <TouchableOpacity
                              key={m.id || m._id}
                              onPress={() => handleItemChange(idx, 'medicine_id', m.id || m._id)}
                              style={{ backgroundColor: item.medicine_id === (m.id || m._id) ? "#4f46e5" : "white" }}
                              className="px-3 py-1.5 rounded-xl mr-2 border border-slate-200 shadow-sm"
                            >
                              <Text style={{ color: item.medicine_id === (m.id || m._id) ? "white" : "#64748b" }} className="text-[9px] font-bold">
                                {m.brand_name || m.name}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                      <View className="flex-row gap-4">
                        <View className="flex-1">
                          <Text className="text-slate-400 text-[9px] font-bold uppercase mb-1">Quantity</Text>
                          <TextInput
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                            value={item.ordered_qty}
                            onChangeText={t => handleItemChange(idx, 'ordered_qty', t)}
                            keyboardType="numeric"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-slate-400 text-[9px] font-bold uppercase mb-1">Rate (₹)</Text>
                          <TextInput
                            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-bold text-xs"
                            value={item.purchase_rate}
                            onChangeText={t => handleItemChange(idx, 'purchase_rate', t)}
                            keyboardType="numeric"
                          />
                        </View>
                        {formData.items.length > 1 && (
                          <TouchableOpacity
                            onPress={() => {
                              const its = [...formData.items];
                              its.splice(idx, 1);
                              setFormData({ ...formData, items: its });
                            }}
                            className="justify-center mt-4"
                          >
                            <Ionicons name="trash-outline" size={20} color="#f43f5e" />
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                  ))}

                  <View className="bg-indigo-50 px-5 py-4 rounded-2xl border border-indigo-100 flex-row justify-between items-center mt-4">
                    <Text className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Grand Total</Text>
                    <Text className="text-xl font-black text-indigo-900 font-mono">
                      ₹{formData.items.reduce((sum, it) => sum + ((parseFloat(it.ordered_qty) || 0) * (parseFloat(it.purchase_rate) || 0)), 0).toLocaleString()}
                    </Text>
                  </View>
                </View>

                <View className="mb-6">
                  <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-3 ml-1">Notes</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold h-20"
                    placeholder="Order notes..."
                    value={formData.notes}
                    onChangeText={t => setFormData({ ...formData, notes: t })}
                    multiline
                  />
                </View>

                <TouchableOpacity
                  onPress={handleSaveOrder}
                  disabled={isActionLoading}
                  className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-100 mb-10 flex-row justify-center gap-2"
                >
                  {isActionLoading && <ActivityIndicator color="white" size="small" />}
                  <Text className="text-white font-black uppercase tracking-widest text-xs">
                    {mode === 'edit' ? 'Update Order' : 'Create Draft'}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* View Details / Action Modal */}
        <Modal
          visible={isViewModalOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsViewModalOpen(false)}
        >
          <View className="flex-1 bg-black/60 justify-center p-6">
            <View className="bg-white rounded-[40px] p-6 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">Order Details</Text>
                <TouchableOpacity onPress={() => setIsViewModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {selectedOrder && (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View className="bg-slate-50 p-5 rounded-3xl border border-slate-100 mb-6 flex-row justify-between">
                    <View className="space-y-2 flex-1">
                      <Text className="text-indigo-600 font-black text-xs">{selectedOrder.po_number}</Text>
                      <Text className="text-xl font-black text-slate-900 mt-1">{selectedOrder.supplier_name || getSupplierName(selectedOrder.supplier_id)}</Text>
                      <View className="mt-2 flex-row gap-2">
                        <StatusBadge status={selectedOrder.status} />
                      </View>
                    </View>
                    <View className="items-end justify-between">
                      <View className="items-end">
                        <Text className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Total Value</Text>
                        <Text className="text-xl font-black text-indigo-600 font-mono">₹{Number(selectedOrder.total_amount || 0).toLocaleString()}</Text>
                      </View>
                      <View className="items-end mt-2">
                        <Text className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">Expected</Text>
                        <Text className="text-slate-700 font-bold text-xs">{selectedOrder.expected_date ? new Date(selectedOrder.expected_date).toLocaleDateString() : 'N/A'}</Text>
                      </View>
                    </View>
                  </View>

                  <Text className="text-slate-800 font-black text-sm mb-4">Line Items</Text>
                  <View className="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-6">
                    <View className="flex-row bg-slate-50 px-4 py-2 border-b border-slate-100">
                      <Text className="flex-2 text-[10px] font-bold text-slate-500 flex-1">Item</Text>
                      <Text className="w-12 text-center text-[10px] font-bold text-slate-500">Qty</Text>
                      <Text className="w-16 text-right text-[10px] font-bold text-slate-500">Rate</Text>
                      <Text className="w-20 text-right text-[10px] font-bold text-slate-500">Total</Text>
                    </View>
                    {(selectedOrder.items || selectedOrder.purchase_order_items || []).map((it, idx) => (
                      <View key={idx} className="flex-row items-center px-4 py-3 border-b border-slate-50">
                        <Text className="flex-1 font-bold text-slate-700 text-xs" numberOfLines={1}>
                          {it.medicine_name || it.medicine?.brand_name || it.medicine?.name || it.medicine_id}
                        </Text>
                        <Text className="w-12 text-center text-xs font-bold">{it.ordered_qty || it.qty}</Text>
                        <Text className="w-16 text-right text-xs text-slate-600">₹{(it.purchase_rate || it.unit_cost || 0).toLocaleString()}</Text>
                        <Text className="w-20 text-right font-black text-slate-900 text-xs">
                          ₹{((it.ordered_qty || it.qty || 0) * (it.purchase_rate || it.unit_cost || 0)).toLocaleString()}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {selectedOrder.notes && (
                    <View className="p-4 bg-amber-50 rounded-xl border border-amber-100 mb-6 flex-row gap-3">
                      <Ionicons name="document-text" size={18} color="#d97706" />
                      <View className="flex-1">
                        <Text className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Notes</Text>
                        <Text className="text-sm text-amber-800">{selectedOrder.notes}</Text>
                      </View>
                    </View>
                  )}

                  <View className="flex-row flex-wrap justify-end gap-2 mb-4 pt-4 border-t border-slate-100">
                    {selectedOrder.status === 'DRAFT' && (
                      <TouchableOpacity
                        onPress={() => handlePOAction('submit', selectedOrder.id || selectedOrder._id)}
                        className="bg-indigo-600 px-5 py-3 rounded-xl flex-row items-center"
                      >
                        <Ionicons name="send" size={16} color="white" />
                        <Text className="text-white font-bold text-xs ml-2">Submit</Text>
                      </TouchableOpacity>
                    )}
                    {['SUBMITTED', 'PENDING'].includes(selectedOrder.status) && (
                      <TouchableOpacity
                        onPress={() => handlePOAction('approve', selectedOrder.id || selectedOrder._id)}
                        className="bg-emerald-600 px-5 py-3 rounded-xl flex-row items-center"
                      >
                        <Ionicons name="checkmark-circle" size={16} color="white" />
                        <Text className="text-white font-bold text-xs ml-2">Approve</Text>
                      </TouchableOpacity>
                    )}
                    {selectedOrder.status === 'APPROVED' && (
                      <TouchableOpacity
                        onPress={() => handlePOAction('send', selectedOrder.id || selectedOrder._id)}
                        className="bg-blue-600 px-5 py-3 rounded-xl flex-row items-center"
                      >
                        <Ionicons name="cube" size={16} color="white" />
                        <Text className="text-white font-bold text-xs ml-2">Send</Text>
                      </TouchableOpacity>
                    )}
                    {['DRAFT', 'SUBMITTED', 'PENDING', 'APPROVED'].includes(selectedOrder.status) && (
                      <TouchableOpacity
                        onPress={() => handlePOAction('cancel', selectedOrder.id || selectedOrder._id)}
                        className="bg-rose-50 px-5 py-3 rounded-xl flex-row items-center"
                      >
                        <Ionicons name="ban" size={16} color="#e11d48" />
                        <Text className="text-rose-600 font-bold text-xs ml-2">Cancel</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </PharmacyLayout>
  );
}
