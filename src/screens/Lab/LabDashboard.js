import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Alert
} from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/api";
import LabLayout from "./LabLayout";

const { width } = Dimensions.get("window");

// Mock Dashboard data matching React Web schema perfectly
const mockDashboardData = {
  kpis: {
    total_tests: { value: 54, subtitle: "tests processed today", trend_percent: 18 },
    pending_tests: { value: 14, subtitle: "awaiting processing", trend_percent: -6 },
    completed_tests: { value: 38, subtitle: "reports generated", trend_percent: 14, completion_rate_percent: 70 },
    critical_results: { value: 2, subtitle: "needs immediate review", trend_percent: 25 }
  },
  alerts: [
    { message: "Hematology Analyzer X2 calibrator due in 2 hours" },
    { message: "Centrifuge 3 temperature warning detected" }
  ],
  pending_tests_table: [
    { id: "SMP-102", patient: "John Doe", test: "CBC", received: "10:15 AM", priority: "urgent", status: "PROCESSING" },
    { id: "SMP-104", patient: "Jane Smith", test: "Lipid Profile", received: "11:00 AM", priority: "routine", status: "PENDING" },
    { id: "SMP-108", patient: "David Miller", test: "Kidney Function", received: "11:30 AM", priority: "routine", status: "PENDING" }
  ],
  critical_results_table: [
    { id: "SMP-099", patient: "Robert Miller", test: "Potassium", value: "6.2 mmol/L", alert: "Critical High", notified: "No" },
    { id: "SMP-098", patient: "Sarah Connor", test: "Hemoglobin", value: "6.8 g/dL", alert: "Critical Low", notified: "Yes" }
  ],
  equipment_status: [
    { id: "EQ-HEM-01", name: "Hematology Analyzer X2", status: "Operational", nextMaintenance: "2026-06-01", location: "Room A" },
    { id: "EQ-BIO-03", name: "Biochemistry Auto-Analyzer", status: "Maintenance", nextMaintenance: "2026-05-20", location: "Room B" }
  ],
  qc_status_today: [
    { test: "Glucose Control Level 1", status: "Passed", value: "98 mg/dL", target: "100 mg/dL", time: "08:00 AM" },
    { test: "Glucose Control Level 2", status: "Passed", value: "295 mg/dL", target: "300 mg/dL", time: "08:00 AM" }
  ],
  test_categories: [
    { name: "Biochemistry", count: 18, color: "#4f46e5" },
    { name: "Hematology", count: 14, color: "#06b6d4" },
    { name: "Microbiology", count: 12, color: "#10b981" },
    { name: "Immunology", count: 6, color: "#f59e0b" },
    { name: "Urinalysis", count: 4, color: "#ef4444" }
  ],
  tests_by_workflow_status: {
    labels: ["PENDING", "PROCESSING", "TESTING", "VERIFYING", "READY", "CANCELLED"],
    values: [8, 12, 14, 6, 12, 2]
  },
  qc_trend: {
    min_acceptable: 90,
    max_acceptable: 110,
    unit: "mg/dL",
    within_range: 12,
    warnings: 1,
    failures: 0,
    points: [
      { label: "08:00", value: 98 },
      { label: "10:00", value: 102 },
      { label: "12:00", value: 95 },
      { label: "14:00", value: 104 },
      { label: "16:00", value: 101 }
    ]
  },
  equipment_performance: [
    { name: "EQ-HEM-01", efficiency: 98, downtime: 0 },
    { name: "EQ-BIO-03", efficiency: 85, downtime: 2.5 },
    { name: "EQ-IMM-02", efficiency: 92, downtime: 0.8 }
  ],
  weekly_test_trends: [
    { day: "Mon", tests: 40, critical: 1 },
    { day: "Tue", tests: 48, critical: 2 },
    { day: "Wed", tests: 45, critical: 0 },
    { day: "Thu", tests: 52, critical: 3 },
    { day: "Fri", tests: 54, critical: 2 }
  ],
  weekly_avg_tests_per_day: 47,
  weekly_change_percent: 12
};

