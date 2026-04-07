import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Modal, ActivityIndicator, Alert, Dimensions, Platform } from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AdminLayout, { useSidebar } from './AdminLayout';

const { width } = Dimensions.get('window');

const AppointmentsContent = () => {
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalState, setModalState] = useState({ add: false, edit: false, delete: false, view: false });
  const [currentAppointment, setCurrentAppointment] = useState(null);
  const [formData, setFormData] = useState({
    patient: '', doctor: '', date: '', time: '', reason: '',
    type: 'Consultation', priority: 'Normal', notes: ''
  });

  // Data constants
  const PATIENTS = ['Ravi Kumar', 'Anita Sharma', 'Suresh Patel', 'Priya Singh', 'Rajesh Kumar', 'Meena Gupta', 'Arun Verma', 'Kavita Joshi'];
  const DOCTORS = ['Dr. Meena Rao - Cardiology', 'Dr. Vivek Sharma - Orthopedics', 'Dr. Rajesh Menon - Neurology', 'Dr. Anjali Desai - Pediatrics', 'Dr. Kavita Iyer - ENT', 'Dr. Sanjay Kumar - Dermatology'];
  const APPOINTMENT_TYPES = ['Consultation', 'Follow-up', 'Emergency', 'Routine Checkup', 'Surgery', 'Lab Test'];
  const PRIORITIES = ['Normal', 'Urgent', 'Emergency'];
  const TIME_SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM', '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'];

  useEffect(() => { loadAppointments() }, []);

  const loadAppointments = async () => {
    setLoading(true);
    setTimeout(() => {
      setAppointments([
        { id: 'APT-3001', patient: 'Ravi Kumar', doctor: 'Dr. Meena Rao', dateTime: '2023-10-15 10:30 AM', status: 'Confirmed', reason: 'Fever', type: 'Consultation', priority: 'Normal', notes: '' },
        { id: 'APT-3002', patient: 'Anita Sharma', doctor: 'Dr. Sharma', dateTime: '2023-10-15 11:00 AM', status: 'Pending', reason: 'Back Pain', type: 'Consultation', priority: 'Normal', notes: '' },
        { id: 'APT-3003', patient: 'Suresh Patel', doctor: 'Dr. Menon', dateTime: '2023-10-15 11:30 AM', status: 'Confirmed', reason: 'Routine Checkup', type: 'Routine Checkup', priority: 'Normal', notes: '' },
        { id: 'APT-3004', patient: 'Priya Singh', doctor: 'Dr. Desai', dateTime: '2023-10-15 12:00 PM', status: 'Confirmed', reason: 'Migraine', type: 'Consultation', priority: 'Urgent', notes: 'Severe headache' },
        { id: 'APT-3005', patient: 'Rajesh Kumar', doctor: 'Dr. Iyer', dateTime: '2023-10-15 02:00 PM', status: 'Pending', reason: 'Diabetes Review', type: 'Follow-up', priority: 'Normal', notes: '' }
      ]);
      setLoading(false);
    }, 1000);
  };

  // Modal handlers
  const openModal = (type, appointment = null) => {
    setModalState(prev => ({ ...prev, [type]: true }));
    if ((type === 'edit' || type === 'view') && appointment) {
      setCurrentAppointment(appointment);
      const parts = appointment.dateTime.split(' ');
      const date = parts[0];
      const time = parts.length > 2 ? `${parts[1]} ${parts[2]}` : parts[1];
      setFormData({
        patient: appointment.patient,
        doctor: appointment.doctor,
        date: date,
        time: time,
        reason: appointment.reason,
        type: appointment.type,
        priority: appointment.priority,
        notes: appointment.notes || ''
      });
    } else if (type === 'delete' && appointment) {
      setCurrentAppointment(appointment);
    }
  };

  const closeModal = (type) => {
    setModalState(prev => ({ ...prev, [type]: false }));
    if (type !== 'delete' && type !== 'view') resetForm();
    if (type === 'delete' || type === 'view') setCurrentAppointment(null);
  };

  // Core functions
  const handleScheduleAppointment = () => {
    if (!validateForm()) return;
    const appointment = {
      id: `APT-${Math.floor(3000 + Math.random() * 9000)}`,
      ...formData,
      dateTime: `${formData.date} ${formData.time}`,
      status: 'Pending'
    };
    setAppointments(prev => [appointment, ...prev]);
    closeModal('add');
  };

  const handleUpdateAppointment = () => {
    if (!validateForm()) return;
    setAppointments(prev => prev.map(apt =>
      apt.id === currentAppointment.id ? {
        ...apt,
        ...formData,
        dateTime: `${formData.date} ${formData.time}`
      } : apt
    ));
    closeModal('edit');
  };

  const handleDeleteAppointment = () => {
    setAppointments(prev => prev.filter(apt => apt.id !== currentAppointment.id));
    closeModal('delete');
  };

  const handleStatusChange = (appointmentId, newStatus) => {
    setAppointments(prev => prev.map(apt =>
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ));
  };

  const resetForm = () => {
    setFormData({
      patient: '', doctor: '', date: '', time: '', reason: '',
      type: 'Consultation', priority: 'Normal', notes: ''
    });
    setCurrentAppointment(null);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const required = ['patient', 'doctor', 'date', 'time', 'reason'];
    const missing = required.find(field => !formData[field]);
    if (missing) {
      Alert.alert('Validation Error', `Please fill in the ${missing} field`);
      return false;
    }
    return true;
  };

  // Filter appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch = !searchTerm ||
      [apt.patient, apt.doctor, apt.reason].some(field =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      );
    const matchesStatus = !statusFilter || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = [
    { label: 'Scheduled', value: appointments.length, color: 'blue', icon: 'calendar-alt' },
    { label: 'Confirmed', value: appointments.filter(a => a.status === 'Confirmed').length, color: 'green', icon: 'check-circle' },
    { label: 'Pending', value: appointments.filter(a => a.status === 'Pending').length, color: 'orange', icon: 'hourglass-half' },
    { label: 'Completed', value: appointments.filter(a => a.status === 'Completed').length, color: 'purple', icon: 'tasks' },
    { label: 'Cancelled', value: appointments.filter(a => a.status === 'Cancelled').length, color: 'red', icon: 'times-circle' }
  ];

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 py-4 bg-white border-b border-gray-200">




        <View className="flex-row items-center">
          <TouchableOpacity onPress={toggleSidebar} className="mr-4 h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
            <Ionicons name="menu-outline" size={26} color="#0052CC" />
          </TouchableOpacity>
          <View>
            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Administrator</Text>
            <Text className="text-lg font-black text-gray-900">Appointments</Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => openModal('add')}
          className="bg-blue-600 flex-row items-center px-3 py-2 rounded-lg"
        >
          <FontAwesome5 name="plus" size={12} color="white" style={{ marginRight: 6 }} />
          <Text className="text-white font-medium text-sm">Schedule</Text>
        </TouchableOpacity>



      </View>

      <ScrollView className="flex-1 px-4 pt-4" showsVerticalScrollIndicator={false}>
        {/* Search and Filter */}
        <View className="bg-white p-4 rounded-xl border border-gray-200 mb-6 shadow-sm">
          <TextInput
            placeholder="Search appointments..."
            className="border border-gray-300 p-3 rounded-lg focus:border-blue-500 mb-3 text-base"
            value={searchTerm}
            onChangeText={setSearchTerm}
          />
          {/* Mobile Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {['All', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map((status) => {
              const value = status === 'All' ? '' : status;
              const isActive = statusFilter === value;
              return (
                <TouchableOpacity
                  key={status}
                  onPress={() => setStatusFilter(value)}
                  className={`mr-2 px-4 py-2 rounded-full border ${isActive ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
                >
                  <Text className={isActive ? 'text-white font-medium' : 'text-gray-600'}>{status}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Statistics - KPI Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
          <View className="flex-row" style={{ gap: 16 }}>
            {stats.map(({ label, value, color, icon }) => {
              const colorConfigs = {
                blue: { bg: 'bg-[#3b82f6]', from: 'bg-blue-50', iconBg: 'bg-blue-500', bars: ['#60a5fa', '#93c5fd', '#3b82f6', '#60a5fa'] },
                green: { bg: 'bg-[#22c55e]', from: 'bg-green-50', iconBg: 'bg-green-500', bars: ['#86efac', '#4ade80', '#86efac', '#22c55e'] },
                orange: { bg: 'bg-[#f97316]', from: 'bg-orange-50', iconBg: 'bg-orange-500', bars: ['#fb923c', '#fed7aa', '#fb923c', '#f97316'] },
                purple: { bg: 'bg-[#a855f7]', from: 'bg-purple-50', iconBg: 'bg-purple-500', bars: ['#c084fc', '#d8b4fe', '#c084fc', '#a855f7'] },
                red: { bg: 'bg-[#ef4444]', from: 'bg-red-50', iconBg: 'bg-red-500', bars: ['#f87171', '#fca5a5', '#f87171', '#ef4444'] }
              };
              const config = colorConfigs[color] || colorConfigs.blue;
              const heights = [20, 30, 24, 34];

              return (
                <View
                  key={label}
                  className={`relative ${config.from} rounded-xl p-4 border border-gray-200 shadow-sm overflow-hidden`}
                  style={{ width: 180, height: 110 }}
                >
                  <View className="flex-row justify-between items-end h-full">
                    <View>
                      <View className={`w-8 h-8 flex items-center justify-center rounded-full ${config.iconBg} mb-2`}>
                        <FontAwesome5 name={icon} size={12} color="white" />
                      </View>
                      <Text className="text-xs text-gray-500 uppercase">{label}</Text>
                      <Text className="text-xl font-bold text-gray-900 leading-tight">{value}</Text>
                    </View>
                    <View className="flex-row items-end h-10" style={{ gap: 3 }}>
                      {config.bars.map((barColor, idx) => (
                        <View
                          key={idx}
                          className="w-1 rounded-sm"
                          style={{ height: heights[idx], backgroundColor: barColor }}
                        />
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        {/* Appointments List for Mobile */}
        <View className="mb-8">
          <Text className="text-lg font-bold text-gray-800 mb-4">Agenda</Text>
          {filteredAppointments.length === 0 ? (
            <View className="items-center py-10 bg-white rounded-xl border border-gray-200 shadow-sm">
              <FontAwesome5 name="calendar-times" size={40} color="#9ca3af" />
              <Text className="text-gray-500 mt-3 font-medium">No appointments found</Text>
            </View>
          ) : (
            filteredAppointments.map((row) => (
              <View key={row.id} className="bg-white rounded-xl border border-gray-200 mb-4 shadow-sm p-4">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1 pr-2">
                    <Text className="text-base font-bold text-gray-900">{row.patient}</Text>
                    <Text className="text-xs text-gray-500 mt-0.5">{row.id} • {row.type}</Text>
                  </View>
                  <View className={`px-2 py-1 rounded ${row.status === 'Confirmed' ? 'bg-blue-100' :
                    row.status === 'Pending' ? 'bg-yellow-100' :
                      row.status === 'Completed' ? 'bg-green-100' :
                        'bg-red-100'
                    }`}>
                    <Text className={`text-xs font-bold ${row.status === 'Confirmed' ? 'text-blue-800' :
                      row.status === 'Pending' ? 'text-yellow-800' :
                        row.status === 'Completed' ? 'text-green-800' :
                          'text-red-800'
                      }`}>{row.status}</Text>
                  </View>
                </View>

                <View className="mb-4">
                  <View className="flex-row items-center mb-1">
                    <FontAwesome5 name="user-md" size={12} color="#6b7280" style={{ width: 18 }} />
                    <Text className="text-sm text-gray-700">{row.doctor}</Text>
                  </View>
                  <View className="flex-row items-center">
                    <FontAwesome5 name="clock" size={12} color="#6b7280" style={{ width: 18 }} />
                    <Text className="text-sm text-gray-700">{row.dateTime}</Text>
                  </View>
                </View>

                <View className="flex-row border-t border-gray-100 pt-3" style={{ gap: 8 }}>
                  <TouchableOpacity onPress={() => openModal('view', row)} className="flex-1 py-2 bg-blue-50 rounded flex-row justify-center items-center">
                    <FontAwesome5 name="eye" size={12} color="#2563eb" />
                    <Text className="text-blue-700 font-medium ml-1 text-xs">View</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openModal('edit', row)} className="flex-1 py-2 bg-green-50 rounded flex-row justify-center items-center">
                    <FontAwesome5 name="edit" size={12} color="#16a34a" />
                    <Text className="text-green-700 font-medium ml-1 text-xs">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => openModal('delete', row)} className="flex-1 py-2 bg-red-50 rounded flex-row justify-center items-center">
                    <FontAwesome5 name="times" size={12} color="#dc2626" />
                    <Text className="text-red-700 font-medium ml-1 text-xs">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <AppointmentFormModal
        isOpen={modalState.add}
        onClose={() => closeModal('add')}
        title="Schedule Appointment"
        onSubmit={handleScheduleAppointment}
        formData={formData}
        onInputChange={handleInputChange}
        submitText="Schedule"
        submitIcon="calendar-plus"
        patients={PATIENTS}
        doctors={DOCTORS}
        types={APPOINTMENT_TYPES}
        priorities={PRIORITIES}
        timeSlots={TIME_SLOTS}
      />

      <AppointmentFormModal
        isOpen={modalState.edit}
        onClose={() => closeModal('edit')}
        title="Edit Appointment"
        onSubmit={handleUpdateAppointment}
        formData={formData}
        onInputChange={handleInputChange}
        submitText="Update"
        submitIcon="save"
        patients={PATIENTS}
        doctors={DOCTORS}
        types={APPOINTMENT_TYPES}
        priorities={PRIORITIES}
        timeSlots={TIME_SLOTS}
      />

      <ViewAppointmentModal
        isOpen={modalState.view}
        onClose={() => closeModal('view')}
        appointment={currentAppointment}
        onStatusChange={handleStatusChange}
      />

      <DeleteConfirmationModal
        isOpen={modalState.delete}
        onClose={() => closeModal('delete')}
        onConfirm={handleDeleteAppointment}
        name={`Appointment ${currentAppointment?.id}`}
        type="Appointment"
      />
    </View>
  );
};

