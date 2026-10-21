export const logger = {
  info: (msg: string, ...args: unknown[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  warn: (msg: string, ...args: unknown[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  error: (msg: string, ...args: unknown[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  otp: (phoneNumber: string, otp: string) => {
    console.log('\n' + '='.repeat(60));
    console.log(`🔑 [MINILEDGER MOCK OTP VERIFICATION]`);
    console.log(`📱 Phone Number : ${phoneNumber}`);
    console.log(`🔢 One-Time Code: ${otp}`);
    console.log(`⏳ Valid For    : 10 minutes`);
    console.log('='.repeat(60) + '\n');
  },
};
