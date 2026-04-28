import React, { useMemo, useState, useCallback, useEffect } from 'react'
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
  StyleSheet,
  RefreshControl,
  Switch,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DoctorLayout from './DoctorLayout'
import {
  advancedSearchDoctorPatients,
  getDoctorAllMedicalRecords,
  getDoctorPatientCaseHistory,
  getDoctorPatientClinicalAlerts,
  getDoctorPatientDocuments,
  getDoctorPatientMedicalRecords,
  getDoctorPatientSummary,
  getDoctorPatientTimeline,
  searchDoctorPatients,
} from '../../services/doctorApi'

const { width } = Dimensions.get('window')

const SEARCH_SCOPE_OPTIONS = [
  { value: 'ALL_PATIENTS', label: 'All Patients' },
  { value: 'MY_PATIENTS', label: 'My Patients' },
  { value: 'DEPARTMENT_PATIENTS', label: 'Dept Patients' },
  { value: 'RECENT_PATIENTS', label: 'Recent Patients' },
]

function csvToArray(value) {
  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const StatCard = ({ label, value, icon, color, bgColor }) => (
  <View style={[styles.statCard, { backgroundColor: bgColor, borderColor: `${color}20` }]}>
    <View className="flex-row items-center justify-between mb-2">
      <View style={{ backgroundColor: 'white' }} className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm">
        <Ionicons name={icon} size={16} color={color} />
      </View>
    </View>
    <Text className="text-[10px] font-bold text-gray-500 uppercase tracking-widest" numberOfLines={1}>{label}</Text>
    <Text className="text-xl font-black text-gray-900 mt-1">{value}</Text>
  </View>
)

const PatientCard = ({ patient, onOpen }) => (
  <TouchableOpacity
    onPress={() => onOpen(patient)}
    className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3"
  >
    <View className="flex-row justify-between items-start mb-2">
      <View className="flex-1">
        <Text className="text-base font-black text-gray-900">{patient.patient_name || 'N/A'}</Text>
        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
          {patient.patient_ref || 'NO REF'} • {patient.gender || '-'} • {patient.patient_age || '-'} YRS
        </Text>
      </View>
      <View className="bg-blue-50 px-2 py-1 rounded-md">
        <Text className="text-[10px] font-black text-blue-600 uppercase">{patient.total_visits || 0} VISITS</Text>
      </View>
    </View>
    <View className="flex-row items-center mt-2 pt-2 border-t border-gray-50">
      <View className="flex-1">
        <Text className="text-[10px] text-gray-400 font-bold uppercase">Last Visit</Text>
        <Text className="text-xs text-gray-700 font-bold">{formatDate(patient.last_visit_date)}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-[10px] text-gray-400 font-bold uppercase">Phone</Text>
        <Text className="text-xs text-gray-700 font-bold">{patient.phone_number || '-'}</Text>
      </View>
    </View>
    {Array.isArray(patient.risk_factors) && patient.risk_factors.length > 0 && (
      <View className="mt-2 flex-row flex-wrap gap-1">
        {patient.risk_factors.map((r, i) => (
          <View key={i} className="bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
            <Text className="text-[8px] font-bold text-red-600 uppercase">{r}</Text>
          </View>
        ))}
      </View>
    )}
  </TouchableOpacity>
)

const MedicalRecordCard = ({ record }) => (
  <View className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mb-3">
    <View className="flex-row justify-between items-start mb-2">
      <View className="flex-1">
        <Text className="text-sm font-black text-gray-900" numberOfLines={1}>{record.patient_name || 'N/A'}</Text>
        <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
          {record.record_id || 'NO ID'} • {record.date || '-'}
        </Text>
      </View>
      <View className={record.is_finalized ? "bg-green-50 px-2 py-1 rounded-md" : "bg-yellow-50 px-2 py-1 rounded-md"}>
        <Text className={record.is_finalized ? "text-[8px] font-black text-green-600 uppercase" : "text-[8px] font-black text-yellow-600 uppercase"}>
          {record.is_finalized ? 'FINALIZED' : 'DRAFT'}
        </Text>
      </View>
    </View>
    <View className="mt-1">
      <Text className="text-[10px] text-gray-400 font-bold uppercase">Diagnosis</Text>
      <Text className="text-xs text-gray-700 font-medium" numberOfLines={2}>{record.diagnosis || 'No diagnosis recorded'}</Text>
    </View>
    <View className="mt-2 pt-2 border-t border-gray-50 flex-row justify-between">
      <Text className="text-[10px] text-gray-500 font-bold">Dr. {record.doctor_name || '-'}</Text>
    </View>
  </View>
)

const PatientRecordsContent = () => {
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [loadingGlobalRecords, setLoadingGlobalRecords] = useState(false)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const [patients, setPatients] = useState([])
  const [globalRecords, setGlobalRecords] = useState([])
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [patientDetails, setPatientDetails] = useState({
    summary: null,
    records: [],
    timeline: [],
    caseHistory: null,
    alerts: [],
    documents: [],
  })

  const [searchForm, setSearchForm] = useState({
    query: '',
    search_scope: 'ALL_PATIENTS',
    include_inactive: false,
    limit: 20,
  })

  const [advancedForm, setAdvancedForm] = useState({
    query: '',
    search_scope: 'ALL_PATIENTS',
    limit: 20,
    age_min: '',
    age_max: '',
    gender: '',
    blood_group: '',
    chronic_conditions: '',
    allergies: '',
    diagnosis_keywords: '',
    last_visit_from: '',
    last_visit_to: '',
  })

  const [globalRecordFilters, setGlobalRecordFilters] = useState({
    page: 1,
    limit: 20,
    patient_search: '',
    date_from: '',
    date_to: '',
  })

  const stats = useMemo(() => {
    const highRisk = patients.filter((p) => (p.risk_factors || []).length > 0).length
    const chronic = patients.filter((p) => (p.chronic_conditions || []).length > 0).length
    return {
      total: patients.length,
      highRisk,
      chronic,
      withAlerts: patients.filter((p) => (p.clinical_alerts || []).length > 0).length,
    }
  }, [patients])

  const handleSearchPatients = async () => {
    if (String(searchForm.query || '').trim().length < 2) {
      Alert.alert('Search Query', 'Enter at least 2 characters to search patients.')
      return
    }

    setLoadingSearch(true)
    try {
      const payload = await searchDoctorPatients(searchForm)
      setPatients(payload?.patients || payload?.data?.patients || payload || [])
    } catch (err) {
      Alert.alert('Search Error', err.message || 'Could not search patients right now.')
      setPatients([])
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleAdvancedSearch = async () => {
    if (String(advancedForm.query || '').trim().length < 2) {
      Alert.alert('Advanced Search', 'Advanced search query must be at least 2 characters.')
      return
    }

    setLoadingSearch(true)
    try {
      const searchRequest = {
        query: advancedForm.query,
        search_scope: advancedForm.search_scope,
        limit: Number(advancedForm.limit) || 20,
      }
      const filters = {
        age_range:
          advancedForm.age_min || advancedForm.age_max
            ? {
              min: advancedForm.age_min ? Number(advancedForm.age_min) : undefined,
              max: advancedForm.age_max ? Number(advancedForm.age_max) : undefined,
            }
            : null,
        gender: advancedForm.gender || null,
        blood_group: advancedForm.blood_group || null,
        chronic_conditions: csvToArray(advancedForm.chronic_conditions),
        allergies: csvToArray(advancedForm.allergies),
        diagnosis_keywords: csvToArray(advancedForm.diagnosis_keywords),
        last_visit_range:
          advancedForm.last_visit_from || advancedForm.last_visit_to
            ? {
              from: advancedForm.last_visit_from || undefined,
              to: advancedForm.last_visit_to || undefined,
            }
            : null,
      }

      const payload = await advancedSearchDoctorPatients(searchRequest, filters)
      setPatients(payload?.patients || payload?.data?.patients || payload || [])
      setIsAdvancedOpen(false)
    } catch (err) {
      Alert.alert('Advanced Search Error', err.message || 'Advanced patient search failed.')
      setPatients([])
    } finally {
      setLoadingSearch(false)
    }
  }

  const handleLoadGlobalRecords = async () => {
    setLoadingGlobalRecords(true)
    try {
      const payload = await getDoctorAllMedicalRecords(globalRecordFilters)
      setGlobalRecords(payload?.records || payload?.data?.records || payload || [])
    } catch (err) {
      Alert.alert('Records Error', err.message || 'Could not fetch medical records list.')
      setGlobalRecords([])
    } finally {
      setLoadingGlobalRecords(false)
    }
  }

  const handleOpenPatientDetails = async (patient) => {
    const patientRef = patient?.patient_ref || patient?.patient_id || patient?.patientRef
    if (!patientRef) {
      Alert.alert('Reference Missing', 'Patient reference is missing.')
      return
    }

    setSelectedPatient(patient)
    setIsDetailsModalOpen(true)
    setDetailsLoading(true)

    try {
      const [summaryPayload, recordsPayload, timelinePayload, casePayload, alertsPayload, docsPayload] = await Promise.all([
        getDoctorPatientSummary(patientRef).catch(() => null),
        getDoctorPatientMedicalRecords(patientRef, { limit: 20 }).catch(() => null),
        getDoctorPatientTimeline(patientRef, { grouping: 'MONTHLY' }).catch(() => null),
        getDoctorPatientCaseHistory(patientRef, '1year').catch(() => null),
        getDoctorPatientClinicalAlerts(patientRef, false).catch(() => null),
        getDoctorPatientDocuments(patientRef).catch(() => null),
      ])

      setPatientDetails({
        summary: summaryPayload?.patient_summary || summaryPayload?.data?.patient_summary || summaryPayload || null,
        records: recordsPayload?.medical_records || recordsPayload?.data?.medical_records || recordsPayload || [],
        timeline: timelinePayload?.timeline_entries || timelinePayload?.data?.timeline_entries || timelinePayload || [],
        caseHistory: casePayload?.data || casePayload || null,
        alerts: alertsPayload?.alerts || alertsPayload?.data?.alerts || alertsPayload || [],
        documents: docsPayload?.documents || docsPayload?.data?.documents || docsPayload || [],
      })
    } catch (err) {
      Alert.alert('Load Error', 'Could not load complete patient insight data.')
    } finally {
      setDetailsLoading(false)
    }
  }

  const onRefresh = () => {
    setRefreshing(true)
    handleLoadGlobalRecords()
    setRefreshing(false)
  }

  return (
    <View className="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className="mb-6">
          <Text className="text-3xl font-black text-slate-900 tracking-tighter">Clinical Lookup</Text>
          <Text className="text-sm text-slate-500 font-bold mt-1">Search and manage patient health records</Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between gap-y-2 mb-6">
          <StatCard label="Matched" value={stats.total} icon="search" color="#3b82f6" bgColor="#eff6ff" />
          <StatCard label="High Risk" value={stats.highRisk} icon="warning" color="#f59e0b" bgColor="#fffbeb" />
          <StatCard label="Chronic" value={stats.chronic} icon="pulse" color="#8b5cf6" bgColor="#f5f3ff" />
          <StatCard label="Alerts" value={stats.withAlerts} icon="notifications" color="#ef4444" bgColor="#fef2f2" />
        </View>

        {/* Simple Search Section */}
        <View className="bg-white p-5 rounded-[32px] border border-slate-100 shadow-sm mb-6">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-sm font-black text-slate-900 uppercase tracking-widest">Search Directory</Text>
            <TouchableOpacity onPress={() => setIsAdvancedOpen(!isAdvancedOpen)}>
              <Text className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
                {isAdvancedOpen ? 'HIDE FILTERS' : 'ADVANCED'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="space-y-3">
            <View className="bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100 flex-row items-center">
              <Ionicons name="search" size={18} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-3 text-sm text-slate-900 font-medium"
                placeholder="Name, Phone, Email or ID"
                placeholderTextColor="#94a3b8"
                value={searchForm.query}
                onChangeText={(text) => setSearchForm(prev => ({ ...prev, query: text }))}
              />
            </View>

            <View className="flex-row gap-2">
              <View className="flex-1 bg-slate-50 rounded-2xl px-4 py-3 border border-slate-100">
                <Text className="text-[8px] font-bold text-gray-400 uppercase mb-1">Search Scope</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View className="flex-row gap-1">
                    {SEARCH_SCOPE_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        onPress={() => setSearchForm(prev => ({ ...prev, search_scope: opt.value }))}
                        className={`px-3 py-1 rounded-full ${searchForm.search_scope === opt.value ? 'bg-blue-600' : 'bg-white border border-slate-200'}`}
                      >
                        <Text className={`text-[10px] font-bold ${searchForm.search_scope === opt.value ? 'text-white' : 'text-slate-600'}`}>
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>
            </View>

            <View className="flex-row items-center justify-between px-2">
              <View className="flex-row items-center">
                <Text className="text-xs font-bold text-slate-500 mr-2">Include Inactive</Text>
                <Switch
                  value={searchForm.include_inactive}
                  onValueChange={(val) => setSearchForm(prev => ({ ...prev, include_inactive: val }))}
                  trackColor={{ false: '#e2e8f0', true: '#3b82f6' }}
                />
              </View>
              <TouchableOpacity
                onPress={handleSearchPatients}
                disabled={loadingSearch}
                className="bg-blue-600 px-6 py-3 rounded-2xl shadow-lg shadow-blue-200 flex-row items-center"
              >
                {loadingSearch ? <ActivityIndicator size="small" color="white" /> : (
                  <>
                    <Ionicons name="search" size={16} color="white" className="mr-2" />
                    <Text className="text-white font-black text-xs uppercase ml-2">Execute</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Advanced Search Panel */}
        {isAdvancedOpen && (
          <View className="bg-white p-5 rounded-[32px] border border-blue-100 shadow-xl mb-6">
            <Text className="text-sm font-black text-blue-900 uppercase tracking-widest mb-4">Advanced Clinical Filters</Text>
            <View className="space-y-3">
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 text-xs"
                  placeholder="Min Age"
                  keyboardType="numeric"
                  value={advancedForm.age_min}
                  onChangeText={(t) => setAdvancedForm(prev => ({ ...prev, age_min: t }))}
                />
                <TextInput
                  className="flex-1 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 text-xs"
                  placeholder="Max Age"
                  keyboardType="numeric"
                  value={advancedForm.age_max}
                  onChangeText={(t) => setAdvancedForm(prev => ({ ...prev, age_max: t }))}
                />
              </View>
              <View className="flex-row gap-2">
                <TextInput
                  className="flex-1 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 text-xs"
                  placeholder="Gender"
                  value={advancedForm.gender}
                  onChangeText={(t) => setAdvancedForm(prev => ({ ...prev, gender: t }))}
                />
                <TextInput
                  className="flex-1 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 text-xs"
                  placeholder="Blood Group"
                  value={advancedForm.blood_group}
                  onChangeText={(t) => setAdvancedForm(prev => ({ ...prev, blood_group: t }))}
                />
              </View>
              <TextInput
                className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 text-xs"
                placeholder="Chronic Conditions (comma separated)"
                value={advancedForm.chronic_conditions}
                onChangeText={(t) => setAdvancedForm(prev => ({ ...prev, chronic_conditions: t }))}
              />
              <TextInput
                className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 text-xs"
                placeholder="Diagnosis Keywords"
                value={advancedForm.diagnosis_keywords}
                onChangeText={(t) => setAdvancedForm(prev => ({ ...prev, diagnosis_keywords: t }))}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Text className="text-[8px] font-bold text-gray-400 mb-1 ml-1">VISIT FROM</Text>
                  <TextInput
                    className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 text-xs"
                    placeholder="YYYY-MM-DD"
                    value={advancedForm.last_visit_from}
                    onChangeText={(t) => setAdvancedForm(prev => ({ ...prev, last_visit_from: t }))}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[8px] font-bold text-gray-400 mb-1 ml-1">VISIT TO</Text>
                  <TextInput
                    className="bg-slate-50 rounded-xl px-4 py-2 border border-slate-100 text-xs"
                    placeholder="YYYY-MM-DD"
                    value={advancedForm.last_visit_to}
                    onChangeText={(t) => setAdvancedForm(prev => ({ ...prev, last_visit_to: t }))}
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={handleAdvancedSearch}
                className="bg-blue-900 py-3 rounded-2xl items-center mt-2"
              >
                <Text className="text-white font-black text-xs uppercase">Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Results Sections */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4 px-2">
            <Text className="text-lg font-black text-slate-900">Patient Results</Text>
            {patients.length > 0 && <Text className="text-[10px] font-bold text-slate-400 uppercase">{patients.length} FOUND</Text>}
          </View>
          {loadingSearch ? (
            <View className="py-10 items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Fetching Patients...</Text>
            </View>
          ) : patients.length > 0 ? (
            patients.map((p, i) => <PatientCard key={i} patient={p} onOpen={handleOpenPatientDetails} />)
          ) : (
            <View className="bg-white p-8 rounded-[32px] border border-slate-100 items-center justify-center">
              <Ionicons name="people-outline" size={40} color="#e2e8f0" />
              <Text className="mt-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">No patient results to show</Text>
            </View>
          )}
        </View>

        {/* Global Records Section */}
        <View className="mb-8">
          <View className="flex-row items-center justify-between mb-4 px-2">
            <Text className="text-lg font-black text-slate-900">General Medical Records</Text>
            <TouchableOpacity
              onPress={handleLoadGlobalRecords}
              className="bg-slate-100 px-3 py-1.5 rounded-full flex-row items-center"
            >
              <Ionicons name="refresh" size={12} color="#475569" />
              <Text className="text-[10px] font-black text-slate-600 uppercase ml-1">LOAD</Text>
            </TouchableOpacity>
          </View>

          <View className="bg-white p-4 rounded-[32px] border border-slate-100 shadow-sm mb-4">
            <View className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100 flex-row items-center">
              <Ionicons name="search" size={14} color="#94a3b8" />
              <TextInput
                className="flex-1 ml-2 text-xs text-slate-900"
                placeholder="Quick filter records..."
                value={globalRecordFilters.patient_search}
                onChangeText={(t) => setGlobalRecordFilters(prev => ({ ...prev, patient_search: t }))}
              />
            </View>
          </View>

          {loadingGlobalRecords ? (
            <ActivityIndicator size="large" color="#3b82f6" />
          ) : globalRecords.length > 0 ? (
            globalRecords.map((r, i) => <MedicalRecordCard key={i} record={r} />)
          ) : (
            <Text className="text-center text-[10px] font-bold text-slate-400 uppercase py-6">No global records loaded</Text>
          )}
        </View>

      </ScrollView>

      {/* Patient Insight Modal */}
      <Modal
        visible={isDetailsModalOpen}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setIsDetailsModalOpen(false)}
      >
        <View className="flex-1 bg-[#F8FAFC]">
          {/* Modal Header */}
          <View className="px-6 pt-14 pb-4 bg-white border-b border-slate-100 flex-row items-center justify-between">
            <View>
              <Text className="text-xl font-black text-slate-900 tracking-tighter">
                {selectedPatient?.patient_name || 'Patient Insight'}
              </Text>
              <Text className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                REF: {selectedPatient?.patient_ref || 'PENDING'}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setIsDetailsModalOpen(false)}
              className="w-10 h-10 bg-slate-50 rounded-full items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#1e293b" />
            </TouchableOpacity>
          </View>

          {detailsLoading ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="mt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Synchronizing Clinical Data...</Text>
            </View>
          ) : (
            <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>

              {/* Summary Section */}
              <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-6">
                <Text className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Patient Profile</Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 font-bold">Age / Gender</Text>
                    <Text className="text-xs text-slate-900 font-black">{patientDetails.summary?.patient_age || '-'}Y / {patientDetails.summary?.gender || '-'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 font-bold">Blood Group</Text>
                    <Text className="text-xs text-slate-900 font-black">{patientDetails.summary?.blood_group || '-'}</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-xs text-slate-500 font-bold">Phone</Text>
                    <Text className="text-xs text-slate-900 font-black">{patientDetails.summary?.phone_number || '-'}</Text>
                  </View>
                  <View className="mt-2 pt-2 border-t border-slate-50">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">Last Known Diagnosis</Text>
                    <Text className="text-sm text-slate-800 font-bold mt-0.5">{patientDetails.summary?.last_diagnosis || 'None recorded'}</Text>
                  </View>
                </View>
              </View>

              {/* Alerts Section */}
              <View className="bg-red-50 p-6 rounded-[32px] border border-red-100 mb-6">
                <View className="flex-row items-center mb-4">
                  <Ionicons name="notifications" size={18} color="#ef4444" />
                  <Text className="text-sm font-black text-red-900 uppercase tracking-widest ml-2">Clinical Alerts</Text>
                </View>
                {patientDetails.alerts.length === 0 ? (
                  <Text className="text-xs text-red-600 font-medium italic">No active clinical alerts.</Text>
                ) : (
                  <View className="space-y-3">
                    {patientDetails.alerts.map((alert, idx) => (
                      <View key={idx} className="bg-white/80 p-3 rounded-2xl border border-red-100">
                        <Text className="text-xs font-black text-red-900">{alert.title}</Text>
                        <Text className="text-[10px] text-red-700 font-medium mt-1">{alert.description}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Records Timeline */}
              <View className="mb-6">
                <Text className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 ml-2">Medical History</Text>
                {patientDetails.records.length === 0 ? (
                  <View className="bg-white p-6 rounded-[32px] border border-slate-100 items-center">
                    <Text className="text-[10px] font-bold text-slate-400 uppercase">No recent records</Text>
                  </View>
                ) : (
                  patientDetails.records.map((rec, idx) => (
                    <View key={idx} className="bg-white p-4 rounded-2xl border border-slate-100 mb-3 shadow-sm">
                      <View className="flex-row justify-between mb-2">
                        <Text className="text-xs font-black text-slate-900">{rec.date}</Text>
                        <Text className="text-[10px] font-bold text-blue-600 uppercase">Dr. {rec.doctor_name}</Text>
                      </View>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase">Complaint</Text>
                      <Text className="text-xs text-slate-700 font-medium mb-2">{rec.chief_complaint || '-'}</Text>
                      <Text className="text-[10px] text-slate-400 font-bold uppercase">Plan</Text>
                      <Text className="text-xs text-slate-700 font-medium">{rec.treatment_plan || '-'}</Text>
                    </View>
                  ))
                )}
              </View>

              {/* Case History Analysis */}
              <View className="bg-slate-900 p-6 rounded-[32px] mb-6">
                <Text className="text-sm font-black text-white uppercase tracking-widest mb-4">Case Intelligence</Text>
                <View className="flex-row justify-between mb-4">
                  <View>
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">Readmission Risk</Text>
                    <Text className="text-xl font-black text-white">{patientDetails.caseHistory?.readmission_risk || 'N/A'}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[10px] text-slate-400 font-bold uppercase">Total Cases</Text>
                    <Text className="text-xl font-black text-white">{patientDetails.caseHistory?.total_cases || '0'}</Text>
                  </View>
                </View>
                <Text className="text-[10px] text-slate-400 font-bold uppercase mb-2">Clinical Recommendations</Text>
                {(patientDetails.caseHistory?.clinical_recommendations || []).map((rec, i) => (
                  <View key={i} className="flex-row items-start mb-1">
                    <Text className="text-blue-400 mr-2">•</Text>
                    <Text className="text-xs text-slate-300 font-medium flex-1">{rec}</Text>
                  </View>
                ))}
              </View>

              {/* Documents Section */}
              <View className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm mb-6">
                <Text className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Clinical Documents</Text>
                {patientDetails.documents.length === 0 ? (
                  <Text className="text-xs text-slate-400 italic">No uploaded documents.</Text>
                ) : (
                  <View className="space-y-3">
                    {patientDetails.documents.map((doc, idx) => (
                      <TouchableOpacity key={idx} className="flex-row items-center p-3 bg-slate-50 rounded-2xl border border-slate-100">
                        <View className="w-8 h-8 bg-blue-50 rounded-lg items-center justify-center mr-3">
                          <Ionicons name="document-text" size={16} color="#3b82f6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-xs font-black text-slate-900" numberOfLines={1}>{doc.title || doc.file_name}</Text>
                          <Text className="text-[8px] font-bold text-slate-400 uppercase">{doc.document_type} • {doc.uploaded_date}</Text>
                        </View>
                        <Ionicons name="download-outline" size={16} color="#94a3b8" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  statCard: {
    width: (width - 48) / 2, // Fits 2 columns
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  }
})

export default function PatientRecordsScree() {
  return (
    <DoctorLayout>
      <PatientRecordsContent />
    </DoctorLayout>
  )
}
