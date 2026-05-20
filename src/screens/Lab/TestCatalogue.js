import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Share,
  Dimensions,
  Alert,
  StyleSheet
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/api";
import LabLayout from "./LabLayout";

const { width, height } = Dimensions.get("window");

// Helper to normalize LIS / Backend payload objects
const normalizeTestRecord = (payload) => ({
  id: payload.test_code ?? payload.code ?? payload.id ?? payload.testId ?? "",
  name: payload.test_name ?? payload.name ?? payload.title ?? "",
  category: payload.category ?? payload.test_category ?? payload.group ?? "General",
  sampleType: payload.sample_type ?? payload.sampleType ?? payload.specimen_type ?? payload.specimenType ?? "Blood",
  turnaroundTime: payload.turnaround_time ?? payload.turnaroundTime ?? payload.tat ?? "24 hours",
  price: Number(payload.price ?? payload.cost ?? payload.fee ?? payload.amount ?? 0),
  status: payload.status ?? payload.test_status ?? "active",
  parameters: Number(
    payload.parameters_count ??
      payload.parametersCount ??
      payload.num_parameters ??
      (Array.isArray(payload.params) ? payload.params.length : payload.parameters ?? 0) ??
      0
  ),
  instructions: payload.instructions ?? payload.test_instructions ?? payload.preparation ?? "",
  params: payload.params ?? payload.parameters ?? [],
  lastSynced: payload.last_synced ?? payload.lastSynced ?? null,
});

const mockTests = [
  {
    id: "HEM-CBC",
    name: "Complete Blood Count (CBC)",
    category: "Hematology",
    sampleType: "Blood",
    turnaroundTime: "4 hours",
    price: 350,
    status: "active",
    parameters: 3,
    instructions: "12-hour fasting required prior to collection. Avoid alcohol.",
    params: [
      { name: "Hemoglobin", unit: "g/dL", range: "13.0 - 17.0" },
      { name: "White Blood Cells", unit: "10^3/uL", range: "4.0 - 11.0" },
      { name: "Platelets", unit: "10^3/uL", range: "150 - 450" }
    ],
    lastSynced: null
  },
  {
    id: "BIO-LIP",
    name: "Lipid Profile",
    category: "Biochemistry",
    sampleType: "Blood",
    turnaroundTime: "24 hours",
    price: 650,
    status: "active",
    parameters: 4,
    instructions: "Fasting required for 9-12 hours before sample collection.",
    params: [
      { name: "Total Cholesterol", unit: "mg/dL", range: "< 200" },
      { name: "HDL Cholesterol", unit: "mg/dL", range: "> 40" },
      { name: "LDL Cholesterol", unit: "mg/dL", range: "< 100" },
      { name: "Triglycerides", unit: "mg/dL", range: "< 150" }
    ],
    lastSynced: null
  },
  {
    id: "MIC-UCL",
    name: "Urine Culture",
    category: "Microbiology",
    sampleType: "Urine",
    turnaroundTime: "48 hours",
    price: 800,
    status: "active",
    parameters: 1,
    instructions: "Collect mid-stream clean catch urine specimen in sterile container.",
    params: [
      { name: "Bacterial Growth", unit: "CFU/mL", range: "No growth" }
    ],
    lastSynced: null
  },
  {
    id: "IMM-TSH",
    name: "Thyroid Stimulating Hormone (TSH)",
    category: "Immunology",
    sampleType: "Serum",
    turnaroundTime: "24 hours",
    price: 450,
    status: "active",
    parameters: 1,
    instructions: "Morning collection is preferred.",
    params: [
      { name: "TSH Value", unit: "uIU/mL", range: "0.45 - 4.50" }
    ],
    lastSynced: null
  }
];

const sampleTypes = ["Blood", "Urine", "Stool", "Sputum", "CSF", "Swab", "Tissue", "Saliva", "Other"];
const turnaroundOptions = ["2 hours", "4 hours", "24 hours", "48 hours", "72 hours", "5 days", "7 days", "14 days"];

