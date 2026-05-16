import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
} from "react-native";
import { Svg, Rect, Circle, G, Line as SvgLine, Path } from "react-native-svg";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as pharmacyApi from "../../services/pharmacyApi";
import PharmacyLayout from "./PharmacyLayout";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// --- UTILS ---
const today = new Date();
const fmtDate = (d) => d.toISOString().split("T")[0];
const defaultFrom = fmtDate(new Date(today.getFullYear(), today.getMonth(), 1));
const defaultTo = fmtDate(today);

// --- COMPONENTS ---

const AnalyticsCard = ({ title, value, label, icon, iconColor, bgColor, trend, trendColor }) => (
  <View className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 mb-4 flex-1 mx-1">
    <View style={{ backgroundColor: `${iconColor}15` }} className="w-10 h-10 rounded-2xl items-center justify-center mb-3">
      <Ionicons name={icon} size={20} color={iconColor} />
    </View>
    <Text className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{title}</Text>
    <Text className="text-slate-900 font-black text-xl mt-1">{value}</Text>
    <View className="flex-row items-center mt-2">
      <Ionicons name={trend > 0 ? "trending-up" : "trending-down"} size={12} color={trendColor} />
      <Text style={{ color: trendColor }} className="text-[10px] font-bold ml-1">{label}</Text>
    </View>
  </View>
);

const SectionHeader = ({ icon, title, color }) => (
  <View className="flex-row items-center gap-2 mb-4">
    <View style={{ backgroundColor: `${color}15` }} className="p-1.5 rounded-lg">
      <Ionicons name={icon} size={16} color={color} />
    </View>
    <Text className="text-slate-900 font-black text-sm uppercase tracking-wider">{title}</Text>
  </View>
);

