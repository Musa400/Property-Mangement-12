/**
 * Wraps an async function to catch errors and pass them to the error handling middleware
 * @param {Function} fn - The async function to wrap
 * @returns {Function} Express middleware function
 */
const catchAsync = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Wraps multiple async route handlers to catch and forward errors
 * @param {...Function} handlers - Async route handler functions
 * @returns {Array} Array of wrapped route handlers
 */
const catchAsyncMultiple = (...handlers) => {
  return handlers.map(handler => catchAsync(handler));
};

/**
 * Wraps an async route handler with custom error handling
 * @param {Function} fn - The async route handler function
 * @param {Function} errorHandler - Custom error handling function
 * @returns {Function} Wrapped route handler
 */
const catchAsyncWithCustomHandler = (fn, errorHandler) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next))
      .catch(error => {
        if (errorHandler) {
          return errorHandler(error, req, res, next);
        }
        next(error);
      });
  };
};

/**
 * Wraps an async route handler with retry logic
 * @param {Function} fn - The async route handler function
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} delay - Delay between retries in milliseconds
 * @returns {Function} Wrapped route handler
 */
const catchAsyncWithRetry = (fn, maxRetries = 3, delay = 1000) => {
  return async (req, res, next) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await Promise.resolve(fn(req, res, next));
      } catch (error) {
        lastError = error;
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }
    
    next(lastError);
  };
};

// Export catchAsync as the default export
module.exports = catchAsync;

// Export other functions as named exports
module.exports.catchAsyncMultiple = catchAsyncMultiple;
module.exports.catchAsyncWithCustomHandler = catchAsyncWithCustomHandler;
module.exports.catchAsyncWithRetry = catchAsyncWithRetry; 