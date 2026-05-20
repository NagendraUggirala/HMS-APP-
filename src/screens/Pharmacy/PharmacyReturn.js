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

const ReturnItem = ({ returnRecord, onPress }) => {
  const isPatient = !!returnRecord.sale_id;

  return (
    <TouchableOpacity
      onPress={() => onPress(returnRecord)}
      className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 shadow-sm"
    >
      <View className="flex-row justify-between items-start mb-3">
        <View>
          <Text className="text-indigo-600 font-black text-[10px] uppercase tracking-widest">
            ID: {returnRecord.id?.substring(0, 8).toUpperCase()}
          </Text>
          <View className="flex-row items-center mt-1">
            <Ionicons name={isPatient ? "receipt-outline" : "bus-outline"} size={14} color="#64748b" />
            <Text className="text-slate-700 font-bold text-xs ml-1">
              {isPatient ? `Sale: ${returnRecord.sale_id}` : (returnRecord.supplier_name || "Supplier Return")}
            </Text>
          </View>
        </View>
        <View className={`px-2 py-1 rounded-lg ${isPatient ? 'bg-blue-50' : 'bg-purple-50'}`}>
          <Text className={`text-[8px] font-black uppercase ${isPatient ? 'text-blue-600' : 'text-purple-600'}`}>
            {isPatient ? "Patient" : "Supplier"}
          </Text>
        </View>
      </View>

      <Text className="text-slate-800 font-bold text-xs mb-2" numberOfLines={1}>
        {returnRecord.return_reason || "No reason provided"}
      </Text>

      <View className="flex-row justify-between items-center pt-2 border-t border-slate-50">
        <Text className="text-slate-400 text-[10px] font-medium">
          {new Date(returnRecord.created_at).toLocaleDateString()}
        </Text>
        <View className="flex-row items-center">
          <Ionicons name="layers-outline" size={12} color="#94a3b8" />
          <Text className="text-slate-400 text-[10px] font-medium ml-1">
            {returnRecord.items?.length || 0} items
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function PharmacyReturn() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [returnType, setReturnType] = useState(""); // PATIENT | SUPPLIER

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("PATIENT");
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    sale_id: "",
    supplier_id: "",
    grn_id: "",
    return_reason: "",
    items: [{ medicine_id: "", medicine_name: "", batch_id: "", batch_no: "", qty: "1", unit_price: 0 }]
  });

  // Supporting Data
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [batches, setBatches] = useState({});

  const fetchReturns = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await pharmacyApi.getReturns(returnType);
      const list = data.returns || data.items || data.data || (Array.isArray(data) ? data : []);
      setReturns(list);
    } catch (error) {
      console.error("[Return] Fetch error:", error);
      Alert.alert("Error", "Failed to load returns history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [returnType]);

  const fetchSupportData = async () => {
    try {
      const [medData, supData] = await Promise.all([
        pharmacyApi.getMedicines(0, 500),
        pharmacyApi.getSuppliers(0, 500)
      ]);
      setMedicines(medData.medicines || medData.items || (Array.isArray(medData) ? medData : []));
      setSuppliers(supData.suppliers || supData.items || (Array.isArray(supData) ? supData : []));
    } catch (error) {
      console.error("[Return] Support data error:", error);
    }
  };

  useEffect(() => {
    fetchReturns();
    fetchSupportData();
  }, [fetchReturns]);

  const handleOpenModal = (type) => {
    setModalType(type);
    setFormData({
      sale_id: "",
      supplier_id: "",
      grn_id: "",
      return_reason: "",
      items: [{ medicine_id: "", medicine_name: "", batch_id: "", batch_no: "", qty: "1", unit_price: 0 }]
    });
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicine_id: "", medicine_name: "", batch_id: "", batch_no: "", qty: "1", unit_price: 0 }]
    });
  };

  const handleRemoveItem = (idx) => {
    const items = [...formData.items];
    items.splice(idx, 1);
    setFormData({ ...formData, items });
  };

  const fetchBatchesForMed = async (medId, idx) => {
    try {
      const data = await pharmacyApi.getStockBatches(medId);
      const medBatches = data.batches || [];
      setBatches(prev => ({ ...prev, [medId]: medBatches }));
    } catch (error) {
      console.warn("Failed to fetch batches for", medId);
    }
  };

  const handleItemChange = (idx, field, value) => {
    const items = [...formData.items];
    items[idx][field] = value;

    if (field === 'medicine_id') {
      const med = medicines.find(m => m.id === value);
      items[idx].medicine_name = med?.brand_name || "";
      items[idx].unit_price = med?.sale_price || 0;
      fetchBatchesForMed(value, idx);
    }

    setFormData({ ...formData, items });
  };

  const processReturn = async () => {
    if (modalType === 'PATIENT' && !formData.sale_id.trim()) {
      Alert.alert("Validation", "Sale ID is required for patient returns.");
      return;
    }
    if (modalType === 'SUPPLIER' && !formData.supplier_id) {
      Alert.alert("Validation", "Supplier is required.");
      return;
    }
    if (!formData.return_reason.trim()) {
      Alert.alert("Validation", "Return reason is required.");
      return;
    }

    const validItems = formData.items.filter(it => it.medicine_id && it.batch_id && parseInt(it.qty) > 0);
    if (validItems.length === 0) {
      Alert.alert("Validation", "At least one valid item with batch and quantity is required.");
      return;
    }

    setIsActionLoading(true);
    try {
      const payload = {
        return_reason: formData.return_reason,
        items: validItems.map(it => ({
          medicine_id: it.medicine_id,
          batch_id: it.batch_id,
          qty: parseInt(it.qty),
          unit_price: Number(it.unit_price)
        }))
      };

      if (modalType === 'PATIENT') {
        await pharmacyApi.createPatientReturn({ ...payload, sale_id: formData.sale_id });
      } else {
        await pharmacyApi.createSupplierReturn({ ...payload, supplier_id: formData.supplier_id });
      }

      Alert.alert("Success", "Return processed successfully.");
      setIsModalOpen(false);
      fetchReturns();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to process return.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        {/* Header */}
        <View className="p-6 pb-2">
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="text-3xl font-black text-slate-900 tracking-tight">
                Returns
              </Text>
              <Text className="text-slate-500 font-medium mt-1">
                Track refunds and supplier credits
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleOpenModal("PATIENT")}
                className="bg-indigo-600 w-11 h-11 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
              >
                <Ionicons name="person-add" size={20} color="white" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOpenModal("SUPPLIER")}
                className="bg-slate-800 w-11 h-11 rounded-2xl items-center justify-center shadow-lg shadow-slate-100"
              >
                <Ionicons name="bus" size={20} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Filters */}
        <View className="px-6 py-4 flex-row gap-2">
          <View className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex-row items-center shadow-sm">
            <Ionicons name="search" size={18} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-2 text-xs font-bold text-slate-700"
              placeholder="Search ID or reason..."
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
            {["", "PATIENT", "SUPPLIER"].map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setReturnType(type)}
                style={{ backgroundColor: returnType === type ? "#4f46e5" : "white" }}
                className="px-4 py-2.5 rounded-2xl border border-slate-100 shadow-sm"
              >
                <Text style={{ color: returnType === type ? "white" : "#64748b" }} className="text-[10px] font-black uppercase">
                  {type || "All"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* List */}
        <View className="flex-1 px-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : (
            <FlatList
              data={returns.filter(r =>
                r.id.toLowerCase().includes(search.toLowerCase()) ||
                r.return_reason?.toLowerCase().includes(search.toLowerCase())
              )}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <ReturnItem returnRecord={item} onPress={(r) => Alert.alert("Return Details", r.return_reason)} />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchReturns(true)} />
              }
              ListEmptyComponent={
                <View className="py-20 items-center justify-center">
                  <Ionicons name="refresh-circle-outline" size={60} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">No records found</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Process Return Modal */}
        <Modal
          visible={isModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalOpen(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-6 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">
                  New {modalType === 'PATIENT' ? 'Patient' : 'Supplier'} Return
                </Text>
                <TouchableOpacity onPress={() => setIsModalOpen(false)}>
                  <Ionicons name="close-circle" size={28} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {isActionLoading ? (
                <View className="py-20 items-center justify-center">
                  <ActivityIndicator size="large" color="#4f46e5" />
                </View>
              ) : (
                <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                  {modalType === 'PATIENT' ? (
                    <View>
                      <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1.5 ml-1">Sale ID Reference</Text>
                      <TextInput
                        className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold"
                        placeholder="e.g. SALE-1234"
                        value={formData.sale_id}
                        onChangeText={(t) => setFormData({ ...formData, sale_id: t })}
                      />
                    </View>
                  ) : (
                    <View>
                      <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1.5 ml-1">Select Supplier</Text>
                      <View className="flex-row flex-wrap gap-2">
                        {suppliers.map(s => (
                          <TouchableOpacity
                            key={s.id}
                            onPress={() => setFormData({ ...formData, supplier_id: s.id })}
                            style={{ backgroundColor: formData.supplier_id === s.id ? "#4f46e5" : "#f1f5f9" }}
                            className="px-3 py-2 rounded-xl"
                          >
                            <Text style={{ color: formData.supplier_id === s.id ? "white" : "#475569" }} className="text-[10px] font-bold">
                              {s.name}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  )}

                  <View>
                    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1.5 ml-1">Return Reason</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold"
                      placeholder="e.g. Expired or Damaged"
                      value={formData.return_reason}
                      onChangeText={(t) => setFormData({ ...formData, return_reason: t })}
                    />
                  </View>

                  <View className="border-t border-slate-100 pt-4 mt-2">
                    <View className="flex-row justify-between items-center mb-4">
                      <Text className="text-slate-900 font-black text-sm">Return Items</Text>
                      <TouchableOpacity onPress={handleAddItem} className="bg-indigo-50 px-3 py-1.5 rounded-xl">
                        <Text className="text-indigo-600 font-black text-[10px] uppercase">+ Add Item</Text>
                      </TouchableOpacity>
                    </View>

                    {formData.items.map((item, idx) => (
                      <View key={idx} className="bg-slate-50 p-4 rounded-3xl mb-3 border border-slate-100">
                        <View className="flex-row justify-between items-center mb-3">
                          <Text className="text-indigo-600 font-black text-[10px]">ITEM #{idx + 1}</Text>
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

                        {item.medicine_id && (
                          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-3">
                            {(batches[item.medicine_id] || []).map(b => (
                              <TouchableOpacity
                                key={b.id}
                                onPress={() => handleItemChange(idx, 'batch_id', b.id)}
                                style={{ backgroundColor: item.batch_id === b.id ? "#10b981" : "white" }}
                                className="px-3 py-1.5 rounded-xl mr-2 border border-slate-100"
                              >
                                <Text style={{ color: item.batch_id === b.id ? "white" : "#475569" }} className="text-[10px] font-bold">
                                  Batch: {b.batch_no}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}

                        <View className="flex-row items-center justify-between">
                          <View className="flex-1 mr-4">
                            <Text className="text-slate-400 text-[10px] font-bold mb-1 uppercase">Quantity</Text>
                            <TextInput
                              className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-slate-900 font-bold text-center"
                              keyboardType="numeric"
                              value={item.qty}
                              onChangeText={(t) => handleItemChange(idx, 'qty', t)}
                            />
                          </View>
                          <View className="items-end">
                            <Text className="text-slate-400 text-[10px] font-bold mb-1 uppercase">Refund Value</Text>
                            <Text className="text-slate-900 font-black text-lg">₹{(parseInt(item.qty || 0) * item.unit_price).toLocaleString()}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>

                  <TouchableOpacity
                    onPress={processReturn}
                    disabled={isActionLoading}
                    className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-100 mt-4 mb-10"
                  >
                    <Text className="text-white font-black uppercase tracking-widest text-xs">
                      Submit Return Request
                    </Text>
                  </TouchableOpacity>

                  <View className="h-10" />
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </PharmacyLayout>
  );
}
