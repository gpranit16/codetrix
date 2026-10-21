import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api/client';

export const LoginScreen: React.FC = () => {
  const { sendOtp, verifyOtp } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<number>(0);

  // Cooldown countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const fullPhoneNumber = `${countryCode}${phoneNumber.trim()}`;

  const handleSendOtp = async () => {
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!phoneNumber.trim() || phoneNumber.trim().length < 8) {
      setErrorMessage('Please enter a valid phone number (at least 8 digits)');
      return;
    }

    setIsLoading(true);
    try {
      const res = await sendOtp(fullPhoneNumber);
      setSuccessMessage(res.message || 'OTP sent! Please check the server console log.');
      setCooldown(res.cooldownSeconds || 30);
      setStep('OTP');
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to send OTP. Ensure backend server is running.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setErrorMessage(null);

    if (!otp.trim() || otp.trim().length !== 6) {
      setErrorMessage('Please enter the complete 6-digit OTP code');
      return;
    }

    setIsLoading(true);
    try {
      await verifyOtp(fullPhoneNumber, otp.trim());
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to verify OTP. Please try again.');
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
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.brandIcon}>
            <Ionicons name="wallet" size={40} color={colors.primary} />
          </View>
          <Text style={styles.brandTitle}>MiniLedger</Text>
          <Text style={styles.brandSubtitle}>
            Track money lent to friends, due dates & repayments
          </Text>
        </View>

        {/* Card Form */}
        <View style={styles.formCard}>
          {step === 'PHONE' ? (
            <>
              <Text style={styles.cardHeader}>Welcome Back</Text>
              <Text style={styles.cardSubheader}>
                Enter your mobile number to sign in or register
              </Text>

              {/* Phone Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PHONE NUMBER</Text>
                <View style={styles.phoneInputRow}>
                  <View style={styles.countryCodeBadge}>
                    <Text style={styles.countryCodeText}>{countryCode}</Text>
                  </View>
                  <TextInput
                    style={styles.phoneInput}
                    placeholder="9876543210"
                    placeholderTextColor={colors.textPlaceholder}
                    keyboardType="phone-pad"
                    value={phoneNumber}
                    onChangeText={(val) => {
                      setPhoneNumber(val.replace(/[^\d]/g, ''));
                      setErrorMessage(null);
                    }}
                    maxLength={12}
                    autoFocus
                  />
                </View>
              </View>

              {/* Error Alert */}
              {errorMessage && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.dangerLight} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
                onPress={handleSendOtp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Send One-Time Password</Text>
                    <Ionicons name="arrow-forward" size={18} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>

              {/* Demo Hint */}
              <View style={styles.hintBox}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primaryLight} />
                <Text style={styles.hintText}>
                  Mock OTP: When you request an OTP, the 6-digit code will be printed in your backend terminal log.
                </Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.otpHeaderRow}>
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => {
                    setStep('PHONE');
                    setErrorMessage(null);
                    setOtp('');
                  }}
                >
                  <Ionicons name="arrow-back" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                <View>
                  <Text style={styles.cardHeader}>Verify OTP</Text>
                  <Text style={styles.cardSubheader}>
                    Code sent to <Text style={styles.boldText}>{fullPhoneNumber}</Text>
                  </Text>
                </View>
              </View>

              {/* Success notification */}
              {successMessage && (
                <View style={styles.successBox}>
                  <Ionicons name="checkmark-circle" size={16} color={colors.successLight} />
                  <Text style={styles.successText}>{successMessage}</Text>
                </View>
              )}

              {/* OTP Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>ENTER 6-DIGIT CODE</Text>
                <TextInput
                  style={styles.otpInput}
                  placeholder="• • • • • •"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="number-pad"
                  value={otp}
                  onChangeText={(val) => {
                    setOtp(val.replace(/[^\d]/g, '').slice(0, 6));
                    setErrorMessage(null);
                  }}
                  maxLength={6}
                  autoFocus
                />
              </View>

              {/* Error Alert */}
              {errorMessage && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={colors.dangerLight} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              )}

              {/* Verify Button */}
              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isLoading || otp.length !== 6) && styles.buttonDisabled,
                ]}
                onPress={handleVerifyOtp}
                disabled={isLoading || otp.length !== 6}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                    <Ionicons name="checkmark-done" size={18} color={colors.white} />
                  </>
                )}
              </TouchableOpacity>

              {/* Resend Cooldown */}
              <View style={styles.resendRow}>
                {cooldown > 0 ? (
                  <Text style={styles.cooldownText}>
                    Resend code in <Text style={styles.boldText}>{cooldown}s</Text>
                  </Text>
                ) : (
                  <TouchableOpacity
                    onPress={handleSendOtp}
                    disabled={isLoading}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.resendButtonText}>Resend One-Time Password</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandIcon: {
    width: 72,
    height: 72,
    borderRadius: 22,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 280,
  },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 6,
  },
  cardHeader: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubheader: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  boldText: {
    color: colors.textPrimary,
    fontWeight: '700',
  },
  otpHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    overflow: 'hidden',
  },
  countryCodeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: colors.surfaceLight,
    borderRightWidth: 1,
    borderRightColor: colors.inputBorder,
  },
  countryCodeText: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  otpInput: {
    backgroundColor: colors.inputBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: colors.primaryLight,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 6,
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
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.successBg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.successBorder,
    gap: 8,
  },
  successText: {
    fontSize: 12,
    color: colors.successLight,
    fontWeight: '600',
    flex: 1,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    gap: 8,
    marginTop: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 18,
  },
  cooldownText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  resendButtonText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 8,
  },
  hintText: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
});
