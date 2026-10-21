import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface EmptyStateProps {
  filter: string;
  onAddLoan: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ filter, onAddLoan }) => {
  let title = 'No loan entries yet';
  let desc = 'Start tracking money lent to friends, due dates, and repayments in one place.';

  if (filter === 'OVERDUE') {
    title = 'All clear! No overdue loans';
    desc = 'None of your friends are currently past their scheduled payment due date.';
  } else if (filter === 'PENDING') {
    title = 'No pending loans';
    desc = 'All outstanding balances have been settled.';
  } else if (filter === 'REPAID') {
    title = 'No settled loans yet';
    desc = 'Loans marked as repaid will appear here.';
  }

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons
          name={filter === 'OVERDUE' ? 'shield-checkmark-outline' : 'wallet-outline'}
          size={42}
          color={filter === 'OVERDUE' ? colors.success : colors.primary}
        />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.desc}>{desc}</Text>

      {filter !== 'OVERDUE' && filter !== 'REPAID' && (
        <TouchableOpacity style={styles.addBtn} onPress={onAddLoan} activeOpacity={0.8}>
          <Ionicons name="add" size={18} color={colors.white} />
          <Text style={styles.addBtnText}>Add Your First Loan</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    maxWidth: 280,
    marginBottom: 20,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  addBtnText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '700',
  },
});
