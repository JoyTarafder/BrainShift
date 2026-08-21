const API_URL = 'http://localhost:5000/api';

console.log('Testing Express backend login endpoint directly...');

const res = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'poked30693@hutdot.com',
    password: 'Student@123456'
  })
});

const data = await res.json();
console.log('Response Status:', res.status);
console.log('Response Data:', data);

if (data.success && data.user) {
  console.log('✅ Express Auth Login WORKS GREAT!');
} else {
  console.error('❌ Express Auth Login Failed');
}
