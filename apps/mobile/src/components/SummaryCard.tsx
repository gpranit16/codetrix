import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { SummaryData } from '../types';
import { formatCurrency } from '../utils/format';

interface SummaryCardProps {
  summary: SummaryData | null;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ summary }) => {
  const totalLent = summary?.totalLent ?? 0;
  const totalRepaid = summary?.totalRepaid ?? 0;
  const overdueAmount = summary?.overdueAmount ?? 0;
  const overdueCount = summary?.overdueCount ?? 0;
  const repaidCount = summary?.repaidCount ?? 0;
  const activeCount = summary?.activeCount ?? 0;

  return (
    <View style={styles.card}>
      {/* Primary Total Lent Hero */}
      <View style={styles.heroRow}>
        <View>
          <Text style={styles.heroLabel}>TOTAL LENT</Text>
          <Text style={styles.heroAmount}>{formatCurrency(totalLent)}</Text>
          <Text style={styles.heroSubtext}>
            {activeCount} active loan{activeCount === 1 ? '' : 's'} awaiting settlement
          </Text>
        </View>
        <View style={styles.heroIconBox}>
          <Ionicons name="trending-up" size={26} color={colors.primary} />
        </View>
      </View>

      <View style={styles.divider} />

      {/* Secondary Metrics: Repaid vs Overdue */}
      <View style={styles.statsRow}>
        {/* Total Repaid Box */}
        <View style={[styles.statBox, styles.statBoxRepaid]}>
          <View style={styles.statHeader}>
            <Ionicons name="checkmark-done" size={16} color={colors.success} />
            <Text style={styles.statLabelRepaid}>REPAID</Text>
          </View>
          <Text style={styles.statAmountRepaid}>{formatCurrency(totalRepaid)}</Text>
          <Text style={styles.statCount}>{repaidCount} settled</Text>
        </View>

        {/* Overdue Amount Box */}
        <View
          style={[
            styles.statBox,
            overdueAmount > 0 ? styles.statBoxOverdueAlert : styles.statBoxOverdueNeutral,
          ]}
        >
          <View style={styles.statHeader}>
            <Ionicons
              name={overdueAmount > 0 ? 'warning' : 'shield-checkmark-outline'}
              size={16}
              color={overdueAmount > 0 ? colors.danger : colors.textMuted}
            />
            <Text
              style={[
                styles.statLabelOverdue,
                overdueAmount > 0 ? { color: colors.dangerLight } : { color: colors.textMuted },
              ]}
            >
              OVERDUE
            </Text>
          </View>
          <Text
            style={[
              styles.statAmountOverdue,
              overdueAmount > 0 ? { color: colors.dangerLight } : { color: colors.textSecondary },
            ]}
          >
            {formatCurrency(overdueAmount)}
          </Text>
          <Text
            style={[
              styles.statCount,
              overdueAmount > 0 ? { color: colors.dangerLight } : { color: colors.textMuted },
            ]}
          >
            {overdueCount > 0 ? `${overdueCount} loan(s) delayed` : 'No overdue loans'}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    marginHorizontal: 16,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  heroAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  heroSubtext: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  heroIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  divider: {
    height: 1,
    backgroundColor: colors.divider,
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  statBoxRepaid: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  statBoxOverdueAlert: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    borderColor: colors.dangerBorder,
  },
  statBoxOverdueNeutral: {
    backgroundColor: colors.surface,
    borderColor: colors.cardBorder,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statLabelRepaid: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.successLight,
    letterSpacing: 1,
  },
  statLabelOverdue: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  statAmountRepaid: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.successLight,
  },
  statAmountOverdue: {
    fontSize: 18,
    fontWeight: '800',
  },
  statCount: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
});
