import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminLayout, { useSidebar } from './AdminLayout';
import { api } from '../../services/api';

const { width } = Dimensions.get('window');

const ActionColorMap = {
  view: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' }, // blue
  create: { bg: '#fffbeb', text: '#b45309', border: '#fde68a' }, // amber
  update: { bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff' }, // purple
  delete: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca' }, // red
  login: { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0' }, // emerald
  logout: { bg: '#f3f4f6', text: '#374151', border: '#e5e7eb' }, // gray
  edit: { bg: '#faf5ff', text: '#6b21a8', border: '#e9d5ff' }, // purple
  read: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' }, // blue
  default: { bg: '#eff6ff', text: '#1e40af', border: '#bfdbfe' },
};

const getActionStyles = (action) => {
  const key = (action || '').toLowerCase();
  return ActionColorMap[key] || ActionColorMap.default;
};

const StatCard = ({ title, value, icon, colors, loading }) => (
  <View style={[styles.statCard, { backgroundColor: colors.bg, borderColor: colors.border }]}>
    <View style={styles.statCardInner}>
      <View>
        <Text style={[styles.statTitle, { color: colors.textDark }]}>{title}</Text>
        <Text style={[styles.statValue, { color: colors.textDark }]}>
          {loading ? '...' : value}
        </Text>
      </View>
      <View style={[styles.statIconContainer, { backgroundColor: colors.iconBg }]}>
        <Ionicons name={icon} size={28} color={colors.iconColor} />
      </View>
    </View>
  </View>
);

const AuditLogsContent = () => {
  const { toggleSidebar } = useSidebar();
  const navigation = useNavigation();

  const [auditLogs, setAuditLogs] = useState([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [statsSummary, setStatsSummary] = useState({});
  const itemsPerPage = 10;

  const fetchAuditLogs = async (skip = 0, limit = 50) => {
    try {
      setLoading(true);
      setError(null);

      // Using the central api service to match the web API call
      // Assumption: The endpoint is /api/v1/hospital-admin/audit-logs
      const response = await api.get(`/api/v1/hospital-admin/audit-logs?skip=${skip}&limit=${limit}`).catch(async () => {
         // Fallback endpoint if the first one fails
         return await api.get(`/api/v1/admin/audit-logs?skip=${skip}&limit=${limit}`);
      });
      
      const logsArray = response?.items || [];
      const total = response?.summary?.total_logs || logsArray.length;
      
      setAuditLogs(logsArray);
      setTotalLogs(total);
      
      if (response?.summary) {
        setStatsSummary(response.summary);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Failed to fetch audit logs. Please try again.');
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs(0, 50);
  }, []);

  const uniqueUsers = useMemo(() => {
    return [...new Set(auditLogs.map((log) => log.user_name).filter(Boolean))];
  }, [auditLogs]);

  const uniqueActions = useMemo(() => {
    return [...new Set(auditLogs.map((log) => log.action).filter(Boolean))];
  }, [auditLogs]);

  const filteredLogs = useMemo(() => {
    let result = auditLogs;

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter((log) => {
        return (
          (log.user_name || '').toLowerCase().includes(searchLower) ||
          (log.action || '').toLowerCase().includes(searchLower) ||
          (log.resource || '').toLowerCase().includes(searchLower) ||
          (log.description || '').toLowerCase().includes(searchLower) ||
          (log.ip_address || '').includes(searchTerm)
        );
      });
    }

    if (filterAction !== 'all') {
      result = result.filter((log) => log.action === filterAction);
    }

    if (filterUser !== 'all') {
      result = result.filter((log) => log.user_name === filterUser);
    }

    return result;
  }, [auditLogs, searchTerm, filterAction, filterUser]);

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const stats = useMemo(() => {
    return {
      total: statsSummary.total_logs || totalLogs,
      userLogins: statsSummary.user_logins || 0,
      updates: statsSummary.updates || 0,
      creations: statsSummary.creations || 0,
      deletions: statsSummary.deletions || 0,
    };
  }, [totalLogs, statsSummary]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={toggleSidebar} style={styles.menuBtn} activeOpacity={0.7}>
              <Ionicons name="menu-outline" size={26} color="#4F46E5" />
            </TouchableOpacity>
            <View>
              <Text style={styles.pageTitle}>Audit Logs</Text>
              <Text style={styles.pageSubtitle}>Real-time tracking and monitoring{'\n'}of all system activities</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={24} color="#b91c1c" />
            <View style={{ marginLeft: 12 }}>
              <Text style={styles.errorTitle}>Error Loading Audit Logs</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        )}

        {/* Stats Grid */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsScroll}>
          <View style={styles.statsRow}>
            <StatCard
              title="Total Logs"
              value={stats.total}
              icon="list"
              loading={loading}
              colors={{ bg: '#eff6ff', border: '#93c5fd', textDark: '#1e40af', iconBg: 'rgba(37,99,235,0.2)', iconColor: '#2563eb' }}
            />
            <StatCard
              title="User Logins"
              value={stats.userLogins}
              icon="log-in"
              loading={loading}
              colors={{ bg: '#ecfdf5', border: '#6ee7b7', textDark: '#065f46', iconBg: 'rgba(5,150,105,0.2)', iconColor: '#059669' }}
            />
            <StatCard
              title="Updates"
              value={stats.updates}
              icon="create"
              loading={loading}
              colors={{ bg: '#faf5ff', border: '#d8b4fe', textDark: '#6b21a8', iconBg: 'rgba(147,51,234,0.2)', iconColor: '#9333ea' }}
            />
            <StatCard
              title="Creations"
              value={stats.creations}
              icon="add-circle"
              loading={loading}
              colors={{ bg: '#fffbeb', border: '#fcd34d', textDark: '#92400e', iconBg: 'rgba(217,119,6,0.2)', iconColor: '#d97706' }}
            />
            <StatCard
              title="Deletions"
              value={stats.deletions}
              icon="trash"
              loading={loading}
              colors={{ bg: '#fef2f2', border: '#fca5a5', textDark: '#991b1b', iconBg: 'rgba(220,38,38,0.2)', iconColor: '#dc2626' }}
            />
          </View>
        </ScrollView>

        {/* Filters & Search */}
        <View style={styles.filtersContainer}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by user, action, resource, or IP address..."
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                setCurrentPage(1);
              }}
              placeholderTextColor="#9CA3AF"
            />
          </View>

          <View style={styles.filterControlsRow}>
            {/* Simple native filter selection logic since React Native Picker is external, we'll use horizontal scoll for chips for users/actions */}
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.filterLabel}>Actions</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                <TouchableOpacity
                  style={[styles.filterChip, filterAction === 'all' && styles.filterChipActive]}
                  onPress={() => { setFilterAction('all'); setCurrentPage(1); }}
                >
                  <Text style={[styles.filterChipText, filterAction === 'all' && styles.filterChipTextActive]}>All Actions</Text>
                </TouchableOpacity>
                {uniqueActions.map(action => (
                  <TouchableOpacity
                    key={action}
                    style={[styles.filterChip, filterAction === action && styles.filterChipActive]}
                    onPress={() => { setFilterAction(action); setCurrentPage(1); }}
                  >
                    <Text style={[styles.filterChipText, filterAction === action && styles.filterChipTextActive]}>{action}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.filterControlsRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
               <Text style={styles.filterLabel}>Users</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 8 }}>
                <TouchableOpacity
                  style={[styles.filterChip, filterUser === 'all' && styles.filterChipActive]}
                  onPress={() => { setFilterUser('all'); setCurrentPage(1); }}
                >
                  <Text style={[styles.filterChipText, filterUser === 'all' && styles.filterChipTextActive]}>All Users</Text>
                </TouchableOpacity>
                {uniqueUsers.map(user => (
                  <TouchableOpacity
                    key={user}
                    style={[styles.filterChip, filterUser === user && styles.filterChipActive]}
                    onPress={() => { setFilterUser(user); setCurrentPage(1); }}
                  >
                    <Text style={[styles.filterChipText, filterUser === user && styles.filterChipTextActive]}>{user}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity
              style={styles.reloadBtn}
              onPress={() => fetchAuditLogs(0, 50)}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
              ) : (
                <Ionicons name="refresh" size={18} color="#fff" style={{ marginRight: 8 }} />
              )}
              <Text style={styles.reloadBtnText}>Reload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => {
                setSearchTerm('');
                setFilterAction('all');
                setFilterUser('all');
                setCurrentPage(1);
              }}
            >
              <Ionicons name="refresh" size={18} color="#374151" style={{ marginRight: 8 }} />
              <Text style={styles.resetBtnText}>Reset</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.resultsInfo}>
            {loading
              ? 'Loading audit logs...'
              : `Showing ${paginatedLogs.length} of ${filteredLogs.length} results (${stats.total} total)`}
          </Text>
        </View>

        {/* Audit Log List (Table Alternative) */}
        <View style={styles.tableCard}>
          <View style={styles.tableHeaderMobile}>
             <Text style={styles.tableHeaderTitle}>Activity History</Text>
          </View>

          {loading ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#9CA3AF" />
              <Text style={styles.emptyStateText}>Loading audit logs...</Text>
            </View>
          ) : paginatedLogs.length > 0 ? (
            paginatedLogs.map((log, index) => {
              const actionStyle = getActionStyles(log.action);
              const timestamp = log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A';

              return (
                <View key={log.id || index} style={[styles.logItem, index === paginatedLogs.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.logItemHeader}>
                    <Text style={styles.logUser}>{log.user_name || 'N/A'}</Text>
                    <View style={[styles.logActionBadge, { backgroundColor: actionStyle.bg, borderColor: actionStyle.border }]}>
                      <Text style={[styles.logActionText, { color: actionStyle.text }]}>{log.action || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.logItemDetails}>
                    <Text style={styles.logResource}><Text style={{ fontWeight: '600' }}>Resource:</Text> {log.resource || 'N/A'}</Text>
                  </View>
                  <View style={styles.logItemFooter}>
                    <View style={styles.logIpContainer}>
                      <Text style={styles.logIpText}>{log.ip_address || 'N/A'}</Text>
                    </View>
                    <Text style={styles.logTime}>{timestamp}</Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="inbox" size={40} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No audit logs found matching your filters</Text>
            </View>
          )}

          {/* Pagination */}
          {totalPages > 1 && !loading && (
            <View style={styles.paginationContainer}>
              <Text style={styles.paginationText}>
                Page {currentPage} of {totalPages}
              </Text>
              <View style={styles.paginationControls}>
                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#9CA3AF' : '#374151'} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.pageBtn, currentPage === totalPages && styles.pageBtnDisabled]}
                  onPress={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#9CA3AF' : '#374151'} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Nav Bar */}
     
    </View>
  );
};

const AuditLogsScreen = () => {
  return (
    <AdminLayout>
      <AuditLogsContent />
    </AdminLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { paddingHorizontal: 20, paddingVertical: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  menuBtn: { marginRight: 16, height: 44, width: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#eef2ff' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#111827' },
  pageSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },
  errorContainer: { backgroundColor: '#fef2f2', borderColor: '#fecaca', borderWidth: 1, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  errorTitle: { fontWeight: '600', color: '#b91c1c' },
  errorText: { fontSize: 13, color: '#b91c1c', marginTop: 2 },
  statsScroll: { marginBottom: 16, overflow: 'visible' },
  statsRow: { flexDirection: 'row', paddingRight: 16 },
  statCard: { width: 220, padding: 20, borderRadius: 16, borderWidth: 1, marginRight: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  statCardInner: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  statTitle: { fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, opacity: 0.8 },
  statValue: { fontSize: 28, fontWeight: 'bold', marginTop: 8 },
  statIconContainer: { padding: 10, borderRadius: 12 },
  filtersContainer: { backgroundColor: 'white', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 12, marginBottom: 16 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 14, color: '#111827' },
  filterControlsRow: { marginBottom: 12 },
  filterLabel: { fontSize: 11, fontWeight: '600', color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb', marginRight: 8 },
  filterChipActive: { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' },
  filterChipText: { fontSize: 13, color: '#4b5563', fontWeight: '500' },
  filterChipTextActive: { color: '#1d4ed8', fontWeight: '600' },
  actionButtonsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  reloadBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#2563eb', paddingVertical: 10, borderRadius: 8, marginRight: 8 },
  reloadBtnText: { color: 'white', fontWeight: '600', fontSize: 14 },
  resetBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#d1d5db', paddingVertical: 10, borderRadius: 8 },
  resetBtnText: { color: '#374151', fontWeight: '600', fontSize: 14 },
  resultsInfo: { marginTop: 16, fontSize: 13, color: '#4b5563' },
  tableCard: { backgroundColor: 'white', borderRadius: 16, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  tableHeaderMobile: { backgroundColor: '#f3f4f6', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  tableHeaderTitle: { fontWeight: '600', color: '#374151', textTransform: 'uppercase', fontSize: 12 },
  logItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  logItemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  logUser: { fontSize: 15, fontWeight: '600', color: '#111827' },
  logActionBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  logActionText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  logItemDetails: { marginBottom: 8 },
  logResource: { fontSize: 14, color: '#4b5563' },
  logItemFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logIpContainer: { backgroundColor: '#f9fafb', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#e5e7eb' },
  logIpText: { fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#4b5563' },
  logTime: { fontSize: 12, color: '#6b7280' },
  emptyState: { padding: 32, alignItems: 'center', justifyContent: 'center' },
  emptyStateText: { marginTop: 12, fontSize: 14, color: '#6b7280', fontWeight: '500' },
  paginationContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, backgroundColor: '#f9fafb', borderTopWidth: 1, borderTopColor: '#e5e7eb' },
  paginationText: { fontSize: 13, color: '#4b5563' },
  paginationControls: { flexDirection: 'row', alignItems: 'center' },
  pageBtn: { padding: 6, backgroundColor: '#e5e7eb', borderRadius: 6, marginLeft: 8 },
  pageBtnDisabled: { opacity: 0.5 },
  bottomNav: { position: 'absolute', bottom: 0, width: '100%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingVertical: 16, paddingBottom: 40, shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 20 },
  navItem: { alignItems: 'center' },
  navText: { marginTop: 4, fontSize: 10, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase' },
  activeNavIconContainer: { height: 44, width: 44, alignItems: 'center', justifyContent: 'center', borderRadius: 16, backgroundColor: '#4f46e5', marginBottom: 4, shadowColor: '#818cf8', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8, elevation: 4 },
  activeNavText: { fontSize: 10, fontWeight: '900', color: '#4f46e5', textTransform: 'uppercase' }
});

export default AuditLogsScreen;
