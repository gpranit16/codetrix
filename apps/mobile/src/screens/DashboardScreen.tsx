import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Header } from '../components/Header';
import { SummaryCard } from '../components/SummaryCard';
import { LoanCard } from '../components/LoanCard';
import { RepayConfirmModal } from '../components/RepayConfirmModal';
import { ReceiptModal } from '../components/ReceiptModal';
import { EmptyState } from '../components/EmptyState';
import { api, ApiError } from '../api/client';
import { Loan, SummaryData } from '../types';

interface DashboardScreenProps {
  onOpenAddLoan: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onOpenAddLoan }) => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'OVERDUE' | 'REPAID'>('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Repayment modal state
  const [repayTarget, setRepayTarget] = useState<Loan | null>(null);
  const [isRepaying, setIsRepaying] = useState(false);

  // Receipt preview modal state
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setErrorMessage(null);

    try {
      const [summaryRes, loansRes] = await Promise.all([
        api.getSummary(),
        api.getLoans(),
      ]);

      if (summaryRes.success) {
        setSummary(summaryRes.data);
      }
      if (loansRes.success) {
        setLoans(loansRes.data);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Unable to connect to MiniLedger backend server.');
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Execute loan repayment
  const handleConfirmRepay = async () => {
    if (!repayTarget) return;

    setIsRepaying(true);
    try {
      await api.repayLoan(repayTarget.id);
      setRepayTarget(null);
      // Reload both summary and loan list
      await loadData(true);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        alert(err.message);
      } else {
        alert('Failed to mark loan as repaid.');
      }
    } finally {
      setIsRepaying(false);
    }
  };

  // Filtered loans
  const displayedLoans = loans.filter((loan) => {
    if (filter === 'ALL') return true;
    if (filter === 'OVERDUE') return loan.status === 'OVERDUE';
    if (filter === 'PENDING') return loan.status === 'PENDING';
    if (filter === 'REPAID') return loan.status === 'REPAID';
    return true;
  });

  const overdueCount = loans.filter((l) => l.status === 'OVERDUE').length;

  return (
    <View style={styles.container}>
      <Header />

      {/* Network Error Banner */}
      {errorMessage && (
        <View style={styles.errorBanner}>
          <Ionicons name="cloud-offline-outline" size={18} color={colors.dangerLight} />
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadData()}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading && !isRefreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Syncing your MiniLedger data...</Text>
        </View>
      ) : (
        <FlatList
          data={displayedLoans}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadData(true)}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ListHeaderComponent={
            <>
              {/* Financial Summary Card */}
              <SummaryCard summary={summary} />

              {/* Filter Tabs */}
              <View style={styles.filtersSection}>
                <View style={styles.filterTabsRow}>
                  <TouchableOpacity
                    style={[styles.filterTab, filter === 'ALL' && styles.filterTabActive]}
                    onPress={() => setFilter('ALL')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        filter === 'ALL' && styles.filterTabTextActive,
                      ]}
                    >
                      All ({loans.length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterTab, filter === 'PENDING' && styles.filterTabActive]}
                    onPress={() => setFilter('PENDING')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        filter === 'PENDING' && styles.filterTabTextActive,
                      ]}
                    >
                      Pending ({loans.filter((l) => l.status === 'PENDING').length})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.filterTab,
                      filter === 'OVERDUE' && styles.filterTabActive,
                      overdueCount > 0 && styles.filterTabOverdueAlert,
                    ]}
                    onPress={() => setFilter('OVERDUE')}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={14}
                      color={overdueCount > 0 ? colors.dangerLight : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.filterTabText,
                        filter === 'OVERDUE' && styles.filterTabTextActive,
                        overdueCount > 0 && { color: colors.dangerLight, fontWeight: '700' },
                      ]}
                    >
                      Overdue ({overdueCount})
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.filterTab, filter === 'REPAID' && styles.filterTabActive]}
                    onPress={() => setFilter('REPAID')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        filter === 'REPAID' && styles.filterTabTextActive,
                      ]}
                    >
                      Repaid ({loans.filter((l) => l.status === 'REPAID').length})
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.listHeaderRow}>
                  <Text style={styles.listHeaderTitle}>
                    {filter === 'ALL'
                      ? 'Recent Loan Entries'
                      : filter === 'OVERDUE'
                      ? 'Overdue Loans (Action Required)'
                      : filter === 'PENDING'
                      ? 'Pending Repayments'
                      : 'Settled Repayments'}
                  </Text>
                  <Text style={styles.listHeaderCount}>
                    {displayedLoans.length} entr{displayedLoans.length === 1 ? 'y' : 'ies'}
                  </Text>
                </View>
              </View>
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.loanItemWrapper}>
              <LoanCard
                loan={item}
                onRepay={(target) => setRepayTarget(target)}
                onViewReceipt={(receiptUrl) => setSelectedReceipt(receiptUrl)}
              />
            </View>
          )}
          ListEmptyComponent={
            <EmptyState filter={filter} onAddLoan={onOpenAddLoan} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Floating Add Loan Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={onOpenAddLoan}
        activeOpacity={0.85}
        accessibilityLabel="Add New Loan"
      >
        <Ionicons name="add" size={28} color={colors.white} />
        <Text style={styles.fabText}>Add Loan</Text>
      </TouchableOpacity>

      {/* Confirmation Modal */}
      <RepayConfirmModal
        visible={!!repayTarget}
        loan={repayTarget}
        isLoading={isRepaying}
        onConfirm={handleConfirmRepay}
        onCancel={() => setRepayTarget(null)}
      />

      {/* Receipt Preview Modal */}
      <ReceiptModal
        visible={!!selectedReceipt}
        receiptUrl={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 12,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.dangerBorder,
    gap: 10,
  },
  errorBannerText: {
    flex: 1,
    color: colors.dangerLight,
    fontSize: 12,
    fontWeight: '600',
  },
  retryBtn: {
    backgroundColor: colors.dangerBorder,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  retryBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  filtersSection: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    gap: 4,
  },
  filterTabActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  filterTabOverdueAlert: {
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 6,
  },
  listHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.2,
  },
  listHeaderCount: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 90,
  },
  loanItemWrapper: {
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    gap: 6,
  },
  fabText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
