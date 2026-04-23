import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import AdminLayout, { useSidebar } from './AdminLayout';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

// ─── Constants ──────────────────────────────────────────────────────────────

const REPORT_TYPES = [
  { 
    id: 'revenue', 
    name: 'Revenue Analytics', 
    icon: 'chart-bar', 
    color: '#059669', 
    bgColor: '#ecfdf5',
    description: 'Monthly revenue breakdown by department',
  },
  { 
    id: 'department-performance', 
    name: 'Department Performance', 
    icon: 'building', 
    color: '#0d9488', 
    bgColor: '#f0fdfa',
    description: 'Department-wise performance metrics',
  },
  { 
    id: 'bed-occupancy', 
    name: 'Bed Occupancy', 
    icon: 'bed', 
    color: '#7c3aed', 
    bgColor: '#f5f3ff',
    description: 'Daily occupancy and utilization',
  }
];

// ─── Shared Components ───────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color, bgColor }) => (
  <View style={styles.statCard}>
    <View style={[styles.statIconBox, { backgroundColor: bgColor }]}>
      <FontAwesome5 name={icon} size={20} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

const CalendarPicker = ({ visible, onClose, onSelect, initialDate }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const renderDays = () => {
    const month = currentMonth.getMonth();
    const year = currentMonth.getFullYear();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();
    let days = [];
    for (let i = 0; i < startDay; i++) days.push(<View key={`empty-${i}`} style={styles.calendarDayEmpty} />);
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const isSelected = initialDate === dateStr;
      days.push(
        <TouchableOpacity key={d} onPress={() => onSelect(dateStr)} style={styles.calendarDay}>
          <View style={[styles.calendarDayInner, isSelected && styles.calendarDaySelected]}>
            <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected]}>{d}</Text>
          </View>
        </TouchableOpacity>
      );
    }
    return days;
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}>
              <Ionicons name="chevron-back" size={24} color="#6b7280" />
            </TouchableOpacity>
            <Text style={styles.calendarMonthText}>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</Text>
            <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}>
              <Ionicons name="chevron-forward" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.calendarWeekdays}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <Text key={i} style={styles.weekdayText}>{d}</Text>)}
          </View>
          <View style={styles.calendarGrid}>{renderDays()}</View>
          <TouchableOpacity onPress={onClose} style={styles.calendarCloseBtn}>
            <Text style={styles.calendarCloseText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// ─── Main Content ────────────────────────────────────────────────────────────

const ReportsContent = () => {
  const { toggleSidebar } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [modalState, setModalState] = useState({ generate: false, view: false, delete: false, calendar: false, showTypePicker: false });
  const [calendarTarget, setCalendarTarget] = useState(null);
  const [currentReport, setCurrentReport] = useState(null);
  const [selectedReportType, setSelectedReportType] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [reportFormat, setReportFormat] = useState('PDF');

  const selectedReportObj = REPORT_TYPES.find(r => r.id === selectedReportType);

  const openModal = (type, report = null) => {
    setModalState(prev => ({ ...prev, [type]: true }));
    if (type === 'generate' && report) setSelectedReportType(report.id);
    else if ((type === 'view' || type === 'delete') && report) setCurrentReport(report);
  };

  const closeModal = (type) => {
    setModalState(prev => ({ ...prev, [type]: false }));
    if (type === 'generate') setSelectedReportType('');
    else setCurrentReport(null);
  };

  const handleGenerateReport = async () => {
    if (!selectedReportType || !dateRange.start || !dateRange.end) {
      Alert.alert('Selection Required', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const endpoint = selectedReportType === 'bed-occupancy' ? 'bed-occupancy' : selectedReportType === 'revenue' ? 'revenue-summary' : 'department-performance';
      const data = await api.get(`/api/v1/hospital-admin/reports/${endpoint}?date_from=${dateRange.start}&date_to=${dateRange.end}`);
      const newReport = {
        id: `REP-${String(reports.length + 1).padStart(3, '0')}`,
        type: selectedReportObj.name,
        report_code: selectedReportType,
        period: `${dateRange.start} - ${dateRange.end}`,
        generated: new Date().toLocaleDateString(),
        size: '1.2 MB',
        format: reportFormat,
        data: data
      };
      setReports(prev => [newReport, ...prev]);
      closeModal('generate');
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to generate report");
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.contentContainer}>
      {/* ── Fixed Sticky Header ── */}
      <View style={styles.header}>
        <View style={styles.topRow}>
          <View style={styles.leftHeader}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuBtn}>
              <Ionicons name="menu" size={28} color="#111827" />
            </TouchableOpacity>
            <View style={styles.titleGroup}>
              <Text style={styles.pageTitle}>Reports & Analytics</Text>
              <Text style={styles.pageSubtitle}>Hospital Metrics</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => openModal('generate')}
            style={styles.generateBtn}
          >
            <Ionicons name="add" size={20} color="white" />
            <Text style={styles.generateBtnText}>New Report</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Analytics Grid */}
        <View style={styles.gridSection}>
          {REPORT_TYPES.map((report) => (
            <TouchableOpacity 
              key={report.id} 
              onPress={() => openModal('generate', report)} 
              style={styles.reportCard}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: report.bgColor }]}>
                  <FontAwesome5 name={report.icon} size={22} color={report.color} />
                </View>
                <View style={styles.trendTag}>
                  <Ionicons name="trending-up" size={14} color="#059669" />
                  <Text style={styles.trendText}>+12%</Text>
                </View>
              </View>
              <Text style={styles.cardTitle}>{report.name}</Text>
              <Text style={styles.cardDesc}>{report.description}</Text>
              <View style={styles.cardFooter}>
                <Text style={styles.liveText}>Live connection</Text>
                <View style={styles.actionLink}>
                  <Text style={styles.actionText}>Generate</Text>
                  <Ionicons name="arrow-forward" size={14} color="#059669" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.recentSection}>
          <Text style={styles.sectionHeading}>Recent Reports</Text>
          <View style={styles.tableContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View>
                <View style={styles.tableHeader}>
                  <Text style={[styles.columnHeader, { width: 80 }]}>ID</Text>
                  <Text style={[styles.columnHeader, { width: 160 }]}>Type</Text>
                  <Text style={[styles.columnHeader, { width: 160 }]}>Period</Text>
                  <Text style={[styles.columnHeader, { width: 80 }]}>Format</Text>
                  <Text style={[styles.columnHeader, { width: 80, textAlign: 'right' }]}>Actions</Text>
                </View>
                {reports.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>No reports generated recently.</Text>
                  </View>
                ) : (
                  reports.map((report) => (
                    <View key={report.id} style={styles.tableRow}>
                      <Text style={[styles.cellText, { width: 80, color: '#6b7280' }]}>{report.id}</Text>
                      <Text style={[styles.cellText, { width: 160, fontWeight: 'bold', color: '#111827' }]}>{report.type}</Text>
                      <Text style={[styles.cellText, { width: 160, color: '#6b7280' }]}>{report.period}</Text>
                      <Text style={[styles.cellText, { width: 80, color: '#6b7280' }]}>{report.format}</Text>
                      <View style={[styles.actionCell, { width: 80 }]}>
                         <TouchableOpacity onPress={() => openModal('view', report)} style={styles.actionBtn}>
                           <Ionicons name="eye-outline" size={18} color="#059669" />
                         </TouchableOpacity>
                         <TouchableOpacity onPress={() => openModal('delete', report)} style={styles.actionBtn}>
                           <Ionicons name="trash-outline" size={18} color="#ef4444" />
                         </TouchableOpacity>
                      </View>
                    </View>
                  ))
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </ScrollView>

      {/* Generation Modal */}
      <Modal visible={modalState.generate} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>Generate Report</Text>
              <TouchableOpacity onPress={() => closeModal('generate')}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formBody}>
              {selectedReportObj && (
                <View style={styles.infoBanner}>
                  <View style={styles.bannerIcon}>
                    <FontAwesome5 name={selectedReportObj.icon} size={18} color="#2563eb" />
                  </View>
                  <View style={styles.bannerContent}>
                    <Text style={styles.bannerTitle}>{selectedReportObj.name}</Text>
                    <Text style={styles.bannerDesc}>{selectedReportObj.description}</Text>
                  </View>
                </View>
              )}

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Report Type</Text>
                <TouchableOpacity 
                  onPress={() => setModalState(prev => ({ ...prev, showTypePicker: !prev.showTypePicker }))}
                  style={styles.selectBox}
                >
                  <Text style={selectedReportType ? styles.selectText : styles.placeholderText}>
                    {selectedReportObj ? selectedReportObj.name : 'Select Report Type'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#6b7280" />
                </TouchableOpacity>

                {modalState.showTypePicker && (
                  <View style={styles.dropdown}>
                    {REPORT_TYPES.map(t => (
                      <TouchableOpacity 
                        key={t.id} 
                        onPress={() => { setSelectedReportType(t.id); setModalState(prev => ({ ...prev, showTypePicker: false })); }}
                        style={styles.dropdownItem}
                      >
                        <Text style={styles.dropdownText}>{t.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View style={styles.dateRow}>
                <View style={styles.dateField}>
                  <Text style={styles.label}>Start Date</Text>
                  <TouchableOpacity onPress={() => { setCalendarTarget('start'); setModalState(prev => ({...prev, calendar: true})); }} style={styles.datePickerBtn}>
                    <Text style={dateRange.start ? styles.dateText : styles.placeholderText}>{dateRange.start || 'YYYY-MM-DD'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.dateField}>
                  <Text style={styles.label}>End Date</Text>
                  <TouchableOpacity onPress={() => { setCalendarTarget('end'); setModalState(prev => ({...prev, calendar: true})); }} style={styles.datePickerBtn}>
                    <Text style={dateRange.end ? styles.dateText : styles.placeholderText}>{dateRange.end || 'YYYY-MM-DD'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Format</Text>
                <View style={styles.radioRow}>
                  <TouchableOpacity onPress={() => setReportFormat('PDF')} style={styles.radioItem}>
                    <View style={[styles.radioOuter, reportFormat === 'PDF' && styles.radioOuterActive]}>
                      {reportFormat === 'PDF' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>PDF</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setReportFormat('Excel')} style={styles.radioItem}>
                    <View style={[styles.radioOuter, reportFormat === 'Excel' && styles.radioOuterActive]}>
                      {reportFormat === 'Excel' && <View style={styles.radioInner} />}
                    </View>
                    <Text style={styles.radioLabel}>Excel</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formFooter}>
                <TouchableOpacity onPress={() => closeModal('generate')} style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={handleGenerateReport} 
                  disabled={!selectedReportType || !dateRange.start || !dateRange.end}
                  style={[styles.submitBtn, (!selectedReportType || !dateRange.start || !dateRange.end) && styles.submitBtnDisabled]}
                >
                  {loading ? <ActivityIndicator color="white" size="small" /> : <Text style={styles.submitBtnText}>Generate</Text>}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <CalendarPicker 
        visible={modalState.calendar} 
        onClose={() => setModalState(prev => ({...prev, calendar: false}))} 
        onSelect={(d) => { setDateRange(prev => ({...prev, [calendarTarget]: d})); setModalState(prev => ({...prev, calendar: false})); }} 
        initialDate={dateRange[calendarTarget]} 
      />

      <Modal visible={modalState.view} animationType="slide">
        <View style={styles.viewModal}>
          <View style={styles.viewHeader}>
            <View>
              <Text style={styles.viewTitle}>{currentReport?.type}</Text>
              <Text style={styles.viewPeriod}>{currentReport?.period}</Text>
            </View>
            <TouchableOpacity onPress={() => closeModal('view')}>
              <Ionicons name="close" size={28} color="#111827" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.viewBody}>
             {currentReport && (
               currentReport.report_code === 'revenue' ? <RevenueSummaryView data={currentReport.data} /> :
               currentReport.report_code === 'bed-occupancy' ? <BedOccupancyView data={currentReport.data} /> :
               currentReport.report_code === 'department-performance' ? <DepartmentPerformanceView data={currentReport.data} /> :
               <Text style={styles.noDataText}>Report view not implemented for this type.</Text>
             )}
          </ScrollView>
          {/* Sticky Close Button at Bottom */}
          <View style={styles.viewFooter}>
            <TouchableOpacity onPress={() => closeModal('view')} style={styles.closeFooterBtn}>
              <Ionicons name="close" size={18} color="white" style={{ marginRight: 6 }} />
              <Text style={styles.closeFooterBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal visible={modalState.delete} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.deleteCard}>
            <View style={styles.deleteIconBox}>
              <Ionicons name="alert-circle" size={44} color="#ef4444" />
            </View>
            <Text style={styles.deleteTitle}>Delete Report?</Text>
            <Text style={styles.deleteDesc}>Are you sure you want to delete{`\n`}<Text style={{ fontWeight: 'bold', color: '#111827' }}>{currentReport?.type}</Text>?{`\n`}This action cannot be undone.</Text>
            <View style={styles.deleteActions}>
              <TouchableOpacity
                onPress={() => closeModal('delete')}
                style={styles.deleteCancelBtn}
              >
                <Text style={styles.deleteCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setReports(prev => prev.filter(r => r.id !== currentReport?.id));
                  closeModal('delete');
                }}
                style={styles.deleteConfirmBtn}
              >
                <Ionicons name="trash-outline" size={16} color="white" style={{ marginRight: 6 }} />
                <Text style={styles.deleteConfirmText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// ─── Visual Views ────────────────────────────────────────────────────────────

const BedOccupancyView = ({ data }) => {
  if (!data) return <Text style={styles.noDataText}>No data available.</Text>;
  const { summary = {}, ward_breakdown, daily_trends } = data;

  const getNetChangeStyle = (val) => {
    if (val > 0) return { bg: '#ecfdf5', color: '#059669', prefix: '+' };
    if (val < 0) return { bg: '#fee2e2', color: '#dc2626', prefix: '' };
    return { bg: 'transparent', color: '#6b7280', prefix: '' };
  };

  return (
    <View style={styles.detailContent}>

      {/* Summary KPI Cards */}
      <Text style={styles.detailHeading}>Summary Overview</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 8 }}>
          <StatCard title="Total Beds" value={summary.total_beds || 0} icon="bed" color="#2563eb" bgColor="#eff6ff" />
          <StatCard title="Occupied" value={summary.occupied_beds || 0} icon="procedures" color="#dc2626" bgColor="#fee2e2" />
          <StatCard title="Available" value={summary.available_beds || 0} icon="check-circle" color="#059669" bgColor="#ecfdf5" />
          <StatCard title="Occupancy Rate" value={`${summary.occupancy_rate || 0}%`} icon="chart-pie" color="#7c3aed" bgColor="#f5f3ff" />
          <StatCard title="ALOS" value={`${summary.average_length_of_stay || 0}d`} icon="clock" color="#d97706" bgColor="#fffbeb" />
        </View>
      </ScrollView>

      {/* Admissions & Discharges */}
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 8 }}>
        <View style={styles.admissionBox}>
          <View>
            <Text style={styles.admissionLabel}>Total Admissions</Text>
            <Text style={styles.admissionValue}>{data.total_admissions || 0}</Text>
          </View>
          <FontAwesome5 name="user-plus" size={28} color="#6ee7b7" />
        </View>
        <View style={styles.dischargeBox}>
          <View>
            <Text style={styles.dischargeLabel}>Total Discharges</Text>
            <Text style={styles.dischargeValue}>{data.total_discharges || 0}</Text>
          </View>
          <FontAwesome5 name="user-minus" size={28} color="#fdba74" />
        </View>
      </View>

      {/* Ward Breakdown Table */}
      <Text style={styles.detailHeading}>Ward Breakdown</Text>
      <View style={styles.tableContainerFull}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={{ minWidth: 600 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { width: 140 }]}>Ward Name</Text>
              <Text style={[styles.columnHeader, { width: 70, textAlign: 'center' }]}>Total</Text>
              <Text style={[styles.columnHeader, { width: 80, textAlign: 'center' }]}>Occupied</Text>
              <Text style={[styles.columnHeader, { width: 80, textAlign: 'center' }]}>Available</Text>
              <Text style={[styles.columnHeader, { width: 90, textAlign: 'center' }]}>Maintenance</Text>
              <Text style={[styles.columnHeader, { width: 70, textAlign: 'center' }]}>Rate</Text>
            </View>
            {(!ward_breakdown || ward_breakdown.length === 0) ? (
              <View style={styles.emptyRow}>
                <Text style={styles.noDataText}>No ward data available for this range.</Text>
              </View>
            ) : (
              ward_breakdown.map((w, i) => (
                <View key={i} style={[styles.tableRowBorder, { alignItems: 'center' }]}>
                  <Text style={[styles.rowPrimary, { width: 140 }]}>{w.ward_name}</Text>
                  <Text style={[styles.cellText, { width: 70, textAlign: 'center', fontWeight: '600', color: '#374151' }]}>{w.total_beds}</Text>
                  <Text style={[styles.cellText, { width: 80, textAlign: 'center', fontWeight: 'bold', color: '#dc2626' }]}>{w.occupied}</Text>
                  <Text style={[styles.cellText, { width: 80, textAlign: 'center', fontWeight: 'bold', color: '#059669' }]}>{w.available}</Text>
                  <Text style={[styles.cellText, { width: 90, textAlign: 'center', fontWeight: 'bold', color: '#d97706' }]}>{w.maintenance}</Text>
                  <Text style={[styles.rowHighlight, { width: 70, textAlign: 'center' }]}>{w.occupancy_rate}%</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Daily Trends Table */}
      <Text style={styles.detailHeading}>Daily Trends</Text>
      <View style={styles.tableContainerFull}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 420 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { width: 120 }]}>Date</Text>
              <Text style={[styles.columnHeader, { width: 100, textAlign: 'center' }]}>Admissions</Text>
              <Text style={[styles.columnHeader, { width: 100, textAlign: 'center' }]}>Discharges</Text>
              <Text style={[styles.columnHeader, { width: 100, textAlign: 'center' }]}>Net Change</Text>
            </View>
            {(!daily_trends || daily_trends.length === 0) ? (
              <View style={styles.emptyRow}>
                <Text style={styles.noDataText}>No trend data available for this range.</Text>
              </View>
            ) : (
              daily_trends.map((t, i) => {
                const nc = getNetChangeStyle(t.net_change);
                return (
                  <View key={i} style={[styles.tableRowBorder, { alignItems: 'center' }]}>
                    <Text style={[styles.rowPrimary, { width: 120 }]}>{t.date}</Text>
                    <Text style={[styles.cellText, { width: 100, textAlign: 'center', fontWeight: 'bold', color: '#059669' }]}>{t.admissions}</Text>
                    <Text style={[styles.cellText, { width: 100, textAlign: 'center', fontWeight: 'bold', color: '#d97706' }]}>{t.discharges}</Text>
                    <View style={{ width: 100, alignItems: 'center' }}>
                      <View style={{ backgroundColor: nc.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                        <Text style={{ color: nc.color, fontWeight: 'bold', fontSize: 13 }}>{nc.prefix}{t.net_change}</Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const DepartmentPerformanceView = ({ data }) => {
  if (!data) return <Text style={styles.noDataText}>No data available.</Text>;
  const { hospital_summary, department_performance } = data;

  const getCompletionStyle = (rate) => {
    if (rate >= 80) return { bg: '#dcfce7', text: '#166534' };
    if (rate >= 60) return { bg: '#fef9c3', text: '#854d0e' };
    return { bg: '#fee2e2', text: '#991b1b' };
  };

  return (
    <View style={styles.detailContent}>

      {/* Hospital Summary KPI Cards */}
      <Text style={styles.detailHeading}>Hospital Summary</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 12, paddingBottom: 8 }}>
          <StatCard title="Departments" value={hospital_summary?.total_departments || 0} icon="building" color="#2563eb" bgColor="#eff6ff" />
          <StatCard title="Doctors" value={hospital_summary?.total_doctors || 0} icon="user-md" color="#059669" bgColor="#ecfdf5" />
          <StatCard title="Total Appts" value={hospital_summary?.total_appointments || 0} icon="calendar-check" color="#7c3aed" bgColor="#f5f3ff" />
          <StatCard title="Total Revenue" value={`₹${hospital_summary?.total_revenue || 0}`} icon="rupee-sign" color="#059669" bgColor="#ecfdf5" />
          <StatCard title="Avg Appts/Dept" value={hospital_summary?.avg_appointments_per_department || 0} icon="chart-line" color="#d97706" bgColor="#fffbeb" />
        </View>
      </ScrollView>

      {/* Department Performance Table */}
      <Text style={styles.detailHeading}>Department Performance</Text>
      <View style={styles.tableContainerFull}>
        <ScrollView horizontal showsHorizontalScrollIndicator={true}>
          <View style={{ minWidth: 800 }}>
            {/* Table Header */}
            <View style={[styles.tableHeader, { paddingVertical: 12 }]}>
              <Text style={[styles.columnHeader, { width: 130 }]}>Department</Text>
              <Text style={[styles.columnHeader, { width: 120 }]}>Head Doctor</Text>
              <Text style={[styles.columnHeader, { width: 70, textAlign: 'center' }]}>Doctors</Text>
              <Text style={[styles.columnHeader, { width: 80, textAlign: 'center' }]}>Total Appts</Text>
              <Text style={[styles.columnHeader, { width: 80, textAlign: 'center' }]}>Completed</Text>
              <Text style={[styles.columnHeader, { width: 80, textAlign: 'center' }]}>Cancelled</Text>
              <Text style={[styles.columnHeader, { width: 100, textAlign: 'center' }]}>Rate</Text>
              <Text style={[styles.columnHeader, { width: 100, textAlign: 'right' }]}>Revenue</Text>
            </View>
            {(!department_performance || department_performance.length === 0) ? (
              <View style={styles.emptyRow}>
                <Text style={styles.noDataText}>No department data available for this range.</Text>
              </View>
            ) : (
              department_performance.map((dept, i) => {
                const rate = dept.metrics?.completion_rate || 0;
                const badge = getCompletionStyle(rate);
                return (
                  <View key={i} style={[styles.tableRowBorder, { alignItems: 'center' }]}>
                    <View style={{ width: 130 }}>
                      <Text style={[styles.rowPrimary, { fontSize: 13 }]}>{dept.department_name}</Text>
                      <Text style={[styles.rowSecondary, { fontSize: 10 }]}>{dept.department_code}</Text>
                    </View>
                    <Text style={[styles.rowPrimary, { width: 120, fontSize: 13 }]}>{dept.head_doctor}</Text>
                    <Text style={[styles.cellBoldBlue, { width: 70, textAlign: 'center' }]}>{dept.doctor_count}</Text>
                    <Text style={[styles.cellBoldBlue, { width: 80, textAlign: 'center' }]}>{dept.metrics?.total_appointments || 0}</Text>
                    <Text style={[{ width: 80, textAlign: 'center', fontWeight: 'bold', color: '#16a34a', fontSize: 14 }]}>{dept.metrics?.completed_appointments || 0}</Text>
                    <Text style={[{ width: 80, textAlign: 'center', fontWeight: 'bold', color: '#dc2626', fontSize: 14 }]}>{dept.metrics?.cancelled_appointments || 0}</Text>
                    <View style={{ width: 100, alignItems: 'center' }}>
                      <View style={{ backgroundColor: badge.bg, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 }}>
                        <Text style={{ color: badge.text, fontWeight: 'bold', fontSize: 12 }}>{rate}%</Text>
                      </View>
                    </View>
                    <Text style={[styles.rowHighlight, { width: 100, textAlign: 'right' }]}>₹{dept.revenue?.total_revenue || 0}</Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>

      {/* Detailed Metrics Cards */}
      {(department_performance || []).length > 0 && (
        <View>
          <Text style={styles.detailHeading}>Detailed Metrics</Text>
          {department_performance.map((dept, i) => (
            <View key={i} style={styles.deptMetricCard}>
              <View style={styles.deptMetricHeader}>
                <Text style={styles.deptTitle}>{dept.department_name}</Text>
                <View style={styles.deptCodeBadge}>
                  <Text style={styles.deptCodeText}>{dept.department_code}</Text>
                </View>
              </View>
              <View style={styles.deptMetricRow}>
                <Text style={styles.deptMetricLabel}>Completion Rate</Text>
                <Text style={[styles.deptMetricValue, { color: '#16a34a' }]}>{dept.metrics?.completion_rate || 0}%</Text>
              </View>
              <View style={styles.deptMetricRow}>
                <Text style={styles.deptMetricLabel}>Cancellation Rate</Text>
                <Text style={[styles.deptMetricValue, { color: '#dc2626' }]}>{dept.metrics?.cancellation_rate || 0}%</Text>
              </View>
              <View style={styles.deptMetricRow}>
                <Text style={styles.deptMetricLabel}>No Show Rate</Text>
                <Text style={[styles.deptMetricValue, { color: '#d97706' }]}>{dept.metrics?.no_show_rate || 0}%</Text>
              </View>
              <View style={styles.deptMetricRow}>
                <Text style={styles.deptMetricLabel}>Avg Revenue/Appt</Text>
                <Text style={[styles.deptMetricValue, { color: '#059669' }]}>₹{dept.revenue?.avg_revenue_per_appointment || 0}</Text>
              </View>
              <View style={[styles.deptMetricRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.deptMetricLabel}>Avg Appts/Doctor</Text>
                <Text style={[styles.deptMetricValue, { color: '#7c3aed' }]}>{dept.metrics?.avg_appointments_per_doctor || 0}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const RevenueSummaryView = ({ data }) => {
  if (!data) return <Text style={styles.noDataText}>No data available.</Text>;
  const { total_revenue, revenue_this_month, revenue_by_department, revenue_trend } = data;

  return (
    <View style={styles.detailContent}>
      <Text style={styles.detailHeading}>Revenue Overview</Text>
      <View style={styles.kpiRow}>
        <StatCard title="Total Revenue" value={`₹${total_revenue}`} icon="wallet" color="#059669" bgColor="#ecfdf5" />
        <StatCard title="Monthly" value={`₹${revenue_this_month}`} icon="calendar-check" color="#2563eb" bgColor="#eff6ff" />
      </View>

      <Text style={styles.detailHeading}>Revenue by Department</Text>
      <View style={styles.tableContainerFull}>
        <View style={styles.tableHeader}>
           <Text style={[styles.columnHeader, { flex: 1 }]}>Department</Text>
           <Text style={[styles.columnHeader, { width: 120, textAlign: 'right' }]}>Revenue</Text>
        </View>
        {Object.entries(revenue_by_department || {}).length === 0 ? (
          <View style={styles.emptyRow}>
            <Text style={styles.noDataText}>No departmental revenue data available.</Text>
          </View>
        ) : (
          Object.entries(revenue_by_department || {}).map(([dept, rev], i) => (
            <View key={i} style={styles.tableRowBorder}>
              <Text style={[styles.rowPrimary, { flex: 1 }]}>{dept}</Text>
              <Text style={[styles.rowHighlight, { width: 120, textAlign: 'right' }]}>₹{rev}</Text>
            </View>
          ))
        )}
      </View>

      <Text style={styles.detailHeading}>Daily Revenue Trend</Text>
      <View style={styles.tableContainerFull}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={{ minWidth: 400 }}>
            <View style={styles.tableHeader}>
              <Text style={[styles.columnHeader, { width: 120 }]}>Date</Text>
              <Text style={[styles.columnHeader, { width: 120, textAlign: 'center' }]}>Appointments</Text>
              <Text style={[styles.columnHeader, { width: 120, textAlign: 'center' }]}>Daily Revenue</Text>
            </View>
            {(!revenue_trend || revenue_trend.length === 0) ? (
              <View style={styles.emptyRow}>
                <Text style={styles.noDataText}>No trend data available.</Text>
              </View>
            ) : (
              revenue_trend.map((t, i) => (
                <View key={i} style={styles.tableRowBorder}>
                  <Text style={[styles.rowPrimary, { width: 120 }]}>{t.date}</Text>
                  <Text style={[styles.cellBoldBlue, { width: 120, textAlign: 'center' }]}>{t.appointment_count}</Text>
                  <Text style={[styles.rowHighlight, { width: 120, textAlign: 'center' }]}>₹{t.revenue}</Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  contentContainer: { flex: 1, backgroundColor: '#f9fafb' },
  header: { padding: 16, paddingTop: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  leftHeader: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  menuBtn: { padding: 4, marginRight: 12 },
  titleGroup: { flex: 1 },
  generateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#059669', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
  generateBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 6, fontSize: 13 },
  pageTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  pageSubtitle: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  gridSection: { padding: 16 },
  reportCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trendTag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  trendText: { color: '#059669', fontSize: 12, fontWeight: 'bold', marginLeft: 2 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  cardDesc: { fontSize: 14, color: '#6b7280', lineHeight: 20 },
  cardFooter: { marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: '#f9fafb', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  liveText: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },
  actionLink: { flexDirection: 'row', alignItems: 'center' },
  actionText: { color: '#059669', fontWeight: 'bold', fontSize: 14, marginRight: 4 },
  recentSection: { padding: 16, paddingBottom: 40 },
  sectionHeading: { fontSize: 20, fontWeight: 'bold', color: '#111827', marginBottom: 16, marginLeft: 8 },
  tableContainer: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f9fafb', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  columnHeader: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },
  tableRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f9fafb', alignItems: 'center' },
  cellText: { fontSize: 14 },
  actionCell: { flexDirection: 'row', justifyContent: 'flex-end' },
  actionBtn: { marginLeft: 12 },
  emptyState: { padding: 40, alignItems: 'center' },
  emptyStateText: { color: '#9ca3af', fontSize: 14 },
  emptyRow: { padding: 20, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  formContainer: { backgroundColor: 'white', width: '100%', borderRadius: 20, maxHeight: '90%', overflow: 'hidden' },
  formHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  formBody: { padding: 20 },
  infoBanner: { backgroundColor: '#eff6ff', borderWidth: 1, borderColor: '#bfdbfe', borderRadius: 12, padding: 16, flexDirection: 'row', marginBottom: 24 },
  bannerIcon: { width: 36, height: 36, backgroundColor: '#dbeafe', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  bannerContent: { flex: 1 },
  bannerTitle: { fontSize: 14, fontWeight: 'bold', color: '#1e40af' },
  bannerDesc: { fontSize: 12, color: '#1e40af', marginTop: 2 },
  fieldGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  selectBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12 },
  selectText: { fontSize: 14, color: '#111827' },
  placeholderText: { fontSize: 14, color: '#9ca3af' },
  dropdown: { marginTop: 8, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, backgroundColor: 'white' },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  dropdownText: { fontSize: 14, color: '#374151' },
  dateRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  dateField: { flex: 1 },
  datePickerBtn: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 12 },
  dateText: { fontSize: 14, color: '#111827', fontWeight: '500' },
  radioRow: { flexDirection: 'row', gap: 24 },
  radioItem: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  radioOuterActive: { borderColor: '#2563eb' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#2563eb' },
  radioLabel: { fontSize: 14, color: '#374151' },
  formFooter: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 20, marginBottom: 40 },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, borderWidth: 1, borderColor: '#d1d5db' },
  cancelBtnText: { color: '#374151', fontWeight: 'bold' },
  submitBtn: { backgroundColor: '#2563eb', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10, minWidth: 120, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitBtnText: { color: 'white', fontWeight: 'bold' },
  calendarContainer: { backgroundColor: 'white', borderRadius: 20, padding: 20, width: '100%', maxWidth: 350 },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  calendarMonthText: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  calendarWeekdays: { flexDirection: 'row', marginBottom: 10 },
  weekdayText: { flex: 1, textAlign: 'center', fontSize: 12, color: '#9ca3af', fontWeight: 'bold' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: { width: '14.28%', height: 40, alignItems: 'center', justifyContent: 'center' },
  calendarDayEmpty: { width: '14.28%', height: 40 },
  calendarDayInner: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  calendarDaySelected: { backgroundColor: '#059669' },
  calendarDayText: { fontSize: 14, color: '#374151' },
  calendarDayTextSelected: { color: 'white', fontWeight: 'bold' },
  calendarCloseBtn: { marginTop: 20, padding: 12, backgroundColor: '#f3f4f6', borderRadius: 10, alignItems: 'center' },
  calendarCloseText: { color: '#4b5563', fontWeight: 'bold' },
  viewModal: { flex: 1, backgroundColor: '#f9fafb' },
  viewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  viewTitle: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  viewPeriod: { fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 1, marginTop: 4 },
  viewBody: { flex: 1 },
  viewFooter: { padding: 16, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f3f4f6', flexDirection: 'row', justifyContent: 'flex-end' },
  closeFooterBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2563eb', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10 },
  closeFooterBtnText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  detailContent: { padding: 16 },
  detailHeading: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginTop: 24, marginBottom: 12 },
  kpiRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statCard: { flex: 1, backgroundColor: 'white', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, elevation: 1 },
  statIconBox: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  statTitle: { fontSize: 12, color: '#6b7280', fontWeight: '500' },
  tableContainerFull: { backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden' },
  tableRowBorder: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb', alignItems: 'center' },
  rowPrimary: { fontSize: 14, fontWeight: '600', color: '#374151' },
  rowSecondary: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  rowHighlight: { fontSize: 14, fontWeight: 'bold', color: '#059669' },
  rowLabel: { fontSize: 10, color: '#9ca3af', fontWeight: 'bold', textTransform: 'uppercase' },
  cellBoldBlue: { fontSize: 14, fontWeight: 'bold', color: '#2563eb' },
  deptCard: { backgroundColor: 'white', padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6' },
  deptHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  deptTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827' },
  deptSub: { fontSize: 12, color: '#6b7280' },
  deptBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  deptBadgeText: { color: '#059669', fontSize: 12, fontWeight: 'bold' },
  deptFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f9fafb' },
  deptStat: { flexDirection: 'row', alignItems: 'center' },
  deptStatText: { fontSize: 12, color: '#6b7280', marginLeft: 4 },
  deptRevenue: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  deptMetricCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  deptMetricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  deptCodeBadge: { backgroundColor: '#dbeafe', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  deptCodeText: { color: '#1e40af', fontWeight: 'bold', fontSize: 11 },
  deptMetricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#f9fafb' },
  deptMetricLabel: { fontSize: 14, color: '#6b7280' },
  deptMetricValue: { fontSize: 14, fontWeight: 'bold' },
  noDataText: { textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 14 },
  admissionBox: { flex: 1, backgroundColor: '#ecfdf5', borderWidth: 1, borderColor: '#d1fae5', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  admissionLabel: { fontSize: 12, color: '#065f46', fontWeight: '600' },
  admissionValue: { fontSize: 24, fontWeight: 'bold', color: '#065f46', marginTop: 4 },
  dischargeBox: { flex: 1, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 14, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dischargeLabel: { fontSize: 12, color: '#9a3412', fontWeight: '600' },
  dischargeValue: { fontSize: 24, fontWeight: 'bold', color: '#9a3412', marginTop: 4 },
  deleteCard: { backgroundColor: 'white', borderRadius: 24, padding: 28, width: '90%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  deleteIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fee2e2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  deleteTitle: { fontSize: 22, fontWeight: 'bold', color: '#111827', marginBottom: 10 },
  deleteDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  deleteActions: { flexDirection: 'row', gap: 12, width: '100%' },
  deleteCancelBtn: { flex: 1, backgroundColor: '#f3f4f6', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  deleteCancelText: { color: '#374151', fontWeight: 'bold', fontSize: 15 },
  deleteConfirmBtn: { flex: 1, backgroundColor: '#ef4444', paddingVertical: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  deleteConfirmText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
});

export default function ReportsScreen() {
  return (
    <AdminLayout>
      <ReportsContent />
    </AdminLayout>
  );
}