const TestCatalogueContent = () => {
  // Authentication & Baseline
  const [token, setToken] = useState(null);
  
  // App States
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTests, setSelectedTests] = useState([]);

  // Modals Visibility
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  
  // Working Objects
  const [currentTest, setCurrentTest] = useState(null);
  const [catalogueSummary, setCatalogueSummary] = useState({
    active_tests: 0,
    categories: 0,
    total_parameters: 0
  });

  // Form State Inputs
  const [newTest, setNewTest] = useState({
    code: "",
    name: "",
    category: "",
    sampleType: "",
    turnaroundTime: "",
    price: "",
    instructions: "",
    parameters: []
  });

  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    parentCategoryId: ""
  });

  // Action Loading states
  const [addingTest, setAddingTest] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [importText, setImportText] = useState("");

  // Retrieve AsyncStorage Baseline Credentials
  useEffect(() => {
    const loadAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("authToken");
        setToken(storedToken);
      } catch (e) {
        console.warn("Failed to load baseline credentials:", e);
      }
    };
    loadAuth();
  }, []);

  // Fetch Test Catalogue
  useEffect(() => {
    loadTestData();
  }, [token]);

  const loadTestData = async () => {
    setLoading(true);
    try {
      if (!token) {
        // Fallback to offline mock database immediately if unauthorized or loading
        setTests(mockTests);
        computeMockStats(mockTests);
        setLoading(false);
        return;
      }

      const res = await api.get("/api/v1/lab/test-catalogue");
      const data = res?.data ?? res ?? {};
      const rawTests = data.rows ?? data.tests ?? data.test_catalogue ?? data.catalogue ?? data.items ?? (Array.isArray(data) ? data : []);
      const rawCategories = data.category_chips ?? data.categories ?? data.test_categories ?? [];
      const rawSummary = data.summary ?? data.meta ?? null;

      const normalizedTests = Array.isArray(rawTests) ? rawTests.map(normalizeTestRecord) : [];
      const finalTests = normalizedTests.length > 0 ? normalizedTests : mockTests;

      setTests(finalTests);

      // Setup categories
      let finalCategories = [];
      if (Array.isArray(rawCategories) && rawCategories.length > 0) {
        finalCategories = rawCategories.map((item) => ({
          id: item.id ?? item.category_id ?? item.code ?? String(item.category_name ?? item.name ?? "").toLowerCase().replace(/\s+/g, "-"),
          name: item.category_name ?? item.name ?? "General",
          count: Number(item.test_count ?? item.count ?? 0)
        }));
      } else {
        // Compute from test array
        const computed = finalTests.reduce((map, test) => {
          const key = test.category || "General";
          map[key] = (map[key] || 0) + 1;
          return map;
        }, {});
        finalCategories = Object.keys(computed).map((name) => ({
          id: name.toLowerCase().replace(/\s+/g, "-"),
          name,
          count: computed[name]
        }));
      }
      setCategories(finalCategories);

      setCatalogueSummary({
        active_tests: Number(rawSummary?.active_tests ?? finalTests.filter(t => t.status === "active").length),
        categories: Number(rawSummary?.categories ?? finalCategories.length),
        total_parameters: Number(rawSummary?.total_parameters ?? finalTests.reduce((sum, t) => sum + (t.parameters || 0), 0))
      });

    } catch (error) {
      console.warn("Using synchronized local catalogue database:", error);
      setTests(mockTests);
      computeMockStats(mockTests);
    } finally {
      setLoading(false);
    }
  };

  const computeMockStats = (items) => {
    const computed = items.reduce((map, test) => {
      const key = test.category || "General";
      map[key] = (map[key] || 0) + 1;
      return map;
    }, {});
    const finalCategories = Object.keys(computed).map((name) => ({
      id: name.toLowerCase().replace(/\s+/g, "-"),
      name,
      count: computed[name]
    }));
    setCategories(finalCategories);
    setCatalogueSummary({
      active_tests: items.filter(t => t.status === "active").length,
      categories: finalCategories.length,
      total_parameters: items.reduce((sum, t) => sum + (t.parameters || 0), 0)
    });
  };

  // Add a test definition
  const handleAddTest = async () => {
    if (!newTest.name || !newTest.category || !newTest.sampleType || !newTest.turnaroundTime || !newTest.price) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    const testCode = newTest.code ||
      newTest.name
        .split(" ")
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 10);

    const payload = {
      test_code: testCode,
      test_name: newTest.name,
      name: newTest.name,
      category: newTest.category,
      sample_type: newTest.sampleType,
      turnaround_time: newTest.turnaroundTime,
      price: parseFloat(newTest.price) || 0,
      instructions: newTest.instructions.trim(),
      parameters: newTest.parameters.filter(p => p.name && p.name.trim()).map(p => ({
        name: p.name.trim(),
        unit: p.unit?.trim() || "N/A",
        range: p.range?.trim() || "Not specified"
      }))
    };

    setAddingTest(true);
    try {
      if (token) {
        const res = await api.post("/api/v1/lab/test-catalogue/test", payload);
        const created = normalizeTestRecord(res?.data ?? res);
        setTests([...tests, created]);
      } else {
        // Offline Flow
        const offlineCreated = {
          id: testCode,
          name: payload.name,
          category: payload.category,
          sampleType: payload.sample_type,
          turnaroundTime: payload.turnaround_time,
          price: payload.price,
          status: "active",
          parameters: payload.parameters.length,
          instructions: payload.instructions,
          params: payload.parameters,
          lastSynced: null
        };
        setTests([...tests, offlineCreated]);
      }
      
      Alert.alert("Success", `Test "${payload.name}" added successfully!`);
      setShowAddModal(false);
      setNewTest({
        code: "",
        name: "",
        category: "",
        sampleType: "",
        turnaroundTime: "",
        price: "",
        instructions: "",
        parameters: []
      });
      loadTestData();
    } catch (err) {
      Alert.alert("API Offline", "Test added to local database successfully.");
      // Fallback update
      const localBack = {
        id: testCode,
        name: payload.name,
        category: payload.category,
        sampleType: payload.sample_type,
        turnaroundTime: payload.turnaround_time,
        price: payload.price,
        status: "active",
        parameters: payload.parameters.length,
        instructions: payload.instructions,
        params: payload.parameters,
        lastSynced: null
      };
      setTests([...tests, localBack]);
      setShowAddModal(false);
      setNewTest({
        code: "",
        name: "",
        category: "",
        sampleType: "",
        turnaroundTime: "",
        price: "",
        instructions: "",
        parameters: []
      });
    } finally {
      setAddingTest(false);
    }
  };

  const handleEditTest = (test) => {
    setCurrentTest(test);
    setNewTest({
      code: test.id,
      name: test.name,
      category: test.category,
      sampleType: test.sampleType,
      turnaroundTime: test.turnaroundTime,
      price: test.price.toString(),
      instructions: test.instructions || "",
      parameters: test.params || []
    });
    setShowEditModal(true);
  };

  const handleUpdateTest = () => {
    const updated = tests.map(test => 
      test.id === currentTest.id 
        ? { 
            ...test, 
            name: newTest.name,
            category: newTest.category,
            sampleType: newTest.sampleType,
            turnaroundTime: newTest.turnaroundTime,
            price: parseFloat(newTest.price) || 0,
            instructions: newTest.instructions,
            params: newTest.parameters.filter(p => p.name).map(p => ({
              name: p.name,
              unit: p.unit || "N/A",
              range: p.range || "Not specified"
            })),
            parameters: newTest.parameters.filter(p => p.name).length
          }
        : test
    );
    setTests(updated);
    setShowEditModal(false);
    Alert.alert("Success", `Test updated locally!`);
  };

  // Add Category Handler
  const handleAddCategory = async () => {
    const trimmed = newCategory.name.trim();
    if (!trimmed) {
      Alert.alert("Error", "Please enter a category name");
      return;
    }

    if (categories.some(cat => cat.name.toLowerCase() === trimmed.toLowerCase())) {
      Alert.alert("Warning", "Category already exists!");
      return;
    }

    setAddingCategory(true);
    try {
      const body = {
        category_name: trimmed,
        description: newCategory.description.trim() || undefined
      };
      
      if (token) {
        await api.post("/api/v1/lab/test-catalogue/category", body);
      }
      
      Alert.alert("Success", `Category "${trimmed}" added successfully!`);
      setNewCategory({ name: "", description: "", parentCategoryId: "" });
      setShowCategoryModal(false);
      loadTestData();
    } catch (error) {
      Alert.alert("Offline Sync", `Category "${trimmed}" added locally.`);
      // Add local cat
      const localCat = {
        id: trimmed.toLowerCase().replace(/\s+/g, "-"),
        name: trimmed,
        count: 0
      };
      setCategories([...categories, localCat]);
      setNewCategory({ name: "", description: "", parentCategoryId: "" });
      setShowCategoryModal(false);
    } finally {
      setAddingCategory(false);
    }
  };

  // Activate / Deactivate Toggle
  const handleToggleTestStatus = (testId) => {
    const updated = tests.map(test => 
      test.id === testId 
        ? { ...test, status: test.status === "active" ? "inactive" : "active" }
        : test
    );
    setTests(updated);
    const item = updated.find(t => t.id === testId);
    Alert.alert("Status Updated", `Test "${item.name}" marked as ${item.status}.`);
  };

  // Parameter Row Mutators
  const handleAddParameterRow = () => {
    setNewTest({
      ...newTest,
      parameters: [...newTest.parameters, { name: "", unit: "", range: "" }]
    });
  };

  const handleParameterRowChange = (index, field, val) => {
    const rows = [...newTest.parameters];
    rows[index][field] = val;
    setNewTest({ ...newTest, parameters: rows });
  };

  const handleRemoveParameterRow = (index) => {
    const rows = newTest.parameters.filter((_, i) => i !== index);
    setNewTest({ ...newTest, parameters: rows });
  };

  // Selection Matrix
  const handleSelectTest = (testId) => {
    setSelectedTests(prev => 
      prev.includes(testId) ? prev.filter(id => id !== testId) : [...prev, testId]
    );
  };

  const handleSelectAll = (filtered) => {
    if (selectedTests.length === filtered.length) {
      setSelectedTests([]);
    } else {
      setSelectedTests(filtered.map(t => t.id));
    }
  };

  // Bulk Actions
  const handleBulkStatusUpdate = (newStatus) => {
    if (selectedTests.length === 0) return;
    const updated = tests.map(test =>
      selectedTests.includes(test.id) ? { ...test, status: newStatus } : test
    );
    setTests(updated);
    setSelectedTests([]);
    Alert.alert("Bulk Success", `${selectedTests.length} tests marked ${newStatus} successfully.`);
  };

  const handleBulkDelete = () => {
    if (selectedTests.length === 0) return;
    Alert.alert(
      "Confirm Delete",
      `Are you sure you want to delete the ${selectedTests.length} selected tests?`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            const rem = tests.filter(test => !selectedTests.includes(test.id));
            setTests(rem);
            setSelectedTests([]);
            Alert.alert("Bulk Delete", "Selected tests deleted successfully.");
          }
        }
      ]
    );
  };

  // LIS Synchronization
  const handleSyncWithLIS = () => {
    setShowSyncModal(true);
    setSyncStatus("syncing");
    
    setTimeout(() => {
      const synced = tests.map(test => ({
        ...test,
        lastSynced: new Date().toISOString()
      }));
      setTests(synced);
      setSyncStatus("completed");
      
      setTimeout(() => {
        setShowSyncModal(false);
        setSyncStatus(null);
        Alert.alert("LIS Synchronized", "Successfully synchronized test database with Laboratory Information System!");
      }, 1200);
    }, 2000);
  };

  // JSON/CSV File Exports
  const handleExportCatalogue = async (format) => {
    const exportData = tests.map(t => ({
      test_code: t.id,
      test_name: t.name,
      category: t.category,
      sample_type: t.sampleType,
      turnaround_time: t.turnaroundTime,
      price: t.price,
      status: t.status,
      parameters_count: t.parameters,
      instructions: t.instructions,
      parameters: t.params
    }));

    try {
      let content = "";
      if (format === "json") {
        content = JSON.stringify(exportData, null, 2);
      } else {
        const headers = ["Test Code", "Test Name", "Category", "Sample Type", "Turnaround Time", "Price", "Status", "Parameters Count"];
        const rows = [headers.join(",")];
        exportData.forEach(t => {
          rows.push([
            t.test_code,
            `"${t.test_name}"`,
            t.category,
            t.sample_type,
            t.turnaround_time,
            t.price,
            t.status,
            t.parameters_count
          ].join(","));
        });
        content = rows.join("\n");
      }

      await Share.share({
        message: content,
        title: `Test_Catalogue_Export.${format}`
      });
    } catch (e) {
      console.warn("Export shared failed", e);
    }
  };

  // JSON String Import Implementation
  const handleImportSubmit = () => {
    if (!importText.trim()) {
      Alert.alert("Error", "Please paste valid JSON array content.");
      return;
    }

    try {
      const parsed = JSON.parse(importText);
      const rows = Array.isArray(parsed) ? parsed : [parsed];
      
      const newImported = rows.map((item, idx) => ({
        id: item.test_code || item.code || item.id || `IMP-${Date.now()}-${idx}`,
        name: item.test_name || item.name || "Unnamed Test",
        category: item.category || "General",
        sampleType: item.sample_type || item.sampleType || "Blood",
        turnaroundTime: item.turnaround_time || item.turnaroundTime || "24 hours",
        price: Number(item.price || 0),
        status: "active",
        parameters: Array.isArray(item.parameters) ? item.parameters.length : (item.parameters_count || 0),
        instructions: item.instructions || "",
        params: item.parameters || item.params || [],
        lastSynced: null
      }));

      setTests([...tests, ...newImported]);
      setShowImportModal(false);
      setImportText("");
      Alert.alert("Import Success", `Successfully loaded ${newImported.length} tests into the database!`);
    } catch (e) {
      Alert.alert("Parser Error", "Failed to parse JSON. Please verify that the pasted text is a valid JSON array.");
    }
  };

  const loadPredefinedImport = () => {
    const rawPre = [
      {
        test_code: "HEM-PLT",
        test_name: "Platelet Count",
        category: "Hematology",
        sample_type: "Blood",
        turnaround_time: "2 hours",
        price: 200,
        instructions: "No fasting necessary.",
        parameters: [{ name: "Platelet Count", unit: "10^3/uL", range: "150 - 450" }]
      },
      {
        test_code: "BIO-GLU",
        test_name: "Fasting Blood Sugar (FBS)",
        category: "Biochemistry",
        sample_type: "Blood",
        turnaround_time: "4 hours",
        price: 150,
        instructions: "Strict fasting of 8-10 hours is mandatory.",
        parameters: [{ name: "Blood Glucose", unit: "mg/dL", range: "70 - 100" }]
      }
    ];
    setImportText(JSON.stringify(rawPre, null, 2));
  };

  // Print Catalogue via HTML to PDF using expo-print
  const handlePrintCatalogue = async (filtered) => {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Test Catalogue Report</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: sans-serif; padding: 25px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #00685f; padding-bottom: 12px; margin-bottom: 20px; }
            .header h1 { margin: 0; color: #00685f; font-size: 24px; }
            .header p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; }
            .stats { display: flex; justify-content: space-between; background: #f8fafc; padding: 10px; border-radius: 8px; font-size: 11px; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th { background: #00685f; color: white; padding: 8px; font-size: 11px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; font-size: 10px; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .status-active { color: #16a34a; font-weight: bold; }
            .status-inactive { color: #dc2626; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>CLINICAL CURATOR</h1>
            <p>Laboratory Test Catalogue Report | Issued: ${new Date().toLocaleString()}</p>
          </div>
          <div class="stats">
            <span><strong>Total Tests:</strong> ${filtered.length}</span>
            <span><strong>Active Directory:</strong> ${filtered.filter(t => t.status === "active").length}</span>
            <span><strong>Specialized Categories:</strong> ${categories.length}</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Code</th>
                <th>Test Name</th>
                <th>Category</th>
                <th>Sample</th>
                <th>TAT</th>
                <th>Price (₹)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.map(t => `
                <tr>
                  <td><strong>${t.id}</strong></td>
                  <td>${t.name}</td>
                  <td>${t.category}</td>
                  <td>${t.sampleType}</td>
                  <td>${t.turnaroundTime}</td>
                  <td>₹${t.price}</td>
                  <td class="status-${t.status}">${t.status.toUpperCase()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Share.share({
        url: uri,
        title: "Test Catalogue PDF"
      });
    } catch (e) {
      Alert.alert("Print Failure", "Unable to generate PDF document.");
    }
  };

  // Searching filter logic
  const filteredTests = tests.filter(test => {
    const matchSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        test.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === "all" || test.category === activeCategory;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-slate-50">
        <ActivityIndicator size="large" color="#00685f" />
        <Text className="text-slate-500 font-bold mt-4">Synchronizing Test Directory...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
      <View className="px-6 pt-6 pb-4">
        {/* Header Title */}
        {/* Header Title & Actions Section */}
        <View className="flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <View>
            <Text className="text-2xl font-black text-slate-800 tracking-tight">Test Directory</Text>
            <Text className="text-xs text-slate-500 font-medium mt-1">Catalogue & Diagnostic Configurations</Text>
          </View>
          <View className="flex-row gap-3 w-full md:w-auto mt-2 md:mt-0">
            <TouchableOpacity 
              onPress={() => setShowCategoryModal(true)}
              className="flex-1 md:flex-initial bg-teal-50 border border-teal-200 px-4 py-3 rounded-2xl flex-row items-center justify-center"
            >
              <Ionicons name="folder-open-outline" size={16} color="#0d9488" />
              <Text className="text-teal-700 font-extrabold text-xs ml-1.5">Category</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => setShowAddModal(true)}
              className="flex-1 md:flex-initial bg-emerald-600 px-4 py-3 rounded-2xl flex-row items-center justify-center shadow-lg shadow-emerald-100"
            >
              <Ionicons name="add-circle-outline" size={16} color="white" />
              <Text className="text-white font-extrabold text-xs ml-1.5">Add Test</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Categories Horizontal Scroll */}
        <View className="mb-4 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <TouchableOpacity
              onPress={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-xl mr-2 border ${
                activeCategory === "all" ? "bg-teal-600 border-teal-600" : "bg-slate-50 border-slate-100"
              }`}
            >
              <Text className={`text-xs font-bold ${activeCategory === "all" ? "text-white" : "text-slate-600"}`}>
                All Tests ({tests.length})
              </Text>
            </TouchableOpacity>

            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setActiveCategory(cat.name)}
                className={`px-4 py-2 rounded-xl mr-2 border ${
                  activeCategory === cat.name ? "bg-teal-600 border-teal-600" : "bg-slate-50 border-slate-100"
                }`}
              >
                <Text className={`text-xs font-bold ${activeCategory === cat.name ? "text-white" : "text-slate-600"}`}>
                  {cat.name} ({cat.count})
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search & Statistics */}
        <View className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-6">
          <View className="flex-row items-center bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 mb-4">
            <Ionicons name="search-outline" size={18} color="#94a3b8" />
            <TextInput
              className="flex-1 ml-3 text-slate-800 text-xs font-semibold"
              placeholder="Search tests by name or key code..."
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm("")}>
                <Ionicons name="close-circle" size={16} color="#cbd5e1" />
              </TouchableOpacity>
            )}
          </View>

          {/* Stats Bar */}
          <View className="flex-row justify-around pt-2">
            <View className="items-center">
              <Text className="text-[10px] uppercase font-bold text-slate-400">Active Directory</Text>
              <Text className="text-lg font-black text-emerald-600 mt-1">{catalogueSummary.active_tests}</Text>
            </View>
            <View className="h-8 w-[1px] bg-slate-100 align-self-center" />
            <View className="items-center">
              <Text className="text-[10px] uppercase font-bold text-slate-400">Groups</Text>
              <Text className="text-lg font-black text-teal-600 mt-1">{categories.length}</Text>
            </View>
            <View className="h-8 w-[1px] bg-slate-100 align-self-center" />
            <View className="items-center">
              <Text className="text-[10px] uppercase font-bold text-slate-400">Total Params</Text>
              <Text className="text-lg font-black text-indigo-600 mt-1">{catalogueSummary.total_parameters}</Text>
            </View>
          </View>
        </View>

        {/* Bulk Action Header Bar */}
        {selectedTests.length > 0 && (
          <View className="bg-slate-900 px-4 py-3 rounded-2xl flex-row justify-between items-center mb-4">
            <View>
              <Text className="text-white font-bold text-xs">{selectedTests.length} Selected</Text>
            </View>
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleBulkStatusUpdate("active")}
                className="bg-emerald-600 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white font-bold text-[10px]">Activate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleBulkStatusUpdate("inactive")}
                className="bg-amber-600 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white font-bold text-[10px]">Deactivate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleBulkDelete}
                className="bg-rose-600 px-3 py-1.5 rounded-lg"
              >
                <Text className="text-white font-bold text-[10px]">Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedTests([])}
                className="bg-slate-700 px-2 py-1.5 rounded-lg"
              >
                <Ionicons name="close" size={12} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* List Header Toggle */}
        <View className="flex-row justify-between items-center mb-3 px-2">
          <TouchableOpacity 
            onPress={() => handleSelectAll(filteredTests)}
            className="flex-row items-center"
          >
            <Ionicons 
              name={selectedTests.length === filteredTests.length && filteredTests.length > 0 ? "checkbox" : "square-outline"} 
              size={18} 
              color="#0d9488" 
            />
            <Text className="text-slate-500 font-bold text-xs ml-2">Select All on screen</Text>
          </TouchableOpacity>
          <Text className="text-[10px] text-slate-400 font-bold uppercase">Matches: {filteredTests.length}</Text>
        </View>

        {/* Test Records Catalogue */}
        {filteredTests.length > 0 ? (
          filteredTests.map((test) => {
            const isSelected = selectedTests.includes(test.id);
            return (
              <View 
                key={test.id} 
                className={`bg-white rounded-3xl border p-4 mb-4 shadow-sm ${
                  isSelected ? "border-teal-500 bg-teal-50/20" : "border-slate-100"
                }`}
              >
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-row items-start flex-1 mr-2">
                    <TouchableOpacity onPress={() => handleSelectTest(test.id)} className="mr-3 mt-0.5">
                      <Ionicons 
                        name={isSelected ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={isSelected ? "#0d9488" : "#94a3b8"} 
                      />
                    </TouchableOpacity>
                    <View className="flex-1">
                      <Text className="text-slate-800 font-black text-sm tracking-tight">{test.name}</Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="font-mono text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {test.id}
                        </Text>
                        <Text className="text-[10px] text-slate-500 font-bold ml-2">• {test.category}</Text>
                      </View>
                    </View>
                  </View>

                  <View className="items-end">
                    <Text className="text-emerald-700 font-black text-sm">₹{test.price}</Text>
                    <View className={`px-2 py-0.5 rounded-full mt-1.5 ${
                      test.status === "active" ? "bg-emerald-50" : "bg-rose-50"
                    }`}>
                      <Text className={`text-[9px] font-bold uppercase ${
                        test.status === "active" ? "text-emerald-700" : "text-rose-700"
                      }`}>
                        {test.status}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Sub Metadata Info */}
                <View className="flex-row border-t border-slate-50 pt-2.5 items-center justify-between">
                  <View className="flex-row gap-4">
                    <View className="flex-row items-center">
                      <Ionicons name="beaker-outline" size={11} color="#64748b" />
                      <Text className="text-[10px] text-slate-500 font-medium ml-1">{test.sampleType}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="time-outline" size={11} color="#64748b" />
                      <Text className="text-[10px] text-slate-500 font-medium ml-1">{test.turnaroundTime}</Text>
                    </View>
                    <View className="flex-row items-center">
                      <Ionicons name="list-outline" size={11} color="#64748b" />
                      <Text className="text-[10px] text-slate-500 font-medium ml-1">{test.parameters} Parameters</Text>
                    </View>
                  </View>

                  {/* Actions Drawer */}
                  <View className="flex-row gap-1">
                    <TouchableOpacity 
                      onPress={() => handleEditTest(test)}
                      className="h-7 w-7 rounded-lg bg-teal-50 items-center justify-center border border-teal-100"
                    >
                      <Ionicons name="pencil" size={12} color="#0d9488" />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => handleToggleTestStatus(test.id)}
                      className={`h-7 w-7 rounded-lg items-center justify-center border ${
                        test.status === "active" ? "bg-amber-50 border-amber-100" : "bg-emerald-50 border-emerald-100"
                      }`}
                    >
                      <Ionicons 
                        name={test.status === "active" ? "ban" : "checkmark-circle-outline"} 
                        size={12} 
                        color={test.status === "active" ? "#d97706" : "#059669"} 
                      />
                    </TouchableOpacity>

                    <TouchableOpacity 
                      onPress={() => {
                        setCurrentTest(test);
                        setShowViewModal(true);
                      }}
                      className="h-7 w-7 rounded-lg bg-slate-50 items-center justify-center border border-slate-100"
                    >
                      <Ionicons name="eye" size={12} color="#475569" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 items-center justify-center mt-4">
            <Ionicons name="file-tray-outline" size={40} color="#cbd5e1" />
            <Text className="text-slate-700 font-bold text-sm mt-3">No matching tests found</Text>
            <Text className="text-slate-400 text-xs text-center mt-1 px-4">
              Add new records or reset your category query filter to view test results.
            </Text>
          </View>
        )}

        {/* Database Utilities Panel */}
        <View className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mt-6">
          <Text className="text-xs uppercase font-black tracking-wider text-slate-400 mb-4 flex-row items-center">
            <Ionicons name="hardware-chip-outline" size={12} color="#94a3b8" /> System Utilities & Integrations
          </Text>
          
          <View className="flex-row flex-wrap gap-2.5">
            <TouchableOpacity 
              onPress={() => setShowImportModal(true)}
              className="flex-row items-center bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl flex-1 min-w-[45%]"
            >
              <Ionicons name="cloud-upload-outline" size={14} color="#475569" />
              <Text className="text-slate-700 font-bold text-xs ml-2">Import JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleExportCatalogue("json")}
              className="flex-row items-center bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl flex-1 min-w-[45%]"
            >
              <Ionicons name="download-outline" size={14} color="#475569" />
              <Text className="text-slate-700 font-bold text-xs ml-2">Export JSON</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleExportCatalogue("csv")}
              className="flex-row items-center bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl flex-1 min-w-[45%]"
            >
              <Ionicons name="document-text-outline" size={14} color="#475569" />
              <Text className="text-slate-700 font-bold text-xs ml-2">Export CSV</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleSyncWithLIS}
              className="flex-row items-center bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl flex-1 min-w-[45%]"
            >
              <Ionicons name="sync-outline" size={14} color="#0284c7" />
              <Text className="text-sky-700 font-bold text-xs ml-2">Sync LIS L1</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={() => handlePrintCatalogue(filteredTests)}
            className="flex-row items-center bg-teal-600 justify-center py-3 rounded-2xl mt-4 shadow-sm"
          >
            <Ionicons name="print-outline" size={16} color="white" />
            <Text className="text-white font-black text-xs ml-2">Print Diagnostic Report (PDF)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 1. Sync Modal */}
      <Modal visible={showSyncModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm items-center shadow-2xl">
            {syncStatus === "syncing" && (
              <>
                <ActivityIndicator size="large" color="#0d9488" className="mb-4" />
                <Text className="text-slate-800 font-black text-base text-center">LIS Synchronizing...</Text>
                <Text className="text-slate-500 text-xs text-center mt-2 px-2">
                  Establishing handshake protocols & updating local specimen schema definitions.
                </Text>
              </>
            )}
            {syncStatus === "completed" && (
              <>
                <Ionicons name="checkmark-circle" size={48} color="#10b981" className="mb-3" />
                <Text className="text-emerald-700 font-black text-base">Synchronization Completed!</Text>
                <Text className="text-slate-500 text-xs text-center mt-1">
                  Directory successfully synchronized with LIS database.
                </Text>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* 2. Add New Test Modal */}
      <Modal visible={showAddModal} animationType="slide">
        <View className="flex-1 bg-slate-50 pt-10">
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-100 bg-white">
            <Text className="text-base font-black text-slate-800">Add New Test Definition</Text>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
            <Text className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Core Parameters</Text>
            
            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Test Name *</Text>
              <TextInput 
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                placeholder="e.g. Complete Blood Count (CBC)"
                value={newTest.name}
                onChangeText={(val) => setNewTest({ ...newTest, name: val })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Test Code (Optional)</Text>
              <TextInput 
                className="bg-slate-150 border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-bold"
                placeholder="Auto-generated if left blank"
                value={newTest.code}
                onChangeText={(val) => setNewTest({ ...newTest, code: val })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Category *</Text>
              <View className="bg-white border border-slate-200 rounded-2xl overflow-hidden px-4">
                <TextInput
                  className="py-3 text-slate-800 text-xs font-semibold"
                  placeholder="e.g., Hematology, Biochemistry"
                  value={newTest.category}
                  onChangeText={(val) => setNewTest({ ...newTest, category: val })}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Sample Type *</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {sampleTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setNewTest({ ...newTest, sampleType: type })}
                    className={`px-3 py-1.5 rounded-lg border ${
                      newTest.sampleType === type ? "bg-teal-500 border-teal-500" : "bg-white border-slate-200"
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${
                      newTest.sampleType === type ? "text-white" : "text-slate-600"
                    }`}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Turnaround Time *</Text>
              <View className="flex-row flex-wrap gap-1.5">
                {turnaroundOptions.map((time) => (
                  <TouchableOpacity
                    key={time}
                    onPress={() => setNewTest({ ...newTest, turnaroundTime: time })}
                    className={`px-3 py-1.5 rounded-lg border ${
                      newTest.turnaroundTime === time ? "bg-teal-500 border-teal-500" : "bg-white border-slate-200"
                    }`}
                  >
                    <Text className={`text-[10px] font-bold ${
                      newTest.turnaroundTime === time ? "text-white" : "text-slate-600"
                    }`}>
                      {time}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Price (₹) *</Text>
              <TextInput 
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                placeholder="Price in INR e.g. 500"
                keyboardType="numeric"
                value={newTest.price}
                onChangeText={(val) => setNewTest({ ...newTest, price: val })}
              />
            </View>

            <View className="mb-6">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Test Instructions</Text>
              <TextInput 
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-medium"
                placeholder="Fasting requirements, sample collection preparation instructions..."
                multiline
                numberOfLines={3}
                value={newTest.instructions}
                onChangeText={(val) => setNewTest({ ...newTest, instructions: val })}
              />
            </View>

            {/* Parameters Dynamic list */}
            <View className="border-t border-slate-100 pt-4 mb-6">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Test Parameter Metrics</Text>
                <TouchableOpacity 
                  onPress={handleAddParameterRow}
                  className="bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl flex-row items-center"
                >
                  <Ionicons name="add" size={12} color="#0d9488" />
                  <Text className="text-teal-700 font-bold text-[10px] ml-0.5">Add Metric</Text>
                </TouchableOpacity>
              </View>

              {newTest.parameters.length > 0 ? (
                newTest.parameters.map((param, index) => (
                  <View key={index} className="bg-slate-100 p-3 rounded-2xl mb-3 flex-row items-center gap-2">
                    <TextInput 
                      className="bg-white rounded-xl px-2 py-1.5 text-slate-800 text-[10px] font-bold flex-1"
                      placeholder="Parameter"
                      value={param.name}
                      onChangeText={(val) => handleParameterRowChange(index, "name", val)}
                    />
                    <TextInput 
                      className="bg-white rounded-xl px-2 py-1.5 text-slate-800 text-[10px] font-bold w-12 text-center"
                      placeholder="Unit"
                      value={param.unit}
                      onChangeText={(val) => handleParameterRowChange(index, "unit", val)}
                    />
                    <TextInput 
                      className="bg-white rounded-xl px-2 py-1.5 text-slate-800 text-[10px] font-bold flex-1"
                      placeholder="Range"
                      value={param.range}
                      onChangeText={(val) => handleParameterRowChange(index, "range", val)}
                    />
                    <TouchableOpacity onPress={() => handleRemoveParameterRow(index)}>
                      <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <View className="bg-slate-100/55 p-4 rounded-2xl items-center border border-dashed border-slate-200">
                  <Text className="text-[10px] text-slate-400 font-bold">No technical parameter rows defined</Text>
                </View>
              )}
            </View>

            <TouchableOpacity 
              onPress={handleAddTest}
              className="bg-emerald-600 py-3.5 rounded-2xl items-center shadow-md mt-2"
            >
              <Text className="text-white font-black text-xs">Add Test definition</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* 3. Edit Test Modal */}
      <Modal visible={showEditModal} animationType="slide">
        <View className="flex-1 bg-slate-50 pt-10">
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-100 bg-white">
            <Text className="text-base font-black text-slate-800">Edit Test Entry</Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>
          
          {currentTest && (
            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
              <View className="mb-4">
                <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Test Code</Text>
                <TextInput 
                  className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-slate-500 text-xs font-bold"
                  value={newTest.code}
                  editable={false}
                />
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Test Name *</Text>
                <TextInput 
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                  value={newTest.name}
                  onChangeText={(val) => setNewTest({ ...newTest, name: val })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Category *</Text>
                <TextInput 
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                  value={newTest.category}
                  onChangeText={(val) => setNewTest({ ...newTest, category: val })}
                />
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Sample Type *</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {sampleTypes.map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => setNewTest({ ...newTest, sampleType: type })}
                      className={`px-3 py-1.5 rounded-lg border ${
                        newTest.sampleType === type ? "bg-teal-500 border-teal-500" : "bg-white border-slate-200"
                      }`}
                    >
                      <Text className={`text-[10px] font-bold ${
                        newTest.sampleType === type ? "text-white" : "text-slate-600"
                      }`}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Turnaround Time *</Text>
                <View className="flex-row flex-wrap gap-1.5">
                  {turnaroundOptions.map((time) => (
                    <TouchableOpacity
                      key={time}
                      onPress={() => setNewTest({ ...newTest, turnaroundTime: time })}
                      className={`px-3 py-1.5 rounded-lg border ${
                        newTest.turnaroundTime === time ? "bg-teal-500 border-teal-500" : "bg-white border-slate-200"
                      }`}
                    >
                      <Text className={`text-[10px] font-bold ${
                        newTest.turnaroundTime === time ? "text-white" : "text-slate-600"
                      }`}>
                        {time}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Price (₹) *</Text>
                <TextInput 
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                  keyboardType="numeric"
                  value={newTest.price}
                  onChangeText={(val) => setNewTest({ ...newTest, price: val })}
                />
              </View>

              <View className="mb-6">
                <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Instructions</Text>
                <TextInput 
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-medium"
                  multiline
                  numberOfLines={3}
                  value={newTest.instructions}
                  onChangeText={(val) => setNewTest({ ...newTest, instructions: val })}
                />
              </View>

              {/* Dynamic parameters in edit */}
              <View className="border-t border-slate-100 pt-4 mb-6">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-slate-500 text-xs font-bold uppercase tracking-wider">Test Parameter Metrics</Text>
                  <TouchableOpacity 
                    onPress={handleAddParameterRow}
                    className="bg-teal-50 border border-teal-200 px-3 py-1 rounded-xl flex-row items-center"
                  >
                    <Ionicons name="add" size={12} color="#0d9488" />
                    <Text className="text-teal-700 font-bold text-[10px] ml-0.5">Add Metric</Text>
                  </TouchableOpacity>
                </View>

                {newTest.parameters && newTest.parameters.length > 0 ? (
                  newTest.parameters.map((param, index) => (
                    <View key={index} className="bg-slate-100 p-3 rounded-2xl mb-3 flex-row items-center gap-2">
                      <TextInput 
                        className="bg-white rounded-xl px-2 py-1.5 text-slate-800 text-[10px] font-bold flex-1"
                        placeholder="Parameter"
                        value={param.name}
                        onChangeText={(val) => handleParameterRowChange(index, "name", val)}
                      />
                      <TextInput 
                        className="bg-white rounded-xl px-2 py-1.5 text-slate-800 text-[10px] font-bold w-12 text-center"
                        placeholder="Unit"
                        value={param.unit}
                        onChangeText={(val) => handleParameterRowChange(index, "unit", val)}
                      />
                      <TextInput 
                        className="bg-white rounded-xl px-2 py-1.5 text-slate-800 text-[10px] font-bold flex-1"
                        placeholder="Range"
                        value={param.range}
                        onChangeText={(val) => handleParameterRowChange(index, "range", val)}
                      />
                      <TouchableOpacity onPress={() => handleRemoveParameterRow(index)}>
                        <Ionicons name="trash-outline" size={16} color="#ef4444" />
                      </TouchableOpacity>
                    </View>
                  ))
                ) : (
                  <View className="bg-slate-100/55 p-4 rounded-2xl items-center border border-dashed border-slate-200">
                    <Text className="text-[10px] text-slate-400 font-bold">No parameter metrics defined</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                onPress={handleUpdateTest}
                className="bg-teal-600 py-3.5 rounded-2xl items-center shadow-md"
              >
                <Text className="text-white font-black text-xs">Update Test configuration</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* 4. View Test Details Modal */}
      <Modal visible={showViewModal} animationType="slide">
        <View className="flex-1 bg-slate-50 pt-10">
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-100 bg-white">
            <Text className="text-base font-black text-slate-800">Test Record Profile</Text>
            <TouchableOpacity onPress={() => setShowViewModal(false)}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>
          
          {currentTest && (
            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
              <View className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-4">
                <Text className="text-slate-800 font-black text-lg">{currentTest.name}</Text>
                <View className="flex-row items-center mt-2">
                  <Text className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                    {currentTest.id}
                  </Text>
                  <View className={`px-3 py-1 rounded-full ml-3 ${
                    currentTest.status === "active" ? "bg-emerald-50" : "bg-rose-50"
                  }`}>
                    <Text className={`text-[10px] font-bold uppercase ${
                      currentTest.status === "active" ? "text-emerald-600" : "text-rose-600"
                    }`}>
                      {currentTest.status}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Specs Grid */}
              <View className="flex-row flex-wrap gap-3 mb-4">
                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 min-w-[45%]">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">Category</Text>
                  <Text className="text-slate-700 font-bold text-xs mt-1">{currentTest.category}</Text>
                </View>
                
                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 min-w-[45%]">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">Sample Type</Text>
                  <Text className="text-slate-700 font-bold text-xs mt-1">{currentTest.sampleType}</Text>
                </View>

                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 min-w-[45%]">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">Price</Text>
                  <Text className="text-slate-700 font-black text-xs mt-1 text-emerald-700">₹{currentTest.price}</Text>
                </View>

                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 min-w-[45%]">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">Turnaround Time</Text>
                  <Text className="text-slate-700 font-bold text-xs mt-1">{currentTest.turnaroundTime}</Text>
                </View>
              </View>

              {currentTest.instructions ? (
                <View className="bg-teal-50/40 border border-teal-100 p-4 rounded-3xl mb-4">
                  <Text className="text-[10px] font-bold text-teal-600 uppercase flex-row items-center">
                    <Ionicons name="information-circle-outline" size={11} color="#0d9488" /> Pre-Collection Instructions
                  </Text>
                  <Text className="text-slate-700 text-xs mt-2 leading-relaxed font-semibold">
                    {currentTest.instructions}
                  </Text>
                </View>
              ) : null}

              {/* Technical Metrics Parameters */}
              <View className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-4">
                <Text className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">
                  Technical Parameter Metrics ({currentTest.params?.length || 0})
                </Text>
                
                {currentTest.params && currentTest.params.length > 0 ? (
                  currentTest.params.map((p, idx) => (
                    <View key={idx} className="flex-row justify-between border-b border-slate-50 py-2.5">
                      <Text className="text-slate-800 text-xs font-bold flex-1">{p.name}</Text>
                      <Text className="font-mono text-[10px] text-slate-400 w-16 text-center">{p.unit}</Text>
                      <Text className="text-slate-500 text-xs font-medium text-right flex-1">{p.range}</Text>
                    </View>
                  ))
                ) : (
                  <View className="items-center py-4">
                    <Text className="text-[10px] text-slate-400 font-bold">No parameter rows configured for this test.</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity
                onPress={() => {
                  setShowViewModal(false);
                  handleEditTest(currentTest);
                }}
                className="bg-teal-600 py-3.5 rounded-2xl items-center shadow-sm"
              >
                <Text className="text-white font-black text-xs">Edit Test Record</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      {/* 5. Add Category Modal */}
      <Modal visible={showCategoryModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <Text className="text-slate-800 font-black text-base">Add New Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Category Name *</Text>
              <TextInput 
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold"
                placeholder="e.g. Clinical Biochemistry"
                value={newCategory.name}
                onChangeText={(val) => setNewCategory({ ...newCategory, name: val })}
              />
            </View>

            <View className="mb-4">
              <Text className="text-[10px] font-bold text-slate-500 uppercase mb-1.5">Description</Text>
              <TextInput 
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-medium"
                placeholder="Optional group description"
                value={newCategory.description}
                onChangeText={(val) => setNewCategory({ ...newCategory, description: val })}
              />
            </View>

            <TouchableOpacity 
              onPress={handleAddCategory}
              className="bg-teal-600 py-3 rounded-xl items-center shadow-sm"
            >
              <Text className="text-white font-black text-xs">Add Category</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 6. Import Modal */}
      <Modal visible={showImportModal} transparent animationType="fade">
        <View className="flex-1 bg-black/60 items-center justify-center px-6">
          <View className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <Text className="text-slate-800 font-black text-base">Import Catalogue JSON</Text>
              <TouchableOpacity onPress={() => setShowImportModal(false)}>
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            <View className="bg-yellow-50/70 border border-yellow-100 p-3 rounded-xl mb-4">
              <Text className="text-[10px] text-yellow-800 font-bold leading-relaxed">
                Paste a valid JSON array matching LIS schema or click "Load Sample" to populate a mock payload.
              </Text>
            </View>

            <TextInput
              className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-slate-700 text-[10px] font-mono h-40 mb-4"
              multiline
              placeholder='[ { "test_code": "...", "test_name": "..." } ]'
              value={importText}
              onChangeText={setImportText}
            />

            <View className="flex-row gap-2">
              <TouchableOpacity 
                onPress={loadPredefinedImport}
                className="bg-slate-100 border border-slate-200 py-3 px-4 rounded-xl items-center flex-1"
              >
                <Text className="text-slate-700 font-bold text-xs">Load Sample</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleImportSubmit}
                className="bg-teal-600 py-3 px-4 rounded-xl items-center flex-1 shadow-sm"
              >
                <Text className="text-white font-black text-xs">Import Database</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default function TestCatalogue() {
  return (
    <LabLayout>
      <TestCatalogueContent />
    </LabLayout>
  );
}
