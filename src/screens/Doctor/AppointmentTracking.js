import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  Dimensions,
  Switch,
  RefreshControl,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import DoctorLayout from './DoctorLayout'
import {
  createCommunicationLogEntry,
  doctorAppointmentErrorMessage,
  getAppointmentMetricsSummary,
  getAppointmentTrackingDetails,
  getCommunicationLog,
  getNotificationHistory,
  getTodaysAppointmentDelays,
  getTodaysAppointmentTracking,
  getUpcomingAppointmentsTracking,
  sendAppointmentNotification,
  sendBulkAppointmentNotifications,
  updateAppointmentDelay,
} from '../../services/doctorApi'

const { width } = Dimensions.get('window')

const NOTIFICATION_TYPES = [
  'APPOINTMENT_REMINDER',
  'APPOINTMENT_CONFIRMATION',
  'APPOINTMENT_CANCELLATION',
  'APPOINTMENT_RESCHEDULE',
  'APPOINTMENT_DELAY',
  'FOLLOW_UP_REMINDER',
]

const METRIC_PERIODS = ['week', 'month', 'quarter', 'year']
const NOTIFICATION_CHANNELS = ['SMS', 'EMAIL', 'PUSH']
const COMMUNICATION_TYPES = ['CALL', 'SMS', 'EMAIL', 'IN_PERSON']
const COMMUNICATION_DIRECTIONS = ['OUTBOUND', 'INBOUND']

function normalizeApiData(payload) {
  return payload?.data ?? payload ?? {}
}

function formatClockTime(timeStr) {
  if (!timeStr) return '-'
  const part = String(timeStr).slice(0, 5)
  const [hRaw, mRaw] = part.split(':')
  const h = parseInt(hRaw, 10)
  const m = mRaw ?? '00'
  if (Number.isNaN(h)) return String(timeStr)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h % 12 || 12
  return `${h12}:${m} ${ampm}`
}

function normalizedStatus(status) {
  return String(status || '').toUpperCase()
}

