/**
 * Custom API Error class for handling API errors
 */
class ApiError extends Error {
  /**
   * Create a new API Error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a bad request error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError}
   */
  static badRequest(message, details = {}) {
    return new ApiError(message, 400, details);
  }

  /**
   * Create an unauthorized error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError}
   */
  static unauthorized(message, details = {}) {
    return new ApiError(message, 401, details);
  }

  /**
   * Create a forbidden error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError}
   */
  static forbidden(message, details = {}) {
    return new ApiError(message, 403, details);
  }

  /**
   * Create a not found error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError}
   */
  static notFound(message, details = {}) {
    return new ApiError(message, 404, details);
  }

  /**
   * Create a conflict error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError}
   */
  static conflict(message, details = {}) {
    return new ApiError(message, 409, details);
  }

  /**
   * Create a validation error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError}
   */
  static validationError(message, details = {}) {
    return new ApiError(message, 422, details);
  }

  /**
   * Create an internal server error
   * @param {string} message - Error message
   * @param {Object} details - Additional error details
   * @returns {ApiError}
   */
  static internal(message, details = {}) {
    return new ApiError(message, 500, details);
  }

  /**
   * Convert error to JSON format
   * @returns {Object} JSON representation of the error
   */
  toJSON() {
    return {
      status: this.status,
      message: this.message,
      details: this.details,
      stack: this.stack
    };
  }
}

module.exports = ApiError; 