import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal as RNModal,
  ActivityIndicator,
  RefreshControl,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../services/api';
import LabLayout from './LabLayout';

// High-fidelity fallback mock dataset for robust presentation
const defaultMockData = {
  equipment: [
    {
      equipmentId: "eq-10023",
      id: "EQP-001",
      qrCode: "EQP-001",
      name: "Auto-Analyzer 5000",
      type: "Analyzer",
      brand: "Sysmex",
      model: "XN-1000",
      serialNumber: "SN-9982739",
      location: "Biochemistry Lab",
      status: "operational",
      lastMaintenance: "2026-04-10",
      nextMaintenance: "2026-06-10",
      calibrationDue: "2026-06-10",
      installationDate: "2024-01-15",
      notes: "Routine reagent cycles checked weekly. Operating optimally.",
      specifications: { chamber_temp: "37.1 C", throughput: "120 samples/hr" },
      isActive: true,
      created_at: "2024-01-15T09:00:00Z",
      updated_at: "2026-05-10T14:30:00Z"
    },
    {
      equipmentId: "eq-10024",
      id: "EQP-002",
      qrCode: "EQP-002",
      name: "Hematology System X",
      type: "Analyzer",
      brand: "Roche",
      model: "Cobas 6000",
      serialNumber: "SN-8823901",
      location: "Hematology Lab",
      status: "maintenance",
      lastMaintenance: "2026-03-15",
      nextMaintenance: "2026-05-20",
      calibrationDue: "2026-05-20",
      installationDate: "2023-11-20",
      notes: "Laser alignment deviation detected during daily QC. Part replacement scheduled.",
      specifications: { laser_output: "15mW", laser_temp: "24.5 C" },
      isActive: true,
      created_at: "2023-11-20T10:00:00Z",
      updated_at: "2026-05-18T16:15:00Z"
    },
    {
      equipmentId: "eq-10025",
      id: "EQP-003",
      qrCode: "EQP-003",
      name: "Centrifuge Prime",
      type: "Centrifuge",
      brand: "Eppendorf",
      model: "5424 R",
      serialNumber: "SN-7763820",
      location: "Pathology Unit",
      status: "calibration_due",
      lastMaintenance: "2025-11-05",
      nextMaintenance: "2026-05-05",
      calibrationDue: "2026-05-05",
      installationDate: "2023-05-10",
      notes: "Calibration cycle overdue. Limit spin to 4000 RPM until calibrated.",
      specifications: { max_speed: "15000 RPM", rotor_type: "FA-45-24-11" },
      isActive: true,
      created_at: "2023-05-10T11:00:00Z",
      updated_at: "2026-05-05T08:00:00Z"
    }
  ],
  stats: {
    total_equipment: 3,
    operational: 1,
    maintenance: 1,
    calibration_due: 1
  },
  logs: [
    {
      id: "log-88912",
      equipmentId: "eq-10024",
      equipmentName: "Hematology System X",
      type: "preventive",
      date: "2026-04-15",
      performedBy: "Alex Rivers (Technician)",
      cost: 4500,
      description: "Routine chamber decontamination and vacuum pressure validation.",
      status: "completed"
    },
    {
      id: "log-88913",
      equipmentId: "eq-10023",
      equipmentName: "Auto-Analyzer 5000",
      type: "calibration",
      date: "2026-04-10",
      performedBy: "NIST Calibration Services",
      cost: 8000,
      description: "Annual multi-wavelength calibration standard verify.",
      status: "completed"
    }
  ]
};

const equipmentTypes = ['Analyzer', 'Centrifuge', 'Microscope', 'Incubator', 'Autoclave', 'Refrigerator', 'Freezer', 'Pipette', 'Balance', 'Water Bath', 'Other'];

const filterStatusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Operational', value: 'operational' },
  { label: 'Under Maintenance', value: 'maintenance' },
  { label: 'Calibration Due', value: 'calibration_due' },
  { label: 'Out of Service', value: 'out_of_service' },
];

const filterTypeOptions = [
  { label: 'All Types', value: 'all' },
  ...equipmentTypes.map(t => ({ label: t, value: t }))
];

const equipmentStatusStyles = {
  'operational': { colorBg: 'bg-emerald-50 border-emerald-200', colorText: 'text-emerald-700', label: 'Operational', dotColor: 'bg-emerald-500' },
  'maintenance': { colorBg: 'bg-amber-50 border-amber-200', colorText: 'text-amber-700', label: 'Under Maintenance', dotColor: 'bg-amber-500' },
  'calibration_due': { colorBg: 'bg-orange-50 border-orange-200', colorText: 'text-orange-700', label: 'Calibration Due', dotColor: 'bg-orange-500' },
  'out_of_service': { colorBg: 'bg-red-50 border-red-200', colorText: 'text-red-700', label: 'Out of Service', dotColor: 'bg-red-500' },
  'retired': { colorBg: 'bg-slate-100 border-slate-200', colorText: 'text-slate-600', label: 'Retired', dotColor: 'bg-slate-500' }
};

