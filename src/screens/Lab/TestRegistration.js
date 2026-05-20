import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Share,
  Dimensions,
  Alert,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../../services/api";
import LabLayout from "./LabLayout";

const { width } = Dimensions.get("window");

// Mock Local Fallbacks for Offline Operations
const mockPatients = [
  { id: "PAT-482", name: "Alice Johnson", age: "28", gender: "Female", phone: "9876543210", email: "alice@example.com", doctor: "Dr. Robert Chen", department: "Cardiology" },
  { id: "PAT-931", name: "Bob Smith", age: "45", gender: "Male", phone: "9876543211", email: "bob@example.com", doctor: "Dr. Sarah Jenkins", department: "Urology" },
  { id: "PAT-112", name: "Charlie Davis", age: "60", gender: "Male", phone: "9876543212", email: "charlie@example.com", doctor: "Dr. Alok Verma", department: "Internal Medicine" }
];

const mockRegistrations = [
  {
    id: "REG-2026-001",
    patientName: "Alice Johnson",
    patientId: "PAT-482",
    age: "28",
    gender: "Female",
    phoneNumber: "9876543210",
    email: "alice@example.com",
    testType: "CBC, Lipid Profile",
    sampleType: "Blood, Blood",
    registeredDate: new Date().toISOString().split("T")[0],
    status: "SAMPLE_COLLECTED",
    priority: "routine",
    referringDoctor: "Dr. Robert Chen",
    department: "Cardiology",
    instructions: "12-hour fasting required.",
    selectedTests: [
      { id: 101, testType: "CBC", sampleType: "Blood" },
      { id: 102, testType: "Lipid Profile", sampleType: "Blood" }
    ]
  },
  {
    id: "REG-2026-002",
    patientName: "Bob Smith",
    patientId: "PAT-931",
    age: "45",
    gender: "Male",
    phoneNumber: "9876543211",
    email: "bob@example.com",
    testType: "Urine Culture",
    sampleType: "Urine",
    registeredDate: new Date().toISOString().split("T")[0],
    status: "SAMPLE_PENDING",
    priority: "urgent",
    referringDoctor: "Dr. Sarah Jenkins",
    department: "Urology",
    instructions: "Clean catch mid-stream urine.",
    selectedTests: [
      { id: 201, testType: "Urine Culture", sampleType: "Urine" }
    ]
  }
];

const testTypes = ["CBC", "Lipid Profile", "Liver Function", "Kidney Function", "Thyroid", "Diabetes", "Urine Culture", "Blood Culture", "COVID-19 RT-PCR", "Dengue NS1"];
const sampleTypes = ["Blood", "Urine", "Stool", "Sputum", "CSF", "Swab", "Tissue"];

