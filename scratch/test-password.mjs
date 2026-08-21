import bcrypt from 'bcryptjs';

const hash = '$2b$10$dUQt.h3gsc4S1rPBb2qofutyOhhyJBWNnZ.XV0v4JmDXmLUekAEfm';
const common = ['123456', 'password', 'jitu123', 'Jitu123', 'student123', '12345678', 'Admin@TutorNova2026'];

for (const p of common) {
  const match = await bcrypt.compare(p, hash);
  if (match) {
    console.log(`✅ MATCH FOUND! Password is: "${p}"`);
    process.exit(0);
  }
}
console.log('❌ No match found in common password list.');
