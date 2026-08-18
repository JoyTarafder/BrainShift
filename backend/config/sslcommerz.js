export const SSLCOMMERZ_CONFIG = {
  store_id: process.env.SSLCOMMERZ_STORE_ID || 'tutornova_test',
  store_passwd: process.env.SSLCOMMERZ_STORE_PASS || 'tutornova_test@ssl',
  is_live: process.env.SSLCOMMERZ_IS_LIVE === 'true',
  init_url: process.env.SSLCOMMERZ_IS_LIVE === 'true'
    ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
    : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
  validation_url: process.env.SSLCOMMERZ_IS_LIVE === 'true'
    ? 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php'
    : 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php',
};
