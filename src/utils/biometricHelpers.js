/**
 * Check if browser supports WebAuthn biometrics
 */
export function isWebAuthnSupported() {
  if (typeof window === 'undefined') return false
  return !!window.PublicKeyCredential && !!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable?.()
}

/**
 * Generate random challenge for WebAuthn
 */
export function generateBiometricChallenge() {
  return crypto.getRandomValues(new Uint8Array(32))
}

/**
 * Hash verification data for API transmission (native crypto)
 */
export async function hashVerificationData(data) {
  const msg = JSON.stringify(data, Object.keys(data).sort())
  const msgBuffer = new TextEncoder().encode(msg)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return btoa(String.fromCharCode(...hashArray))
}

/**
 * Get icon for biometric method
 */
export function getBiometricMethodIcon(method) {
  const icons = {
    fingerprint: '👆',
    eye: '👁️',
    manual: '⌚'
  }
  return icons[method] || '❓'
}

/**
 * Format confidence score
 */
export function formatConfidence(score) {
  return score != null ? `${Math.round(score * 100)}%` : '—'
}