const LabDashboardContent = ({ navigation }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const apiFetch = async (url) => {
    try {
      return await api.get(url);
    } catch (e) {
      throw e;
    }
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        setToken(storedToken);
      } catch (e) {
        console.warn("Auth token load error:", e);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    loadDashboardData(selectedDate);
  }, [selectedDate, token]);

  const loadDashboardData = async (date = selectedDate) => {
    setLoading(true);
    try {
      if (!token) {
        setDashboardData(mockDashboardData);
        setLoading(false);
        return;
      }
      const url = `/api/v1/lab/tech-dashboard?for_date=${encodeURIComponent(date)}`;
      const res = await apiFetch(url);
      const data = res?.data ?? res ?? {};
      setDashboardData(Object.keys(data).length > 0 ? data : mockDashboardData);
    } catch (error) {
      setDashboardData(mockDashboardData);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAction = (action) => {
    const screenNameMap = {
      "lab-dashboard": "LabDashboard",
      "critical-results": "CriticalResults",
      "test-registration": "TestRegistration",
      "sample-tracking": "SampleTracking",
      "report-generation": "ReportGeneration",
      "result-access": "ResultAccess",
      "test-catalogue": "TestCatalogue",
      "equipment-tracking": "EquipmentTracking",
      "quality-control": "QualityControl",
      "profile": "LabProfile",
      "raise-ticket": "LabRaiseTicket"
    };

    if (screenNameMap[action]) {
      navigation.navigate(screenNameMap[action]);
    } else {
      Alert.alert("Navigation", `Directing to module: ${action}`);
    }
  };

  // KPIs
  const totalTests = dashboardData?.kpis?.total_tests?.value ?? 0;
  const totalTestsSubtitle = dashboardData?.kpis?.total_tests?.subtitle ?? "tests processed today";
  const totalTestsTrend = dashboardData?.kpis?.total_tests?.trend_percent ?? 0;

  const pendingTestsCount = dashboardData?.kpis?.pending_tests?.value ?? 0;
  const pendingTestsSubtitle = dashboardData?.kpis?.pending_tests?.subtitle ?? "awaiting processing";
  const pendingTestsTrend = dashboardData?.kpis?.pending_tests?.trend_percent ?? 0;

  const completedTestsCount = dashboardData?.kpis?.completed_tests?.value ?? 0;
  const completedTestsSubtitle = dashboardData?.kpis?.completed_tests?.subtitle ?? "reports generated";
  const completedTestsTrend = dashboardData?.kpis?.completed_tests?.trend_percent ?? 0;

  const criticalResultsCount = dashboardData?.kpis?.critical_results?.value ?? 0;
  const criticalResultsSubtitle = dashboardData?.kpis?.critical_results?.subtitle ?? "needs immediate review";
  const criticalResultsTrend = dashboardData?.kpis?.critical_results?.trend_percent ?? 0;

  const completionPercentage = dashboardData?.kpis?.completed_tests?.completion_rate_percent ?? 
    (totalTests > 0 ? Math.round((completedTestsCount / totalTests) * 100) : 0);

  // Test category calculation
  const testCategoryData = useMemo(() => {
    const categories = dashboardData.test_categories || [];
    const defaultColors = ["#4f46e5", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    return categories.map((cat, index) => ({
      name: cat.name || cat.category || "Unknown",
      value: cat.value || cat.count || 0,
      color: cat.color || defaultColors[index % defaultColors.length]
    }));
  }, [dashboardData]);

  // Enhanced tests by status
  const testsByStatus = useMemo(() => {
    if (dashboardData.tests_by_workflow_status) {
      const labels = dashboardData.tests_by_workflow_status.labels || [];
      const values = dashboardData.tests_by_workflow_status.values || [];
      return labels.map((label, index) => {
        let color = "#ec4899";
        if (label === "Sample Collection" || label === "RECEIVED" || label === "PENDING") color = "#f97316";
        else if (label === "Sample Processing" || label === "PROCESSING") color = "#3b82f6";
        else if (label === "Testing" || label === "TESTING" || label === "IN_PROGRESS") color = "#8b5cf6";
        else if (label === "Culture In Progress" || label === "CULTURE") color = "#06b6d4";
        else if (label === "Analysis" || label === "ANALYSIS" || label === "VERIFYING") color = "#10b981";
        else if (label === "Completed" || label === "COMPLETED" || label === "READY") color = "#22c55e";
        else if (label === "CANCELLED") color = "#ef4444";
        return {
          status: label,
          count: values[index] || 0,
          color: color
        };
      });
    }
    return [];
  }, [dashboardData]);

  // QC Trend data
  const qcTrend = useMemo(() => {
    if (!dashboardData.qc_trend || !dashboardData.qc_trend.points) return [];
    return dashboardData.qc_trend.points.map(p => ({
      time: p.time || p.label,
      value: p.value
    }));
  }, [dashboardData]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text style={styles.loaderText}>Syncing operations console...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      
      {/* Header bar */}
      <View style={styles.header}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.title}>Laboratory Dashboard</Text>
          <Text style={styles.subtitle}>Real-time overview of lab operations and performance</Text>
        </View>
      </View>

      {/* Date Picker Bar & Action Buttons */}
      <View style={styles.dateAndActionsWrapper}>
        <View style={styles.datePickerContainer}>
          <Text style={styles.dateLabel}>Date: </Text>
          <TextInput
            style={styles.datePickerInput}
            value={selectedDate}
            onChangeText={setSelectedDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
        
        <View style={styles.topButtonsRow}>
          <TouchableOpacity 
            onClick={() => handleQuickAction("critical-results")} 
            style={styles.redButton}
            onPress={() => handleQuickAction("critical-results")}
          >
            <Ionicons name="flask" size={14} color="#dc2626" style={{ marginRight: 6 }} />
            <Text style={styles.redButtonText}>Critical Results</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onClick={() => handleQuickAction("report-generation")} 
            style={styles.blueButton}
            onPress={() => handleQuickAction("report-generation")}
          >
            <Ionicons name="document-text" size={14} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={styles.blueButtonText}>Lab Reports</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Lab Alerts Banner */}
      <View style={styles.alertBanner}>
        <View style={styles.alertHeader}>
          <View style={styles.alertIconBg}>
            <Ionicons name="warning" size={16} color="white" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>Lab Alerts</Text>
            <Text style={styles.alertMessage}>
              {dashboardData.alerts && dashboardData.alerts.length > 0
                ? dashboardData.alerts.map((a) => a.message || a).join(" • ")
                : "No new alerts"}
            </Text>
          </View>
          <TouchableOpacity onPress={() => handleQuickAction("equipment-tracking")}>
            <Text style={styles.alertLink}>View all →</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards with Beautiful Visualizations */}
      <View style={styles.statsGrid}>
        
        {/* Total Tests with Mini Bar Chart Visualization */}
        <TouchableOpacity 
          onPress={() => handleQuickAction("test-registration")}
          style={styles.kpiVisualCard}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.kpiIconWrapperBlue}>
              <Ionicons name="flask" size={18} color="white" />
            </View>
            <Text style={styles.kpiLabel}>Total Tests</Text>
            <Text style={styles.kpiValText}>{totalTests}</Text>
            <Text style={styles.kpiSubText}>{totalTestsSubtitle}</Text>
          </View>
          {/* Mini Bar Chart */}
          <View style={styles.miniBarChartWrapper}>
            {[7, 10, 8, 12, 9, 6, 11].map((h, i) => (
              <View 
                key={i} 
                style={[styles.miniBar, { height: h * 3, backgroundColor: "#3b82f6" }]} 
              />
            ))}
          </View>
          <View style={styles.trendBadgeBlue}>
            <Text style={styles.trendBadgeTextBlue}>{totalTestsTrend >= 0 ? `+${totalTestsTrend}%` : `${totalTestsTrend}%`}</Text>
          </View>
        </TouchableOpacity>

        {/* Pending Tests with Ticking Clock Visualization */}
        <TouchableOpacity 
          onPress={() => handleQuickAction("test-registration")}
          style={styles.kpiVisualCard}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.kpiIconWrapperYellow}>
              <Ionicons name="hourglass" size={18} color="white" />
            </View>
            <Text style={styles.kpiLabel}>Pending Tests</Text>
            <Text style={styles.kpiValText}>{pendingTestsCount}</Text>
            <Text style={styles.kpiSubText}>{pendingTestsSubtitle}</Text>
          </View>
          {/* Clock Visualization */}
          <View style={styles.miniClockWrapper}>
            <View style={styles.clockCircle}>
              <View style={styles.clockHourHand} />
              <View style={styles.clockMinuteHand} />
            </View>
          </View>
          <View style={styles.trendBadgeYellow}>
            <Text style={styles.trendBadgeTextYellow}>{pendingTestsTrend >= 0 ? `+${pendingTestsTrend}%` : `${pendingTestsTrend}%`}</Text>
          </View>
        </TouchableOpacity>

        {/* Completed Tests with SVG circular progress simulation */}
        <TouchableOpacity 
          onPress={() => handleQuickAction("report-generation")}
          style={styles.kpiVisualCard}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.kpiIconWrapperGreen}>
              <Ionicons name="checkmark-circle" size={18} color="white" />
            </View>
            <Text style={styles.kpiLabel}>Completed Tests</Text>
            <Text style={styles.kpiValText}>{completedTestsCount}</Text>
            <Text style={styles.kpiSubText}>{completedTestsSubtitle}</Text>
          </View>
          {/* Circular Progress Circle */}
          <View style={styles.miniProgressCircle}>
            <Text style={styles.progressCircleText}>{completionPercentage}%</Text>
          </View>
          <View style={styles.trendBadgeGreen}>
            <Text style={styles.trendBadgeTextGreen}>{completedTestsTrend >= 0 ? `+${completedTestsTrend}%` : `${completedTestsTrend}%`}</Text>
          </View>
        </TouchableOpacity>

        {/* Critical Results with Warning Triangle Visualization */}
        <TouchableOpacity 
          onPress={() => handleQuickAction("critical-results")}
          style={styles.kpiVisualCard}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.kpiIconWrapperRed}>
              <Ionicons name="exclamation" size={18} color="white" />
            </View>
            <Text style={styles.kpiLabel}>Critical Results</Text>
            <Text style={[styles.kpiValText, { color: "#ef4444" }]}>{criticalResultsCount}</Text>
            <Text style={styles.kpiSubText}>{criticalResultsSubtitle}</Text>
          </View>
          {/* Warning Triangle */}
          <View style={styles.miniTriangleWrapper}>
            <View style={styles.warningTriangle}>
              <Text style={styles.warningExclamation}>!</Text>
            </View>
          </View>
          <View style={styles.trendBadgeRed}>
            <Text style={styles.trendBadgeTextRed}>{criticalResultsTrend >= 0 ? `+${criticalResultsTrend}%` : `${criticalResultsTrend}%`}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Test Volume Over Time Visual Graph */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <View className="flex-row items-center">
            <View style={styles.graphIconBgPurple}>
              <Ionicons name="stats-chart" size={16} color="#7c3aed" />
            </View>
            <View>
              <Text style={styles.graphCardTitle}>Test Volume Over Time</Text>
              <Text style={styles.graphCardSubtitle}>Today's test progression</Text>
            </View>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-row items-center">
              <View style={[styles.legendDot, { backgroundColor: "#3b82f6" }]} />
              <Text style={{ fontSize: 9, color: "#64748b" }}>Received</Text>
            </View>
            <View className="flex-row items-center">
              <View style={[styles.legendDot, { backgroundColor: "#10b981" }]} />
              <Text style={{ fontSize: 9, color: "#64748b" }}>Completed</Text>
            </View>
          </View>
        </View>

        {/* Visual Line/Bar progression yard */}
        <View style={styles.volumeBarYard}>
          <View style={styles.barYardGridLines}>
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
            <View style={styles.gridLine} />
          </View>
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: "100%", zIndex: 10 }}>
            {[
              { hour: "08:00", tests: 8, completed: 4 },
              { hour: "10:00", tests: 12, completed: 8 },
              { hour: "12:00", tests: 15, completed: 12 },
              { hour: "14:00", tests: 10, completed: 9 },
              { hour: "16:00", tests: 9, completed: 5 }
            ].map((p, i) => (
              <View key={i} style={{ alignItems: "center", flex: 1 }}>
                <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 3, marginBottom: 4 }}>
                  <View style={{ width: 8, height: p.tests * 8, backgroundColor: "#3b82f6", borderRadius: 2 }} />
                  <View style={{ width: 8, height: p.completed * 8, backgroundColor: "#10b981", borderRadius: 2 }} />
                </View>
                <Text style={{ fontSize: 9, color: "#64748b", fontWeight: "700" }}>{p.hour}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Test Categories Distribution Donut Chart Simulation */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <View className="flex-row items-center">
            <View style={styles.graphIconBgBlue}>
              <Ionicons name="pie-chart" size={16} color="#2563eb" />
            </View>
            <View>
              <Text style={styles.graphCardTitle}>Test Categories Distribution</Text>
              <Text style={styles.graphCardSubtitle}>Today's test breakdown</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.graphCardValueText}>{totalTests}</Text>
            <Text style={{ fontSize: 8, color: "#64748b" }}>Total Tests</Text>
          </View>
        </View>

        {/* Visual Segmented Proportion Bar representing Donut Chart segments */}
        <View style={styles.segmentedProportionBar}>
          {testCategoryData.map((item, index) => {
            const pct = totalTests > 0 ? (item.value / totalTests) * 100 : 0;
            if (pct === 0) return null;
            return (
              <View 
                key={index} 
                style={{ width: `${pct}%`, backgroundColor: item.color, height: "100%" }} 
              />
            );
          })}
        </View>

        {/* Legends Breakdown Grid */}
        <View style={styles.categoriesBreakdownGrid}>
          {testCategoryData.map((item, index) => {
            const pct = totalTests > 0 ? Math.round((item.value / totalTests) * 100) : 0;
            return (
              <View key={index} style={styles.categoryLegendRow}>
                <View className="flex-row items-center">
                  <View style={[styles.legendDotSquare, { backgroundColor: item.color }]} />
                  <Text style={styles.legendLabelText}>{item.name}</Text>
                </View>
                <Text style={styles.legendValueText}>{item.value} ({pct}%)</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Tests by Status Bar Graph */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <View className="flex-row items-center">
            <View style={styles.graphIconBgGreen}>
              <Ionicons name="list" size={16} color="#10b981" />
            </View>
            <View>
              <Text style={styles.graphCardTitle}>Tests by Status</Text>
              <Text style={styles.graphCardSubtitle}>Current processing status</Text>
            </View>
          </View>
          <TouchableOpacity onPress={() => handleQuickAction("test-registration")}>
            <Text style={styles.graphActionText}>View Details →</Text>
          </TouchableOpacity>
        </View>

        {/* Status Vertical Bar Chart */}
        <View style={styles.statusBarsWrapper}>
          {testsByStatus.map((item, index) => {
            const maxVal = Math.max(...testsByStatus.map(t => t.count), 1);
            const barHeightPct = (item.count / maxVal) * 100;
            return (
              <View key={index} style={styles.statusBarColumn}>
                <View style={{ flex: 1, justifyContent: "flex-end", width: "100%", alignItems: "center" }}>
                  <Text style={{ fontSize: 9, fontWeight: "950", color: item.color, marginBottom: 2 }}>{item.count}</Text>
                  <View style={[styles.statusBarFill, { height: `${barHeightPct}%`, backgroundColor: item.color }]} />
                </View>
                <Text numberOfLines={1} style={styles.statusBarLabelText}>{item.status}</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* QC Trend Area Graph */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <View className="flex-row items-center">
            <View style={styles.graphIconBgCyan}>
              <Ionicons name="analytics" size={16} color="#06b6d4" />
            </View>
            <View>
              <Text style={styles.graphCardTitle}>QC Trend Analysis</Text>
              <Text style={styles.graphCardSubtitle}>Glucose QC performance</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 8, color: "#64748b" }}>Acceptable Range</Text>
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#1e293b" }}>
              {dashboardData.qc_trend?.min_acceptable ?? 90}-{dashboardData.qc_trend?.max_acceptable ?? 110} {dashboardData.qc_trend?.unit ?? "mg/dL"}
            </Text>
          </View>
        </View>

        {/* Interactive QC Points chart */}
        <View style={styles.qcPointsYard}>
          {/* Target limit lines */}
          <View style={styles.qcTargetDashedLine} />
          
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", height: "100%", zIndex: 10 }}>
            {(dashboardData.qc_trend?.points ?? []).map((p, idx) => {
              const val = p.value ?? 100;
              // Normalize value height inside acceptable range (domain: 80 - 120)
              const heightPct = Math.min(Math.max(((val - 80) / 40) * 100, 5), 95);
              return (
                <View key={idx} style={{ flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" }}>
                  <Text style={{ fontSize: 8, fontWeight: "900", color: "#06b6d4", marginBottom: 2 }}>{val}</Text>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#06b6d4", marginBottom: `${heightPct}%` }} />
                  <Text style={{ fontSize: 9, color: "#64748b", fontWeight: "750" }}>{p.time || p.label}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* QC status boxes */}
        <View style={styles.qcStatusBoxesRow}>
          <View style={styles.qcBoxGreen}>
            <Text style={styles.qcBoxValGreen}>{dashboardData.qc_trend?.within_range ?? 0}</Text>
            <Text style={styles.qcBoxLblGreen}>Within Range</Text>
          </View>
          <View style={styles.qcBoxYellow}>
            <Text style={styles.qcBoxValYellow}>{dashboardData.qc_trend?.warnings ?? 0}</Text>
            <Text style={styles.qcBoxLblYellow}>Warnings</Text>
          </View>
          <View style={styles.qcBoxRed}>
            <Text style={styles.qcBoxValRed}>{dashboardData.qc_trend?.failures ?? 0}</Text>
            <Text style={styles.qcBoxLblRed}>Failures</Text>
          </View>
        </View>
      </View>

      {/* Equipment Performance Graph */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <View className="flex-row items-center">
            <View style={styles.graphIconBgIndigo}>
              <Ionicons name="construct" size={16} color="#4f46e5" />
            </View>
            <View>
              <Text style={styles.graphCardTitle}>Equipment Performance</Text>
              <Text style={styles.graphCardSubtitle}>Efficiency vs Downtime</Text>
            </View>
          </View>
        </View>

        {/* Custom Efficiency Chart progress */}
        <View style={{ paddingVertical: 8 }}>
          {(dashboardData.equipment_performance ?? []).map((eq, i) => (
            <View key={i} style={{ marginBottom: 12 }}>
              <View className="flex-row justify-between items-center mb-1">
                <Text style={{ fontSize: 11, fontWeight: "850", color: "#1e293b" }}>{eq.name}</Text>
                <Text style={{ fontSize: 10, fontWeight: "900", color: "#4f46e5" }}>
                  Eff: {eq.efficiency}% • Downtime: {eq.downtime} hrs
                </Text>
              </View>
              <View style={styles.progressBarWrapper}>
                <View style={[styles.progressBarFillGreen, { width: `${eq.efficiency}%` }]} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Weekly Test Trends Graph */}
      <View style={styles.graphCard}>
        <View style={styles.graphHeader}>
          <View className="flex-row items-center">
            <View style={styles.graphIconBgViolet}>
              <Ionicons name="trending-up" size={16} color="#8b5cf6" />
            </View>
            <View>
              <Text style={styles.graphCardTitle}>Weekly Test Trends</Text>
              <Text style={styles.graphCardSubtitle}>Last 5 days comparison</Text>
            </View>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontSize: 10, fontWeight: "900", color: "#8b5cf6" }}>Avg: {dashboardData.weekly_avg_tests_per_day ?? 0} tests/day</Text>
            <Text style={{ fontSize: 8, color: "#64748b" }}>{dashboardData.weekly_change_percent >= 0 ? "+" : ""}{dashboardData.weekly_change_percent ?? 0}% from last week</Text>
          </View>
        </View>

        {/* Weekly Trend bars */}
        <View style={{ height: 140, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginTop: 10 }}>
          {(dashboardData.weekly_test_trends ?? []).map((t, i) => {
            const maxTests = Math.max(...(dashboardData.weekly_test_trends ?? []).map(x => x.tests), 1);
            const testHeight = (t.tests / maxTests) * 100;
            return (
              <View key={i} style={{ alignItems: "center", flex: 1 }}>
                <View style={{ flex: 1, justifyContent: "flex-end", alignItems: "center", width: "100%" }}>
                  <Text style={{ fontSize: 8, fontWeight: "900", color: "#8b5cf6", marginBottom: 2 }}>{t.tests}</Text>
                  <View style={{ width: 14, height: `${testHeight}%`, backgroundColor: "#8b5cf6", borderRadius: 4 }} />
                </View>
                <Text style={{ fontSize: 10, color: "#64748b", fontWeight: "750", marginTop: 4 }}>{t.day}</Text>
              </View>
            );
          })}
        </View>
      </View>

 

      {/* Pending Tests DataTable Deck */}
      <View style={styles.sectionContainer}>
        <View className="flex-row justify-between items-center mb-3">
          <Text style={styles.sectionTitle}>Pending Tests</Text>
          <TouchableOpacity onPress={() => handleQuickAction("test-registration")}>
            <Text style={styles.sectionLink}>View All →</Text>
          </TouchableOpacity>
        </View>
        
        {dashboardData.pending_tests_table && dashboardData.pending_tests_table.length > 0 ? (
          dashboardData.pending_tests_table.map((row, idx) => (
            <TouchableOpacity 
              key={row.id || `pending-${idx}`} 
              onPress={() => Alert.alert("Test clicked", `Viewing test: ${row.id} - ${row.test}`)}
              style={styles.recordRow}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.recordPrimary}>{row.patient}</Text>
                <Text style={styles.recordSecondary}>ID: {row.id} • {row.test} • Received: {row.received}</Text>
              </View>
              <View style={{ alignItems: "end" }}>
                <View className={`px-2 py-0.5 rounded-full mb-1.5 ${
                  row.priority === "urgent" ? "bg-rose-50 border border-rose-100" : "bg-slate-100 border border-slate-200"
                }`}>
                  <Text className={`text-[9px] font-black uppercase ${
                    row.priority === "urgent" ? "text-rose-600" : "text-slate-500"
                  }`}>{row.priority}</Text>
                </View>
                <Text style={{ fontSize: 9, fontWeight: "900", color: "#64748b" }}>{row.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No pending tests booked.</Text>
          </View>
        )}
      </View>

      {/* Critical Alerts Deck */}
      <View style={styles.sectionContainer}>
        <View className="flex-row justify-between items-center mb-3">
          <Text style={styles.sectionTitle}>Critical Results</Text>
          <TouchableOpacity onPress={() => handleQuickAction("critical-results")}>
            <Text style={[styles.sectionLink, { color: "#ef4444" }]}>View All →</Text>
          </TouchableOpacity>
        </View>
        
        {dashboardData.critical_results_table && dashboardData.critical_results_table.length > 0 ? (
          dashboardData.critical_results_table.map((row, idx) => (
            <TouchableOpacity 
              key={row.id || `critical-${idx}`} 
              onPress={() => Alert.alert("Critical Result clicked", `Critical Result: ${row.test} for ${row.patient}\nValue: ${row.value}`)}
              style={[styles.recordRow, { borderLeftColor: "#ef4444", borderLeftWidth: 4 }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.recordPrimary, { color: "#ef4444" }]}>{row.patient}</Text>
                <Text style={styles.recordSecondary}>ID: {row.id} • {row.test} • Value: <Text style={{ fontWeight: "900", color: "#ef4444" }}>{row.value}</Text></Text>
              </View>
              <View style={{ alignItems: "end" }}>
                <View className="bg-rose-100 px-2.5 py-0.5 rounded-full mb-1">
                  <Text className="text-rose-700 text-[8px] font-black uppercase">{row.alert}</Text>
                </View>
                <Text style={styles.recordSecondary}>Notified: {row.notified}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No critical results reported today.</Text>
          </View>
        )}
      </View>

      {/* Equipment Status Log */}
      <View style={styles.sectionContainer}>
        <View className="flex-row justify-between items-center mb-3">
          <Text style={styles.sectionTitle}>Equipment Status</Text>
          <TouchableOpacity onPress={() => handleQuickAction("equipment-tracking")}>
            <Text style={styles.sectionLink}>Manage →</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.equipment_status && dashboardData.equipment_status.length > 0 ? (
          dashboardData.equipment_status.map((row, idx) => (
            <TouchableOpacity 
              key={row.id || `equipment-${idx}`} 
              style={styles.recordRow}
              onPress={() => Alert.alert("Equipment clicked", `Equipment: ${row.name}\nStatus: ${row.status}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.recordPrimary}>{row.name}</Text>
                <Text style={styles.recordSecondary}>ID: {row.id} • Location: {row.location} • Next: {row.nextMaintenance}</Text>
              </View>
              <View className={`px-2.5 py-1 rounded-full ${
                row.status === "Operational" ? "bg-emerald-50 border border-emerald-100" : "bg-amber-50 border border-amber-100"
              }`}>
                <Text className={`text-[9px] font-black uppercase ${
                  row.status === "Operational" ? "text-emerald-600" : "text-amber-600"
                }`}>{row.status}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No telemetry information logged.</Text>
          </View>
        )}
      </View>

      {/* Quality Control Telemetry */}
      <View style={[styles.sectionContainer, { marginBottom: 40 }]}>
        <View className="flex-row justify-between items-center mb-3">
          <Text style={styles.sectionTitle}>QC Status Today</Text>
          <TouchableOpacity onPress={() => handleQuickAction("quality-control")}>
            <Text style={styles.sectionLink}>View All →</Text>
          </TouchableOpacity>
        </View>

        {dashboardData.qc_status_today && dashboardData.qc_status_today.length > 0 ? (
          dashboardData.qc_status_today.map((row, idx) => (
            <View key={idx} style={styles.recordRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.recordPrimary}>{row.test}</Text>
                <Text style={styles.recordSecondary}>Target: {row.target} • Value: {row.value} • Time: {row.time}</Text>
              </View>
              <View className="bg-emerald-100 px-2.5 py-0.5 rounded-full">
                <Text className="text-emerald-700 text-[8px] font-black uppercase">{row.status}</Text>
              </View>
            </View>
          ))
        ) : (
          <View style={styles.emptyView}>
            <Text style={styles.emptyText}>No QC data submitted today.</Text>
          </View>
        )}
      </View>


      {/* Quick Actions Matrix Section */}
      <View style={styles.actionsBoxContainer}>
        <Text style={styles.sectionHeaderTitle}>Quick Actions</Text>
        <View style={styles.actionGridContainer}>
          
          <TouchableOpacity onPress={() => handleQuickAction("test-registration")} style={styles.primaryActionBtn}>
            <View style={styles.primaryActionIconBgBlue}>
              <FontAwesome5 name="vial" size={18} color="#2563eb" />
            </View>
            <Text style={styles.primaryActionHeading}>Register Test</Text>
            <Text style={styles.primaryActionSub}>New test registration</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleQuickAction("sample-tracking")} style={styles.primaryActionBtn}>
            <View style={styles.primaryActionIconBgGreen}>
              <FontAwesome5 name="qrcode" size={18} color="#10b981" />
            </View>
            <Text style={styles.primaryActionHeading}>Track Sample</Text>
            <Text style={styles.primaryActionSub}>Scan & track samples</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleQuickAction("report-generation")} style={styles.primaryActionBtn}>
            <View style={styles.primaryActionIconBgYellow}>
              <FontAwesome5 name="file-medical" size={18} color="#f59e0b" />
            </View>
            <Text style={styles.primaryActionHeading}>Generate Report</Text>
            <Text style={styles.primaryActionSub}>Create lab reports</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleQuickAction("quality-control")} style={styles.primaryActionBtn}>
            <View style={styles.primaryActionIconBgPurple}>
              <FontAwesome5 name="chart-line" size={18} color="#7c3aed" />
            </View>
            <Text style={styles.primaryActionHeading}>QC Entry</Text>
            <Text style={styles.primaryActionSub}>Record QC results</Text>
          </TouchableOpacity>
        </View>

        {/* Secondary Buttons Row - perfect 2 by 2 */}
        <View style={styles.secondaryActionsWrapper}>
          <TouchableOpacity onPress={() => handleQuickAction("test-catalogue")} style={styles.secActionButton}>
            <FontAwesome5 name="book-medical" size={12} color="#2563eb" style={{ marginRight: 6 }} />
            <Text style={styles.secActionText}>Test Catalogue</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => handleQuickAction("equipment-tracking")} style={styles.secActionButton}>
            <FontAwesome5 name="microscope" size={12} color="#10b981" style={{ marginRight: 6 }} />
            <Text style={styles.secActionText}>Equipment</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => handleQuickAction("result-access")} style={styles.secActionButton}>
            <FontAwesome5 name="shield-alt" size={12} color="#7c3aed" style={{ marginRight: 6 }} />
            <Text style={styles.secActionText}>Result Access</Text>
          </TouchableOpacity>

          {/* Symmetrical placeholder card to align 3-item grid in perfect 2 by 2 */}
          <View style={[styles.secActionButton, { borderColor: "transparent", backgroundColor: "transparent" }]} />
        </View>
      </View>
    </ScrollView>
  );
};

export default function LabDashboard({ navigation }) {
  return (
    <LabLayout>
      <LabDashboardContent navigation={navigation} />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 16,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#1e293b",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
    fontWeight: "500",
  },
  dateAndActionsWrapper: {
    marginBottom: 20,
  },
  datePickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 11,
    fontWeight: "750",
    color: "#475569",
  },
  datePickerInput: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
    flex: 1,
  },
  topButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  redButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    flex: 1,
    justifyContent: "center",
  },
  redButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#dc2626",
  },
  blueButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    flex: 1,
    justifyContent: "center",
  },
  blueButtonText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#2563eb",
  },
  alertBanner: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fef3c7",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  alertHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  alertIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f59e0b",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  alertTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#b45309",
    textTransform: "uppercase",
  },
  alertMessage: {
    fontSize: 11,
    color: "#d97706",
    marginTop: 1,
    fontWeight: "600",
  },
  alertLink: {
    fontSize: 11,
    fontWeight: "850",
    color: "#b45309",
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  kpiVisualCard: {
    width: "48%",
    backgroundColor: "white",
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 8,
    elevation: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    position: "relative",
    overflow: "hidden",
  },
  kpiIconWrapperBlue: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#3b82f6", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  kpiIconWrapperYellow: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#eab308", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  kpiIconWrapperGreen: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#10b981", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  kpiIconWrapperRed: { width: 34, height: 34, borderRadius: 10, backgroundColor: "#ef4444", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  kpiLabel: { fontSize: 11, fontWeight: "750", color: "#64748b", textTransform: "uppercase" },
  kpiValText: { fontSize: 24, fontWeight: "900", color: "#1e293b", marginVertical: 2 },
  kpiSubText: { fontSize: 9, color: "#94a3b8", fontWeight: "600" },
  
  miniBarChartWrapper: { flexDirection: "row", alignItems: "flex-end", gap: 2.5, height: 40, marginLeft: 6 },
  miniBar: { width: 3.5, borderRadius: 1.5 },
  
  miniClockWrapper: { width: 38, height: 38, alignItems: "center", justifyContent: "center", marginLeft: 6 },
  clockCircle: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: "#eab308", alignItems: "center", justifyContent: "center" },
  clockHourHand: { width: 2, height: 8, backgroundColor: "#eab308", position: "absolute", top: 8 },
  clockMinuteHand: { width: 8, height: 2, backgroundColor: "#eab308", position: "absolute", left: 16 },
  
  miniProgressCircle: { width: 38, height: 38, borderRadius: 19, borderWidth: 3.5, borderColor: "#10b981", alignItems: "center", justifyContent: "center", marginLeft: 6 },
  progressCircleText: { fontSize: 9, fontWeight: "950", color: "#10b981" },
  
  miniTriangleWrapper: { width: 38, height: 38, alignItems: "center", justifyContent: "center", marginLeft: 6 },
  warningTriangle: { width: 0, height: 0, borderLeftWidth: 16, borderRightWidth: 16, borderBottomWidth: 28, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: "#fee2e2", alignItems: "center", justifyContent: "center" },
  warningExclamation: { position: "absolute", top: 6, fontSize: 14, fontWeight: "950", color: "#ef4444" },
  
  trendBadgeBlue: { position: "absolute", top: 12, right: 12, backgroundColor: "#eff6ff", paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6 },
  trendBadgeTextBlue: { color: "#3b82f6", fontSize: 8, fontWeight: "900" },
  trendBadgeYellow: { position: "absolute", top: 12, right: 12, backgroundColor: "#fefbeb", paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6 },
  trendBadgeTextYellow: { color: "#eab308", fontSize: 8, fontWeight: "900" },
  trendBadgeGreen: { position: "absolute", top: 12, right: 12, backgroundColor: "#ecfdf5", paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6 },
  trendBadgeTextGreen: { color: "#10b981", fontSize: 8, fontWeight: "900" },
  trendBadgeRed: { position: "absolute", top: 12, right: 12, backgroundColor: "#fff5f5", paddingHorizontal: 6, paddingVertical: 1.5, borderRadius: 6 },
  trendBadgeTextRed: { color: "#ef4444", fontSize: 8, fontWeight: "900" },
  
  graphCard: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  graphHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  graphIconBgPurple: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#f5f3ff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  graphIconBgBlue: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  graphIconBgGreen: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 10 },
  graphIconBgCyan: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#ecfeff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  graphIconBgIndigo: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#e0e7ff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  graphIconBgViolet: { width: 32, height: 32, borderRadius: 8, backgroundColor: "#f5f3ff", alignItems: "center", justifyContent: "center", marginRight: 10 },
  
  graphCardTitle: { fontSize: 14, fontWeight: "900", color: "#1e293b" },
  graphCardSubtitle: { fontSize: 10, color: "#64748b", fontWeight: "500", marginTop: 1 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 4 },
  
  volumeBarYard: { height: 140, justifyContent: "flex-end", position: "relative", paddingBottom: 6 },
  barYardGridLines: { position: "absolute", inset: 0, justifyContent: "space-between", paddingBottom: 22 },
  gridLine: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  
  segmentedProportionBar: { height: 16, flexDirection: "row", borderRadius: 8, overflow: "hidden", marginVertical: 14 },
  graphCardValueText: { fontSize: 16, fontWeight: "900", color: "#1e293b" },
  
  categoriesBreakdownGrid: { gap: 10 },
  categoryLegendRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 2 },
  legendDotSquare: { width: 10, height: 10, borderRadius: 3, marginRight: 8 },
  legendLabelText: { fontSize: 12, fontWeight: "800", color: "#475569" },
  legendValueText: { fontSize: 12, fontWeight: "900", color: "#1e293b" },
  
  graphActionText: { fontSize: 11, fontWeight: "850", color: "#10b981" },
  statusBarsWrapper: { height: 140, flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 12 },
  statusBarColumn: { flex: 1, alignItems: "center", height: "100%", justifyContent: "flex-end" },
  statusBarFill: { width: 14, borderRadius: 4 },
  statusBarLabelText: { fontSize: 8, color: "#64748b", fontWeight: "750", marginTop: 4 },
  
  qcPointsYard: { height: 140, justifyContent: "flex-end", position: "relative", paddingBottom: 6 },
  qcTargetDashedLine: { position: "absolute", left: 0, right: 0, top: "50%", borderStyle: "dashed", borderBottomWidth: 1.5, borderBottomColor: "#ef4444", zIndex: 1 },
  qcStatusBoxesRow: { flexDirection: "row", justifyContent: "space-between", gap: 10, marginTop: 16 },
  qcBoxGreen: { flex: 1, padding: 10, backgroundColor: "#f0fdf4", borderWidth: 1, borderColor: "#bbf7d0", borderRadius: 12, alignItems: "center" },
  qcBoxValGreen: { fontSize: 16, fontWeight: "950", color: "#15803d" },
  qcBoxLblGreen: { fontSize: 8, fontWeight: "850", color: "#166534", marginTop: 1 },
  qcBoxYellow: { flex: 1, padding: 10, backgroundColor: "#fffbeb", borderWidth: 1, borderColor: "#fde68a", borderRadius: 12, alignItems: "center" },
  qcBoxValYellow: { fontSize: 16, fontWeight: "950", color: "#b45309" },
  qcBoxLblYellow: { fontSize: 8, fontWeight: "850", color: "#92400e", marginTop: 1 },
  qcBoxRed: { flex: 1, padding: 10, backgroundColor: "#fef2f2", borderWidth: 1, borderColor: "#fecaca", borderRadius: 12, alignItems: "center" },
  qcBoxValRed: { fontSize: 16, fontWeight: "950", color: "#b91c1c" },
  qcBoxLblRed: { fontSize: 8, fontWeight: "850", color: "#991b1b", marginTop: 1 },
  
  progressBarWrapper: { height: 6, backgroundColor: "#f1f5f9", borderRadius: 3, overflow: "hidden" },
  progressBarFillGreen: { height: "100%", backgroundColor: "#10b981", borderRadius: 3 },
  
  actionsBoxContainer: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionHeaderTitle: { fontSize: 14, fontWeight: "900", color: "#1e293b", marginBottom: 16 },
  actionGridContainer: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10 },
  primaryActionBtn: {
    width: "48%",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    marginBottom: 4,
  },
  primaryActionIconBgBlue: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  primaryActionIconBgGreen: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  primaryActionIconBgYellow: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#fefbeb", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  primaryActionIconBgPurple: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#f5f3ff", alignItems: "center", justifyContent: "center", marginBottom: 10 },
  
  primaryActionHeading: { fontSize: 12, fontWeight: "850", color: "#1e293b" },
  primaryActionSub: { fontSize: 9, color: "#94a3b8", fontWeight: "600", marginTop: 2 },
  
  secondaryActionsWrapper: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 10, marginTop: 14 },
  secActionButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 38,
    width: "48%",
    justifyContent: "center",
    marginBottom: 6,
  },
  secActionText: { fontSize: 10, fontWeight: "800", color: "#475569" },
  
  sectionContainer: {
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.02)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "900",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionLink: {
    fontSize: 11,
    fontWeight: "800",
    color: "#4f46e5",
  },
  recordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  recordPrimary: {
    fontSize: 13,
    fontWeight: "750",
    color: "#1e293b",
  },
  recordSecondary: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "600",
    marginTop: 2,
  },
  emptyView: {
    paddingVertical: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },
  loaderContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  loaderText: {
    marginTop: 12,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    color: "#64748b",
    letterSpacing: 1,
  }
});
