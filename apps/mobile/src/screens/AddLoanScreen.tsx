import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '../theme/colors';
import { api, ApiError } from '../api/client';
import { formatDate } from '../utils/format';

interface AddLoanScreenProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const AddLoanScreen: React.FC<AddLoanScreenProps> = ({ onClose, onSuccess }) => {
  const [friendName, setFriendName] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');

  // Default due date: 7 days from now
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  const [dueDate, setDueDate] = useState<Date>(defaultDate);

  // Receipt image attachment (bonus feature)
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick preset helper
  const setPresetDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setDueDate(d);
  };

  const pickReceiptImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        alert('Permission to access photos is needed to attach a receipt.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch {
      alert('Unable to select photo');
    }
  };

  const handleSubmit = async () => {
    setErrorMessage(null);

    // Validation
    if (!friendName.trim() || friendName.trim().length < 2) {
      setErrorMessage('Please enter a valid friend name (at least 2 characters)');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid positive loan amount in INR');
      return;
    }

    setIsLoading(true);
    try {
      const created = await api.createLoan({
        friendName: friendName.trim(),
        amount: numAmount,
        dueDate: dueDate.toISOString(),
        notes: notes.trim() || undefined,
      });

      // If receipt is attached, upload it
      if (receiptImage && created.data?.id) {
        try {
          await api.uploadReceipt(created.data.id, receiptImage);
        } catch {
          console.warn('Loan created, but receipt upload failed.');
        }
      }

      onSuccess();
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to create loan. Please check your connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Loan</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Friend Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>FRIEND'S NAME *</Text>
          <View style={styles.inputRow}>
            <Ionicons name="person-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={colors.textPlaceholder}
              value={friendName}
              onChangeText={(t) => {
                setFriendName(t);
                setErrorMessage(null);
              }}
              autoFocus
            />
          </View>
        </View>

        {/* Amount in INR */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>AMOUNT (₹ INR) *</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={[styles.input, styles.amountInput]}
              placeholder="0.00"
              placeholderTextColor={colors.textPlaceholder}
              keyboardType="decimal-pad"
              value={amount}
              onChangeText={(t) => {
                setAmount(t.replace(/[^0-9.]/g, ''));
                setErrorMessage(null);
              }}
            />
          </View>
        </View>

        {/* Due Date & Quick Presets */}
        <View style={styles.inputGroup}>
          <View style={styles.dueDateHeader}>
            <Text style={styles.inputLabel}>DUE DATE *</Text>
            <Text style={styles.selectedDateBadge}>{formatDate(dueDate.toISOString())}</Text>
          </View>

          <View style={styles.presetRow}>
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => setPresetDays(3)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetText}>In 3 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => setPresetDays(7)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetText}>In 1 Week</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => setPresetDays(14)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetText}>In 2 Weeks</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.presetBtn}
              onPress={() => setPresetDays(30)}
              activeOpacity={0.7}
            >
              <Text style={styles.presetText}>In 1 Month</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Optional Notes */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>NOTES / REASON (OPTIONAL)</Text>
          <View style={styles.inputRow}>
            <Ionicons name="document-text-outline" size={18} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Dinner bill split, trip advance"
              placeholderTextColor={colors.textPlaceholder}
              value={notes}
              onChangeText={setNotes}
              maxLength={200}
            />
          </View>
        </View>

        {/* Bonus: Receipt Photo Upload */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>RECEIPT ATTACHMENT (BONUS FEATURE)</Text>
          {receiptImage ? (
            <View style={styles.receiptPreviewContainer}>
              <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
              <TouchableOpacity
                style={styles.removeReceiptBtn}
                onPress={() => setReceiptImage(null)}
              >
                <Ionicons name="trash-outline" size={16} color={colors.white} />
                <Text style={styles.removeReceiptText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadBtn}
              onPress={pickReceiptImage}
              activeOpacity={0.7}
            >
              <Ionicons name="camera-outline" size={20} color={colors.primaryLight} />
              <Text style={styles.uploadBtnText}>Attach Photo / Bill Receipt</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Error message */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={16} color={colors.dangerLight} />
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="add-circle" size={20} color={colors.white} />
              <Text style={styles.submitBtnText}>Save Loan Entry</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.cardBorder,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.primaryLight,
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  amountInput: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primaryLight,
  },
  dueDateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedDateBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryLight,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  presetBtn: {
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.cardBorder,
  },
  presetText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.primaryLight,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  uploadBtnText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  receiptPreviewContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.cardBorder,
    position: 'relative',
  },
  receiptPreview: {
    width: '100%',
    height: 160,
    backgroundColor: colors.surface,
  },
  removeReceiptBtn: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 63, 94, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 4,
  },
  removeReceiptText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.dangerBg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    gap: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.dangerLight,
    fontWeight: '600',
    flex: 1,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