// Sub-components mapped to React Native (Mobile Optimized Forms)
const CustomModal = ({ isOpen, onClose, title, children }) => {
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-white rounded-t-2xl overflow-hidden shadow-lg w-full max-h-[90%] pb-8">
          <View className="flex-row justify-between items-center p-4 border-b border-gray-200 bg-white">
            <Text className="text-lg font-bold text-gray-800">{title}</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <FontAwesome5 name="times" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <ScrollView className="p-5" keyboardShouldPersistTaps="handled">
            {children}
            <View style={{ height: 30 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Form Modal 
const AppointmentFormModal = ({ isOpen, onClose, title, onSubmit, formData, onInputChange, submitText, submitIcon, patients, doctors, types, priorities, timeSlots }) => (
  <CustomModal isOpen={isOpen} onClose={onClose} title={title}>
    <View className="space-y-4">

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Select Patient *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-base text-gray-800 focus:border-blue-500 focus:bg-white"
          placeholder="e.g. Ravi Kumar"
          value={formData.patient}
          onChangeText={(val) => onInputChange('patient', val)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Select Doctor *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-base text-gray-800 focus:border-blue-500 focus:bg-white"
          placeholder="e.g. Dr. Meena Rao"
          value={formData.doctor}
          onChangeText={(val) => onInputChange('doctor', val)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Appointment Date *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-base text-gray-800 focus:border-blue-500 focus:bg-white"
          placeholder="YYYY-MM-DD"
          value={formData.date}
          onChangeText={(val) => onInputChange('date', val)}
        />
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Appointment Time *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {timeSlots.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => onInputChange('time', t)}
              className={`mr-2 px-4 py-2 rounded-lg border ${formData.time === t ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
            >
              <Text className={`text-sm ${formData.time === t ? 'text-white font-bold' : 'text-gray-700'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Appointment Type *</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
          {types.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => onInputChange('type', t)}
              className={`mr-2 px-4 py-2 rounded-lg border ${formData.type === t ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
            >
              <Text className={`text-sm ${formData.type === t ? 'text-white font-bold' : 'text-gray-700'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">Priority Level *</Text>
        <View className="flex-row gap-2">
          {priorities.map(t => (
            <TouchableOpacity
              key={t}
              onPress={() => onInputChange('priority', t)}
              className={`flex-1 items-center py-2 rounded-lg border ${formData.priority === t ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
            >
              <Text className={`text-sm ${formData.priority === t ? 'text-white font-bold' : 'text-gray-700'}`}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Reason for Visit *</Text>
        <TextInput
          className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-base text-gray-800 focus:border-blue-500 focus:bg-white"
          placeholder="Brief description of the medical issue"
          value={formData.reason}
          onChangeText={(val) => onInputChange('reason', val)}
        />
      </View>

      <View className="mb-6">
        <Text className="text-sm font-medium text-gray-700 mb-1">Additional Notes</Text>
        <TextInput
          className="border border-gray-300 rounded-lg bg-gray-50 p-3 text-base text-gray-800 min-h-[80px] focus:border-blue-500 focus:bg-white"
          placeholder="Any special requirements..."
          multiline
          textAlignVertical="top"
          value={formData.notes}
          onChangeText={(val) => onInputChange('notes', val)}
        />
      </View>

      <View className="flex-row gap-3 mt-2">
        <TouchableOpacity
          onPress={onClose}
          className="flex-1 py-3 border border-gray-300 rounded-xl items-center bg-white"
        >
          <Text className="text-gray-700 font-bold">Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSubmit}
          className={`flex-1 py-3 rounded-xl flex-row justify-center items-center ${(!formData.patient || !formData.doctor || !formData.date || !formData.time || !formData.reason)
            ? 'bg-blue-400' : 'bg-blue-600'
            }`}
          disabled={!formData.patient || !formData.doctor || !formData.date || !formData.time || !formData.reason}
        >
          <FontAwesome5 name={submitIcon} size={14} color="white" style={{ marginRight: 6 }} />
          <Text className="text-white font-bold">{submitText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </CustomModal>
);

const ViewAppointmentModal = ({ isOpen, onClose, appointment, onStatusChange }) => (
  <CustomModal isOpen={isOpen} onClose={onClose} title="Details">
    {appointment && (
      <View>
        <View className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
          <DetailItem label="Appointment ID" value={appointment.id} />
          <View className="my-2 h-[1px] bg-gray-200" />
          <DetailItem label="Status" value={appointment.status} />
          <View className="my-2 h-[1px] bg-gray-200" />
          <DetailItem label="Patient" value={appointment.patient} />
          <View className="my-2 h-[1px] bg-gray-200" />
          <DetailItem label="Doctor" value={appointment.doctor} />
          <View className="my-2 h-[1px] bg-gray-200" />
          <DetailItem label="Date & Time" value={appointment.dateTime} />
          <View className="my-2 h-[1px] bg-gray-200" />
          <DetailItem label="Type" value={appointment.type} />
          <View className="my-2 h-[1px] bg-gray-200" />
          <DetailItem label="Priority" value={appointment.priority} />
          <View className="my-2 h-[1px] bg-gray-200" />
          <DetailItem label="Reason" value={appointment.reason} />
        </View>

        {appointment.notes ? (
          <View className="mb-4">
            <Text className="text-sm font-medium text-gray-700 mb-1">Notes</Text>
            <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
              <Text className="text-sm text-gray-800">{appointment.notes}</Text>
            </View>
          </View>
        ) : null}

        <View className="mt-2 mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-2">Change Status</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {['Pending', 'Confirmed', 'Completed', 'Cancelled'].map(status => (
              <TouchableOpacity
                key={status}
                onPress={() => onStatusChange(appointment.id, status)}
                className={`mr-2 px-4 py-2 rounded-full border ${appointment.status === status ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-300'}`}
              >
                <Text className={appointment.status === status ? 'text-white font-medium' : 'text-gray-700'}>{status}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity onPress={onClose} className="w-full py-4 bg-gray-800 rounded-xl items-center">
          <Text className="text-white font-bold">Close Details</Text>
        </TouchableOpacity>
      </View>
    )}
  </CustomModal>
);

const DetailItem = ({ label, value }) => (
  <View className="flex-row justify-between items-start">
    <Text className="text-gray-500 font-medium text-sm flex-1">{label}</Text>
    <Text className="text-gray-900 font-semibold text-sm flex-1 text-right">{value}</Text>
  </View>
);

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, name, type }) => (
  <CustomModal isOpen={isOpen} onClose={onClose} title={`Cancel`}>
    <View className="items-center py-4">
      <View className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <FontAwesome5 name="exclamation-triangle" size={32} color="#dc2626" />
      </View>
      <Text className="text-xl font-bold text-gray-900 mb-2">Cancel {type}?</Text>
      <Text className="text-gray-500 mb-8 text-center px-4 leading-5">
        Are you sure you want to cancel the appointment for <Text className="font-bold text-gray-800">{name}</Text>?
        This action cannot be reversed.
      </Text>
      <View className="flex-row w-full gap-3">
        <TouchableOpacity onPress={onClose} className="flex-1 py-3.5 border border-gray-300 rounded-xl items-center bg-white">
          <Text className="text-gray-700 font-bold">Keep It</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onConfirm} className="flex-1 py-3.5 bg-red-600 rounded-xl flex-row justify-center items-center">
          <Text className="text-white font-bold">Yes, Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </CustomModal>
);

const AppointmentsScreen = () => (
  <AdminLayout>
    <AppointmentsContent />
  </AdminLayout>
);

export default AppointmentsScreen;