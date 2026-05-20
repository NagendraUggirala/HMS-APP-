import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const GRNItemRow = ({ grn, onPress, onFinalize, loading }) => (
  <TouchableOpacity
    onPress={() => onPress(grn)}
    className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 shadow-sm"
  >
    <View className="flex-row justify-between items-start mb-3">
      <View>
        <Text className="text-slate-900 font-black text-sm uppercase tracking-tighter">
          {grn.grn_number}
        </Text>
        <View className="flex-row items-center mt-1">
          <Ionicons name="bus-outline" size={14} color="#64748b" />
          <Text className="text-slate-500 font-bold text-xs ml-1" numberOfLines={1}>
            {grn.supplier_name || "Direct Purchase"}
          </Text>
        </View>
      </View>
      <View className={`px-2.5 py-1 rounded-full ${grn.is_finalized ? 'bg-emerald-50' : 'bg-amber-50'}`}>
        <Text className={`text-[8px] font-black uppercase tracking-widest ${grn.is_finalized ? 'text-emerald-600' : 'text-amber-600'}`}>
          {grn.is_finalized ? "Finalized" : "Draft"}
        </Text>
      </View>
    </View>

    <View className="flex-row justify-between items-center pt-3 border-t border-slate-50">
      <View className="flex-row items-center gap-3">
        <View>
          <Text className="text-slate-400 text-[10px] font-bold uppercase">Date</Text>
          <Text className="text-slate-700 font-black text-xs">
            {new Date(grn.received_at).toLocaleDateString()}
          </Text>
        </View>
        <View>
          <Text className="text-slate-400 text-[10px] font-bold uppercase">PO Ref</Text>
          <Text className="text-slate-700 font-black text-xs">
            {grn.po_id ? `PO-${grn.po_id.slice(0, 6)}` : "Direct"}
          </Text>
        </View>
      </View>
      {!grn.is_finalized && (
        <TouchableOpacity
          onPress={() => onFinalize(grn.id)}
          disabled={loading}
          className="bg-emerald-500 px-3 py-1.5 rounded-xl shadow-sm shadow-emerald-100"
        >
          <Text className="text-white font-black text-[10px] uppercase">Finalize</Text>
        </TouchableOpacity>
      )}
    </View>
  </TouchableOpacity>
);

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = "default", flex = 1 }) => (
  <View style={{ flex }} className="mb-3">
    <Text className="text-slate-500 font-black text-[9px] uppercase tracking-widest mb-1 ml-1">{label}</Text>
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 font-bold text-xs"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  </View>
);