function humanizeStatus(status) {
  return String(status || 'UNKNOWN')
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function statusStyle(status) {
  const s = normalizedStatus(status)
  if (s.includes('CONFIRMED') || s === 'CHECKED_IN') return { bg: '#ecfdf5', text: '#059669' }
  if (s.includes('COMPLETED')) return { bg: '#eff6ff', text: '#2563eb' }
  if (s.includes('CANCELLED')) return { bg: '#fef2f2', text: '#dc2626' }
  return { bg: '#fffbeb', text: '#d97706' }
}

const AppointmentTracking = () => {
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [todaySummary, setTodaySummary] = useState({})
  const [todayAppointments, setTodayAppointments] = useState([])
  const [upcomingDays, setUpcomingDays] = useState(7)
  const [upcomingByDate, setUpcomingByDate] = useState({})
  const [metricsPeriod, setMetricsPeriod] = useState('month')
  const [metrics, setMetrics] = useState({})
  const [delays, setDelays] = useState([])
  const [delaySummary, setDelaySummary] = useState({})
  const [notificationHistory, setNotificationHistory] = useState([])
  const [communicationLog, setCommunicationLog] = useState([])
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [selectedTracking, setSelectedTracking] = useState(null)
  const [isSendingNotification, setIsSendingNotification] = useState(false)
  const [isSendingBulkNotification, setIsSendingBulkNotification] = useState(false)
  const [isUpdatingDelay, setIsUpdatingDelay] = useState(false)
  const [isCreatingCommunicationLog, setIsCreatingCommunicationLog] = useState(false)
  const [isCommunicationModalOpen, setIsCommunicationModalOpen] = useState(false)

  const [notificationForm, setNotificationForm] = useState({
    appointment_ref: '',
    notification_type: 'APPOINTMENT_REMINDER',
    message: '',
    channels: {
      SMS: true,
      EMAIL: false,
      PUSH: false,
    },
  })

  const [bulkNotificationForm, setBulkNotificationForm] = useState({
    notification_type: 'APPOINTMENT_REMINDER',
    message_template:
      'Hello {patient_name}, this is a reminder from {doctor_name} for your appointment on {appointment_date} at {appointment_time}.',
    channels: {
      SMS: true,
      EMAIL: false,
      PUSH: false,
    },
  })

  const [selectedBulkRefs, setSelectedBulkRefs] = useState([])

  const [delayForm, setDelayForm] = useState({
    appointment_ref: '',
    delay_minutes: 15,
    reason: '',
    estimated_new_time: '',
    notify_patient: true,
  })

  const [notificationFiltersDraft, setNotificationFiltersDraft] = useState({
    appointment_ref: '',
    notification_type: '',
    date_from: '',
    date_to: '',
    limit: 20,
  })

  const [appliedNotificationFilters, setAppliedNotificationFilters] = useState({
    appointment_ref: '',
    notification_type: '',
    date_from: '',
    date_to: '',
    limit: 20,
  })

  const [communicationFiltersDraft, setCommunicationFiltersDraft] = useState({
    appointment_ref: '',
    patient_ref: '',
    communication_type: '',
    date_from: '',
    date_to: '',
    limit: 20,
  })

  const [appliedCommunicationFilters, setAppliedCommunicationFilters] = useState({
    appointment_ref: '',
    patient_ref: '',
    communication_type: '',
    date_from: '',
    date_to: '',
    limit: 20,
  })

  const [communicationForm, setCommunicationForm] = useState({
    appointment_ref: '',
    communication_type: 'SMS',
    direction: 'OUTBOUND',
    channel: 'SMS',
    subject: '',
    message: '',
    status: 'SENT',
    response_received: false,
    response_message: '',
  })

  const runApiRequest = useCallback(async (requestFn, fallbackError) => {
    try {
      const payload = await requestFn()
      return { ok: true, payload }
    } catch (err) {
      return { ok: false, payload: {}, error: err.message || fallbackError }
    }
  }, [])

  const loadDashboardData = useCallback(async (showLoader = false) => {
    if (showLoader) setLoading(true)
    setRefreshing(true)

    const [todayRes, upcomingRes, metricRes, delayRes, historyRes, communicationRes] = await Promise.all([
      runApiRequest(getTodaysAppointmentTracking, 'Could not load today tracking data'),
      runApiRequest(() => getUpcomingAppointmentsTracking(upcomingDays), 'Could not load upcoming tracking data'),
      runApiRequest(() => getAppointmentMetricsSummary(metricsPeriod), 'Could not load metrics'),
      runApiRequest(getTodaysAppointmentDelays, 'Could not load delays summary'),
      runApiRequest(() => getNotificationHistory(appliedNotificationFilters), 'Could not load notification history'),
      runApiRequest(() => getCommunicationLog(appliedCommunicationFilters), 'Could not load communication log'),
    ])

    if (todayRes.ok) {
      const data = normalizeApiData(todayRes.payload)
      const appointments = Array.isArray(data?.appointments) ? data.appointments : []
      setTodaySummary(data?.tracking_summary || {})
      setTodayAppointments(appointments)
    }

    if (upcomingRes.ok) {
      const data = normalizeApiData(upcomingRes.payload)
      setUpcomingByDate(data?.appointments_by_date || {})
    }

    if (metricRes.ok) {
      const data = normalizeApiData(metricRes.payload)
      setMetrics(data?.metrics || {})
    }

    if (delayRes.ok) {
      const data = normalizeApiData(delayRes.payload)
      setDelaySummary(data || {})
      setDelays(Array.isArray(data?.delays) ? data.delays : [])
    }

    if (historyRes.ok) {
      const data = normalizeApiData(historyRes.payload)
      setNotificationHistory(Array.isArray(data?.notifications) ? data.notifications : [])
    }

    if (communicationRes.ok) {
      const data = normalizeApiData(communicationRes.payload)
      setCommunicationLog(Array.isArray(data?.communications) ? data.communications : [])
    }

    setLoading(false)
    setRefreshing(false)
  }, [
    appliedCommunicationFilters,
    appliedNotificationFilters,
    metricsPeriod,
    runApiRequest,
    upcomingDays,
  ])

  useEffect(() => {
    loadDashboardData(true)
  }, [loadDashboardData])

  const upcomingRows = useMemo(() => {
    return Object.entries(upcomingByDate || {}).flatMap(([date, items]) =>
      (Array.isArray(items) ? items : []).map((item) => ({
        ...item,
        date,
      }))
    )
  }, [upcomingByDate])

  const handleViewTrackingDetails = async (appointmentRef) => {
    if (!appointmentRef) return
    setDetailsLoading(true)
    const result = await runApiRequest(
      () => getAppointmentTrackingDetails(appointmentRef),
      'Could not load appointment tracking details'
    )
    if (!result.ok) {
      Alert.alert('Error', result.error)
      setDetailsLoading(false)
      return
    }
    const data = normalizeApiData(result.payload)
    setSelectedTracking({
      appointment_tracking: data?.appointment_tracking || {},
      communication_log: Array.isArray(data?.communication_log) ? data.communication_log : [],
      notification_history: Array.isArray(data?.notification_history) ? data.notification_history : [],
    })
    setDetailsLoading(false)
  }

  const handleSendNotification = async () => {
    const channels = Object.entries(notificationForm.channels)
      .filter(([, checked]) => checked)
      .map(([channel]) => channel)

    if (!notificationForm.appointment_ref) {
      Alert.alert('Error', 'Please select an appointment reference')
      return
    }
    if (channels.length === 0) {
      Alert.alert('Error', 'Please select at least one notification channel')
      return
    }

    setIsSendingNotification(true)
    const result = await runApiRequest(
      () =>
        sendAppointmentNotification({
          appointment_ref: notificationForm.appointment_ref,
          notification_type: notificationForm.notification_type,
          channels,
          message: String(notificationForm.message || '').trim() || null,
        }),
      'Could not send notification'
    )

    if (!result.ok) {
      Alert.alert('Error', result.error)
    } else {
      Alert.alert('Success', 'Notification sent successfully')
      setNotificationForm((prev) => ({ ...prev, message: '' }))
      loadDashboardData(false)
    }
    setIsSendingNotification(false)
  }

  const handleQuickReminder = async (appointmentRef) => {
    if (!appointmentRef) return
    const result = await runApiRequest(
      () =>
        sendAppointmentNotification({
          appointment_ref: appointmentRef,
          notification_type: 'APPOINTMENT_REMINDER',
          channels: ['SMS'],
          message: null,
        }),
      'Could not send reminder'
    )
    if (!result.ok) {
      Alert.alert('Error', result.error)
      return
    }
    Alert.alert('Success', 'Reminder sent')
    loadDashboardData(false)
  }

  const handleDelayUpdate = async () => {
    if (!delayForm.appointment_ref || !delayForm.reason.trim()) {
      Alert.alert('Error', 'Appointment reference and delay reason are required')
      return
    }

    setIsUpdatingDelay(true)
    const result = await runApiRequest(
      () =>
        updateAppointmentDelay(delayForm.appointment_ref, {
          delay_minutes: Number(delayForm.delay_minutes || 0),
          reason: String(delayForm.reason || '').trim(),
          estimated_new_time: delayForm.estimated_new_time || null,
          notify_patient: Boolean(delayForm.notify_patient),
        }),
      'Could not update appointment delay'
    )

    if (!result.ok) {
      Alert.alert('Error', result.error)
    } else {
      Alert.alert('Success', 'Appointment delay updated')
      setDelayForm((prev) => ({ ...prev, reason: '', estimated_new_time: '' }))
      loadDashboardData(false)
    }
    setIsUpdatingDelay(false)
  }

  const handleBulkNotificationSubmit = async () => {
    const channels = Object.entries(bulkNotificationForm.channels)
      .filter(([, checked]) => checked)
      .map(([channel]) => channel)

    if (selectedBulkRefs.length === 0) {
      Alert.alert('Error', 'Select at least one appointment for bulk notifications')
      return
    }
    if (channels.length === 0) {
      Alert.alert('Error', 'Please select at least one notification channel')
      return
    }
    if (!bulkNotificationForm.message_template.trim()) {
      Alert.alert('Error', 'Message template is required for bulk notification')
      return
    }

    setIsSendingBulkNotification(true)
    const result = await runApiRequest(
      () =>
        sendBulkAppointmentNotifications({
          appointment_refs: selectedBulkRefs,
          notification_type: bulkNotificationForm.notification_type,
          channels,
          message_template: bulkNotificationForm.message_template.trim(),
          priority: 'NORMAL',
        }),
      'Could not send bulk notifications'
    )
    if (!result.ok) {
      Alert.alert('Error', result.error)
    } else {
      Alert.alert('Success', 'Bulk notifications queued successfully')
      loadDashboardData(false)
    }
    setIsSendingBulkNotification(false)
  }

  const handleSelectBulkRef = (appointmentRef) => {
    setSelectedBulkRefs((prev) => {
      if (prev.includes(appointmentRef)) {
        return prev.filter((ref) => ref !== appointmentRef)
      }
      return [...prev, appointmentRef]
    })
  }

  const openCommunicationLogModal = (appointmentRef = '') => {
    setCommunicationForm((prev) => ({
      ...prev,
      appointment_ref: appointmentRef || prev.appointment_ref || todayAppointments[0]?.appointment_ref || '',
    }))
    setIsCommunicationModalOpen(true)
  }

  const handleCreateCommunicationEntry = async () => {
    if (!communicationForm.appointment_ref || !communicationForm.message.trim()) {
      Alert.alert('Error', 'Appointment reference and message are required')
      return
    }

    setIsCreatingCommunicationLog(true)
    const result = await runApiRequest(
      () =>
        createCommunicationLogEntry(communicationForm),
      'Could not create communication log entry'
    )

    if (!result.ok) {
      Alert.alert('Error', result.error)
    } else {
      Alert.alert('Success', 'Communication log entry created')
      setCommunicationForm((prev) => ({
        ...prev,
        subject: '',
        message: '',
        status: 'SENT',
        response_received: false,
        response_message: '',
      }))
      setIsCommunicationModalOpen(false)
      loadDashboardData(false)
    }
    setIsCreatingCommunicationLog(false)
  }

  if (loading && todayAppointments.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
        <Text className="mt-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Tracking Live Data...</Text>
      </View>
    )
  }

  return (
    <DoctorLayout>
      <ScrollView
        className="flex-1 bg-[#F8FAFC]"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadDashboardData(false)} />}
      >
        {/* Header */}
        <View className="mb-6 flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-black text-slate-900 tracking-tighter">Live Tracking</Text>
            <Text className="text-sm text-slate-500 font-bold mt-1">Live status, notifications & delays</Text>
          </View>
          <TouchableOpacity
            onPress={() => loadDashboardData(false)}
            className="w-12 h-12 rounded-2xl bg-white items-center justify-center shadow-sm"
          >
            <Ionicons name="refresh" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>

        {/* Tracking Summary Cards */}
        <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
          <TrackingCard title="Scheduled" value={todaySummary.scheduled || 0} color="#f59e0b" />
          <TrackingCard title="Confirmed" value={todaySummary.confirmed || 0} color="#3b82f6" />
          <TrackingCard title="Checked In" value={todaySummary.checked_in || 0} color="#10b981" />
          <TrackingCard title="In Progress" value={todaySummary.in_progress || 0} color="#8b5cf6" />
          <TrackingCard title="Completed" value={todaySummary.completed || 0} color="#059669" />
        </View>

        {/* Today's Appointments Table */}
        <Section title="Today's Appointments" count={todayAppointments.length}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View>
              <TableHeader columns={['REF', 'PATIENT', 'TIME', 'TRACKING', 'ACTIONS']} />
              {todayAppointments.map((row) => (
                <View key={row.appointment_ref} className="flex-row items-center border-b border-gray-50 py-3 px-2 bg-white">
                  <Text className="w-24 text-[11px] font-black text-blue-600">{row.appointment_ref}</Text>
                  <Text className="w-32 text-xs font-bold text-gray-800" numberOfLines={1}>{row.patient_name}</Text>
                  <Text className="w-24 text-[11px] font-medium text-gray-500">{formatClockTime(row.appointment_time)}</Text>
                  <View className="w-28">
                    <StatusBadge status={row.tracking_status} />
                  </View>
                  <View className="flex-row items-center gap-2">
                    <TouchableOpacity onPress={() => handleViewTrackingDetails(row.appointment_ref)} className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center">
                      <Ionicons name="eye" size={16} color="#2563eb" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleQuickReminder(row.appointment_ref)} className="w-8 h-8 rounded-lg bg-green-50 items-center justify-center">
                      <Ionicons name="paper-plane" size={16} color="#059669" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openCommunicationLogModal(row.appointment_ref)} className="w-8 h-8 rounded-lg bg-indigo-50 items-center justify-center">
                      <Ionicons name="chatbubble-ellipses" size={16} color="#4f46e5" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              {todayAppointments.length === 0 && <NoData message="No appointments today" />}
            </View>
          </ScrollView>
        </Section>

        {/* Notification & Delay Forms Grid */}
        <View className="mt-8 gap-y-6">
          <Section title="Send Notification">
            <View className="gap-4">
              <SelectInput
                label="Appointment"
                value={notificationForm.appointment_ref}
                options={todayAppointments.map(a => ({ label: `${a.appointment_ref} - ${a.patient_name}`, value: a.appointment_ref }))}
                onChange={(v) => setNotificationForm(p => ({ ...p, appointment_ref: v }))}
              />
              <SelectInput
                label="Type"
                value={notificationForm.notification_type}
                options={NOTIFICATION_TYPES.map(t => ({ label: humanizeStatus(t), value: t }))}
                onChange={(v) => setNotificationForm(p => ({ ...p, notification_type: v }))}
              />
              <View>
                <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Channels</Text>
                <View className="flex-row gap-4">
                  {NOTIFICATION_CHANNELS.map(c => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setNotificationForm(p => ({ ...p, channels: { ...p.channels, [c]: !p.channels[c] } }))}
                      className="flex-row items-center gap-2"
                    >
                      <Ionicons name={notificationForm.channels[c] ? "checkbox" : "square-outline"} size={20} color={notificationForm.channels[c] ? "#2563eb" : "#cbd5e1"} />
                      <Text className="text-xs font-bold text-gray-600">{c}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TextInput
                placeholder="Custom Message (Optional)"
                className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold h-24"
                multiline
                value={notificationForm.message}
                onChangeText={(v) => setNotificationForm(p => ({ ...p, message: v }))}
              />
              <TouchableOpacity
                onPress={handleSendNotification}
                disabled={isSendingNotification}
                className="bg-blue-600 h-12 rounded-2xl items-center justify-center"
              >
                {isSendingNotification ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-[10px] uppercase tracking-widest">Send Now</Text>}
              </TouchableOpacity>
            </View>
          </Section>

          <Section title="Update Delay">
            <View className="gap-4">
              <SelectInput
                label="Appointment"
                value={delayForm.appointment_ref}
                options={todayAppointments.map(a => ({ label: `${a.appointment_ref} - ${a.patient_name}`, value: a.appointment_ref }))}
                onChange={(v) => setDelayForm(p => ({ ...p, appointment_ref: v }))}
              />
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delay (Min)</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={String(delayForm.delay_minutes)}
                    onChangeText={(v) => setDelayForm(p => ({ ...p, delay_minutes: v }))}
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">New Time</Text>
                  <TextInput
                    placeholder="HH:MM"
                    value={delayForm.estimated_new_time}
                    onChangeText={(v) => setDelayForm(p => ({ ...p, estimated_new_time: v }))}
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold"
                  />
                </View>
              </View>
              <TextInput
                placeholder="Reason (Emergency, etc.)"
                className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold"
                value={delayForm.reason}
                onChangeText={(v) => setDelayForm(p => ({ ...p, reason: v }))}
              />
              <TouchableOpacity
                onPress={() => setDelayForm(p => ({ ...p, notify_patient: !p.notify_patient }))}
                className="flex-row items-center gap-2"
              >
                <Ionicons name={delayForm.notify_patient ? "checkbox" : "square-outline"} size={20} color={delayForm.notify_patient ? "#2563eb" : "#cbd5e1"} />
                <Text className="text-xs font-bold text-gray-600">Notify Patient Immediately</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleDelayUpdate}
                disabled={isUpdatingDelay}
                className="bg-amber-500 h-12 rounded-2xl items-center justify-center"
              >
                {isUpdatingDelay ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-[10px] uppercase tracking-widest">Update Delay</Text>}
              </TouchableOpacity>
            </View>
          </Section>
        </View>

        {/* Metrics Section */}
        <Section title="Tracking Metrics" className="mt-8">
          <View className="flex-row justify-between mb-4">
            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Period: {metricsPeriod}</Text>
            <View className="flex-row gap-2">
              {METRIC_PERIODS.map(p => (
                <TouchableOpacity key={p} onPress={() => setMetricsPeriod(p)}>
                  <Text className={`text-[10px] font-black uppercase ${metricsPeriod === p ? 'text-blue-600' : 'text-gray-400'}`}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View className="flex-row flex-wrap gap-3">
            <StatMini label="Total" value={metrics.total_appointments || 0} />
            <StatMini label="Confirmed" value={metrics.confirmed_appointments || 0} />
            <StatMini label="Completed" value={metrics.completed_appointments || 0} />
            <StatMini label="Confirm %" value={`${metrics.confirmation_rate || 0}%`} />
            <StatMini label="On-Time %" value={`${metrics.on_time_rate || 0}%`} />
          </View>
        </Section>

      </ScrollView>

      {/* DETAIL MODAL */}
      <Modal visible={Boolean(selectedTracking)} transparent animationType="slide">
        <View className="flex-1 bg-black/60 justify-end">
          <View className="bg-white rounded-t-[48px] p-8 max-h-[85%]">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-2xl font-black text-gray-900 tracking-tighter">Tracking Details</Text>
              <TouchableOpacity onPress={() => setSelectedTracking(null)} className="p-2 bg-gray-50 rounded-full">
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            {selectedTracking && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View className="bg-blue-50/50 p-6 rounded-3xl mb-6">
                  <InfoRow label="Patient" value={selectedTracking.appointment_tracking?.patient_name} />
                  <InfoRow label="Reference" value={selectedTracking.appointment_tracking?.appointment_ref} />
                  <InfoRow label="Time" value={formatClockTime(selectedTracking.appointment_tracking?.appointment_time)} />
                  <InfoRow label="Status" value={humanizeStatus(selectedTracking.appointment_tracking?.tracking_status)} />
                </View>

                <Text className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Notification Timeline</Text>
                <View className="gap-3 mb-8">
                  {selectedTracking.notification_history.map((item, idx) => (
                    <View key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <Text className="text-xs font-bold text-gray-800">{humanizeStatus(item.type)} ({item.channel})</Text>
                      <Text className="text-[10px] text-gray-500 mt-1">{item.sent_at}</Text>
                    </View>
                  ))}
                  {selectedTracking.notification_history.length === 0 && <Text className="text-xs text-gray-400 italic">No notification history</Text>}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* COMMUNICATION MODAL */}
      <Modal visible={isCommunicationModalOpen} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
          <View className="flex-1 bg-black/60 justify-end">
            <View className="bg-white rounded-t-[48px] p-8 max-h-[90%]">
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-2xl font-black text-gray-900 tracking-tighter">New Log Entry</Text>
                <TouchableOpacity onPress={() => setIsCommunicationModalOpen(false)} className="p-2 bg-gray-100 rounded-full">
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                <View className="gap-5">
                  <SelectInput
                    label="Appointment"
                    value={communicationForm.appointment_ref}
                    options={todayAppointments.map(a => ({ label: `${a.appointment_ref} - ${a.patient_name}`, value: a.appointment_ref }))}
                    onChange={(v) => setCommunicationForm(p => ({ ...p, appointment_ref: v }))}
                  />
                  <View className="flex-row gap-3">
                    <View className="flex-1">
                      <SelectInput
                        label="Type"
                        value={communicationForm.communication_type}
                        options={COMMUNICATION_TYPES.map(t => ({ label: t, value: t }))}
                        onChange={(v) => setCommunicationForm(p => ({ ...p, communication_type: v }))}
                      />
                    </View>
                    <View className="flex-1">
                      <SelectInput
                        label="Direction"
                        value={communicationForm.direction}
                        options={COMMUNICATION_DIRECTIONS.map(d => ({ label: d, value: d }))}
                        onChange={(v) => setCommunicationForm(p => ({ ...p, direction: v }))}
                      />
                    </View>
                  </View>
                  <TextInput
                    placeholder="Subject (Optional)"
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold"
                    value={communicationForm.subject}
                    onChangeText={(v) => setCommunicationForm(p => ({ ...p, subject: v }))}
                  />
                  <TextInput
                    placeholder="Detailed message..."
                    className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-xs font-bold h-32"
                    multiline
                    value={communicationForm.message}
                    onChangeText={(v) => setCommunicationForm(p => ({ ...p, message: v }))}
                  />

                  <TouchableOpacity
                    onPress={handleCreateCommunicationEntry}
                    disabled={isCreatingCommunicationLog}
                    className="bg-indigo-600 h-16 rounded-[28px] items-center justify-center shadow-xl shadow-indigo-200 mt-4"
                  >
                    {isCreatingCommunicationLog ? <ActivityIndicator color="white" /> : <Text className="text-white font-black uppercase tracking-widest">Create Log</Text>}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {detailsLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </DoctorLayout>
  )
}

// --- SUB-COMPONENTS ---

const TrackingCard = ({ title, value, color }) => (
  <View style={{ backgroundColor: color, width: (width - 60) / 2 }} className="rounded-3xl p-5 shadow-sm">
    <Text className="text-white/80 text-[10px] font-black uppercase tracking-widest">{title}</Text>
    <Text className="text-2xl font-black text-white mt-1">{value}</Text>
  </View>
)

const Section = ({ title, count, children, className }) => (
  <View className={`bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm ${className}`}>
    <View className="flex-row items-center justify-between mb-6">
      <Text className="text-sm font-black text-gray-900 uppercase tracking-widest">{title}</Text>
      {count !== undefined && (
        <View className="bg-gray-100 px-3 py-1 rounded-full">
          <Text className="text-[10px] font-black text-gray-500">{count}</Text>
        </View>
      )}
    </View>
    {children}
  </View>
)

const TableHeader = ({ columns }) => (
  <View className="flex-row items-center bg-gray-50 py-2 px-2 rounded-xl mb-2">
    {columns.map((col, idx) => (
      <Text key={idx} style={{ width: col === 'PATIENT' ? 132 : col === 'REF' ? 96 : col === 'TIME' ? 96 : col === 'TRACKING' ? 112 : 100 }} className="text-[9px] font-black text-gray-400 uppercase tracking-widest">
        {col}
      </Text>
    ))}
  </View>
)

const StatusBadge = ({ status }) => {
  const style = statusStyle(status)
  return (
    <View style={{ backgroundColor: style.bg }} className="px-2 py-1 rounded-lg self-start">
      <Text style={{ color: style.text }} className="text-[9px] font-black uppercase">
        {humanizeStatus(status)}
      </Text>
    </View>
  )
}

const StatMini = ({ label, value }) => (
  <View className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex-1 min-w-[100px]">
    <Text className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{label}</Text>
    <Text className="text-sm font-black text-gray-900 mt-1">{value}</Text>
  </View>
)

const InfoRow = ({ label, value }) => (
  <View className="flex-row justify-between items-center mb-3">
    <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</Text>
    <Text className="text-xs font-bold text-gray-800">{value || '-'}</Text>
  </View>
)

const SelectInput = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false)
  const selected = options.find(o => o.value === value)
  return (
    <View>
      <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">{label}</Text>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex-row justify-between items-center"
      >
        <Text className="text-xs font-bold text-gray-800">{selected ? selected.label : `Select ${label}`}</Text>
        <Ionicons name="chevron-down" size={16} color="#64748b" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity onPress={() => setOpen(false)} className="flex-1 bg-black/20 justify-center p-6">
          <View className="bg-white rounded-3xl p-4 shadow-xl max-h-[60%]">
            <ScrollView>
              {options.map((opt, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => { onChange(opt.value); setOpen(false) }}
                  className="p-4 border-b border-gray-50"
                >
                  <Text className={`text-sm font-bold ${value === opt.value ? 'text-blue-600' : 'text-gray-700'}`}>{opt.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

const NoData = ({ message }) => (
  <View className="p-10 items-center">
    <Text className="text-gray-400 font-bold text-[10px] uppercase">{message}</Text>
  </View>
)

const styles = StyleSheet.create({
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }
})

export default AppointmentTracking