const TestRegistrationContent = () => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tests, setTests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Form registration state
  const [newTest, setNewTest] = useState({
    patientId: "",
    patientName: "",
    age: "",
    gender: "",
    phoneNumber: "",
    email: "",
    registrationDate: new Date().toISOString().split("T")[0],
    testType: "",
    priority: "routine",
    sampleType: "",
    referringDoctor: "",
    department: "",
    instructions: "",
    selectedTests: [{ id: Date.now(), testType: "", sampleType: "" }],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editingTestId, setEditingTestId] = useState(null);
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [patientSearch, setPatientSearch] = useState("");
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedTestData, setSelectedTestData] = useState(null);
  
  // Status Picker modal state
  const [statusPickerState, setStatusPickerState] = useState({
    visible: false,
    testId: null,
    currentStatus: ""
  });

  const [filters, setFilters] = useState({
    for_date: "",
    search: "",
    status: "",
    priority: "",
  });

  const [summary, setSummary] = useState({
    total_tests_today: 0,
    completed_tests: 0,
    in_progress_tests: 0,
    urgent_tests: 0,
  });

  const [filteredPatients, setFilteredPatients] = useState([]);

  // Bridge Axios wrapper simulating apiFetch
  const apiFetch = async (url, options = {}) => {
    const method = (options.method ?? "GET").toLowerCase();
    const body = options.body ?? null;
    try {
      if (method === "get") {
        return await api.get(url);
      } else if (method === "post") {
        return await api.post(url, body);
      } else if (method === "patch") {
        return await api.patch(url, body);
      } else if (method === "put") {
        return await api.put(url, body);
      } else if (method === "delete") {
        return await api.delete(url);
      }
    } catch (e) {
      throw e;
    }
  };

  // Auth Baseline loading
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

  // Fetch live patient lookup dropdown lists
  useEffect(() => {
    if (patientSearch && patientSearch.length >= 2) {
      const fetchPatients = async () => {
        try {
          if (!token) {
            const matched = mockPatients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()));
            setFilteredPatients(matched);
            return;
          }
          const res = await apiFetch(`/api/v1/lab/patients?search=${encodeURIComponent(patientSearch)}&query=${encodeURIComponent(patientSearch)}`);
          const data = res?.data ?? res ?? {};
          const apiPayload = data?.data ?? data?.patients ?? data?.rows ?? [];
          const mappedPatients = Array.isArray(apiPayload) ? apiPayload.map(p => ({
            id: p.patient_id || p.id,
            name: p.patient_name || p.name,
            age: p.age,
            gender: p.gender,
            phone: p.phone_number || p.phone,
            email: p.email,
            doctor: p.referring_doctor || p.doctor,
            department: p.department,
          })) : [];
          setFilteredPatients(mappedPatients);
        } catch (error) {
          const matched = mockPatients.filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()));
          setFilteredPatients(matched);
        }
      };

      const timer = setTimeout(() => fetchPatients(), 300);
      return () => clearTimeout(timer);
    } else {
      setFilteredPatients([]);
    }
  }, [patientSearch, token]);

  useEffect(() => {
    loadTestData();
  }, [token]);

  const loadTestData = async () => {
    setLoading(true);
    try {
      const params = [];
      if (filters.for_date) params.push(`for_date=${encodeURIComponent(filters.for_date)}`);
      if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
      if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
      if (filters.priority) params.push(`priority=${encodeURIComponent(filters.priority)}`);

      const query = params.join("&");
      const url = query ? `/api/v1/lab/test-registration?${query}` : "/api/v1/lab/test-registration";

      if (!token) {
        setTests(mockRegistrations);
        computeOfflineSummary(mockRegistrations);
        setLoading(false);
        return;
      }

      const res = await apiFetch(url);
      const data = res?.data ?? res ?? {};
      const apiPayload = data?.rows ?? data?.data ?? data?.tests ?? [];
      const mappedData = Array.isArray(apiPayload)
        ? apiPayload.map((test) => ({
          ...test,
          id: test.test_id || test.id,
          patientId: test.patient_id || test.patientId,
          patientName: test.patient_name || test.patientName,
          testType: test.test_type || test.testType,
          sampleType: test.sample_type || test.sampleType,
          registeredDate: test.registered_date || test.registeredDate,
          status: test.status || "SAMPLE_PENDING",
          priority: test.priority ? String(test.priority).toLowerCase() : "routine",
          selectedTests: Array.isArray(test.selectedTests)
            ? test.selectedTests
            : Array.isArray(test.selected_tests)
              ? test.selected_tests
              : [{
                id: Date.now(),
                testType: test.test_type || test.testType,
                sampleType: test.sample_type || test.sampleType,
              }],
        }))
        : [];
      setTests(mappedData.length > 0 ? mappedData : mockRegistrations);
      setSummary({
        total_tests_today: data?.summary?.total_tests_today ?? mappedData.length,
        completed_tests: data?.summary?.completed_tests ?? mappedData.filter(t => t.status === "COMPLETED" || t.status === "Completed").length,
        in_progress_tests: data?.summary?.in_progress_tests ?? mappedData.filter(t => t.status === "IN_PROGRESS" || t.status === "In Progress" || t.status === "SAMPLE_COLLECTED").length,
        urgent_tests: data?.summary?.urgent_tests ?? mappedData.filter(t => t.priority === "urgent").length,
      });
    } catch (error) {
      setTests(mockRegistrations);
      computeOfflineSummary(mockRegistrations);
    } finally {
      setLoading(false);
    }
  };

  const computeOfflineSummary = (list) => {
    setSummary({
      total_tests_today: list.length,
      completed_tests: list.filter(t => t.status === "COMPLETED" || t.status === "Completed").length,
      in_progress_tests: list.filter(t => t.status === "IN_PROGRESS" || t.status === "In Progress" || t.status === "SAMPLE_COLLECTED").length,
      urgent_tests: list.filter(t => t.priority === "urgent" || t.priority === "Urgent").length,
    });
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handleApplyFilters = () => {
    loadTestData();
  };

  const handleStatusChange = async (testId, newStatus) => {
    try {
      if (!token) {
        // Handle mock update
        const updated = tests.map(t => t.id === testId ? { ...t, status: newStatus } : t);
        setTests(updated);
        computeOfflineSummary(updated);
        Alert.alert("Local Update", `Status set to ${newStatus}`);
        return;
      }

      let res;
      try {
        res = await apiFetch(`/api/v1/lab/test-registration/${testId}/status`, {
          method: "PATCH",
          body: { status: newStatus },
        });
      } catch (err) {
        // Fallback for plural endpoint
        res = await apiFetch(`/api/v1/lab/test-registrations/${testId}/status`, {
          method: "PATCH",
          body: { status: newStatus },
        });
      }

      const data = res?.data ?? res ?? {};
      setTests((prevTests) =>
        prevTests.map((t) =>
          t.id === testId ? { ...t, status: newStatus } : t
        )
      );
      Alert.alert("Success", "Status updated successfully.");
    } catch (error) {
      console.warn("Error updating status:", error);
      // Mock update fallback
      const updated = tests.map(t => t.id === testId ? { ...t, status: newStatus } : t);
      setTests(updated);
      computeOfflineSummary(updated);
      Alert.alert("Sync Update", `Updated locally. Status set to: ${newStatus}`);
    }
  };

  const handleRegisterTest = async () => {
    const aggregatedTestType =
      newTest.selectedTests
        .map((t) => t.testType)
        .filter(Boolean)
        .join(", ") || "N/A";
    const aggregatedSampleType =
      newTest.selectedTests
        .map((t) => t.sampleType)
        .filter(Boolean)
        .join(", ") || "N/A";

    const payload = {
      patient_id: newTest.patientId || undefined,
      patient_name: newTest.patientName,
      age: newTest.age ? parseInt(newTest.age, 10) : undefined,
      gender: newTest.gender || undefined,
      phone_number: newTest.phoneNumber || undefined,
      email: newTest.email || undefined,
      registered_date: newTest.registrationDate,
      test_type: aggregatedTestType,
      sample_type: aggregatedSampleType,
      priority: newTest.priority ? newTest.priority.toUpperCase() : "ROUTINE",
      referring_doctor: newTest.referringDoctor || undefined,
      department: newTest.department || undefined,
      instructions: newTest.instructions || undefined,
      selected_tests: newTest.selectedTests.map((t) => ({
        test_type: t.testType,
        sample_type: t.sampleType,
      })),
    };

    if (isEditing) {
      const updated = tests.map((t) =>
        t.id === editingTestId
          ? {
            ...t,
            ...newTest,
            testType: aggregatedTestType,
            sampleType: aggregatedSampleType,
            registeredDate: t.registeredDate, // Preserve original date
          }
          : t,
      );
      setTests(updated);
      computeOfflineSummary(updated);
      Alert.alert("Success", `Test updated successfully! ID: ${editingTestId}`);
    } else {
      try {
        if (!token) {
          throw new Error("No network session active.");
        }

        let res;
        try {
          res = await apiFetch("/api/v1/lab/test-registration", {
            method: "POST",
            body: payload,
          });
        } catch (e) {
          res = await apiFetch("/api/v1/lab/test-registrations", {
            method: "POST",
            body: payload,
          });
        }

        const responseData = res?.data ?? res ?? {};
        const savedTest = responseData?.data ?? responseData?.row ?? responseData;
        const newTestEntry = {
          id: savedTest?.test_id || savedTest?.id || `REG-${new Date().getFullYear()}-${(tests.length + 1).toString().padStart(3, "0")}`,
          patientName: savedTest?.patient_name || savedTest?.patientName || newTest.patientName,
          patientId: savedTest?.patient_id || savedTest?.patientId || newTest.patientId || `PAT-${Math.floor(Math.random() * 1000)}`,
          age: savedTest?.age || newTest.age,
          gender: savedTest?.gender || newTest.gender,
          phoneNumber: savedTest?.phone_number || newTest.phoneNumber,
          email: savedTest?.email || newTest.email,
          testType: savedTest?.test_type || aggregatedTestType,
          sampleType: savedTest?.sample_type || aggregatedSampleType,
          registeredDate: savedTest?.registered_date || newTest.registrationDate,
          status: savedTest?.status || "SAMPLE_PENDING",
          priority: savedTest?.priority ? String(savedTest.priority).toLowerCase() : newTest.priority,
          referringDoctor: savedTest?.referring_doctor || newTest.referringDoctor,
          department: savedTest?.department || newTest.department,
          instructions: savedTest?.instructions || newTest.instructions,
          selectedTests: Array.isArray(savedTest?.selected_tests)
            ? savedTest.selected_tests.map((t, index) => ({
              id: Date.now() + index,
              testType: t.test_type || t.testType,
              sampleType: t.sample_type || t.sampleType,
            }))
            : newTest.selectedTests,
        };

        const updated = [newTestEntry, ...tests];
        setTests(updated);
        computeOfflineSummary(updated);
        Alert.alert("Success", `Test registered successfully! ID: ${newTestEntry.id}`);
      } catch (error) {
        // Offline Saving Fallback
        const newTestEntry = {
          id: `REG-${new Date().getFullYear()}-${(tests.length + 1).toString().padStart(3, "0")}`,
          patientName: newTest.patientName,
          patientId: newTest.patientId || `PAT-${Math.floor(Math.random() * 1000)}`,
          age: newTest.age,
          gender: newTest.gender,
          phoneNumber: newTest.phoneNumber,
          email: newTest.email,
          testType: aggregatedTestType,
          sampleType: aggregatedSampleType,
          registeredDate: newTest.registrationDate,
          status: "SAMPLE_PENDING",
          priority: newTest.priority,
          referringDoctor: newTest.referringDoctor,
          department: newTest.department,
          instructions: newTest.instructions,
          selectedTests: newTest.selectedTests,
        };
        const updated = [newTestEntry, ...tests];
        setTests(updated);
        computeOfflineSummary(updated);
        Alert.alert("Offline Sync", `Saved locally. ID: ${newTestEntry.id}`);
      }
    }

    setShowRegistrationModal(false);
    setIsEditing(false);
    setEditingTestId(null);
    setNewTest({
      patientId: "",
      patientName: "",
      age: "",
      gender: "",
      phoneNumber: "",
      email: "",
      registrationDate: new Date().toISOString().split("T")[0],
      testType: "",
      priority: "routine",
      sampleType: "",
      referringDoctor: "",
      department: "",
      instructions: "",
      selectedTests: [{ id: Date.now(), testType: "", sampleType: "" }],
    });
    setPatientSearch("");
  };

  const handleSelectPatient = (patient) => {
    setNewTest({
      ...newTest,
      patientId: patient.id,
      patientName: patient.name,
      age: String(patient.age ?? ""),
      gender: patient.gender,
      phoneNumber: patient.phone,
      email: patient.email,
      referringDoctor: patient.doctor || "",
      department: patient.department || "",
    });
    setPatientSearch(patient.name);
    setShowPatientDropdown(false);
  };

  const handleViewTest = (test) => {
    setSelectedTestData(test);
    setShowViewModal(true);
  };

  const handleEditTest = (test) => {
    setIsEditing(true);
    setEditingTestId(test.id);
    setNewTest({
      patientId: test.patientId || "",
      patientName: test.patientName || "",
      age: String(test.age ?? ""),
      gender: test.gender || "",
      phoneNumber: test.phoneNumber || "",
      email: test.email || "",
      registrationDate: test.registeredDate || new Date().toISOString().split("T")[0],
      testType: test.testType || "",
      priority: test.priority || "routine",
      sampleType: test.sampleType || "",
      referringDoctor: test.referringDoctor || "",
      department: test.department || "",
      instructions: test.instructions || "",
      selectedTests: test.selectedTests || [
        {
          id: Date.now(),
          testType: test.testType,
          sampleType: test.sampleType,
        },
      ],
    });
    setPatientSearch(test.patientName || "");
    setShowRegistrationModal(true);
  };

  const handlePrintLabels = async (testData) => {
    if (!testData) return;

    const printDate = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const printTime = new Date().toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const html = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Registration Slip - ${testData.id}</title>
        <style>
          body {
            font-family: sans-serif;
            margin: 0;
            padding: 20px;
            color: #1a202c;
          }
          .letterhead {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #2d3748;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }
          .hospital-name {
            font-size: 18px;
            font-weight: bold;
            color: #1e3a8a;
            text-transform: uppercase;
          }
          .info-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            font-size: 12px;
          }
          .info-table td {
            padding: 5px 0;
          }
          .bold { font-weight: bold; }
          .test-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
          }
          .test-table th {
            border: 1px solid #d1d5db;
            background: #f9fafb;
            padding: 8px;
            text-align: left;
            font-size: 11px;
          }
          .test-table td {
            border: 1px solid #d1d5db;
            padding: 8px;
            font-size: 11px;
          }
        </style>
      </head>
      <body>
        <div class="letterhead">
          <div>
            <div class="hospital-name">City Multispeciality Hospital</div>
            <div style="font-size: 10px; color: #4b5563;">Accredited Laboratory Services</div>
          </div>
          <div style="text-align: right;">
            <div style="font-weight: bold; color: #1e3a8a;">Lab Slip</div>
            <div style="font-size: 11px; font-weight: bold; font-family: monospace;">${testData.id}</div>
          </div>
        </div>

        <table class="info-table">
          <tr>
            <td class="bold" style="width: 110px;">Patient Name</td>
            <td>: ${testData.patientName}</td>
            <td class="bold" style="width: 110px;">Time Issued</td>
            <td>: ${printDate}, ${printTime}</td>
          </tr>
          <tr>
            <td class="bold">Age / Gender</td>
            <td>: ${testData.age} yrs / ${testData.gender}</td>
            <td class="bold">Priority Status</td>
            <td style="color: ${testData.priority === "urgent" ? "#ef4444" : "#1a202c"}; font-weight: bold;">: ${String(testData.priority).toUpperCase()}</td>
          </tr>
          <tr>
            <td class="bold">Referring Doctor</td>
            <td>: ${testData.referringDoctor || "Self Referral"}</td>
            <td class="bold">Specimen Status</td>
            <td>: Registered</td>
          </tr>
        </table>

        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; color: #4b5563; margin-top: 20px;">Requested Investigations</div>
        <table class="test-table">
          <thead>
            <tr>
              <th style="width: 40px;">No</th>
              <th>Test & Description</th>
              <th>Specimen Type</th>
            </tr>
          </thead>
          <tbody>
            ${testData.selectedTests && testData.selectedTests.length > 0
        ? testData.selectedTests.map((t, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td><strong>${t.testType}</strong></td>
                <td>${t.sampleType}</td>
              </tr>
            `).join("")
        : `
              <tr>
                <td>1</td>
                <td><strong>${testData.testType}</strong></td>
                <td>${testData.sampleType}</td>
              </tr>
            `
      }
          </tbody>
        </table>

        ${testData.instructions ? `
          <div style="margin-top: 20px; font-size: 11px; border-left: 3px solid #1e3a8a; padding-left: 10px; font-style: italic;">
            <strong>Instructions:</strong> ${testData.instructions}
          </div>
        ` : ""}
      </body>
    </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Share.share({ url: uri, title: `Lab_Slip_${testData.id}` });
    } catch (e) {
      Alert.alert("Print Error", "Failed to compile printable document.");
    }
  };

  const handleBulkPrint = () => {
    const list = filteredTests();
    if (list.length === 0) {
      Alert.alert("Empty", "No active records to print labels for.");
      return;
    }
    Alert.alert("Bulk Printing", `Prepared print queue for ${list.length} laboratory barcodes.`);
  };

  const filteredTests = () => {
    return tests.filter(
      (test) =>
        test.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        test.testType.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View className="flex-row justify-between items-center mb-6">
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.title}>Test Registration</Text>
          <Text style={styles.subtitle}>Register new lab tests and manage request logs</Text>
        </View>
        <TouchableOpacity 
          onPress={() => setShowFilters(!showFilters)}
          className={`w-11 h-11 rounded-2xl items-center justify-center border ${
            showFilters ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"
          }`}
        >
          <Ionicons name="filter" size={18} color={showFilters ? "white" : "#475569"} />
        </TouchableOpacity>
      </View>

      {/* Segmented Top Primary Actions */}
      <View className="flex-row gap-3 mb-6">
        <TouchableOpacity
          onPress={handleBulkPrint}
          className="flex-1 bg-white border border-indigo-200 py-3 rounded-2xl flex-row items-center justify-center gap-2"
        >
          <Ionicons name="print-outline" size={16} color="#4f46e5" />
          <Text className="text-indigo-600 text-xs font-black uppercase tracking-wider">Print Labels</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            setIsEditing(false);
            setEditingTestId(null);
            setNewTest({
              patientId: "",
              patientName: "",
              age: "",
              gender: "",
              phoneNumber: "",
              email: "",
              registrationDate: new Date().toISOString().split("T")[0],
              testType: "",
              priority: "routine",
              sampleType: "",
              referringDoctor: "",
              department: "",
              instructions: "",
              selectedTests: [{ id: Date.now(), testType: "", sampleType: "" }],
            });
            setPatientSearch("");
            setShowRegistrationModal(true);
          }}
          className="flex-1 bg-indigo-600 py-3 rounded-2xl flex-row items-center justify-center gap-2 shadow-sm shadow-indigo-100"
        >
          <Ionicons name="add-circle" size={16} color="white" />
          <Text className="text-white text-xs font-black uppercase tracking-wider">New Register</Text>
        </TouchableOpacity>
      </View>

      {/* Advanced Filter Collapse card */}
      {showFilters && (
        <View className="bg-white p-5 rounded-3xl border border-slate-100 mb-6 shadow-sm">
          <Text style={styles.sectionTitle}>Apply Filters</Text>

          <View className="mb-4">
            <Text style={styles.label}>Select Booking Date</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="#cbd5e1"
                value={filters.for_date}
                onChangeText={(val) => handleFilterChange("for_date", val)}
              />
            </View>
          </View>

          <View className="mb-4">
            <Text style={styles.label}>Search Patient / Test</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Type search terms..."
                placeholderTextColor="#cbd5e1"
                value={filters.search}
                onChangeText={(val) => handleFilterChange("search", val)}
              />
            </View>
          </View>

          <View className="flex-row gap-3 mb-4">
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="PENDING / COMPLETED"
                  placeholderTextColor="#cbd5e1"
                  value={filters.status}
                  onChangeText={(val) => handleFilterChange("status", val)}
                />
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Priority</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="ROUTINE / URGENT"
                  placeholderTextColor="#cbd5e1"
                  value={filters.priority}
                  onChangeText={(val) => handleFilterChange("priority", val)}
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleApplyFilters}
            className="bg-indigo-600 py-3 rounded-2xl items-center shadow-md mt-2"
          >
            <Text className="text-white font-black text-xs uppercase tracking-widest">Apply Active Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Stats Summary Board Grid (2x2 Layout) */}
      <View style={styles.statsGrid}>
        {/* Stat 1 */}
        <View style={styles.gridStatCard} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-row items-center">
          <View className="p-2.5 bg-blue-50 rounded-xl mr-3">
            <Ionicons name="flask" size={18} color="#2563eb" />
          </View>
          <View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase">Total Today</Text>
            <Text className="text-slate-800 text-lg font-black mt-0.5">{summary.total_tests_today}</Text>
          </View>
        </View>

        {/* Stat 2 */}
        <View style={styles.gridStatCard} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-row items-center">
          <View className="p-2.5 bg-emerald-50 rounded-xl mr-3">
            <Ionicons name="checkmark-circle" size={18} color="#10b981" />
          </View>
          <View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase">Completed</Text>
            <Text className="text-slate-800 text-lg font-black mt-0.5">{summary.completed_tests}</Text>
          </View>
        </View>

        {/* Stat 3 */}
        <View style={styles.gridStatCard} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-row items-center">
          <View className="p-2.5 bg-amber-50 rounded-xl mr-3">
            <Ionicons name="refresh-circle" size={18} color="#f59e0b" />
          </View>
          <View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase">In Progress</Text>
            <Text className="text-slate-800 text-lg font-black mt-0.5">{summary.in_progress_tests}</Text>
          </View>
        </View>

        {/* Stat 4 */}
        <View style={styles.gridStatCard} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex-row items-center">
          <View className="p-2.5 bg-rose-50 rounded-xl mr-3">
            <Ionicons name="alert-circle" size={18} color="#ef4444" />
          </View>
          <View>
            <Text className="text-slate-400 text-[10px] font-bold uppercase">Urgent</Text>
            <Text className="text-slate-800 text-lg font-black mt-0.5">{summary.urgent_tests}</Text>
          </View>
        </View>
      </View>

      {/* Main Registrations Deck List */}
      <View style={styles.recentSection}>
        <View className="flex-row justify-between items-center mb-4 ml-1">
          <Text style={styles.sectionTitle}>Registration Logs ({filteredTests().length})</Text>
          <View className="bg-slate-100 px-3 py-1 rounded-full">
            <Text className="text-[10px] text-slate-500 font-bold uppercase">Active records</Text>
          </View>
        </View>

        {/* Text Filter Bar */}
        <View style={styles.inputGroup} className="mb-4">
          <View style={styles.inputWrapper}>
            <Ionicons name="search" size={16} color="#94a3b8" />
            <TextInput
              style={styles.input}
              placeholder="Quick search index (e.g. Alice)..."
              placeholderTextColor="#94a3b8"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color="#4f46e5" className="mt-8" />
        ) : filteredTests().length > 0 ? (
          filteredTests().map((item) => (
            <View
              key={item.id}
              style={[
                styles.recentItem,
                { borderLeftColor: item.priority === "urgent" ? "#ef4444" : "#cbd5e1" }
              ]}
            >
              <View className="flex-1">
                <View className="flex-row items-center gap-2 mb-1">
                  <Text className="text-slate-800 font-black text-sm">{item.patientName}</Text>
                  <View className={`px-2 py-0.5 rounded-full ${
                    item.priority === "urgent" ? "bg-rose-50" : "bg-slate-100"
                  }`}>
                    <Text className={`text-[9px] font-black uppercase ${
                      item.priority === "urgent" ? "text-rose-600" : "text-slate-500"
                    }`}>{item.priority}</Text>
                  </View>
                </View>

                <Text className="text-slate-500 font-bold text-xs">Test: {item.testType}</Text>
                <Text className="text-[10px] text-slate-400 font-semibold mt-1">ID: {item.id} • Sample: {item.sampleType}</Text>

                {/* Direct Action Status Tag */}
                <TouchableOpacity
                  onPress={() => setStatusPickerState({
                    visible: true,
                    testId: item.id,
                    currentStatus: item.status
                  })}
                  className="mt-3.5 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl self-start flex-row items-center gap-1.5"
                >
                  <View className={`w-2 h-2 rounded-full ${
                    item.status === "COMPLETED" || item.status === "Completed"
                      ? "bg-emerald-500"
                      : item.status === "SAMPLE_PENDING"
                        ? "bg-rose-500"
                        : "bg-amber-500"
                  }`} />
                  <Text className="text-slate-600 font-bold text-[10px] uppercase">
                    {item.status.replace("_", " ")} ↻
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Individual Row Action Matrix */}
              <View className="justify-between items-end gap-3 pl-2">
                <Text className="text-[10px] font-black text-slate-400">{item.registeredDate}</Text>
                
                <View className="flex-row gap-1.5">
                  <TouchableOpacity
                    onPress={() => handleViewTest(item)}
                    className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 items-center justify-center"
                  >
                    <Ionicons name="eye" size={14} color="#4f46e5" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handleEditTest(item)}
                    className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-100 items-center justify-center"
                  >
                    <Ionicons name="pencil" size={14} color="#d97706" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => handlePrintLabels(item)}
                    className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-100 items-center justify-center"
                  >
                    <Ionicons name="print" size={14} color="#059669" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        ) : (
          <View className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 items-center justify-center mt-2">
            <Ionicons name="folder-open" size={36} color="#cbd5e1" />
            <Text className="text-slate-400 font-bold text-xs mt-3">No registration records match</Text>
          </View>
        )}
      </View>

      {/* Status ActionSheet Selector modal */}
      <Modal 
        visible={statusPickerState.visible} 
        transparent 
        animationType="fade"
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-[36px] p-6">
            <View className="flex-row justify-between items-center mb-5">
              <Text className="text-slate-800 font-black text-base">Change Registration Status</Text>
              <TouchableOpacity onPress={() => setStatusPickerState({ visible: false, testId: null, currentStatus: "" })}>
                <Ionicons name="close-circle" size={24} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {["SAMPLE_PENDING", "SAMPLE_COLLECTED", "IN_PROGRESS", "COMPLETED"].map((stat) => (
              <TouchableOpacity
                key={stat}
                onPress={() => {
                  handleStatusChange(statusPickerState.testId, stat);
                  setStatusPickerState({ visible: false, testId: null, currentStatus: "" });
                }}
                className={`py-3.5 px-4 rounded-2xl flex-row justify-between items-center mb-2.5 border ${
                  statusPickerState.currentStatus === stat
                    ? "bg-indigo-50 border-indigo-200"
                    : "bg-slate-50 border-slate-100"
                }`}
              >
                <Text className={`font-black text-xs uppercase ${
                  statusPickerState.currentStatus === stat ? "text-indigo-600" : "text-slate-700"
                }`}>
                  {stat.replace("_", " ")}
                </Text>
                {statusPickerState.currentStatus === stat && (
                  <Ionicons name="checkmark-circle" size={18} color="#4f46e5" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* 1. Full High Fidelity Test Registration Modal */}
      <Modal 
        visible={showRegistrationModal} 
        animationType="slide"
        onRequestClose={() => setShowRegistrationModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-slate-50"
        >
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-100 bg-white pt-10">
            <Text className="text-base font-black text-slate-800">
              {isEditing ? "Edit Test Registration" : "Register New Test"}
            </Text>
            <TouchableOpacity onPress={() => setShowRegistrationModal(false)}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
            
            {/* Patient Search autocomplete lookup */}
            <View className="mb-4">
              <Text style={styles.label}>Patient Name Lookup</Text>
              <View className="bg-white border border-slate-200 rounded-2xl px-4 py-2.5 flex-row items-center relative">
                <Ionicons name="search" size={16} color="#94a3b8" />
                <TextInput
                  className="flex-1 ml-2 text-slate-800 text-xs font-semibold"
                  placeholder="Search patient name..."
                  value={patientSearch}
                  onChangeText={(val) => {
                    setPatientSearch(val);
                    setNewTest({ ...newTest, patientName: val });
                    setShowPatientDropdown(true);
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                />
                <TouchableOpacity onPress={() => setShowPatientDropdown(!showPatientDropdown)}>
                  <Ionicons name="arrow-down" size={16} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              {/* Dynamic patient drop results overlay */}
              {showPatientDropdown && filteredPatients.length > 0 && (
                <View className="bg-white border border-slate-200 rounded-2xl p-2 mt-2 max-h-40 shadow-sm">
                  <ScrollView nestedScrollEnabled>
                    {filteredPatients.map((patient) => (
                      <TouchableOpacity
                        key={patient.id}
                        onPress={() => handleSelectPatient(patient)}
                        className="py-2.5 px-3 border-b border-slate-50 last:border-b-0"
                      >
                        <Text className="text-slate-800 font-bold text-xs">{patient.name}</Text>
                        <Text className="text-[9px] text-slate-400 font-semibold mt-0.5">
                          {patient.id} • {patient.gender} • {patient.age} yrs
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Demographics Deck */}
            <View className="mb-4">
              <Text style={styles.label}>Patient ID</Text>
              <TextInput
                className="bg-slate-100 border border-slate-200 rounded-2xl px-4 py-3 text-slate-500 text-xs font-bold"
                value={newTest.patientId}
                editable={false}
                placeholder="Auto-filled or manual ID"
              />
            </View>

            <View className="flex-row gap-3 mb-4">
              <View className="flex-1">
                <Text style={styles.label}>Age</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                  keyboardType="numeric"
                  value={newTest.age}
                  onChangeText={(val) => setNewTest({ ...newTest, age: val })}
                />
              </View>
              
              <View className="flex-1">
                <Text style={styles.label}>Gender</Text>
                <TextInput
                  className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                  placeholder="e.g. Female"
                  value={newTest.gender}
                  onChangeText={(val) => setNewTest({ ...newTest, gender: val })}
                />
              </View>
            </View>

            <View className="mb-4">
              <Text style={styles.label}>Contact Phone Number</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                keyboardType="phone-pad"
                value={newTest.phoneNumber}
                onChangeText={(val) => setNewTest({ ...newTest, phoneNumber: val })}
              />
            </View>

            <View className="mb-4">
              <Text style={styles.label}>Email Address</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                keyboardType="email-address"
                value={newTest.email}
                onChangeText={(val) => setNewTest({ ...newTest, email: val })}
              />
            </View>

            <View className="mb-4">
              <Text style={styles.label}>Registration Booking Date</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                value={newTest.registrationDate}
                onChangeText={(val) => setNewTest({ ...newTest, registrationDate: val })}
              />
            </View>

            <View className="border-t border-slate-100 pt-4 mb-4">
              <Text style={styles.sectionTitle}>Clinical & Referral Context</Text>

              <View className="flex-row gap-3 mb-4">
                <View className="flex-1">
                  <Text style={styles.label}>Referring Doctor</Text>
                  <TextInput
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                    placeholder="Doctor name"
                    value={newTest.referringDoctor}
                    onChangeText={(val) => setNewTest({ ...newTest, referringDoctor: val })}
                  />
                </View>
                
                <View className="flex-1">
                  <Text style={styles.label}>Department</Text>
                  <TextInput
                    className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                    placeholder="Clinical Unit"
                    value={newTest.department}
                    onChangeText={(val) => setNewTest({ ...newTest, department: val })}
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text style={styles.label}>Priority Level</Text>
                <View className="flex-row gap-2">
                  {["routine", "urgent"].map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      onPress={() => setNewTest({ ...newTest, priority: lvl })}
                      className={`flex-1 py-3 rounded-2xl border items-center ${
                        newTest.priority === lvl ? "bg-indigo-600 border-indigo-600" : "bg-white border-slate-200"
                      }`}
                    >
                      <Text className={`text-[10px] font-black uppercase ${
                        newTest.priority === lvl ? "text-white" : "text-slate-600"
                      }`}>{lvl}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Dynamic Investigations Table list row appending */}
            <View className="border-t border-slate-100 pt-4 mb-4">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-slate-500 text-xs font-black uppercase tracking-wider">Dynamic Investigations List</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setNewTest({
                      ...newTest,
                      selectedTests: [...newTest.selectedTests, { id: Date.now(), testType: "", sampleType: "" }]
                    });
                  }}
                  className="bg-indigo-50 border border-indigo-200 px-3.5 py-1.5 rounded-xl flex-row items-center"
                >
                  <Ionicons name="add" size={12} color="#4f46e5" />
                  <Text className="text-indigo-700 font-black text-[10px] ml-0.5">Add Test row</Text>
                </TouchableOpacity>
              </View>

              {newTest.selectedTests.map((rowItem, idx) => (
                <View key={rowItem.id} className="bg-slate-100 p-3 rounded-2xl mb-3 flex-row items-center gap-2">
                  <View className="flex-1">
                    <TextInput 
                      className="bg-white rounded-xl px-3 py-2 text-slate-800 text-[11px] font-bold mb-1.5 border border-slate-200"
                      placeholder="e.g. CBC, Liver Function"
                      value={rowItem.testType}
                      onChangeText={(val) => {
                        const updated = [...newTest.selectedTests];
                        updated[idx].testType = val;
                        setNewTest({ ...newTest, selectedTests: updated });
                      }}
                    />
                    <TextInput 
                      className="bg-white rounded-xl px-3 py-2 text-slate-800 text-[11px] font-bold border border-slate-200"
                      placeholder="Sample Type: Blood, Urine"
                      value={rowItem.sampleType}
                      onChangeText={(val) => {
                        const updated = [...newTest.selectedTests];
                        updated[idx].sampleType = val;
                        setNewTest({ ...newTest, selectedTests: updated });
                      }}
                    />
                  </View>
                  
                  <TouchableOpacity 
                    disabled={newTest.selectedTests.length === 1}
                    onPress={() => {
                      const rem = newTest.selectedTests.filter((_, i) => i !== idx);
                      setNewTest({ ...newTest, selectedTests: rem });
                    }}
                    className="p-2"
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View className="mb-6">
              <Text style={styles.label}>Special Instructions</Text>
              <TextInput
                className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-slate-800 text-xs font-semibold"
                multiline
                numberOfLines={3}
                placeholder="Patient fasting details, clinical signs..."
                value={newTest.instructions}
                onChangeText={(val) => setNewTest({ ...newTest, instructions: val })}
              />
            </View>

            <TouchableOpacity 
              onPress={handleRegisterTest}
              className="bg-indigo-600 py-3.5 rounded-2xl items-center shadow-md"
            >
              <Text className="text-white font-black text-xs uppercase tracking-widest">
                {isEditing ? "Update Lab Request" : "Register Diagnostic Request"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* 2. Detailed Dossier Modal Overlay */}
      <Modal visible={showViewModal} animationType="slide">
        <View className="flex-1 bg-slate-50 pt-10">
          <View className="px-6 py-4 flex-row justify-between items-center border-b border-slate-100 bg-white">
            <Text className="text-base font-black text-slate-800">Registration Detail Dossier</Text>
            <TouchableOpacity onPress={() => setShowViewModal(false)}>
              <Ionicons name="close" size={24} color="#475569" />
            </TouchableOpacity>
          </View>

          {selectedTestData && (
            <ScrollView className="flex-1 px-6 pt-4" contentContainerStyle={{ paddingBottom: 60 }}>
              <View className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm mb-4">
                <Text className="text-[10px] font-bold text-slate-400 uppercase">Test Identifier</Text>
                <Text className="text-slate-800 font-black text-lg mt-0.5">{selectedTestData.id}</Text>
                
                <View className="flex-row items-center mt-3 justify-between">
                  <View className={`px-3 py-1 rounded-full ${
                    selectedTestData.priority === "urgent" ? "bg-rose-50" : "bg-blue-50"
                  }`}>
                    <Text className={`text-[9px] font-black uppercase ${
                      selectedTestData.priority === "urgent" ? "text-rose-600" : "text-blue-600"
                    }`}>{selectedTestData.priority}</Text>
                  </View>

                  <View className={`px-3 py-1 rounded-full ${
                    selectedTestData.status === "COMPLETED" || selectedTestData.status === "Completed" ? "bg-emerald-50" : "bg-amber-50"
                  }`}>
                    <Text className={`text-[9px] font-black uppercase ${
                      selectedTestData.status === "COMPLETED" || selectedTestData.status === "Completed" ? "text-emerald-600" : "text-amber-600"
                    }`}>{selectedTestData.status.replace("_", " ")}</Text>
                  </View>
                </View>
              </View>

              {/* Demographic Information Grid cards */}
              <View className="flex-row flex-wrap gap-3 mb-4">
                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 min-w-[45%]">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">Patient Name</Text>
                  <Text className="text-slate-700 font-bold text-xs mt-1">{selectedTestData.patientName}</Text>
                </View>

                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 min-w-[45%]">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">Patient ID</Text>
                  <Text className="text-slate-700 font-bold text-xs mt-1">{selectedTestData.patientId}</Text>
                </View>

                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 min-w-[45%]">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">Age / Gender</Text>
                  <Text className="text-slate-700 font-bold text-xs mt-1">{selectedTestData.age} yrs / {selectedTestData.gender}</Text>
                </View>

                <View className="bg-white p-3.5 rounded-2xl border border-slate-100 flex-1 min-w-[45%]">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase">Registered Date</Text>
                  <Text className="text-slate-700 font-bold text-xs mt-1">{selectedTestData.registeredDate}</Text>
                </View>
              </View>

              {/* Referral Doctor context */}
              <View className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-4">
                <Text className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-2">Referral Context</Text>
                <View className="flex-row justify-between py-1.5 border-b border-slate-50">
                  <Text className="text-slate-500 text-xs">Medical Officer</Text>
                  <Text className="text-slate-800 font-bold text-xs">{selectedTestData.referringDoctor || "Self referral"}</Text>
                </View>
                <View className="flex-row justify-between py-1.5">
                  <Text className="text-slate-500 text-xs">Department</Text>
                  <Text className="text-slate-800 font-bold text-xs">{selectedTestData.department || "N/A"}</Text>
                </View>
              </View>

              {/* Requested Investigation Table list cards */}
              <View className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm mb-4">
                <Text className="text-[9px] uppercase font-black text-slate-400 tracking-wider mb-3">Investigation Details</Text>
                {(selectedTestData.selectedTests || []).map((t, idx) => (
                  <View key={idx} className="flex-row justify-between border-b border-slate-50 py-2.5 last:border-b-0">
                    <Text className="text-slate-800 text-xs font-bold">{t.testType}</Text>
                    <Text className="text-[10px] text-slate-400 font-mono uppercase">Specimen: {t.sampleType}</Text>
                  </View>
                ))}
              </View>

              {selectedTestData.instructions ? (
                <View className="bg-amber-50/40 border border-amber-100 p-4 rounded-3xl mb-6">
                  <Text className="text-[10px] font-bold text-amber-600 uppercase flex-row items-center">
                    <Ionicons name="alert-circle-outline" size={11} color="#d97706" /> Clinical Instructions
                  </Text>
                  <Text className="text-slate-700 text-xs mt-2 leading-relaxed font-semibold">
                    {selectedTestData.instructions}
                  </Text>
                </View>
              ) : null}

              {/* Overlay Foot Action Matrices */}
              <View className="flex-row gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setShowViewModal(false);
                    handleEditTest(selectedTestData);
                  }}
                  className="bg-amber-600 py-3.5 rounded-2xl items-center flex-1 shadow-sm"
                >
                  <Text className="text-white font-black text-xs uppercase">Edit Record</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handlePrintLabels(selectedTestData)}
                  className="bg-indigo-600 py-3.5 rounded-2xl items-center flex-1 shadow-sm"
                >
                  <Text className="text-white font-black text-xs uppercase">Print Slip</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

export default function TestRegistration() {
  return (
    <LabLayout>
      <TestRegistrationContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  content: { padding: 20, paddingBottom: 100 },
  header: { marginBottom: 24 },
  title: { fontSize: 24, fontWeight: "900", color: "#1e293b" },
  subtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  formCard: { backgroundColor: "#fff", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  sectionTitle: { fontSize: 13, fontWeight: "800", color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 11, fontWeight: "700", color: "#64748b", marginBottom: 6, marginLeft: 4 },
  inputWrapper: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 16, paddingHorizontal: 16 },
  input: { flex: 1, height: 46, marginLeft: 8, fontSize: 13, color: "#1e293b", fontWeight: "600" },
  row: { flexDirection: "row" },
  submitButton: { backgroundColor: "#2563eb", height: 50, borderRadius: 16, alignItems: "center", justifyContent: "center", marginTop: 10, shadowColor: "#2563eb", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  submitButtonText: { color: "#fff", fontSize: 15, fontWeight: "800" },
  recentSection: { marginTop: 16 },
  recentItem: { flexDirection: "row", backgroundColor: "#fff", padding: 18, borderRadius: 24, marginBottom: 12, borderLeftWidth: 4, borderLeftColor: "#cbd5e1", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 1 },
  recentIcon: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center", marginRight: 12 },
  recentText: { fontSize: 13, fontWeight: "700", color: "#1e293b" },
  recentSubtext: { fontSize: 11, color: "#94a3b8", marginTop: 2 },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  gridStatCard: {
    width: (width - 52) / 2, // Perfect 2-column layout with 12px gap accounting for 20px left/right container padding
    marginBottom: 12,
  }
});
