import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Reusable hook for handling async API calls with loading states and toasts.
 * 
 * @param {Object} options
 * @param {string} [options.successMessage] - Default success message if none returned by API
 * @param {string} [options.errorMessage] - Default error message if API fails
 * @param {boolean} [options.showSuccessToast=true] - Whether to show success toast
 * @param {boolean} [options.showErrorToast=true] - Whether to show error toast
 */
export function useAsyncAction(options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (asyncFn, customSuccessMsg) => {
    setLoading(true);
    setError(null);
    try {
      const result = await asyncFn();
      
      if (options.showSuccessToast !== false) {
        const msg = customSuccessMsg || result?.message || options.successMessage;
        if (msg) toast.success(msg);
      }
      
      return { success: true, data: result };
    } catch (err) {
      setError(err);
      if (options.showErrorToast !== false) {
        const msg = err.response?.data?.message || err.message || options.errorMessage || 'An error occurred';
        toast.error(msg);
      }
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [options.successMessage, options.errorMessage, options.showSuccessToast, options.showErrorToast]);

  return { execute, loading, error };
}