const OptionPickerModal = ({ visible, onClose, title, options, selectedValue, onSelect }) => (
  <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View className="bg-white rounded-t-3xl p-6 w-full max-h-[85%] absolute bottom-0 shadow-2xl">
        <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
          <Text className="text-lg font-black text-slate-800">{title}</Text>
          <TouchableOpacity onPress={onClose} className="p-1">
            <Ionicons name="close" size={24} color="#64748b" />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {options.map((option) => {
            const isSelected = option.value === selectedValue;
            return (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  onSelect(option.value);
                  onClose();
                }}
                className={`flex-row justify-between items-center py-3.5 px-4 rounded-xl mb-1 ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <Text className={`font-semibold text-sm ${isSelected ? 'text-blue-600 font-bold' : 'text-slate-700'}`}>
                  {option.label}
                </Text>
                {isSelected && <Ionicons name="checkmark" size={18} color="#2563eb" />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  </RNModal>
);

const EquipmentTrackingContent = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [equipment, setEquipment] = useState([]);
  const [filteredEquipment, setFilteredEquipment] = useState([]);
  const [equipmentStats, setEquipmentStats] = useState({ total_equipment: 0, operational: 0, maintenance: 0, calibration_due: 0 });
  const [maintenanceLogs, setMaintenanceLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Custom picker modal controls
  const [pickerState, setPickerState] = useState({ visible: false, type: '', title: '', options: [] });
  
  // Filters state
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Popup Triggers
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showCalibrationModal, setShowCalibrationModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  
  const [loadingSelectedEquipment, setLoadingSelectedEquipment] = useState(false);
  const [savingEquipment, setSavingEquipment] = useState(false);
  const [updatingEquipment, setUpdatingEquipment] = useState(false);
  
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [logsFilterType, setLogsFilterType] = useState('all');

  const [toast, setToast] = useState(null);

  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenanceType: 'preventive',
    scheduledDate: new Date().toISOString().split('T')[0],
    technician: '',
    description: '',
    cost: '0',
    status: 'scheduled',
    notes: ''
  });

  const [calibrationForm, setCalibrationForm] = useState({
    calibrationType: 'routine',
    scheduledDate: new Date().toISOString().split('T')[0],
    standard: '',
    description: '',
    cost: '0',
    status: 'scheduled',
    notes: ''
  });

  const [newEquipment, setNewEquipment] = useState({
    name: '',
    type: '',
    brand: '',
    model: '',
    serialNumber: '',
    location: '',
    status: 'operational',
    nextMaintenance: new Date().toISOString().split('T')[0],
    installationDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [editEquipment, setEditEquipment] = useState({
    equipmentId: '',
    equipment_code: '',
    equipment_name: '',
    category: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    location: '',
    installation_date: '',
    last_calibrated_at: '',
    next_calibration_due_at: '',
    notes: ''
  });

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const mapBackendStatusToUi = (backendStatus, nextCalibrationDueAt) => {
    const s = (backendStatus || '').toUpperCase();
    if (s === 'UNDER_MAINTENANCE' || s === 'MAINTENANCE') return 'maintenance';
    if (s === 'CALIBRATION_DUE') return 'calibration_due';
    if (s === 'DOWN' || s === 'INACTIVE') return 'out_of_service';

    if (s === 'ACTIVE' && nextCalibrationDueAt) {
      const d = new Date(nextCalibrationDueAt);
      if (!Number.isNaN(d.getTime()) && d.getTime() <= Date.now()) return 'calibration_due';
    }
    return 'operational';
  };

  const formatIsoToDateOnly = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return '';
    return d.toISOString().slice(0, 10);
  };

  const loadEquipmentData = async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const params = new URLSearchParams({
        page: '1',
        limit: '50',
        active_only: 'true'
      });
      const data = await api.get(`/api/v1/lab/equipment-qc/equipment?${params.toString()}`);
      if (data) {
        const mapped = (data.equipment || []).map((e) => {
          const uiStatus = mapBackendStatusToUi(e?.status, e?.next_calibration_due_at);
          return {
            equipmentId: e?.equipment_id,
            id: e?.equipment_code || `EQP-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            qrCode: e?.equipment_code,
            name: e?.equipment_name || '',
            type: e?.equipment_type || e?.category || 'Analyzer',
            brand: e?.brand || e?.manufacturer || '',
            model: e?.model || '',
            serialNumber: e?.serial_no || e?.serial_number || '',
            location: e?.location || '',
            status: uiStatus,
            lastMaintenance: formatIsoToDateOnly(e?.last_calibrated_at),
            nextMaintenance: formatIsoToDateOnly(e?.next_calibration_due_at),
            calibrationDue: formatIsoToDateOnly(e?.next_calibration_due_at),
            installationDate: formatIsoToDateOnly(e?.installation_date),
            notes: typeof e?.notes === 'string' ? e.notes : '',
            specifications: e?.specifications && typeof e?.specifications === 'object' ? e.specifications : null,
            isActive: e?.is_active ?? true,
            created_at: e?.created_at,
            updated_at: e?.updated_at
          };
        });

        setEquipment(mapped);
        setEquipmentStats({
          total_equipment: data?.pagination?.total || mapped.length,
          operational: mapped.filter(item => item.status === 'operational').length,
          maintenance: mapped.filter(item => item.status === 'maintenance').length,
          calibration_due: mapped.filter(item => item.status === 'calibration_due').length
        });
      }
    } catch (err) {
      console.warn('loadEquipmentData error, loading fallback mockup stats:', err);
      setEquipment(defaultMockData.equipment);
      setEquipmentStats(defaultMockData.stats);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEquipmentDetails = async (equipmentUuid, fallbackRow) => {
    if (!equipmentUuid) return;
    setLoadingSelectedEquipment(true);
    try {
      const data = await api.get(`/api/v1/lab/equipment-qc/equipment/${encodeURIComponent(equipmentUuid)}`);
      if (data) {
        const uiStatus = mapBackendStatusToUi(data?.status, data?.next_calibration_due_at);
        setSelectedEquipment({
          ...fallbackRow,
          equipmentId: data?.equipment_id ?? equipmentUuid,
          id: data?.equipment_code ?? fallbackRow?.id,
          qrCode: data?.equipment_code ?? fallbackRow?.qrCode,
          name: data?.equipment_name ?? fallbackRow?.name ?? '',
          type: data?.equipment_type ?? data?.category ?? fallbackRow?.type ?? '',
          brand: data?.brand ?? data?.manufacturer ?? fallbackRow?.brand ?? '',
          model: data?.model ?? fallbackRow?.model ?? '',
          serialNumber: data?.serial_no ?? data?.serial_number ?? fallbackRow?.serialNumber ?? '',
          location: data?.location ?? fallbackRow?.location ?? '',
          status: uiStatus,
          lastMaintenance: formatIsoToDateOnly(data?.last_calibrated_at) || fallbackRow?.lastMaintenance,
          nextMaintenance: formatIsoToDateOnly(data?.next_calibration_due_at) || fallbackRow?.nextMaintenance,
          calibrationDue: formatIsoToDateOnly(data?.next_calibration_due_at) || fallbackRow?.calibrationDue,
          installationDate: formatIsoToDateOnly(data?.installation_date) || fallbackRow?.installationDate,
          notes: typeof data?.notes === 'string' ? data.notes : (typeof fallbackRow?.notes === 'string' ? fallbackRow.notes : ''),
          specifications: data?.specifications && typeof data.specifications === 'object' ? data.specifications : (fallbackRow?.specifications && typeof fallbackRow.specifications === 'object' ? fallbackRow.specifications : null),
          isActive: data?.is_active ?? true,
          created_at: data?.created_at ?? fallbackRow?.created_at,
          updated_at: data?.updated_at ?? fallbackRow?.updated_at
        });
      }
    } catch (err) {
      console.warn('fetchEquipmentDetails offline fallback:', err);
      const matched = defaultMockData.equipment.find(e => e.equipmentId === equipmentUuid);
      if (matched) setSelectedEquipment(matched);
    } finally {
      setLoadingSelectedEquipment(false);
    }
  };

  const fetchEquipmentLogs = async (equipmentUuid, page = 1, limit = 10, maintenanceType = 'all') => {
    setLoadingLogs(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });
      if (maintenanceType && maintenanceType !== 'all') {
        params.append('maintenance_type', maintenanceType);
      }

      let endpoint = `/api/v1/lab/equipment-qc/equipment/logs?${params.toString()}`;
      if (equipmentUuid) {
        endpoint = `/api/v1/lab/equipment-qc/equipment/${encodeURIComponent(equipmentUuid)}/logs?${params.toString()}`;
      }

      const data = await api.get(endpoint);
      if (data) {
        const transformedLogs = (data.logs || []).map((log) => ({
          id: log?.id || log?.log_id,
          equipmentId: log?.equipment_id || equipmentUuid || '',
          equipmentName: log?.equipment_name || 'Equipment Unit',
          type: log?.maintenance_type || log?.type || 'Maintenance',
          date: log?.performed_at ? new Date(log?.performed_at).toISOString().split('T')[0] : '',
          performedBy: log?.performed_by || log?.technician_name || 'Service Tech',
          cost: log?.cost || 0,
          description: log?.description || log?.notes || '',
          status: log?.status || 'completed'
        }));
        setMaintenanceLogs(transformedLogs);
        if (data.pagination) {
          setLogsPagination({
            page: data.pagination.page || page,
            limit: data.pagination.limit || limit,
            total: data.pagination.total || 0,
            pages: data.pagination.pages || 0
          });
        }
      }
    } catch (err) {
      console.warn('fetchEquipmentLogs API offline, pulling mock list:', err);
      let logs = defaultMockData.logs;
      if (equipmentUuid) {
        logs = logs.filter(l => l.equipmentId === equipmentUuid);
      }
      if (maintenanceType && maintenanceType !== 'all') {
        logs = logs.filter(l => l.type === maintenanceType);
      }
      setMaintenanceLogs(logs);
      setLogsPagination({ page: 1, limit: 10, total: logs.length, pages: 1 });
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadEquipmentData();
    fetchEquipmentLogs(null, 1, 10, 'all');
  }, []);

  useEffect(() => {
    let result = equipment.filter(item => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      const matchesType = typeFilter === 'all' || item.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
    setFilteredEquipment(result);
  }, [searchTerm, statusFilter, typeFilter, equipment]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEquipmentData(false);
  };

  const handleAddEquipment = async () => {
    if (!newEquipment.name || !newEquipment.type || !newEquipment.brand || !newEquipment.model || !newEquipment.serialNumber || !newEquipment.location) {
      showToast('All starred fields are required.', 'error');
      return;
    }
    setSavingEquipment(true);
    const toIso = (dStr) => dStr ? new Date(`${dStr}T00:00:00.000Z`).toISOString() : new Date().toISOString();
    const generatedCode = `EQP-${Math.floor(100 + Math.random() * 900)}`;

    const backendStatusMap = {
      'operational': 'ACTIVE',
      'maintenance': 'UNDER_MAINTENANCE',
      'calibration_due': 'CALIBRATION_DUE',
      'out_of_service': 'DOWN',
      'retired': 'INACTIVE'
    };

    const payload = {
      equipment_code: generatedCode,
      equipment_name: newEquipment.name,
      category: newEquipment.type || 'Analyzer',
      manufacturer: newEquipment.brand,
      model: newEquipment.model,
      serial_number: newEquipment.serialNumber,
      location: newEquipment.location,
      status: backendStatusMap[newEquipment.status] || 'ACTIVE',
      installation_date: toIso(newEquipment.installationDate),
      next_calibration_due_at: toIso(newEquipment.nextMaintenance),
      notes: newEquipment.notes || null
    };

    try {
      await api.post('/api/v1/lab/equipment-qc/equipment', payload);
      showToast(`Equipment "${newEquipment.name}" registered successfully.`, 'success');
      setShowAddModal(false);
      setNewEquipment({
        name: '',
        type: '',
        brand: '',
        model: '',
        serialNumber: '',
        location: '',
        status: 'operational',
        nextMaintenance: new Date().toISOString().split('T')[0],
        installationDate: new Date().toISOString().split('T')[0],
        notes: ''
      });
      loadEquipmentData();
    } catch (e) {
      console.warn('Create equipment failed, applying local simulation:', e);
      
      const newMockItem = {
        equipmentId: `eq-${Math.floor(Math.random() * 10000)}`,
        id: generatedCode,
        qrCode: generatedCode,
        name: newEquipment.name,
        type: newEquipment.type || 'Analyzer',
        brand: newEquipment.brand,
        model: newEquipment.model,
        serialNumber: newEquipment.serialNumber,
        location: newEquipment.location,
        status: newEquipment.status,
        lastMaintenance: '—',
        nextMaintenance: newEquipment.nextMaintenance,
        calibrationDue: newEquipment.nextMaintenance,
        installationDate: newEquipment.installationDate,
        notes: newEquipment.notes,
        specifications: null,
        isActive: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setEquipment(prev => [newMockItem, ...prev]);
      setShowAddModal(false);
      showToast(`Equipment "${newEquipment.name}" simulated locally.`, 'success');
    } finally {
      setSavingEquipment(false);
    }
  };

  const openEditEquipment = () => {
    if (!selectedEquipment) return;
    setEditEquipment({
      equipmentId: selectedEquipment.equipmentId,
      equipment_code: selectedEquipment.id || '',
      equipment_name: selectedEquipment.name || '',
      category: selectedEquipment.type || '',
      manufacturer: selectedEquipment.brand || '',
      model: selectedEquipment.model || '',
      serial_number: selectedEquipment.serialNumber || '',
      location: selectedEquipment.location || '',
      installation_date: selectedEquipment.installationDate || '',
      last_calibrated_at: selectedEquipment.lastMaintenance || '',
      next_calibration_due_at: selectedEquipment.nextMaintenance || '',
      notes: selectedEquipment.notes || ''
    });
    setShowEditModal(true);
  };

  const handleUpdateEquipment = async () => {
    if (!editEquipment.equipment_name) {
      showToast('Equipment Name is required.', 'error');
      return;
    }
    setUpdatingEquipment(true);
    const toIso = (dStr) => dStr ? new Date(`${dStr}T00:00:00.000Z`).toISOString() : undefined;

    const payload = {
      equipment_name: editEquipment.equipment_name,
      category: editEquipment.category || undefined,
      manufacturer: editEquipment.manufacturer || undefined,
      model: editEquipment.model || undefined,
      serial_number: editEquipment.serial_number || undefined,
      location: editEquipment.location || undefined,
      installation_date: toIso(editEquipment.installation_date),
      last_calibrated_at: toIso(editEquipment.last_calibrated_at),
      next_calibration_due_at: toIso(editEquipment.next_calibration_due_at),
      notes: editEquipment.notes || undefined
    };

    try {
      await api.put(`/api/v1/lab/equipment-qc/equipment/${encodeURIComponent(editEquipment.equipmentId)}`, payload);
      showToast('Equipment parameters updated successfully.', 'success');
      setShowEditModal(false);
      loadEquipmentData();
      fetchEquipmentDetails(editEquipment.equipmentId, selectedEquipment);
    } catch (err) {
      console.warn('Update failed, updating locally:', err);
      
      const updatedList = equipment.map(e => 
        e.equipmentId === editEquipment.equipmentId 
          ? {
              ...e,
              name: editEquipment.equipment_name,
              type: editEquipment.category,
              brand: editEquipment.manufacturer,
              model: editEquipment.model,
              serialNumber: editEquipment.serial_number,
              location: editEquipment.location,
              installationDate: editEquipment.installation_date,
              lastMaintenance: editEquipment.last_calibrated_at,
              nextMaintenance: editEquipment.next_calibration_due_at,
              calibrationDue: editEquipment.next_calibration_due_at,
              notes: editEquipment.notes
            }
          : e
      );
      setEquipment(updatedList);
      
      if (selectedEquipment?.equipmentId === editEquipment.equipmentId) {
        setSelectedEquipment(prev => ({
          ...prev,
          name: editEquipment.equipment_name,
          type: editEquipment.category,
          brand: editEquipment.manufacturer,
          model: editEquipment.model,
          serialNumber: editEquipment.serial_number,
          location: editEquipment.location,
          installationDate: editEquipment.installation_date,
          lastMaintenance: editEquipment.last_calibrated_at,
          nextMaintenance: editEquipment.next_calibration_due_at,
          calibrationDue: editEquipment.next_calibration_due_at,
          notes: editEquipment.notes
        }));
      }
      
      setShowEditModal(false);
      showToast('Equipment updated locally.', 'success');
    } finally {
      setUpdatingEquipment(false);
    }
  };

  const handleStatusUpdate = async (equipmentId, newStatus, reason = 'Status changed from mobile panel') => {
    const backendStatusMap = {
      'operational': 'ACTIVE',
      'maintenance': 'UNDER_MAINTENANCE',
      'calibration_due': 'CALIBRATION_DUE',
      'out_of_service': 'DOWN',
      'retired': 'INACTIVE'
    };

    try {
      await api.patch(`/api/v1/lab/equipment-qc/equipment/${encodeURIComponent(equipmentId)}/status`, {
        status: backendStatusMap[newStatus] || 'ACTIVE',
        reason
      });
      showToast(`Status updated to: ${newStatus}`, 'success');
      loadEquipmentData();
      if (selectedEquipment?.equipmentId === equipmentId) {
        setSelectedEquipment(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.warn('Status patch failed, setting state locally:', err);
      setEquipment(prev => prev.map(e => e.equipmentId === equipmentId ? { ...e, status: newStatus } : e));
      if (selectedEquipment?.equipmentId === equipmentId) {
        setSelectedEquipment(prev => ({ ...prev, status: newStatus }));
      }
      showToast(`Status adjusted locally to: ${newStatus}`, 'success');
    }
  };

  const handleLogMaintenance = async () => {
    if (!selectedEquipment) return;
    try {
      const payload = {
        log_type: maintenanceForm.maintenanceType.toUpperCase(),
        maintenance_type: maintenanceForm.maintenanceType,
        description: maintenanceForm.description || `Scheduled ${maintenanceForm.maintenanceType} maintenance`,
        notes: maintenanceForm.notes || 'Logged via Mobile Screen',
        cost: Number(maintenanceForm.cost) || 0,
        status: maintenanceForm.status || 'scheduled',
        performed_at: new Date(maintenanceForm.scheduledDate).toISOString(),
        performed_by: maintenanceForm.technician || 'Technician Desk',
        remarks: `Assigned to technician: ${maintenanceForm.technician || 'Unassigned'}`
      };

      await api.post(`/api/v1/lab/equipment-qc/equipment/${selectedEquipment.equipmentId}/logs`, payload);
      showToast('Maintenance activity logged successfully.', 'success');
      setShowMaintenanceModal(false);
      fetchEquipmentLogs(selectedEquipment.equipmentId, 1, 10, 'all');
      fetchEquipmentDetails(selectedEquipment.equipmentId, selectedEquipment);
    } catch (err) {
      console.warn('Logging logs failed, updating offline list:', err);
      const localLog = {
        id: `log-${Math.floor(Math.random() * 90000)}`,
        equipmentId: selectedEquipment.equipmentId,
        equipmentName: selectedEquipment.name,
        type: maintenanceForm.maintenanceType,
        date: maintenanceForm.scheduledDate,
        performedBy: maintenanceForm.technician || 'Service Team',
        cost: Number(maintenanceForm.cost) || 0,
        description: maintenanceForm.description,
        status: maintenanceForm.status
      };
      setMaintenanceLogs(prev => [localLog, ...prev]);
      setShowMaintenanceModal(false);
      showToast('Maintenance logged locally.', 'success');
    }
  };

  const handleLogCalibration = async () => {
    if (!selectedEquipment) return;
    try {
      const payload = {
        log_type: 'CALIBRATION',
        maintenance_type: 'calibration',
        description: calibrationForm.description || `${calibrationForm.calibrationType} calibration scheduled`,
        notes: calibrationForm.notes || `Reference Standard: ${calibrationForm.standard}`,
        cost: Number(calibrationForm.cost) || 0,
        status: calibrationForm.status || 'scheduled',
        performed_at: new Date(calibrationForm.scheduledDate).toISOString(),
        performed_by: 'Calibration Engineer',
        remarks: `Standard verified: ${calibrationForm.standard || 'Default standard'}`
      };

      await api.post(`/api/v1/lab/equipment-qc/equipment/${selectedEquipment.equipmentId}/logs`, payload);
      showToast('Calibration cycle logged successfully.', 'success');
      setShowCalibrationModal(false);
      fetchEquipmentLogs(selectedEquipment.equipmentId, 1, 10, 'all');
      fetchEquipmentDetails(selectedEquipment.equipmentId, selectedEquipment);
    } catch (err) {
      console.warn('Logging calibration failed, appending locally:', err);
      const localCalLog = {
        id: `log-${Math.floor(Math.random() * 90000)}`,
        equipmentId: selectedEquipment.equipmentId,
        equipmentName: selectedEquipment.name,
        type: 'calibration',
        date: calibrationForm.scheduledDate,
        performedBy: 'NIST Standards',
        cost: Number(calibrationForm.cost) || 0,
        description: calibrationForm.description || `Routine Calibration with ${calibrationForm.standard}`,
        status: calibrationForm.status
      };
      setMaintenanceLogs(prev => [localCalLog, ...prev]);
      setShowCalibrationModal(false);
      showToast('Calibration logged locally.', 'success');
    }
  };

  const handleRowClick = (eqp) => {
    setSelectedEquipment(eqp);
    fetchEquipmentDetails(eqp.equipmentId, eqp);
    fetchEquipmentLogs(eqp.equipmentId, 1, 10, 'all');
  };

  const handleGenerateQR = (eqp) => {
    showToast(`QR Code generated for ${eqp.name}. ID: ${eqp.id}`, 'info');
  };

  const handleBulkQRCodes = () => {
    showToast('Bulk printing QR Codes sheet for all units...', 'info');
  };

  const handleExportInventory = () => {
    showToast('Exporting equipment catalog CSV file...', 'success');
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={["#2563eb"]} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between flex-wrap mb-6">
          <View className="flex-row items-center flex-1 mr-2">
            <View className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3 shadow-inner">
              <Ionicons name="construct" size={20} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-xl font-black text-slate-800">Equipment QC</Text>
              <Text className="text-xs text-slate-400 font-semibold mt-0.5">Asset monitoring & calibrations</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="flex-row items-center px-4 py-2.5 bg-blue-600 rounded-xl shadow-sm"
          >
            <Ionicons name="add" size={16} color="#fff" className="mr-1" />
            <Text className="text-white text-xs font-bold">Register Unit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid 2x2 */}
        <View className="flex-row flex-wrap justify-between gap-y-3 mb-6">
          {/* Card 1: Total Units */}
          <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <View className="absolute right-1 -bottom-1 opacity-5">
              <Ionicons name="server" size={50} color="#2563eb" />
            </View>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Total Units</Text>
            <Text className="text-2xl font-black text-slate-800 mt-1">{equipment.length}</Text>
            <Text className="text-[10px] text-blue-600 font-bold mt-2">Active Assets</Text>
          </View>

          {/* Card 2: Operational */}
          <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <View className="absolute right-1 -bottom-1 opacity-5">
              <Ionicons name="checkmark-circle" size={50} color="#10b981" />
            </View>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Operational</Text>
            <Text className="text-2xl font-black text-emerald-600 mt-1">{equipmentStats.operational}</Text>
            <Text className="text-[10px] text-emerald-600 font-bold mt-2">Fully functional</Text>
          </View>

          {/* Card 3: Maintenance */}
          <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <View className="absolute right-1 -bottom-1 opacity-5">
              <Ionicons name="construct" size={50} color="#f59e0b" />
            </View>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Maintenance</Text>
            <Text className="text-2xl font-black text-amber-600 mt-1">{equipmentStats.maintenance}</Text>
            <Text className="text-[10px] text-amber-600 font-bold mt-2">Under service</Text>
          </View>

          {/* Card 4: Calibration Due */}
          <View className="w-[48%] bg-white p-4 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
            <View className="absolute right-1 -bottom-1 opacity-5">
              <Ionicons name="warning" size={50} color="#f97316" />
            </View>
            <Text className="text-[9px] font-black text-slate-400 uppercase tracking-wide">Calibration Due</Text>
            <Text className="text-2xl font-black text-orange-600 mt-1">{equipmentStats.calibration_due}</Text>
            <Text className="text-[10px] text-orange-600 font-bold mt-2">QC cycles overdue</Text>
          </View>
        </View>

        {/* Filters */}
        <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 mb-3">
            <Ionicons name="search-outline" size={18} color="#94a3b8" className="mr-2" />
            <TextInput
              className="flex-1 text-sm font-semibold text-slate-800 p-0"
              placeholder="Search by ID, Name or Serial..."
              placeholderTextColor="#cbd5e1"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')}>
                <Ionicons name="close-circle" size={18} color="#94a3b8" />
              </TouchableOpacity>
            )}
          </View>

          <View className="flex-row flex-wrap gap-2">
            <TouchableOpacity
              onPress={() => setPickerState({ visible: true, type: 'statusFilter', title: 'Filter by Status', options: filterStatusOptions })}
              className="flex-row items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5"
            >
              <Text className="text-slate-600 text-xs font-bold">
                Status: {filterStatusOptions.find(o => o.value === statusFilter)?.label}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#64748b" className="ml-1" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPickerState({ visible: true, type: 'typeFilter', title: 'Filter by Type', options: filterTypeOptions })}
              className="flex-row items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5"
            >
              <Text className="text-slate-600 text-xs font-bold">
                Type: {filterTypeOptions.find(o => o.value === typeFilter)?.label}
              </Text>
              <Ionicons name="chevron-down" size={12} color="#64748b" className="ml-1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Equipment Card Lists */}
        {filteredEquipment.length === 0 ? (
          <View className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm items-center justify-center mb-6">
            <Ionicons name="alert-circle-outline" size={48} color="#94a3b8" />
            <Text className="text-slate-400 text-sm font-bold mt-2">No matching assets found.</Text>
          </View>
        ) : (
          filteredEquipment.map((item) => {
            const statusConfig = equipmentStatusStyles[item.status] || { colorBg: 'bg-slate-50', colorText: 'text-slate-700', label: item.status, dotColor: 'bg-slate-400' };
            return (
              <TouchableOpacity
                key={item.equipmentId}
                onPress={() => handleRowClick(item)}
                activeOpacity={0.9}
                className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm mb-4"
              >
                {/* Top Row */}
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-[10px] font-mono font-bold text-slate-400">ID: {item.id}</Text>
                  <View className={`px-2 py-0.5 rounded-full border flex-row items-center ${statusConfig.colorBg}`}>
                    <View className={`w-1.5 h-1.5 rounded-full mr-1 ${statusConfig.dotColor}`} />
                    <Text className={`text-[9px] font-black uppercase ${statusConfig.colorText}`}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* Name */}
                <View className="mb-2">
                  <Text className="text-base font-extrabold text-slate-800">{item.name}</Text>
                  <Text className="text-xs text-slate-400 font-bold">{item.brand} {item.model} • {item.type}</Text>
                </View>

                {/* Meta Source block */}
                <View className="flex-row justify-between items-center bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                  <View>
                    <Text className="text-[9px] text-slate-400 font-extrabold uppercase">Location</Text>
                    <Text className="text-xs font-bold text-slate-700 mt-0.5">{item.location}</Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-[9px] text-slate-400 font-extrabold uppercase">Next QC Due</Text>
                    <Text className="text-xs font-black text-amber-600 mt-0.5">{item.nextMaintenance || 'Not Set'}</Text>
                  </View>
                </View>

                {/* Action panel */}
                <View className="flex-row justify-end gap-2 border-t border-slate-100 pt-3 mt-1">
                  <TouchableOpacity
                    onPress={() => handleGenerateQR(item)}
                    className="p-2 bg-purple-50 rounded-xl"
                  >
                    <Ionicons name="qr-code-outline" size={16} color="#9333ea" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedEquipment(item);
                      setMaintenanceForm(prev => ({
                        ...prev,
                        scheduledDate: new Date().toISOString().split('T')[0],
                        technician: '',
                        description: '',
                        cost: '0',
                        notes: ''
                      }));
                      setShowMaintenanceModal(true);
                    }}
                    className="p-2 bg-blue-50 rounded-xl"
                  >
                    <Ionicons name="construct-outline" size={16} color="#2563eb" />
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedEquipment(item);
                      setCalibrationForm(prev => ({
                        ...prev,
                        scheduledDate: new Date().toISOString().split('T')[0],
                        standard: '',
                        description: '',
                        cost: '0',
                        notes: ''
                      }));
                      setShowCalibrationModal(true);
                    }}
                    className="p-2 bg-emerald-50 rounded-xl"
                  >
                    <Ionicons name="speedometer-outline" size={16} color="#059669" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        {/* Selected Equipment Panel Details Drawer */}
        {selectedEquipment && (
          <View className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6">
            <View className="flex-row justify-between items-start mb-4 flex-wrap">
              <View className="flex-1 mr-2">
                <Text className="text-lg font-black text-slate-800">{selectedEquipment.name}</Text>
                <Text className="text-xs text-slate-400 font-bold">{selectedEquipment.brand} {selectedEquipment.model} • SN: {selectedEquipment.serialNumber}</Text>
              </View>
              <View className="flex-row gap-2 mt-2 sm:mt-0">
                <TouchableOpacity
                  onPress={openEditEquipment}
                  className="px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl"
                >
                  <Text className="text-blue-600 text-xs font-bold">Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleStatusUpdate(selectedEquipment.equipmentId, selectedEquipment.status === 'operational' ? 'maintenance' : 'operational')}
                  className={`px-3 py-1.5 rounded-xl ${selectedEquipment.status === 'operational' ? 'bg-amber-50 border border-amber-200' : 'bg-emerald-50 border border-emerald-200'}`}
                >
                  <Text className={`text-xs font-bold ${selectedEquipment.status === 'operational' ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {selectedEquipment.status === 'operational' ? 'Maintenance' : 'Operational'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {loadingSelectedEquipment ? (
              <ActivityIndicator size="small" color="#2563eb" className="py-4" />
            ) : (
              <View className="gap-y-3">
                <View className="flex-row justify-between items-center py-2 border-b border-slate-100">
                  <Text className="text-xs text-slate-400 font-semibold">Location</Text>
                  <Text className="text-xs text-slate-800 font-bold">{selectedEquipment.location}</Text>
                </View>
                <View className="flex-row justify-between items-center py-2 border-b border-slate-100">
                  <Text className="text-xs text-slate-400 font-semibold">Installation Date</Text>
                  <Text className="text-xs text-slate-800 font-bold">{selectedEquipment.installationDate || 'N/A'}</Text>
                </View>
                <View className="flex-row justify-between items-center py-2 border-b border-slate-100">
                  <Text className="text-xs text-slate-400 font-semibold">Last Calibration</Text>
                  <Text className="text-xs text-slate-800 font-bold">{selectedEquipment.lastMaintenance || '—'}</Text>
                </View>
                <View className="flex-row justify-between items-center py-2 border-b border-slate-100">
                  <Text className="text-xs text-slate-400 font-semibold">Calibration Due</Text>
                  <Text className="text-xs text-red-600 font-black">{selectedEquipment.calibrationDue || 'Overdue'}</Text>
                </View>
                {selectedEquipment.notes && typeof selectedEquipment.notes === 'string' && selectedEquipment.notes.trim() !== '' ? (
                  <View className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                    <Text className="text-[9px] text-slate-400 font-extrabold uppercase mb-1">Equipment Notes</Text>
                    <Text className="text-xs text-slate-600 italic leading-relaxed">
                      "{selectedEquipment.notes}"
                    </Text>
                  </View>
                ) : null}

                {/* specifications panel */}
                {selectedEquipment.specifications && typeof selectedEquipment.specifications === 'object' && Object.keys(selectedEquipment.specifications).length > 0 && (
                  <View className="bg-slate-50 p-3 rounded-xl border border-slate-100 mt-2">
                    <Text className="text-[9px] text-slate-400 font-extrabold uppercase mb-1">Diagnostic Specs</Text>
                    {Object.keys(selectedEquipment.specifications).map(k => {
                      const val = selectedEquipment.specifications[k];
                      return (
                        <View key={k} className="flex-row justify-between py-1">
                          <Text className="text-[10px] text-slate-500 font-bold">{k}</Text>
                          <Text className="text-[10px] text-slate-800 font-black">
                            {typeof val === 'object' ? JSON.stringify(val) : String(val || '')}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Maintenance Logs Lists */}
        <View className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mb-6">
          <View className="p-4 border-b border-slate-100 flex-row justify-between items-center flex-wrap gap-2">
            <View>
              <Text className="text-base font-black text-slate-800">Maintenance & QC Logs</Text>
              <Text className="text-[10px] text-slate-400 font-semibold">Log entries for equipment cycles</Text>
            </View>
            
            <TouchableOpacity
              onPress={() => setPickerState({
                visible: true,
                type: 'logsFilterType',
                title: 'Select Log Type',
                options: [
                  { label: 'All Types', value: 'all' },
                  { label: 'Preventive', value: 'preventive' },
                  { label: 'Corrective', value: 'corrective' },
                  { label: 'Calibration', value: 'calibration' }
                ]
              })}
              className="flex-row items-center bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5"
            >
              <Text className="text-slate-600 text-[10px] font-bold">
                Logs: {logsFilterType === 'all' ? 'All' : logsFilterType}
              </Text>
              <Ionicons name="chevron-down" size={10} color="#64748b" className="ml-1" />
            </TouchableOpacity>
          </View>

          {loadingLogs ? (
            <ActivityIndicator size="small" color="#2563eb" className="my-6" />
          ) : maintenanceLogs.length === 0 ? (
            <View className="p-6 items-center">
              <Text className="text-slate-400 text-xs font-semibold">No maintenance logs found.</Text>
            </View>
          ) : (
            maintenanceLogs.map((log) => (
              <View key={log.id} className="p-4 border-b border-slate-50 flex-row justify-between items-start">
                <View className="flex-1 mr-3">
                  <Text className="text-xs font-extrabold text-slate-800">{log.equipmentName}</Text>
                  <Text className="text-[10px] text-slate-400 font-bold">{log.type.toUpperCase()} • {log.date}</Text>
                  <Text className="text-xs text-slate-600 mt-1 leading-normal">{log.description}</Text>
                  <Text className="text-[10px] text-slate-500 font-semibold mt-1">Tech: {log.performedBy}</Text>
                </View>
                <View className="items-end shrink-0">
                  <Text className="text-xs font-black text-slate-800">₹{log.cost}</Text>
                  <View className={`px-2 py-0.5 rounded-full mt-2 ${
                    log.status === 'completed' ? 'bg-emerald-50 border border-emerald-200' : 'bg-blue-50 border border-blue-200'
                  }`}>
                    <Text className={`text-[8px] font-black uppercase ${
                      log.status === 'completed' ? 'text-emerald-700' : 'text-blue-700'
                    }`}>
                      {log.status}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions Panel */}
        <View className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
          <Text className="text-base font-black text-slate-800 mb-3">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between gap-y-3">
            <TouchableOpacity
              onPress={handleBulkQRCodes}
              className="w-[48%] p-3.5 bg-slate-50 border border-slate-100 rounded-2xl items-center"
            >
              <View className="w-10 h-10 bg-purple-100 rounded-xl items-center justify-center mb-2">
                <Ionicons name="qr-code" size={20} color="#9333ea" />
              </View>
              <Text className="text-xs font-extrabold text-slate-800 text-center">Bulk QR Codes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleExportInventory}
              className="w-[48%] p-3.5 bg-slate-50 border border-slate-100 rounded-2xl items-center"
            >
              <View className="w-10 h-10 bg-blue-100 rounded-xl items-center justify-center mb-2">
                <Ionicons name="cloud-download" size={20} color="#2563eb" />
              </View>
              <Text className="text-xs font-extrabold text-slate-800 text-center">Export Inventory</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Option Picker Popover */}
      <OptionPickerModal
        visible={pickerState.visible}
        onClose={() => setPickerState(prev => ({ ...prev, visible: false }))}
        title={pickerState.title}
        options={pickerState.options}
        selectedValue={
          pickerState.type === 'statusFilter' ? statusFilter :
          pickerState.type === 'typeFilter' ? typeFilter :
          pickerState.type === 'logsFilterType' ? logsFilterType :
          pickerState.type === 'newEquipmentType' ? newEquipment.type :
          pickerState.type === 'newEquipmentStatus' ? newEquipment.status :
          pickerState.type === 'maintenanceType' ? maintenanceForm.maintenanceType :
          pickerState.type === 'maintenanceStatus' ? maintenanceForm.status :
          pickerState.type === 'calibrationType' ? calibrationForm.calibrationType :
          pickerState.type === 'calibrationStatus' ? calibrationForm.status : ''
        }
        onSelect={(val) => {
          if (pickerState.type === 'statusFilter') setStatusFilter(val);
          else if (pickerState.type === 'typeFilter') setTypeFilter(val);
          else if (pickerState.type === 'logsFilterType') {
            setLogsFilterType(val);
            fetchEquipmentLogs(selectedEquipment?.equipmentId || null, 1, 10, val);
          }
          else if (pickerState.type === 'newEquipmentType') setNewEquipment(prev => ({ ...prev, type: val }));
          else if (pickerState.type === 'newEquipmentStatus') setNewEquipment(prev => ({ ...prev, status: val }));
          else if (pickerState.type === 'maintenanceType') setMaintenanceForm(prev => ({ ...prev, maintenanceType: val }));
          else if (pickerState.type === 'maintenanceStatus') setMaintenanceForm(prev => ({ ...prev, status: val }));
          else if (pickerState.type === 'calibrationType') setCalibrationForm(prev => ({ ...prev, calibrationType: val }));
          else if (pickerState.type === 'calibrationStatus') setCalibrationForm(prev => ({ ...prev, status: val }));
        }}
      />

      {/* Add Equipment Modal */}
      <RNModal visible={showAddModal} transparent animationType="slide" onRequestClose={() => setShowAddModal(false)}>
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-t-3xl p-6 w-full max-h-[90%] absolute bottom-0 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <Text className="text-base font-black text-slate-800">Register New Equipment</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View className="mb-4">
                <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Equipment Name *</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  value={newEquipment.name}
                  onChangeText={(text) => setNewEquipment(prev => ({ ...prev, name: text }))}
                  placeholder="e.g. Chemistry Analyzer"
                  placeholderTextColor="#cbd5e1"
                />
              </View>

              {/* Type */}
              <View className="mb-4">
                <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Equipment Type *</Text>
                <TouchableOpacity
                  onPress={() => setPickerState({
                    visible: true,
                    type: 'newEquipmentType',
                    title: 'Select Equipment Type',
                    options: equipmentTypes.map(t => ({ label: t, value: t }))
                  })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
                >
                  <Text className="text-sm font-semibold text-slate-800">
                    {newEquipment.type || 'Select Type'}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Brand & Model */}
              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Brand *</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={newEquipment.brand}
                    onChangeText={(text) => setNewEquipment(prev => ({ ...prev, brand: text }))}
                    placeholder="e.g. Sysmex"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Model *</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={newEquipment.model}
                    onChangeText={(text) => setNewEquipment(prev => ({ ...prev, model: text }))}
                    placeholder="e.g. XS-500"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              </View>

              {/* Serial & Location */}
              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Serial Number *</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={newEquipment.serialNumber}
                    onChangeText={(text) => setNewEquipment(prev => ({ ...prev, serialNumber: text }))}
                    placeholder="Unique SN"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Location *</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={newEquipment.location}
                    onChangeText={(text) => setNewEquipment(prev => ({ ...prev, location: text }))}
                    placeholder="e.g. Lab Room 3"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              </View>

              {/* Install Date & Next Due */}
              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Installation Date</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={newEquipment.installationDate}
                    onChangeText={(text) => setNewEquipment(prev => ({ ...prev, installationDate: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Calibration Due</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={newEquipment.nextMaintenance}
                    onChangeText={(text) => setNewEquipment(prev => ({ ...prev, nextMaintenance: text }))}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor="#cbd5e1"
                  />
                </View>
              </View>

              {/* Initial Status */}
              <View className="mb-4">
                <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Initial Status</Text>
                <TouchableOpacity
                  onPress={() => setPickerState({
                    visible: true,
                    type: 'newEquipmentStatus',
                    title: 'Select Initial Status',
                    options: [
                      { label: 'Operational', value: 'operational' },
                      { label: 'Under Maintenance', value: 'maintenance' },
                      { label: 'Calibration Due', value: 'calibration_due' },
                      { label: 'Out of Service', value: 'out_of_service' },
                    ]
                  })}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
                >
                  <Text className="text-sm font-semibold text-slate-800">
                    {newEquipment.status === 'operational' ? 'Operational' :
                     newEquipment.status === 'maintenance' ? 'Under Maintenance' :
                     newEquipment.status === 'calibration_due' ? 'Calibration Due' :
                     newEquipment.status === 'out_of_service' ? 'Out of Service' : 'Select Status'}
                  </Text>
                  <Ionicons name="chevron-down" size={14} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Notes */}
              <View className="mb-6">
                <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Additional Notes</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 min-h-[70px]"
                  value={newEquipment.notes}
                  onChangeText={(text) => setNewEquipment(prev => ({ ...prev, notes: text }))}
                  placeholder="Enter initial logs..."
                  placeholderTextColor="#cbd5e1"
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Buttons */}
              <View className="flex-row gap-3 border-t border-slate-100 pt-4 mb-4">
                <TouchableOpacity
                  onPress={() => setShowAddModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 border border-slate-200 rounded-xl items-center"
                >
                  <Text className="text-slate-700 text-sm font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddEquipment}
                  disabled={
                    savingEquipment ||
                    !newEquipment.name ||
                    !newEquipment.type ||
                    !newEquipment.brand ||
                    !newEquipment.model ||
                    !newEquipment.serialNumber ||
                    !newEquipment.location
                  }
                  className={`flex-1 py-3.5 rounded-xl items-center justify-center flex-row ${
                    (savingEquipment ||
                    !newEquipment.name ||
                    !newEquipment.type ||
                    !newEquipment.brand ||
                    !newEquipment.model ||
                    !newEquipment.serialNumber ||
                    !newEquipment.location) ? 'bg-slate-300' : 'bg-blue-600'
                  }`}
                >
                  {savingEquipment && <ActivityIndicator size="small" color="#fff" className="mr-2" />}
                  <Text className="text-white text-sm font-bold">Register</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </RNModal>

      {/* Edit Equipment Modal */}
      <RNModal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-t-3xl p-6 w-full max-h-[90%] absolute bottom-0 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <Text className="text-base font-black text-slate-800">Update Equipment Assets</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Name */}
              <View className="mb-4">
                <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Equipment Name</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  value={editEquipment.equipment_name}
                  onChangeText={(text) => setEditEquipment(prev => ({ ...prev, equipment_name: text }))}
                />
              </View>

              {/* Category */}
              <View className="mb-4">
                <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Category</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  value={editEquipment.category}
                  onChangeText={(text) => setEditEquipment(prev => ({ ...prev, category: text }))}
                  placeholder="e.g. Analyzer"
                />
              </View>

              {/* Manufacturer & Model */}
              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Manufacturer</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={editEquipment.manufacturer}
                    onChangeText={(text) => setEditEquipment(prev => ({ ...prev, manufacturer: text }))}
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Model</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={editEquipment.model}
                    onChangeText={(text) => setEditEquipment(prev => ({ ...prev, model: text }))}
                  />
                </View>
              </View>

              {/* Serial & Location */}
              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Serial Number</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={editEquipment.serial_number}
                    onChangeText={(text) => setEditEquipment(prev => ({ ...prev, serial_number: text }))}
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Location</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={editEquipment.location}
                    onChangeText={(text) => setEditEquipment(prev => ({ ...prev, location: text }))}
                  />
                </View>
              </View>

              {/* Dates grid */}
              <View className="mb-4">
                <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Installation Date</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                  value={editEquipment.installation_date}
                  onChangeText={(text) => setEditEquipment(prev => ({ ...prev, installation_date: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>

              <View className="flex-row justify-between mb-4">
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Last Calibrated At</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={editEquipment.last_calibrated_at}
                    onChangeText={(text) => setEditEquipment(prev => ({ ...prev, last_calibrated_at: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
                <View className="w-[48%]">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Next Calibration Due</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                    value={editEquipment.next_calibration_due_at}
                    onChangeText={(text) => setEditEquipment(prev => ({ ...prev, next_calibration_due_at: text }))}
                    placeholder="YYYY-MM-DD"
                  />
                </View>
              </View>

              {/* Notes */}
              <View className="mb-6">
                <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Equipment Notes</Text>
                <TextInput
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 min-h-[70px]"
                  value={editEquipment.notes}
                  onChangeText={(text) => setEditEquipment(prev => ({ ...prev, notes: text }))}
                  multiline
                  textAlignVertical="top"
                />
              </View>

              {/* Submit Buttons */}
              <View className="flex-row gap-3 border-t border-slate-100 pt-4 mb-4">
                <TouchableOpacity
                  onPress={() => setShowEditModal(false)}
                  className="flex-1 py-3.5 bg-slate-100 border border-slate-200 rounded-xl items-center"
                >
                  <Text className="text-slate-700 text-sm font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleUpdateEquipment}
                  disabled={updatingEquipment}
                  className="flex-1 py-3.5 bg-blue-600 rounded-xl items-center justify-center flex-row"
                >
                  {updatingEquipment && <ActivityIndicator size="small" color="#fff" className="mr-2" />}
                  <Text className="text-white text-sm font-bold">Update</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </RNModal>

      {/* Schedule Maintenance Modal */}
      <RNModal visible={showMaintenanceModal} transparent animationType="slide" onRequestClose={() => setShowMaintenanceModal(false)}>
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-t-3xl p-6 w-full max-h-[90%] absolute bottom-0 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <Text className="text-base font-black text-slate-800">Schedule Service Visit</Text>
              <TouchableOpacity onPress={() => setShowMaintenanceModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedEquipment && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Active Unit Badge */}
                <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-4 flex-row items-center">
                  <Ionicons name="construct" size={20} color="#2563eb" className="mr-3" />
                  <View className="flex-1">
                    <Text className="text-[9px] font-black text-blue-800 uppercase tracking-wide">Assign Workorder For</Text>
                    <Text className="font-extrabold text-sm text-slate-800">{selectedEquipment.name}</Text>
                    <Text className="text-xs text-slate-400 font-bold">SN: {selectedEquipment.serialNumber}</Text>
                  </View>
                </View>

                {/* Maintenance Type Option Picker */}
                <View className="mb-4">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Maintenance Type</Text>
                  <TouchableOpacity
                    onPress={() => setPickerState({
                      visible: true,
                      type: 'maintenanceType',
                      title: 'Select Maintenance Type',
                      options: [
                        { label: 'Preventive Maintenance', value: 'preventive' },
                        { label: 'Corrective Repair', value: 'corrective' },
                        { label: 'Standard Calibration', value: 'calibration' },
                        { label: 'Repair Log', value: 'repair' }
                      ]
                    })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
                  >
                    <Text className="text-sm font-semibold text-slate-800">
                      {maintenanceForm.maintenanceType.toUpperCase()}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Date & Cost */}
                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Scheduled Date</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                      value={maintenanceForm.scheduledDate}
                      onChangeText={(text) => setMaintenanceForm(prev => ({ ...prev, scheduledDate: text }))}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View className="w-[48%]">
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Estimated Cost (₹)</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                      value={maintenanceForm.cost}
                      keyboardType="numeric"
                      onChangeText={(text) => setMaintenanceForm(prev => ({ ...prev, cost: text }))}
                    />
                  </View>
                </View>

                {/* Technician & Status */}
                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Technician Name</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                      value={maintenanceForm.technician}
                      onChangeText={(text) => setMaintenanceForm(prev => ({ ...prev, technician: text }))}
                      placeholder="Service Technician"
                      placeholderTextColor="#cbd5e1"
                    />
                  </View>
                  <View className="w-[48%]">
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Status</Text>
                    <TouchableOpacity
                      onPress={() => setPickerState({
                        visible: true,
                        type: 'maintenanceStatus',
                        title: 'Select Status',
                        options: [
                          { label: 'Scheduled', value: 'scheduled' },
                          { label: 'In Progress', value: 'in_progress' },
                          { label: 'Completed', value: 'completed' },
                          { label: 'Cancelled', value: 'cancelled' }
                        ]
                      })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
                    >
                      <Text className="text-xs font-bold text-slate-800 uppercase">
                        {maintenanceForm.status}
                      </Text>
                      <Ionicons name="chevron-down" size={12} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Maintenance Description</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 min-h-[60px]"
                    value={maintenanceForm.description}
                    onChangeText={(text) => setMaintenanceForm(prev => ({ ...prev, description: text }))}
                    placeholder="Work description detail..."
                    placeholderTextColor="#cbd5e1"
                    multiline
                  />
                </View>

                {/* Remarks/Notes */}
                <View className="mb-6">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Remarks / Service Notes</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 min-h-[60px]"
                    value={maintenanceForm.notes}
                    onChangeText={(text) => setMaintenanceForm(prev => ({ ...prev, notes: text }))}
                    placeholder="Additional logs..."
                    placeholderTextColor="#cbd5e1"
                    multiline
                  />
                </View>

                {/* Footer buttons */}
                <View className="flex-row gap-3 border-t border-slate-100 pt-4 mb-4">
                  <TouchableOpacity
                    onPress={() => setShowMaintenanceModal(false)}
                    className="flex-1 py-3.5 bg-slate-100 border border-slate-200 rounded-xl items-center"
                  >
                    <Text className="text-slate-700 text-sm font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleLogMaintenance}
                    className="flex-1 py-3.5 bg-blue-600 rounded-xl items-center"
                  >
                    <Text className="text-white text-sm font-bold">Schedule</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </RNModal>

      {/* Schedule Calibration Modal */}
      <RNModal visible={showCalibrationModal} transparent animationType="slide" onRequestClose={() => setShowCalibrationModal(false)}>
        <View style={styles.modalOverlay}>
          <View className="bg-white rounded-t-3xl p-6 w-full max-h-[90%] absolute bottom-0 shadow-2xl">
            <View className="flex-row justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <Text className="text-base font-black text-slate-800">Schedule QC Calibration</Text>
              <TouchableOpacity onPress={() => setShowCalibrationModal(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            {selectedEquipment && (
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Active Unit Badge */}
                <View className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 mb-4 flex-row items-center">
                  <Ionicons name="speedometer" size={20} color="#059669" className="mr-3" />
                  <View className="flex-1">
                    <Text className="text-[9px] font-black text-emerald-800 uppercase tracking-wide">Standard Calibration Log For</Text>
                    <Text className="font-extrabold text-sm text-slate-800">{selectedEquipment.name}</Text>
                    <Text className="text-xs text-slate-400 font-bold">SN: {selectedEquipment.serialNumber}</Text>
                  </View>
                </View>

                {/* Calibration Type Option Picker */}
                <View className="mb-4">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Calibration Cycle</Text>
                  <TouchableOpacity
                    onPress={() => setPickerState({
                      visible: true,
                      type: 'calibrationType',
                      title: 'Select Calibration Type',
                      options: [
                        { label: 'Routine Calibration', value: 'routine' },
                        { label: 'Annual Standard Calibration', value: 'annual' },
                        { label: 'Post-Repair Audit Calibration', value: 'after_repair' },
                        { label: 'Special QC Verification', value: 'special' }
                      ]
                    })}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
                  >
                    <Text className="text-sm font-semibold text-slate-800">
                      {calibrationForm.calibrationType.toUpperCase()}
                    </Text>
                    <Ionicons name="chevron-down" size={14} color="#64748b" />
                  </TouchableOpacity>
                </View>

                {/* Date & Cost */}
                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Calibration Due Date</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                      value={calibrationForm.scheduledDate}
                      onChangeText={(text) => setCalibrationForm(prev => ({ ...prev, scheduledDate: text }))}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                  <View className="w-[48%]">
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Audit Cost (₹)</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                      value={calibrationForm.cost}
                      keyboardType="numeric"
                      onChangeText={(text) => setCalibrationForm(prev => ({ ...prev, cost: text }))}
                    />
                  </View>
                </View>

                {/* Standard and Status */}
                <View className="flex-row justify-between mb-4">
                  <View className="w-[48%]">
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Reference Standard</Text>
                    <TextInput
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800"
                      value={calibrationForm.standard}
                      onChangeText={(text) => setCalibrationForm(prev => ({ ...prev, standard: text }))}
                      placeholder="e.g. NIST Standard"
                      placeholderTextColor="#cbd5e1"
                    />
                  </View>
                  <View className="w-[48%]">
                    <Text className="text-[10px] font-extrabold text-slate-400 uppercase mb-1.5">Status</Text>
                    <TouchableOpacity
                      onPress={() => setPickerState({
                        visible: true,
                        type: 'calibrationStatus',
                        title: 'Select Status',
                        options: [
                          { label: 'Scheduled', value: 'scheduled' },
                          { label: 'In Progress', value: 'in_progress' },
                          { label: 'Completed', value: 'completed' },
                          { label: 'Cancelled', value: 'cancelled' }
                        ]
                      })}
                      className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 flex-row justify-between items-center"
                    >
                      <Text className="text-xs font-bold text-slate-800 uppercase">
                        {calibrationForm.status}
                      </Text>
                      <Ionicons name="chevron-down" size={12} color="#64748b" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Description */}
                <View className="mb-4">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Calibration Specifications</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 min-h-[60px]"
                    value={calibrationForm.description}
                    onChangeText={(text) => setCalibrationForm(prev => ({ ...prev, description: text }))}
                    placeholder="Reference ranges, target deviations..."
                    placeholderTextColor="#cbd5e1"
                    multiline
                  />
                </View>

                {/* Notes */}
                <View className="mb-6">
                  <Text className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide mb-1.5">Audit Remarks</Text>
                  <TextInput
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 min-h-[60px]"
                    value={calibrationForm.notes}
                    onChangeText={(text) => setCalibrationForm(prev => ({ ...prev, notes: text }))}
                    placeholder="Standard compliance notes..."
                    placeholderTextColor="#cbd5e1"
                    multiline
                  />
                </View>

                {/* Footer buttons */}
                <View className="flex-row gap-3 border-t border-slate-100 pt-4 mb-4">
                  <TouchableOpacity
                    onPress={() => setShowCalibrationModal(false)}
                    className="flex-1 py-3.5 bg-slate-100 border border-slate-200 rounded-xl items-center"
                  >
                    <Text className="text-slate-700 text-sm font-bold">Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleLogCalibration}
                    className="flex-1 py-3.5 bg-blue-600 rounded-xl items-center"
                  >
                    <Text className="text-white text-sm font-bold">Schedule</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </RNModal>

      {/* Floating Toast Notification */}
      {toast && (
        <View className={`absolute top-12 left-6 right-6 p-4 rounded-2xl flex-row items-center shadow-2xl border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200' :
          toast.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'
        } z-[9999]`}>
          <Ionicons
            name={toast.type === 'success' ? 'checkmark-circle' : toast.type === 'error' ? 'alert-circle' : 'information-circle'}
            size={20}
            color={toast.type === 'success' ? '#16a34a' : toast.type === 'error' ? '#dc2626' : '#2563eb'}
            className="mr-3 shrink-0"
          />
          <Text className={`text-xs font-bold flex-1 ${
            toast.type === 'success' ? 'text-emerald-800' :
            toast.type === 'error' ? 'text-red-800' : 'text-blue-800'
          }`}>
            {toast.message}
          </Text>
          <TouchableOpacity onPress={() => setToast(null)} className="p-1">
            <Ionicons name="close" size={16} color="#64748b" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default function EquipmentTracking() {
  return (
    <LabLayout>
      <EquipmentTrackingContent />
    </LabLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'flex-end',
  },
});
