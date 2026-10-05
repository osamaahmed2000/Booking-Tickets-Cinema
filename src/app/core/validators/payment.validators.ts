import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Egyptian Mobile Number Validator.
 * Supports:
 * - Local 11-digit format starting with 010, 011, 012, or 015 (e.g. 01012345678)
 * - International formats: +2010..., +2011..., +2012..., +2015..., 002010..., 2010...
 * - Allows spaces, dashes, parentheses during entry, which are stripped before validation.
 */
export function egyptianMobileValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawVal = control.value;
    if (!rawVal || (typeof rawVal === 'string' && rawVal.trim() === '')) {
      return null; // Let Validators.required handle empty values
    }

    // Normalize: remove spaces, dashes, parentheses
    const cleaned = String(rawVal).replace(/[\s\-()]/g, '');

    // Pattern for local format: 01[0125] followed by 8 digits = 11 digits total
    const localRegex = /^01[0125]\d{8}$/;

    // Pattern for international format: (+20|0020|20) followed by 1[0125] and 8 digits
    const intlRegex = /^(\+20|0020|20)1[0125]\d{8}$/;

    if (localRegex.test(cleaned) || intlRegex.test(cleaned)) {
      return null;
    }

    return { invalidEgyptianMobile: true };
  };
}

/**
 * Helper to normalize Egyptian mobile number to local 01XXXXXXXXX or international +201XXXXXXXXX
 */
export function normalizeEgyptianMobile(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (/^01[0125]\d{8}$/.test(cleaned)) {
    return cleaned;
  }
  const match = /^(\+20|0020|20)(1[0125]\d{8})$/.exec(cleaned);
  if (match) {
    return `+20${match[2]}`;
  }
  return cleaned;
}

/**
 * Luhn Algorithm validator for payment card numbers.
 * Validates numeric characters and checksum across 13 to 19 digits.
 */
export function cardNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawVal = control.value;
    if (!rawVal || (typeof rawVal === 'string' && rawVal.trim() === '')) {
      return null;
    }

    const digitsOnly = String(rawVal).replace(/\s+/g, '');

    // Must be 13 to 19 numeric digits
    if (!/^\d{13,19}$/.test(digitsOnly)) {
      return { invalidCardNumber: true };
    }

    // Luhn Algorithm Check
    let sum = 0;
    let shouldDouble = false;
    for (let i = digitsOnly.length - 1; i >= 0; i--) {
      let digit = parseInt(digitsOnly.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }

    if (sum % 10 !== 0) {
      return { invalidCardNumber: true };
    }

    return null;
  };
}

/**
 * Cardholder Name Validator.
 * Allows letters, spaces, hyphens, and apostrophes (min 2, max 100 chars).
 */
export function cardHolderNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawVal = control.value;
    if (!rawVal || (typeof rawVal === 'string' && rawVal.trim() === '')) {
      return null;
    }

    const trimmed = String(rawVal).trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      return { invalidCardName: true };
    }

    // Allow alphabets in any language, spaces, dots, hyphens, apostrophes
    const nameRegex = /^[\p{L}\s.'\-]+$/u;
    if (!nameRegex.test(trimmed)) {
      return { invalidCardName: true };
    }

    return null;
  };
}

/**
 * Expiry Date Validator (MM/YY format).
 * Checks:
 * 1. Format MM/YY or MM / YY
 * 2. Month between 01 and 12
 * 3. Year is valid and not expired (compares against current month & year)
 */
export function expiryDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawVal = control.value;
    if (!rawVal || (typeof rawVal === 'string' && rawVal.trim() === '')) {
      return null;
    }

    const clean = String(rawVal).replace(/\s+/g, '');
    const match = /^(\d{2})\/?(\d{2})$/.exec(clean);

    if (!match) {
      return { invalidExpiry: true };
    }

    const month = parseInt(match[1], 10);
    let year = parseInt(match[2], 10);

    // Month must be 1 to 12
    if (month < 1 || month > 12) {
      return { invalidExpiryMonth: true };
    }

    // Convert 2-digit YY to 4-digit 20YY
    const fullYear = 2000 + year;

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-indexed

    // Check if card is expired
    if (fullYear < currentYear || (fullYear === currentYear && month < currentMonth)) {
      return { expiredCard: true };
    }

    // Reject cards with expiry more than 25 years into the future
    if (fullYear > currentYear + 25) {
      return { invalidExpiry: true };
    }

    return null;
  };
}

/**
 * CVV / CVC Validator (3 or 4 digits).
 */
export function cvvValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const rawVal = control.value;
    if (!rawVal || (typeof rawVal === 'string' && rawVal.trim() === '')) {
      return null;
    }

    const clean = String(rawVal).trim();
    if (!/^\d{3,4}$/.test(clean)) {
      return { invalidCvv: true };
    }

    return null;
  };
}
