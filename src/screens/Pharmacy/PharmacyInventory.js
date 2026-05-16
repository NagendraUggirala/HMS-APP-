import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- COMPONENTS ---

const StatusBadge = ({ status }) => {
  const getStyles = () => {
    switch (status) {
      case 'In Stock': return { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: 'checkmark-circle' };
      case 'Low Stock': return { bg: 'bg-amber-100', text: 'text-amber-700', icon: 'alert-circle' };
      case 'Out of Stock': return { bg: 'bg-rose-100', text: 'text-rose-700', icon: 'close-circle' };
      default: return { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'help-circle' };
    }
  };

  const styles = getStyles();
  return (
    <View className={`${styles.bg} px-2.5 py-1 rounded-full flex-row items-center`}>
      <Ionicons name={styles.icon} size={12} color={styles.text.replace('text-', '') === 'emerald-700' ? '#059669' : styles.text.replace('text-', '') === 'amber-700' ? '#b45309' : '#e11d48'} />
      <Text className={`${styles.text} text-[10px] font-black uppercase ml-1`}>{status}</Text>
    </View>
  );
};

const InventoryItem = ({ item }) => (
  <View className="bg-white p-4 rounded-[32px] mb-3 border border-slate-100 shadow-sm">
    <View className="flex-row items-center mb-3">
      <View className="w-12 h-12 rounded-2xl bg-indigo-50 items-center justify-center">
        <MaterialCommunityIcons name="pill" size={24} color="#4f46e5" />
      </View>
      <View className="flex-1 ml-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text className="text-slate-900 font-black text-sm" numberOfLines={1}>
              {item.name}
            </Text>
            <Text className="text-slate-400 font-mono text-[10px] uppercase mt-0.5">
              {item.code}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      </View>
    </View>

    <View className="flex-row items-center justify-between pt-3 border-t border-slate-50">
      <View>
        <Text className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Category</Text>
        <View className="bg-slate-100 px-2 py-0.5 rounded-lg mt-1 self-start">
          <Text className="text-slate-600 font-bold text-[9px] uppercase">{item.category}</Text>
        </View>
      </View>
      <View className="items-center">
        <Text className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Stock</Text>
        <Text className={`text-sm font-black mt-0.5 ${item.stock <= 10 ? 'text-rose-600' : 'text-slate-900'}`}>
          {item.stock}
        </Text>
      </View>
      <View className="items-end">
        <Text className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Price</Text>
        <Text className="text-sm font-black text-indigo-600 mt-0.5">₹{item.price}</Text>
      </View>
    </View>
  </View>
);

export default function PharmacyInventory({ navigation, route }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventoryRaw, setInventoryRaw] = useState([]);
  const [masterMedicines, setMasterMedicines] = useState([]);

  const categories = ["All", "Antibiotic", "Analgesic", "Hypertension", "Antihistamine", "Diabetes"];

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setIsLoading(true);

    try {
      // Fetch Master Data & Inventory in parallel
      const [medData, invData] = await Promise.all([
        pharmacyApi.getMedicines(0, 1000),
        pharmacyApi.getInventory(0, 500)
      ]);

      // Process Master Data
      const masterItems = Array.isArray(medData) ? medData : (medData?.medicines || medData?.items || medData?.data || []);
      setMasterMedicines(masterItems.map(m => ({
        ...m,
        id: m.id || m._id,
        displayName: m.brand_name || m.name || m.item_name || "Unknown"
      })));

      // Process Inventory Data
      const invItems = Array.isArray(invData) ? invData : (invData?.items || invData?.data || []);
      setInventoryRaw(invItems);
    } catch (error) {
      console.error("[Inventory] Fetch error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formattedInventory = useMemo(() => {
    return inventoryRaw.map(item => {
      const mId = item.medicine_id || item.id || item._id;
      const master = masterMedicines.find(m => m.id === mId);
      
      const stock = item.stock !== undefined ? item.stock : (item.quantity_in_stock !== undefined ? item.quantity_in_stock : 0);
      
      return {
        id: mId,
        name: item.medicine_name || item.brand_name || item.name || item.item_name || master?.displayName || '-',
        code: item.code || item.item_code || master?.sku || (mId ? String(mId).slice(-8).toUpperCase() : 'N/A'),
        category: item.category || master?.category || 'General',
        stock: stock,
        price: item.price !== undefined ? item.price : (item.unit_price !== undefined ? item.unit_price : 0),
        status: stock <= 10 ? (stock === 0 ? "Out of Stock" : "Low Stock") : "In Stock"
      };
    });
  }, [inventoryRaw, masterMedicines]);

  const filteredInventory = useMemo(() => {
    return formattedInventory.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || 
                           m.code.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === "All" || m.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [formattedInventory, search, activeCategory]);

  return (
    <PharmacyLayout navigation={navigation} route={route}>
      <View className="flex-1 bg-[#F8FAFC]">
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />}
        >
          {/* Header */}
          <View className="p-6 pb-2">
            <Text className="text-3xl font-black text-slate-900 tracking-tight">Inventory</Text>
            <Text className="text-slate-500 font-medium mt-1">Real-time stock levels & availability</Text>
          </View>

          {/* Search & Filters */}
          <View className="px-6 py-4">
            <View className="bg-white border border-slate-200 rounded-3xl px-4 py-3 flex-row items-center shadow-sm mb-4">
              <Ionicons name="search" size={20} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-slate-700 font-bold"
                placeholder="Search medicine name or code..."
                value={search}
                onChangeText={setSearch}
                placeholderTextColor="#94a3b8"
              />
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setActiveCategory(cat)}
                  style={{ backgroundColor: activeCategory === cat ? "#4f46e5" : "white" }}
                  className={`px-4 py-2 rounded-2xl mr-2 border ${activeCategory === cat ? 'border-indigo-600' : 'border-slate-100'} shadow-sm`}
                >
                  <Text style={{ color: activeCategory === cat ? "white" : "#64748b" }} className="text-[10px] font-black uppercase tracking-widest">
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Content */}
          <View className="px-6 mb-10">
            {isLoading ? (
              <View className="py-20 items-center justify-center">
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text className="text-slate-400 font-bold mt-4">Fetching real-time stock...</Text>
              </View>
            ) : filteredInventory.length === 0 ? (
              <View className="py-20 items-center justify-center">
                <MaterialCommunityIcons name="pill-off" size={60} color="#cbd5e1" />
                <Text className="text-slate-400 font-bold mt-4">No medicine found in inventory</Text>
              </View>
            ) : (
              filteredInventory.map((item) => (
                <InventoryItem key={item.id} item={item} />
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </PharmacyLayout>
  );
}
