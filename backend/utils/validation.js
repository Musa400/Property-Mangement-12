const mongoose = require('mongoose');

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates if a value is a valid number
 * @param {*} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateNumber = (value) => {
  return !isNaN(Number(value)) && Number(value) > 0;
};

/**
 * Validates if a value is a valid date
 * @param {*} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateDate = (value) => {
  const date = new Date(value);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validates if a value is a valid email
 * @param {string} email - The email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates if a value is a valid phone number
 * @param {string} phone - The phone number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validatePhone = (phone) => {
  const phoneRegex = /^\+?[\d\s-]{10,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validates if a value is a valid URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validates if a value is not empty
 * @param {*} value - The value to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateNotEmpty = (value) => {
  return value !== null && value !== undefined && value !== '';
};

/**
 * Validates if a value is within a specified range
 * @param {number} value - The value to validate
 * @param {number} min - The minimum value
 * @param {number} max - The maximum value
 * @returns {boolean} - True if valid, false otherwise
 */
const validateRange = (value, min, max) => {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
};

module.exports = {
  validateObjectId,
  validateNumber,
  validateDate,
  validateEmail,
  validatePhone,
  validateUrl,
  validateNotEmpty,
  validateRange
}; 