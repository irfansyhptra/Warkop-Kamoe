"use client";

import { useEffect, useCallback, useState } from "react";

// Extend Window interface for Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: MidtransResult) => void;
          onPending?: (result: MidtransResult) => void;
          onError?: (result: MidtransResult) => void;
          onClose?: () => void;
        }
      ) => void;
      hide: () => void;
    };
  }
}

export interface MidtransResult {
  status_code: string;
  status_message: string;
  transaction_id: string;
  order_id: string;
  gross_amount: string;
  payment_type: string;
  transaction_time: string;
  transaction_status: string;
  fraud_status?: string;
  finish_redirect_url?: string;
  pdf_url?: string;
  va_numbers?: Array<{
    bank: string;
    va_number: string;
  }>;
}

interface UseMidtransOptions {
  clientKey?: string;
  onSuccess?: (result: MidtransResult) => void;
  onPending?: (result: MidtransResult) => void;
  onError?: (result: MidtransResult) => void;
  onClose?: () => void;
}

export const useMidtrans = (options: UseMidtransOptions = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientKey =
    options.clientKey || process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;
  const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

  // Load Midtrans Snap.js script
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if script already loaded
    if (window.snap) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in DOM
    const existingScript = document.querySelector(
      'script[src*="snap.js"]'
    ) as HTMLScriptElement;
    if (existingScript) {
      existingScript.onload = () => setIsLoaded(true);
      return;
    }

    setIsLoading(true);

    // Create and load script
    const script = document.createElement("script");
    script.src = isProduction
      ? "https://app.midtrans.com/snap/snap.js"
      : "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute("data-client-key", clientKey || "");
    script.async = true;

    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      setError(null);
    };

    script.onerror = () => {
      setError("Failed to load Midtrans Snap.js");
      setIsLoading(false);
    };

    document.head.appendChild(script);

    // Cleanup
    return () => {
      // Don't remove script as it might be used by other components
    };
  }, [clientKey, isProduction]);

  // Pay function
  const pay = useCallback(
    (snapToken: string) => {
      return new Promise<MidtransResult>((resolve, reject) => {
        if (!window.snap) {
          reject(new Error("Midtrans Snap.js not loaded"));
          return;
        }

        if (!snapToken) {
          reject(new Error("Snap token is required"));
          return;
        }

        window.snap.pay(snapToken, {
          onSuccess: (result) => {
            options.onSuccess?.(result);
            resolve(result);
          },
          onPending: (result) => {
            options.onPending?.(result);
            resolve(result);
          },
          onError: (result) => {
            options.onError?.(result);
            reject(result);
          },
          onClose: () => {
            options.onClose?.();
            reject(new Error("Payment popup closed"));
          },
        });
      });
    },
    [options]
  );

  // Hide popup function
  const hide = useCallback(() => {
    if (window.snap) {
      window.snap.hide();
    }
  }, []);

  return {
    isLoaded,
    isLoading,
    error,
    pay,
    hide,
  };
};

export default useMidtrans;