export default function PharmacyGRN() {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [selectedGrn, setSelectedGrn] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    supplier_id: "",
    po_id: "",
    notes: "",
    items: [{ medicine_id: "", medicine_name: "", batch_no: "", expiry_date: "", received_qty: "1", free_qty: "0", purchase_rate: "0", mrp: "0", selling_price: "0", tax_percent: "0" }]
  });

  // Supporting Data
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);

  const fetchGrns = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await pharmacyApi.getGRNs(supplierFilter);
      const items = Array.isArray(data) ? data : (data?.grns || data?.items || data?.data || []);
      setGrns(items);
    } catch (error) {
      console.error("[GRN] Fetch error:", error);
      Alert.alert("Error", "Failed to load GRN history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [supplierFilter]);

  const fetchSupportData = async () => {
    try {
      const [supData, medData, poData] = await Promise.all([
        pharmacyApi.getSuppliers(0, 1000),
        pharmacyApi.getMedicines(0, 1000),
        pharmacyApi.getPurchaseOrders('APPROVED')
      ]);
      setSuppliers(supData.suppliers || supData.items || (Array.isArray(supData) ? supData : []));
      setMedicines(medData.medicines || medData.items || (Array.isArray(medData) ? medData : []));
      setPurchaseOrders(poData.purchase_orders || poData.items || (Array.isArray(poData) ? poData : []));
    } catch (error) {
      console.error("[GRN] Support data error:", error);
    }
  };

  useEffect(() => {
    fetchGrns();
    fetchSupportData();
  }, [fetchGrns]);

  const handleOpenNewGrn = () => {
    setFormData({
      supplier_id: "",
      po_id: "",
      notes: "",
      items: [{ medicine_id: "", medicine_name: "", batch_no: "", expiry_date: "", received_qty: "1", free_qty: "0", purchase_rate: "0", mrp: "0", selling_price: "0", tax_percent: "0" }]
    });
    setIsModalOpen(true);
  };

  const handleViewGrn = async (id) => {
    setIsActionLoading(true);
    try {
      const data = await pharmacyApi.getGRN(id);
      setSelectedGrn(data.grn || data.data || data);
      setIsViewModalOpen(true);
    } catch (error) {
      Alert.alert("Error", "Failed to load GRN details.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicine_id: "", medicine_name: "", batch_no: "", expiry_date: "", received_qty: "1", free_qty: "0", purchase_rate: "0", mrp: "0", selling_price: "0", tax_percent: "0" }]
    });
  };

  const handleRemoveItem = (idx) => {
    const items = [...formData.items];
    items.splice(idx, 1);
    setFormData({ ...formData, items });
  };

  const handleItemChange = (idx, field, value) => {
    const items = [...formData.items];
    items[idx][field] = value;
    if (field === 'medicine_id') {
      const med = medicines.find(m => m.id === value);
      items[idx].medicine_name = med?.brand_name || "";
    }
    setFormData({ ...formData, items });
  };

  const handleCreateGrn = async () => {
    if (!formData.supplier_id) {
      Alert.alert("Validation", "Please select a supplier.");
      return;
    }
    const validItems = formData.items.filter(it => it.medicine_id && it.batch_no && it.expiry_date);
    if (validItems.length === 0) {
      Alert.alert("Validation", "At least one complete item (Medicine, Batch, Expiry) is required.");
      return;
    }

    setIsActionLoading(true);
    try {
      const payload = {
        supplier_id: formData.supplier_id,
        po_id: formData.po_id || null,
        received_at: new Date().toISOString(),
        notes: formData.notes,
        items: validItems.map(it => ({
          medicine_id: it.medicine_id,
          batch_no: it.batch_no,
          expiry_date: it.expiry_date,
          received_qty: parseInt(it.received_qty || 0),
          free_qty: parseInt(it.free_qty || 0),
          purchase_rate: parseFloat(it.purchase_rate || 0),
          mrp: parseFloat(it.mrp || 0),
          selling_price: parseFloat(it.selling_price || 0),
          tax_percent: parseFloat(it.tax_percent || 0)
        }))
      };

      const res = await pharmacyApi.createGRN(payload);
      const grnId = res.id || res.grn_id;
      if (grnId) {
        await pharmacyApi.finalizeGRN(grnId).catch(() => { });
      }

      Alert.alert("Success", "Stock updated successfully.");
      setIsModalOpen(false);
      fetchGrns();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to process GRN.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleFinalize = async (id) => {
    setIsActionLoading(true);
    try {
      await pharmacyApi.finalizeGRN(id);
      Alert.alert("Success", "Inventory updated.");
      fetchGrns();
    } catch (error) {
      Alert.alert("Error", "Finalization failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        {/* Header */}
        <View className="p-6 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">
              Inventory GRN
            </Text>
            <Text className="text-slate-500 font-medium mt-1">
              Goods Receipt & Stock Update
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenNewGrn}
            className="bg-indigo-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Filters */}
        <View className="px-6 py-4 flex-row gap-2">
          <View className="flex-1 bg-white border border-slate-200 rounded-3xl px-4 py-3 flex-row items-center shadow-sm">
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-700 font-bold"
              placeholder="Search GRN # or notes..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <TouchableOpacity
            onPress={() => fetchGrns()}
            className="bg-white border border-slate-200 w-12 h-12 rounded-3xl items-center justify-center shadow-sm"
          >
            <Ionicons name="refresh" size={20} color="#4f46e5" />
          </TouchableOpacity>
        </View>

        {/* List */}
        <View className="flex-1 px-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : (
            <FlatList
              data={grns.filter(g =>
                g.grn_number.toLowerCase().includes(search.toLowerCase()) ||
                g.notes?.toLowerCase().includes(search.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <GRNItemRow
                  grn={item}
                  onPress={(g) => handleViewGrn(g.id)}
                  onFinalize={(id) => handleFinalize(id)}
                  loading={isActionLoading}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchGrns(true)} />
              }
              ListEmptyComponent={
                <View className="py-20 items-center justify-center">
                  <Ionicons name="cube-outline" size={60} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">No GRN records found</Text>
                </View>
              }
            />
          )}
        </View>

        {/* NEW GRN MODAL */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-6 h-[95%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">Create Receipt Note</Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Ionicons name="close-circle" size={28} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                <View>
                  <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2 ml-1">Supplier Selection</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                    {suppliers.map(s => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => setFormData({ ...formData, supplier_id: s.id })}
                        style={{ backgroundColor: formData.supplier_id === s.id ? "#4f46e5" : "white" }}
                        className="px-4 py-2 rounded-2xl mr-2 border border-slate-100 shadow-sm"
                      >
                        <Text style={{ color: formData.supplier_id === s.id ? "white" : "#64748b" }} className="text-[10px] font-bold">
                          {s.name || s.brand_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View className="flex-row gap-4">
                  <FormInput
                    label="PO ID Ref"
                    value={formData.po_id}
                    onChangeText={(t) => setFormData({ ...formData, po_id: t })}
                    placeholder="Optional PO ID"
                  />
                  <FormInput
                    label="GRN Notes"
                    value={formData.notes}
                    onChangeText={(t) => setFormData({ ...formData, notes: t })}
                    placeholder="Invoice #, etc."
                  />
                </View>

                <View className="border-t border-slate-100 pt-4">
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-slate-900 font-black text-sm">Receipt Items</Text>
                    <TouchableOpacity onPress={handleAddItem} className="bg-indigo-50 px-3 py-1.5 rounded-xl">
                      <Text className="text-indigo-600 font-black text-[10px] uppercase">+ Add Line</Text>
                    </TouchableOpacity>
                  </View>

                  {formData.items.map((item, idx) => (
                    <View key={idx} className="bg-slate-50 p-4 rounded-3xl mb-4 border border-slate-100">
                      <View className="flex-row justify-between items-center mb-3">
                        <Text className="text-indigo-600 font-black text-[10px]">LINE #{idx + 1}</Text>
                        {formData.items.length > 1 && (
                          <TouchableOpacity onPress={() => handleRemoveItem(idx)}>
                            <Ionicons name="trash" size={16} color="#ef4444" />
                          </TouchableOpacity>
                        )}
                      </View>

                      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                        {medicines.map(m => (
                          <TouchableOpacity
                            key={m.id}
                            onPress={() => handleItemChange(idx, 'medicine_id', m.id)}
                            style={{ backgroundColor: item.medicine_id === m.id ? "#4f46e5" : "white" }}
                            className="px-3 py-1.5 rounded-xl mr-2 border border-slate-100"
                          >
                            <Text style={{ color: item.medicine_id === m.id ? "white" : "#475569" }} className="text-[10px] font-bold">
                              {m.brand_name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>

                      <View className="flex-row gap-2">
                        <FormInput label="Batch No" value={item.batch_no} onChangeText={(t) => handleItemChange(idx, 'batch_no', t)} placeholder="e.g. BTC-01" />
                        <FormInput label="Expiry (YYYY-MM)" value={item.expiry_date} onChangeText={(t) => handleItemChange(idx, 'expiry_date', t)} placeholder="2026-12" />
                      </View>

                      <View className="flex-row gap-2">
                        <FormInput label="Qty" value={item.received_qty} onChangeText={(t) => handleItemChange(idx, 'received_qty', t)} keyboardType="numeric" />
                        <FormInput label="P.Rate" value={item.purchase_rate} onChangeText={(t) => handleItemChange(idx, 'purchase_rate', t)} keyboardType="numeric" />
                        <FormInput label="MRP" value={item.mrp} onChangeText={(t) => handleItemChange(idx, 'mrp', t)} keyboardType="numeric" />
                      </View>

                      <View className="flex-row gap-2">
                        <FormInput label="Selling" value={item.selling_price} onChangeText={(t) => handleItemChange(idx, 'selling_price', t)} keyboardType="numeric" />
                        <FormInput label="Tax %" value={item.tax_percent} onChangeText={(t) => handleItemChange(idx, 'tax_percent', t)} keyboardType="numeric" />
                        <View className="flex-1 items-end justify-center">
                          <Text className="text-slate-400 text-[8px] font-bold uppercase">Line Total</Text>
                          <Text className="text-indigo-600 font-black text-xs">₹{(parseInt(item.received_qty || 0) * parseFloat(item.purchase_rate || 0)).toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>

                <TouchableOpacity
                  onPress={handleCreateGrn}
                  disabled={isActionLoading}
                  className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-100 mt-4 mb-10"
                >
                  <Text className="text-white font-black uppercase tracking-widest text-xs">
                    {isActionLoading ? "Processing..." : "Finalize & Update Stock"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* VIEW DETAILS MODAL */}
        <Modal
          visible={isViewModalOpen}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIsViewModalOpen(false)}
        >
          <View className="flex-1 bg-black/50 items-center justify-center p-6">
            <View className="bg-white w-full rounded-[40px] p-6 max-h-[80%]">
              {selectedGrn && (
                <View>
                  <View className="flex-row justify-between items-center mb-6">
                    <Text className="text-xl font-black text-slate-900">{selectedGrn.grn_number}</Text>
                    <TouchableOpacity onPress={() => setIsViewModalOpen(false)}>
                      <Ionicons name="close-circle" size={28} color="#94a3b8" />
                    </TouchableOpacity>
                  </View>

                  <View className="bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-4">
                    <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Supplier Info</Text>
                    <Text className="text-slate-900 font-bold">{selectedGrn.supplier_name}</Text>
                    <Text className="text-slate-500 text-[10px] mt-1">{new Date(selectedGrn.received_at).toLocaleString()}</Text>
                  </View>

                  <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Receipt Summary</Text>
                  <ScrollView className="max-h-[300px]">
                    {selectedGrn.items?.map((it, idx) => (
                      <View key={idx} className="flex-row justify-between items-center py-3 border-b border-slate-50">
                        <View className="flex-1">
                          <Text className="text-slate-900 font-bold text-xs">{it.medicine_name || it.batch_no}</Text>
                          <Text className="text-slate-400 text-[10px]">Batch: {it.batch_no} • Exp: {it.expiry_date}</Text>
                        </View>
                        <View className="items-end">
                          <Text className="text-indigo-600 font-black text-xs">Qty: {it.received_qty}</Text>
                          <Text className="text-slate-400 text-[10px]">Rate: ₹{it.purchase_rate}</Text>
                        </View>
                      </View>
                    ))}
                  </ScrollView>

                  <View className="bg-indigo-50 p-4 rounded-3xl mt-4 flex-row justify-between items-center">
                    <Text className="text-indigo-600 font-black text-xs uppercase">Grand Total</Text>
                    <Text className="text-indigo-600 font-black text-xl">
                      ₹{selectedGrn.items?.reduce((s, i) => s + (i.received_qty * i.purchase_rate), 0).toFixed(2)}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </PharmacyLayout>
  );
}
