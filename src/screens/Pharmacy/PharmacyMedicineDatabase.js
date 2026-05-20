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
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const MedicineItem = ({ medicine, onPress, onEdit, onDelete }) => (
  <TouchableOpacity
    onPress={() => onPress(medicine)}
    className="bg-white p-4 rounded-3xl mb-3 border border-slate-100 shadow-sm flex-row items-center"
  >
    <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center">
      <MaterialCommunityIcons name="pill" size={24} color="#4f46e5" />
    </View>
    <View className="flex-1 ml-4">
      <View className="flex-row items-center justify-between">
        <Text className="text-slate-900 font-black text-sm" numberOfLines={1}>
          {medicine.brand_name}
        </Text>
        {medicine.requires_prescription && (
          <View className="bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">
            <Text className="text-rose-600 font-black text-[8px] uppercase tracking-tighter">RX</Text>
          </View>
        )}
      </View>
      <Text className="text-slate-500 font-bold text-[10px] italic" numberOfLines={1}>
        {medicine.generic_name}
      </Text>
      <View className="flex-row items-center mt-2 gap-2">
        <View className="bg-slate-100 px-2 py-0.5 rounded-lg">
          <Text className="text-slate-500 font-bold text-[9px] uppercase tracking-widest">
            {medicine.category || "General"}
          </Text>
        </View>
        <Text className="text-slate-400 text-[9px] font-medium" numberOfLines={1}>
          • {medicine.manufacturer || "Unknown Mfg"}
        </Text>
      </View>
    </View>
    <View className="ml-2 flex-row gap-2">
      <TouchableOpacity onPress={() => onEdit(medicine)} className="p-1">
        <Ionicons name="pencil" size={16} color="#10b981" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onDelete(medicine)} className="p-1">
        <Ionicons name="trash-outline" size={16} color="#ef4444" />
      </TouchableOpacity>
    </View>
  </TouchableOpacity>
);

const FormInput = ({ label, value, onChangeText, placeholder, multiline = false, disabled = false }) => (
  <View className="mb-4">
    <Text className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1.5 ml-1">
      {label}
    </Text>
    <TextInput
      className={`bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-900 font-bold ${multiline ? 'min-h-[80px]' : ''} ${disabled ? 'opacity-50' : ''}`}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      textAlignVertical={multiline ? "top" : "center"}
      editable={!disabled}
    />
  </View>
);