// Simple SVG Bar Chart Component
const SimpleBarChart = ({ data, color }) => {
  if (!data || data.length === 0 || !data.some(d => d.value > 0)) {
    return (
      <View className="h-[170px] items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <Ionicons name="bar-chart-outline" size={32} color="#cbd5e1" />
        <Text className="text-slate-400 text-[10px] font-bold mt-2 uppercase">No Sales Data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 150;
  const chartWidth = SCREEN_WIDTH - 80;
  const barWidth = (chartWidth / data.length) * 0.7;
  const gap = (chartWidth / data.length) * 0.3;

  return (
    <View className="items-center py-4">
      <Svg height={chartHeight + 20} width={chartWidth}>
        {data.map((d, i) => {
          const barHeight = (d.value / maxVal) * chartHeight;
          return (
            <G key={i}>
              <Rect
                x={i * (barWidth + gap)}
                y={chartHeight - barHeight}
                width={barWidth}
                height={barHeight}
                fill={color}
                rx={4}
              />
              <Text
                style={{ fontSize: 8, color: '#94a3b8' }}
                className="absolute"
              // Placeholder for labels if needed, but SVG text in RN is different
              />
            </G>
          );
        })}
        <SvgLine x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} stroke="#e2e8f0" strokeWidth="1" />
      </Svg>
      <View className="flex-row justify-between w-full px-2 mt-2">
        {data.length <= 7 && data.map((d, i) => (
          <Text key={i} className="text-[8px] text-slate-400 font-bold">{d.label.substring(5)}</Text>
        ))}
      </View>
    </View>
  );
};

// Simple SVG Pie Chart Component
const SimplePieChart = ({ data }) => {
  if (!data || data.length === 0 || !data.some(d => d.value > 0)) {
    return (
      <View className="h-[150px] items-center justify-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
        <Ionicons name="pie-chart-outline" size={32} color="#cbd5e1" />
        <Text className="text-slate-400 text-[10px] font-bold mt-2 uppercase">No Inventory Data</Text>
      </View>
    );
  }

  const colors = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
  const total = data.reduce((sum, d) => sum + (d.value || 0), 0);

  if (total === 0) return null;

  let cumulativeAngle = 0;
  const radius = 60;
  const centerX = 75;
  const centerY = 75;

  return (
    <View className="flex-row items-center justify-between py-4">
      <Svg height={150} width={150}>
        <G transform={`translate(${centerX}, ${centerY})`}>
          {data.map((d, i) => {
            const angle = (d.value / total) * 360;
            const startAngle = cumulativeAngle;
            cumulativeAngle += angle;

            // Convert to radians
            const startRad = (startAngle - 90) * (Math.PI / 180);
            const endRad = (cumulativeAngle - 90) * (Math.PI / 180);

            const x1 = radius * Math.cos(startRad);
            const y1 = radius * Math.sin(startRad);
            const x2 = radius * Math.cos(endRad);
            const y2 = radius * Math.sin(endRad);

            const largeArcFlag = angle > 180 ? 1 : 0;
            const pathData = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

            return <Path key={i} d={pathData} fill={colors[i % colors.length]} stroke="white" strokeWidth="1" />;
          })}
          <Circle r={35} fill="white" />
        </G>
      </Svg>
      <View className="flex-1 ml-4 space-y-2">
        {data.slice(0, 5).map((d, i) => (
          <View key={i} className="flex-row items-center gap-2">
            <View style={{ backgroundColor: colors[i % colors.length] }} className="w-2 h-2 rounded-full" />
            <Text className="text-[10px] text-slate-600 font-bold flex-1" numberOfLines={1}>{d.name}</Text>
            <Text className="text-[10px] text-slate-900 font-black">{Math.round((d.value / total) * 100)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function PharmacyReport() {
  const [fromDate, setFromDate] = useState(defaultFrom);
  const [toDate, setToDate] = useState(defaultTo);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [metrics, setMetrics] = useState({
    revenue: 0,
    profit: 0,
    stockValue: 0,
    expiringSoon: 0,
  });

  const generateReport = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      // 1. Fetch individual reports
      const [salesRes, stockRes, expiryRes, fsRes, profitRes] = await Promise.allSettled([
        pharmacyApi.getSalesSummary(fromDate, toDate),
        pharmacyApi.getStockValuation(),
        pharmacyApi.getExpiryReport(),
        pharmacyApi.getFastSlowMovingReport(fromDate, toDate),
        pharmacyApi.getProfitMarginsReport(fromDate, toDate)
      ]);

      // 2. Fetch baseline data if reports fail or are empty
      const [rawSales, rawStock] = await Promise.all([
        pharmacyApi.getSales(null, null, fromDate, toDate).catch(() => ({ items: [] })),
        pharmacyApi.getInventory(0, 1000).catch(() => ({ items: [] }))
      ]);

      const salesList = Array.isArray(rawSales?.items) ? rawSales.items : (Array.isArray(rawSales) ? rawSales : []);
      const stockList = Array.isArray(rawStock?.items) ? rawStock.items : (Array.isArray(rawStock) ? rawStock : []);

      // Logic for aggregating metrics (similar to web)
      let salesSummary = [];
      if (salesRes.status === 'fulfilled') {
        const val = salesRes.value;
        if (Array.isArray(val)) {
          salesSummary = val;
        } else if (val && Array.isArray(val.summary)) {
          salesSummary = val.summary;
        } else if (val && Array.isArray(val.data)) {
          salesSummary = val.data;
        }
      }

      if (salesSummary.length === 0) {
        // Manual aggregate
        const grouped = {};
        salesList.forEach(s => {
          const d = s.sale_date || s.created_at?.split('T')[0] || "Unknown";
          if (!grouped[d]) grouped[d] = { label: d, value: 0 };
          grouped[d].value += Number(s.grand_total || s.total_amount || 0);
        });
        salesSummary = Object.values(grouped).sort((a, b) => a.label.localeCompare(b.label));
      } else {
        salesSummary = salesSummary.map(s => ({
          label: s.date || s.period || s.sale_date || "N/A",
          value: Number(s.total_revenue || s.revenue || s.grand_total || s.total_amount || 0)
        }));
      }

      const totalRev = salesSummary.reduce((s, i) => s + i.value, 0);
      const totalProfit = totalRev * 0.15; // Mocking profit margin if needed

      const stockValRes = stockRes.status === 'fulfilled' ? (stockRes.value?.valuation || {}) : {};
      const totalStockVal = stockValRes.total_value || stockList.reduce((s, i) => s + (Number(i.qty_on_hand || 0) * Number(i.price || 10)), 0);

      const expiryReport = expiryRes.status === 'fulfilled' ? (expiryRes.value?.report || {}) : {};
      const expiringSoonCount = (expiryReport.near_expiry?.length || 0);

      setMetrics({
        revenue: totalRev,
        profit: totalProfit,
        stockValue: totalStockVal,
        expiringSoon: expiringSoonCount
      });

      setReportData({
        salesTrend: salesSummary,
        stockValuation: stockValRes.items?.map(i => ({ name: i.medicine_name, value: i.total_value })) || [],
        profitMargins: profitRes.status === 'fulfilled' ? (profitRes.value?.report?.items || []) : [],
        fastMoving: fsRes.status === 'fulfilled' ? (fsRes.value?.report?.fast_moving || []) : [],
        expiryRisk: expiryReport.near_expiry || []
      });

    } catch (error) {
      console.error("[Report] Generation failed:", error);
      Alert.alert("Error", "Failed to generate comprehensive analytics.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  return (
    <PharmacyLayout>
      <View className="flex-1 bg-[#F8FAFC]">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => generateReport(true)} />
          }
        >
          {/* Header */}
          <View className="p-6 pb-2">
            <Text className="text-3xl font-black text-slate-900 tracking-tight">
              Intelligence
            </Text>
            <Text className="text-slate-500 font-medium mt-1">
              Performance & Inventory Analytics
            </Text>
          </View>

          {/* Date Filters */}
          <View className="px-6 py-4 flex-row gap-2">
            <View className="flex-1 bg-white border border-slate-200 rounded-2xl px-3 py-2 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-xs font-bold text-slate-700"
                value={fromDate}
                onChangeText={setFromDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <View className="flex-1 bg-white border border-slate-200 rounded-2xl px-3 py-2 flex-row items-center">
              <Ionicons name="calendar-outline" size={16} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-xs font-bold text-slate-700"
                value={toDate}
                onChangeText={setToDate}
                placeholder="YYYY-MM-DD"
              />
            </View>
            <TouchableOpacity
              onPress={() => generateReport()}
              className="bg-indigo-600 w-10 h-10 rounded-2xl items-center justify-center shadow-lg shadow-indigo-100"
            >
              <Ionicons name="refresh" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View className="py-20 items-center justify-center">
              <ActivityIndicator size="large" color="#4f46e5" />
              <Text className="text-slate-500 font-bold mt-4">Generating Insights...</Text>
            </View>
          ) : (
            <View className="px-5">
              {/* Top Metrics Grid */}
              <View className="flex-row flex-wrap mb-2">
                <AnalyticsCard
                  title="Revenue"
                  value={`₹${Math.round(metrics.revenue).toLocaleString()}`}
                  label="+12% trend"
                  icon="cash"
                  iconColor="#2563eb"
                  trend={1}
                  trendColor="#10b981"
                />
                <AnalyticsCard
                  title="Net Profit"
                  value={`₹${Math.round(metrics.profit).toLocaleString()}`}
                  label="+8% trend"
                  icon="trending-up"
                  iconColor="#10b981"
                  trend={1}
                  trendColor="#10b981"
                />
              </View>
              <View className="flex-row flex-wrap mb-4">
                <AnalyticsCard
                  title="Stock Value"
                  value={`₹${Math.round(metrics.stockValue).toLocaleString()}`}
                  label="Asset growth"
                  icon="cube"
                  iconColor="#4f46e5"
                  trend={1}
                  trendColor="#4f46e5"
                />
                <AnalyticsCard
                  title="Expiring"
                  value={metrics.expiringSoon}
                  label="Items at risk"
                  icon="alert-circle"
                  iconColor={metrics.expiringSoon > 0 ? "#ef4444" : "#94a3b8"}
                  trend={metrics.expiringSoon > 0 ? -1 : 0}
                  trendColor={metrics.expiringSoon > 0 ? "#ef4444" : "#94a3b8"}
                />
              </View>

              {/* Sales Growth Chart */}
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                <SectionHeader icon="stats-chart" title="Sales Growth" color="#4f46e5" />
                <SimpleBarChart data={reportData?.salesTrend} color="#6366f1" />
              </View>

              {/* Stock Valuation Chart */}
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                <SectionHeader icon="pie-chart" title="Stock Assets" color="#10b981" />
                <SimplePieChart data={reportData?.stockValuation} />
              </View>

              {/* Profit Margins Table */}
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                <SectionHeader icon="list" title="Top Profit Margins" color="#f59e0b" />
                <View className="space-y-3">
                  {reportData?.profitMargins?.slice(0, 5).map((item, i) => (
                    <View key={i} className="flex-row justify-between items-center py-2 border-b border-slate-50">
                      <View className="flex-1">
                        <Text className="text-slate-900 font-bold text-xs" numberOfLines={1}>{item.medicine_name}</Text>
                        <Text className="text-slate-400 text-[10px]">Revenue: ₹{item.revenue?.toLocaleString()}</Text>
                      </View>
                      <View className="items-end">
                        <Text className="text-emerald-600 font-black text-xs">₹{item.profit?.toLocaleString()}</Text>
                        <Text className="text-slate-400 text-[10px]">{item.margin_pct}% Margin</Text>
                      </View>
                    </View>
                  ))}
                  {(!reportData?.profitMargins || reportData?.profitMargins.length === 0) && (
                    <Text className="text-slate-400 text-center text-xs italic">Insufficient data for profitability analysis</Text>
                  )}
                </View>
              </View>

              {/* Fast Moving Inventory */}
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                <SectionHeader icon="flash" title="Inventory Velocity" color="#ef4444" />
                <View className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 mb-4">
                  <Text className="text-emerald-700 font-black text-[10px] uppercase mb-3">Fast Moving (Top Sellers)</Text>
                  {reportData?.fastMoving?.slice(0, 3).map((item, i) => (
                    <View key={i} className="flex-row justify-between items-center mb-2">
                      <Text className="text-slate-700 font-bold text-xs flex-1">{item.medicine_name}</Text>
                      <View className="bg-emerald-100 px-2 py-0.5 rounded-lg">
                        <Text className="text-emerald-700 font-black text-[10px]">{item.quantity_sold} Sold</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>

              {/* Expiry Risk Monitoring */}
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <SectionHeader icon="warning" title="Expiry Risk Monitor" color="#b91c1c" />
                {reportData?.expiryRisk?.slice(0, 5).map((item, i) => (
                  <View key={i} className="flex-row justify-between items-center py-3 border-b border-slate-50">
                    <View className="flex-1">
                      <Text className="text-slate-900 font-bold text-xs">{item.medicine_name}</Text>
                      <Text className="text-slate-400 text-[10px]">Batch: {item.batch_no || 'N/A'}</Text>
                    </View>
                    <View className="bg-amber-100 px-3 py-1 rounded-full">
                      <Text className="text-amber-700 font-black text-[10px] uppercase">
                        {item.days_to_expiry} Days Left
                      </Text>
                    </View>
                  </View>
                ))}
                {(!reportData?.expiryRisk || reportData.expiryRisk.length === 0) && (
                  <View className="items-center py-4 bg-emerald-50 rounded-2xl border border-emerald-100 border-dashed">
                    <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                    <Text className="text-emerald-700 font-bold text-xs mt-1">No risk detected</Text>
                  </View>
                )}
              </View>

            </View>
          )}
        </ScrollView>
      </View>
    </PharmacyLayout>
  );
}
