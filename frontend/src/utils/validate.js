export function validateGroupName(name) {
  if (!name || name.trim().length < 3) return 'Group name must be at least 3 characters'
  if (/[^a-zA-Z0-9\s\-_áéíóúüñÁÉÍÓÚÜÑ]/.test(name)) return 'Group name contains invalid characters'
  return null
}

export function validateMemberName(name) {
  if (!name || name.trim().length < 2) return 'Name must be at least 2 characters'
  if (/\d/.test(name)) return 'Name must not contain numbers'
  return null
}

export function validateEmail(email) {
  if (!email) return null
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format'
  return null
}

export function validatePassword(password) {
  if (!password || password.length < 6) return 'Password must be at least 6 characters'
  if (!/\d/.test(password)) return 'Password must contain at least one number'
  return null
}

export function validateAmount(amount) {
  if (!amount && amount !== 0) return 'Amount is required'
  if (Number(amount) < 0) return 'Amount must be a positive number'
  if (Number(amount) === 0) return 'Amount must be greater than zero'
  if (!/^\d+(\.\d{1,2})?$/.test(String(amount))) return 'Amount must have at most 2 decimal places'
  return null
}