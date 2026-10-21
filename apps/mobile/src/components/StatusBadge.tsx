import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { LoanStatus } from '../types';

interface StatusBadgeProps {
  status: LoanStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  let badgeBg = colors.warningBg;
  let borderColor = colors.warningBorder;
  let textColor = colors.warningLight;
  let iconName: keyof typeof Ionicons.glyphMap = 'time-outline';
  let label = 'Pending';

  if (status === 'OVERDUE') {
    badgeBg = colors.dangerBg;
    borderColor = colors.dangerBorder;
    textColor = colors.dangerLight;
    iconName = 'alert-circle-outline';
    label = 'Overdue';
  } else if (status === 'REPAID') {
    badgeBg = colors.successBg;
    borderColor = colors.successBorder;
    textColor = colors.successLight;
    iconName = 'checkmark-circle-outline';
    label = 'Repaid';
  }

  return (
    <View style={[styles.badge, { backgroundColor: badgeBg, borderColor }]}>
      <Ionicons name={iconName} size={13} color={textColor} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