export default function PharmacyMedicineDatabase() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState("add"); // add | edit | view
  const [selectedId, setSelectedId] = useState(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    generic_name: "",
    brand_name: "",
    dosage_form: "Tablet",
    strength: "",
    manufacturer: "",
    category: "",
    drug_class: "",
    route: "",
    composition: "",
    pack_size: "",
    reorder_level: "10",
    requires_prescription: false,
  });

  const fetchMedicines = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const data = await pharmacyApi.getMedicines(0, 100, search, category);
      const items = data.medicines || data.items || data.data || (Array.isArray(data) ? data : []);
      setMedicines(items);
    } catch (error) {
      console.error("[MedicineDB] Fetch error:", error);
      Alert.alert("Error", "Failed to load medicine database.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [search, category]);

  useEffect(() => {
    fetchMedicines();
  }, [category]); // We don't trigger on search immediately to avoid excessive calls; user can press enter or refresh button

  const handleOpenModal = async (mode, medicine = null) => {
    setMode(mode);
    setSelectedId(medicine?.id || null);

    if (medicine && (mode === 'view' || mode === 'edit')) {
      setIsActionLoading(true);
      setIsModalOpen(true);
      try {
        const data = await pharmacyApi.getMedicine(medicine.id);
        const med = data.medicine || data;
        setFormData({
          generic_name: med.generic_name || "",
          brand_name: med.brand_name || "",
          dosage_form: med.dosage_form || "Tablet",
          strength: med.strength || "",
          manufacturer: med.manufacturer || "",
          category: med.category || "",
          drug_class: med.drug_class || "",
          route: med.route || "",
          composition: med.composition || "",
          pack_size: String(med.pack_size || ""),
          reorder_level: String(med.reorder_level || 10),
          requires_prescription: med.requires_prescription || false,
        });
      } catch (error) {
        Alert.alert("Error", "Failed to load medicine details.");
        setIsModalOpen(false);
      } finally {
        setIsActionLoading(false);
      }
    } else {
      setFormData({
        generic_name: "",
        brand_name: "",
        dosage_form: "Tablet",
        strength: "",
        manufacturer: "",
        category: "",
        drug_class: "",
        route: "",
        composition: "",
        pack_size: "",
        reorder_level: "10",
        requires_prescription: false,
      });
      setIsModalOpen(true);
    }
  };

  const handleSave = async () => {
    if (!formData.generic_name.trim() || !formData.brand_name.trim()) {
      Alert.alert("Validation", "Generic and Brand names are required.");
      return;
    }

    setIsActionLoading(true);
    try {
      const payload = {
        ...formData,
        pack_size: formData.pack_size ? parseInt(formData.pack_size) : null,
        reorder_level: formData.reorder_level ? parseInt(formData.reorder_level) : 10,
      };

      if (mode === 'add') {
        await pharmacyApi.createMedicine(payload);
        Alert.alert("Success", "Medicine added to database.");
      } else {
        await pharmacyApi.updateMedicine(selectedId, payload);
        Alert.alert("Success", "Medicine updated successfully.");
      }
      setIsModalOpen(false);
      fetchMedicines();
    } catch (error) {
      Alert.alert("Error", error.message || "Operation failed.");
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDelete = (medicine) => {
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to remove ${medicine.brand_name} from the database?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await pharmacyApi.deleteMedicine(medicine.id);
              fetchMedicines();
            } catch (error) {
              Alert.alert("Error", "Failed to delete medicine.");
            }
          }
        }
      ]
    );
  };

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        {/* Header */}
        <View className="p-6 pb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-3xl font-black text-slate-900 tracking-tight">
              Medicines
            </Text>
            <Text className="text-slate-500 font-medium mt-1">
              Central medicine standards database
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => handleOpenModal('add')}
            className="bg-indigo-600 w-12 h-12 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
          >
            <Ionicons name="add" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Search & Filters */}
        <View className="px-6 py-4 space-y-3">
          <View className="bg-white border border-slate-200 rounded-3xl px-4 py-3 flex-row items-center shadow-sm">
            <Ionicons name="search" size={20} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-700 font-bold"
              placeholder="Search generic or brand names..."
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={() => fetchMedicines()}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {["", "Antibiotic", "Analgesic", "Hypertension", "Antihistamine", "Diabetes"].map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{ backgroundColor: category === cat ? "#4f46e5" : "white" }}
                className={`px-4 py-2 rounded-2xl mr-2 border border-slate-100 shadow-sm`}
              >
                <Text style={{ color: category === cat ? "white" : "#64748b" }} className="text-[10px] font-black uppercase">
                  {cat || "All"}
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
              data={medicines}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <MedicineItem
                  medicine={item}
                  onPress={(m) => handleOpenModal('view', m)}
                  onEdit={(m) => handleOpenModal('edit', m)}
                  onDelete={(m) => handleDelete(m)}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={() => fetchMedicines(true)} />
              }
              ListEmptyComponent={
                <View className="py-20 items-center justify-center">
                  <Ionicons name="medical-outline" size={60} color="#cbd5e1" />
                  <Text className="text-slate-400 font-bold mt-4">No medicines found</Text>
                </View>
              }
            />
          )}
        </View>

        {/* Modal Form */}
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
                  {mode === 'add' ? 'New Medicine' : mode === 'edit' ? 'Edit Medicine' : 'Medicine Details'}
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
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <FormInput
                        label="Brand Name"
                        value={formData.brand_name}
                        onChangeText={(t) => setFormData({ ...formData, brand_name: t })}
                        placeholder="e.g. Panadol"
                        disabled={mode === 'view'}
                      />
                    </View>
                    <View className="flex-1">
                      <FormInput
                        label="Generic Name"
                        value={formData.generic_name}
                        onChangeText={(t) => setFormData({ ...formData, generic_name: t })}
                        placeholder="e.g. Paracetamol"
                        disabled={mode === 'view'}
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <FormInput
                        label="Manufacturer"
                        value={formData.manufacturer}
                        onChangeText={(t) => setFormData({ ...formData, manufacturer: t })}
                        placeholder="Mfg Name"
                        disabled={mode === 'view'}
                      />
                    </View>
                    <View className="flex-1">
                      <FormInput
                        label="Category"
                        value={formData.category}
                        onChangeText={(t) => setFormData({ ...formData, category: t })}
                        placeholder="e.g. Analgesic"
                        disabled={mode === 'view'}
                      />
                    </View>
                  </View>

                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <FormInput
                        label="Strength"
                        value={formData.strength}
                        onChangeText={(t) => setFormData({ ...formData, strength: t })}
                        placeholder="500mg"
                        disabled={mode === 'view'}
                      />
                    </View>
                    <View className="flex-1">
                      <FormInput
                        label="Dosage Form"
                        value={formData.dosage_form}
                        onChangeText={(t) => setFormData({ ...formData, dosage_form: t })}
                        placeholder="Tablet"
                        disabled={mode === 'view'}
                      />
                    </View>
                  </View>

                  <View className="bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-4">
                    <View className="flex-row justify-between items-center mb-4">
                      <View>
                        <Text className="text-slate-900 font-black text-sm">Requires RX</Text>
                        <Text className="text-slate-400 text-[10px]">Prescription control status</Text>
                      </View>
                      <Switch
                        value={formData.requires_prescription}
                        onValueChange={(v) => setFormData({ ...formData, requires_prescription: v })}
                        trackColor={{ false: "#e2e8f0", true: "#4f46e5" }}
                        disabled={mode === 'view'}
                      />
                    </View>

                    <FormInput
                      label="Composition / Salt"
                      value={formData.composition}
                      onChangeText={(t) => setFormData({ ...formData, composition: t })}
                      placeholder="Ingredients details..."
                      multiline
                      disabled={mode === 'view'}
                    />
                  </View>

                  {mode !== 'view' && (
                    <TouchableOpacity
                      onPress={handleSave}
                      className="bg-indigo-600 rounded-2xl py-4 items-center shadow-lg shadow-indigo-100 mt-2 mb-6"
                    >
                      <Text className="text-white font-black uppercase tracking-widest text-xs">
                        {mode === 'add' ? 'Save to Database' : 'Update Medicine'}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <View className="h-6" />
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </PharmacyLayout>
  );
}
