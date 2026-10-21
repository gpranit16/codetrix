import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { Loan } from '../types';
import { StatusBadge } from './StatusBadge';
import { formatCurrency, formatDate } from '../utils/format';

interface LoanCardProps {
  loan: Loan;
  onRepay: (loan: Loan) => void;
  onViewReceipt?: (receiptUrl: string) => void;
  onOpenDetails?: (loan: Loan) => void;
}

export const LoanCard: React.FC<LoanCardProps> = ({
  loan,
  onRepay,
  onViewReceipt,
  onOpenDetails,
}) => {
  const isOverdue = loan.status === 'OVERDUE';
  const isRepaid = loan.status === 'REPAID';

  // Get initials for avatar
  const initials = loan.friendName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isOverdue && styles.cardOverdue,
        isRepaid && styles.cardRepaid,
      ]}
      activeOpacity={0.85}
      onPress={() => onOpenDetails && onOpenDetails(loan)}
    >
      {/* Top Header: Friend Info & Status */}
      <View style={styles.topRow}>
        <View style={styles.friendRow}>
          <View
            style={[
              styles.avatar,
              isOverdue && styles.avatarOverdue,
              isRepaid && styles.avatarRepaid,
            ]}
          >
            <Text
              style={[
                styles.avatarText,
                isOverdue && { color: colors.dangerLight },
                isRepaid && { color: colors.successLight },
              ]}
            >
              {initials}
            </Text>
          </View>
          <View style={styles.nameBlock}>
            <Text style={styles.friendName} numberOfLines={1}>
              {loan.friendName}
            </Text>
            {loan.notes ? (
              <Text style={styles.notesText} numberOfLines={1}>
                {loan.notes}
              </Text>
            ) : null}
          </View>
        </View>

        <StatusBadge status={loan.status} />
      </View>

      {/* Overdue Warning Callout Banner */}
      {isOverdue && (
        <View style={styles.overdueCallout}>
          <Ionicons name="time" size={14} color={colors.dangerLight} />
          <Text style={styles.overdueCalloutText}>
            Payment delayed by {loan.daysOverdue} day{loan.daysOverdue === 1 ? '' : 's'}
          </Text>
        </View>
      )}

      {/* Middle: Amount & Dates */}
      <View style={styles.middleRow}>
        <View>
          <Text style={styles.amountLabel}>LENT AMOUNT</Text>
          <Text
            style={[
              styles.amountText,
              isOverdue && styles.amountOverdue,
              isRepaid && styles.amountRepaid,
            ]}
          >
            {formatCurrency(loan.amount)}
          </Text>
        </View>

        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>{isRepaid ? 'SETTLED ON' : 'DUE DATE'}</Text>
          <View style={styles.dateValueRow}>
            <Ionicons
              name={isRepaid ? 'checkmark-circle' : 'calendar-outline'}
              size={14}
              color={isRepaid ? colors.success : isOverdue ? colors.danger : colors.textSecondary}
            />
            <Text
              style={[
                styles.dateValueText,
                isOverdue && { color: colors.dangerLight, fontWeight: '700' },
              ]}
            >
              {isRepaid && loan.repaidAt ? formatDate(loan.repaidAt) : formatDate(loan.dueDate)}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Footer: Actions and Receipt */}
      <View style={styles.footerRow}>
        {loan.receiptUrl ? (
          <TouchableOpacity
            style={styles.receiptBadge}
            onPress={() => onViewReceipt && onViewReceipt(loan.receiptUrl!)}
            activeOpacity={0.7}
          >
            <Ionicons name="receipt-outline" size={14} color={colors.primaryLight} />
            <Text style={styles.receiptText}>Receipt Attached</Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}

        {!isRepaid && (
          <TouchableOpacity
            style={[styles.repayButton, isOverdue && styles.repayButtonOverdue]}
            onPress={() => onRepay(loan)}
            activeOpacity={0.8}
          >
            <Ionicons name="checkmark-done" size={16} color={colors.white} />
            <Text style={styles.repayButtonText}>Mark as Repaid</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  cardOverdue: {
    borderColor: colors.dangerBorder,
    backgroundColor: '#16101D',
  },
  cardRepaid: {
    opacity: 0.9,
    backgroundColor: colors.surface,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  avatarOverdue: {
    backgroundColor: colors.dangerBg,
    borderColor: colors.dangerBorder,
  },
  avatarRepaid: {
    backgroundColor: colors.successBg,
    borderColor: colors.successBorder,
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  nameBlock: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  notesText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  overdueCallout: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  overdueCalloutText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.dangerLight,
  },
  middleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 4,
  },
  amountLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  amountText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  amountOverdue: {
    color: colors.dangerLight,
  },
  amountRepaid: {
    color: colors.successLight,
  },
  dateBlock: {
    alignItems: 'flex-end',
  },
  dateLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateValueText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.divider,
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  receiptText: {
    fontSize: 11,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  repayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  repayButtonOverdue: {
    backgroundColor: '#BE123C',
  },
  repayButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
});
