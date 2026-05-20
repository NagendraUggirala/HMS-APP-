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
  Switch,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const StockItem = ({ batch, medLookup }) => {
  const isLow = Number(batch.qty_on_hand) <= 10;
  
  // Robust name resolution with multiple fallbacks
  const medObj = (batch.medicine && typeof batch.medicine === 'object') ? batch.medicine : {};
  const medId = batch.medicine_id || batch.item_id || batch.med_id || medObj.id || medObj.medicine_id || medObj._id || batch._id || batch.uuid;
  
  const medName = 
    medObj.brand_name || 
    medObj.name || 
    medObj.brand || 
    medObj.brandName ||
    medObj.item_name ||
    (typeof batch.medicine === 'string' ? batch.medicine : null) ||
    (typeof batch.item === 'string' ? batch.item : null) ||
    batch.item?.brand_name ||
    batch.item?.name ||
    batch.brand_name || 
    batch.medicine_name || 
    batch.medicine_brand ||
    batch.medicine_brand_name ||
    batch.item_brand_name ||
    batch.item_name || 
    batch.name || 
    (medId ? medLookup[medId]?.brand : null) || 
    "Unknown Medicine";

  const genericName = medObj.generic_name || medObj.generic || batch.generic_name || batch.generic || (medId ? medLookup[medId]?.generic : null);
  return (
    <View className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 shadow-sm">
      <View className="flex-row items-center">
        <View className={`w-12 h-12 rounded-2xl ${isLow ? 'bg-rose-50' : 'bg-indigo-50'} items-center justify-center`}>
          <MaterialCommunityIcons name="package-variant-closed" size={24} color={isLow ? "#ef4444" : "#4f46e5"} />
        </View>
        <View className="flex-1 ml-4">
          <Text className="text-slate-900 font-black text-sm" numberOfLines={1}>
            {medName}
          </Text>
          {genericName && (
            <Text className="text-slate-500 font-bold text-[9px] -mt-0.5" numberOfLines={1}>
              {genericName}
            </Text>
          )}
          <Text className="text-slate-400 font-bold text-[10px] uppercase tracking-tighter mt-1">
            Batch: {batch.batch_no}
          </Text>
        </View>
        <View className="items-end">
          <Text className={`text-xl font-black ${isLow ? 'text-rose-600' : 'text-slate-900'}`}>
            {batch.qty_on_hand}
          </Text>
          <Text className="text-slate-400 text-[8px] font-bold uppercase tracking-widest">In Stock</Text>
        </View>
      </View>

      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-slate-50">
        <View className="flex-row items-center">
          <Ionicons name="calendar-outline" size={12} color="#94a3b8" />
          <Text className="text-slate-400 text-[10px] font-bold ml-1 uppercase">
            Exp: {new Date(batch.expiry_date).toLocaleDateString([], { month: 'short', year: 'numeric' })}
          </Text>
        </View>
        {isLow && (
          <View className="bg-rose-100 px-2 py-0.5 rounded-lg flex-row items-center">
            <Ionicons name="alert-circle" size={10} color="#ef4444" />
            <Text className="text-rose-700 font-black text-[8px] uppercase ml-1">Low Stock Alert</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const FormInput = ({ label, value, onChangeText, placeholder, keyboardType = "default", flex = 1 }) => (
  <View style={{ flex }} className="mb-3">
    <Text className="text-slate-500 font-black text-[9px] uppercase tracking-widest mb-1 ml-1">{label}</Text>
    <TextInput
      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold text-xs"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
    />
  </View>
);

export default function PharmacyStock({ navigation, route }) {
  const [batches, setBatches] = useState([]);
  const [medLookup, setMedLookup] = useState({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [lowStockOnly, setLowStockOnly] = useState(false);

  // Modals
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Supporting Data for Modal
  const [medicines, setMedicines] = useState([]);
  const [modalBatches, setModalBatches] = useState([]);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  // Adjustment Form State
  const [adjustment, setAdjustment] = useState({
    medicine_id: "",
    batch_id: "",
    qty_change: "1",
    type: "ADD",
    reason: "MANUAL_CORRECTION",
    notes: ""
  });

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const [stockData, medsData] = await Promise.all([
        pharmacyApi.getStockBatches('', lowStockOnly),
        pharmacyApi.getMedicines(0, 1000)
      ]);

      const rawBatches = stockData.batches || stockData.items || stockData.data || (Array.isArray(stockData) ? stockData : []);
      const rawMeds = medsData.medicines || medsData.items || medsData.data || (Array.isArray(medsData) ? medsData : []);
      
      const lookup = {};
      rawMeds.forEach(m => {
        const id = m.id || m._id || m.medicine_id || m.uuid;
        if (id) {
          lookup[id] = {
            brand: m.brand_name || m.name || m.item_name,
            generic: m.generic_name || m.generic
          };
        }
      });
      
      setMedLookup(lookup);
      setBatches(rawBatches);
      setMedicines(rawMeds);
    } catch (error) {
      console.error("[Stock] Fetch error:", error);
      Alert.alert("Error", "Failed to load stock data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lowStockOnly]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAdjustModal = async () => {
    setIsAdjustModalOpen(true);
    setAdjustment({
      medicine_id: "",
      batch_id: "",
      qty_change: "1",
      type: "ADD",
      reason: "MANUAL_CORRECTION",
      notes: ""
    });

    // Pre-fetch medicines list
    try {
      const data = await pharmacyApi.getMedicines(0, 100);
      setMedicines(data.medicines || data.items || (Array.isArray(data) ? data : []));
    } catch (e) { }
  };

  const handleMedicineSelect = async (mId) => {
    setAdjustment(prev => ({ ...prev, medicine_id: mId, batch_id: "" }));
    setIsBatchLoading(true);
    try {
      const data = await pharmacyApi.getStockBatches(mId, false);
      setModalBatches(data.batches || []);
    } catch (e) {
      setModalBatches([]);
    } finally {
      setIsBatchLoading(false);
    }
  };

  const handleApplyAdjustment = async () => {
    if (!adjustment.medicine_id) {
      Alert.alert("Validation", "Please select a medicine.");
      return;
    }
    const qty = parseInt(adjustment.qty_change);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert("Validation", "Please enter a valid quantity.");
      return;
    }

    setIsActionLoading(true);
    try {
      await pharmacyApi.createStockAdjustment({
        medicine_id: adjustment.medicine_id,
        batch_id: adjustment.batch_id || null,
        qty_change: adjustment.type === 'ADD' ? qty : -qty,
        reason: adjustment.reason,
        notes: adjustment.notes || null
      });
      Alert.alert("Success", "Stock adjusted successfully.");
      setIsAdjustModalOpen(false);
      fetchData();
    } catch (error) {
      Alert.alert("Error", error.message || "Adjustment failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <PharmacyLayout navigation={navigation} route={route}>
      <View className="flex-1 bg-[#F8FAFC]">
        {/* Header */}
        <View className="p-6 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">
              Warehouse
            </Text>
            <Text className="text-slate-500 font-medium mt-1">
              Live Inventory & Batches
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleOpenAdjustModal}
            className="bg-indigo-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
          >
            <Ionicons name="options-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>


        {/* Filters */}
        <View className="px-6 pb-4">
          <View className="flex-row gap-2 items-center mb-4">
                <View className="flex-1 bg-white border border-slate-200 rounded-3xl px-4 py-3 flex-row items-center shadow-sm">
                    <Ionicons name="search" size={18} color="#94a3b8" />
                    <TextInput
                        className="flex-1 ml-3 text-slate-700 font-bold"
                        placeholder="Search medicines or batch..."
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
                <TouchableOpacity 
                    onPress={() => setLowStockOnly(!lowStockOnly)}
                    className={`w-12 h-12 rounded-3xl items-center justify-center border shadow-sm ${lowStockOnly ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}
                >
                    <Ionicons name="alert-circle" size={24} color={lowStockOnly ? "#ef4444" : "#94a3b8"} />
                </TouchableOpacity>
          </View>
        </View>

        {/* List Content */}
        <View className="flex-1 px-4">
          {loading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
            </View>
          ) : (
            <FlatList
              data={batches.filter(b => {
                const searchLower = search.toLowerCase();
                
                const medObj = (b.medicine && typeof b.medicine === 'object') ? b.medicine : {};
                const medId = b.medicine_id || b.item_id || b.med_id || medObj.id || medObj.medicine_id || b._id || b.uuid;
                
                const name = (
                  medObj.brand_name || 
                  medObj.name || 
                  medObj.brand || 
                  medObj.item_name ||
                  (typeof b.medicine === 'string' ? b.medicine : null) ||
                  (typeof b.item === 'string' ? b.item : null) ||
                  b.item?.brand_name ||
                  b.brand_name || 
                  b.medicine_name || 
                  b.medicine_brand ||
                  b.item_name || 
                  b.name || 
                  (medId ? medLookup[medId]?.brand : "") || 
                  ""
                ).toLowerCase();

                const generic = (medObj.generic_name || medObj.generic || b.generic_name || b.generic || (medId ? medLookup[medId]?.generic : "") || "").toLowerCase();
                const batch = (b.batch_no || "").toLowerCase();
                return name.includes(searchLower) || generic.includes(searchLower) || batch.includes(searchLower);
              })}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <StockItem batch={item} medLookup={medLookup} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
              }
              ListEmptyComponent={
                <View className="py-20 items-center justify-center">
                  <Ionicons name="layers-outline" size={60} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">No records in this category</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Adjustment Modal */}
        <Modal
          visible={isAdjustModalOpen}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsAdjustModalOpen(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-white rounded-t-[40px] p-6 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-black text-slate-900">Manual Stock Entry</Text>
                <TouchableOpacity onPress={() => setIsAdjustModalOpen(false)}>
                  <Ionicons name="close-circle" size={28} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} className="space-y-4">
                <View>
                  <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2 ml-1">Select Medicine</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                    {medicines.map(m => (
                      <TouchableOpacity
                        key={m.id}
                        onPress={() => handleMedicineSelect(m.id)}
                        style={{ backgroundColor: adjustment.medicine_id === m.id ? "#4f46e5" : "white" }}
                        className="px-4 py-2 rounded-2xl mr-2 border border-slate-100 shadow-sm"
                      >
                        <Text style={{ color: adjustment.medicine_id === m.id ? "white" : "#64748b" }} className="text-[10px] font-bold">
                          {m.brand_name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                {adjustment.medicine_id && (
                  <View>
                    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2 ml-1">Target Batch (FIFO by default)</Text>
                    {isBatchLoading ? <ActivityIndicator size="small" color="#4f46e5" /> : (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row mb-4">
                        <TouchableOpacity
                          onPress={() => setAdjustment({ ...adjustment, batch_id: "" })}
                          style={{ backgroundColor: adjustment.batch_id === "" ? "#10b981" : "white" }}
                          className="px-4 py-2 rounded-2xl mr-2 border border-slate-100 shadow-sm"
                        >
                          <Text style={{ color: adjustment.batch_id === "" ? "white" : "#64748b" }} className="text-[10px] font-bold">Auto-Select</Text>
                        </TouchableOpacity>
                        {modalBatches.map(b => (
                          <TouchableOpacity
                            key={b.id}
                            onPress={() => setAdjustment({ ...adjustment, batch_id: b.id })}
                            style={{ backgroundColor: adjustment.batch_id === b.id ? "#10b981" : "white" }}
                            className="px-4 py-2 rounded-2xl mr-2 border border-slate-100 shadow-sm"
                          >
                            <Text style={{ color: adjustment.batch_id === b.id ? "white" : "#64748b" }} className="text-[10px] font-bold">
                              {b.batch_no} (Qty: {b.qty_on_hand})
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                )}

                <View className="flex-row gap-4">
                  <View className="flex-1">
                    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2 ml-1">Type</Text>
                    <View className="flex-row bg-slate-100 p-1 rounded-2xl">
                      <TouchableOpacity
                        onPress={() => setAdjustment({ ...adjustment, type: 'ADD' })}
                        className={`flex-1 py-2 items-center rounded-xl ${adjustment.type === 'ADD' ? 'bg-white shadow-sm' : ''}`}
                      >
                        <Text className={`text-[10px] font-black uppercase ${adjustment.type === 'ADD' ? 'text-emerald-600' : 'text-slate-400'}`}>Gain</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setAdjustment({ ...adjustment, type: 'SUB' })}
                        className={`flex-1 py-2 items-center rounded-xl ${adjustment.type === 'SUB' ? 'bg-white shadow-sm' : ''}`}
                      >
                        <Text className={`text-[10px] font-black uppercase ${adjustment.type === 'SUB' ? 'text-rose-600' : 'text-slate-400'}`}>Loss</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <FormInput
                    label="Quantity"
                    value={adjustment.qty_change}
                    onChangeText={(t) => setAdjustment({ ...adjustment, qty_change: t })}
                    keyboardType="numeric"
                  />
                </View>

                <View>
                  <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1.5 ml-1">Reason for Adjustment</Text>
                  <View className="flex-row flex-wrap gap-2">
                    {["MANUAL_CORRECTION", "STOCK_TAKE", "DAMAGED", "EXPIRED", "RETURN"].map(r => (
                      <TouchableOpacity
                        key={r}
                        onPress={() => setAdjustment({ ...adjustment, reason: r })}
                        className={`px-3 py-2 rounded-xl border ${adjustment.reason === r ? 'bg-slate-800 border-slate-800' : 'bg-white border-slate-100'}`}
                      >
                        <Text className={`text-[10px] font-bold ${adjustment.reason === r ? 'text-white' : 'text-slate-600'}`}>{r.replace('_', ' ')}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <FormInput
                  label="Internal Notes"
                  value={adjustment.notes}
                  onChangeText={(t) => setAdjustment({ ...adjustment, notes: t })}
                  placeholder="Additional context..."
                  multiline
                />

                <TouchableOpacity
                  onPress={handleApplyAdjustment}
                  disabled={isActionLoading}
                  className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-100 mt-4 mb-10"
                >
                  <Text className="text-white font-black uppercase tracking-widest text-xs">
                    {isActionLoading ? "Processing..." : "Commit Stock Changes"}
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </PharmacyLayout>
  );
}
