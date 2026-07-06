import { useCallback, useState } from "react";
import { axiosClient } from "../lib/axiosClient";
import type { PaymentDTO } from "../types/pi";

type PaymentMetadata = {
  productId: string;
  orderId: string;
  sandbox?: boolean;
};

type UsePaymentsArgs = {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onPaymentStatus?: (message: string) => void;
  onPaymentComplete?: () => void | Promise<void>;
};

export const usePayments = ({ isAuthenticated, onRequireAuth, onPaymentStatus, onPaymentComplete }: UsePaymentsArgs) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState("");
  const isSandbox = () =>
    window.__ENV?.sandbox === "true" ||
    window.location.hostname === "sandbox.minepi.com" ||
    document.referrer.includes("sandbox.minepi.com");

  const onReadyForServerApproval = useCallback(async (paymentId: string) => {
    try {
      await axiosClient.post("/payments/approve", { paymentId, sandbox: isSandbox() });
    } catch (err) {
      console.error("Error approving payment:", err);
    }
  }, []);

  const onReadyForServerCompletion = useCallback(async (paymentId: string, txid: string) => {
    try {
      await axiosClient.post("/payments/complete", { paymentId, txid, sandbox: isSandbox() });
      onPaymentStatus?.("Pi payment completed. Your order is now paid.");
      await onPaymentComplete?.();
    } catch (err) {
      console.error("Error completing payment:", err);
    } finally {
      setIsLoading(false);
      setActiveOrderId("");
    }
  }, [onPaymentComplete, onPaymentStatus]);

  const onCancel = useCallback(async (paymentId: string) => {
    try {
      await axiosClient.post("/payments/cancelled_payment", { paymentId, sandbox: isSandbox() });
      onPaymentStatus?.("Pi payment was cancelled. Your order remains pending.");
    } catch (err) {
      console.error("Error cancelling payment:", err);
    } finally {
      setIsLoading(false);
      setActiveOrderId("");
    }
  }, [onPaymentStatus]);

  const onError = useCallback(async (error: Error, payment?: PaymentDTO) => {
    console.error("Payment error:", error, payment);
    onPaymentStatus?.("Pi payment failed. Your order remains pending.");
    setIsLoading(false);
    setActiveOrderId("");
  }, [onPaymentStatus]);

  const orderProduct = useCallback(
    async (memo: string, amount: number, metadata: PaymentMetadata) => {
      if (!isAuthenticated) {
        onRequireAuth();
        return;
      }

      if (!window.Pi) {
        onPaymentStatus?.("Please open SMAJ PI HUB inside Pi Browser to use Pi payment.");
        return;
      }

      setIsLoading(true);
      setActiveOrderId(metadata.orderId);
      const paymentMetadata = { ...metadata, sandbox: isSandbox() };
      try {
        await window.Pi.createPayment(
          { amount, memo, metadata: paymentMetadata },
          {
            onReadyForServerApproval,
            onReadyForServerCompletion,
            onCancel,
            onError,
          }
        );
      } catch (err) {
        console.error("Error creating payment:", err);
        onPaymentStatus?.("Pi payment failed. Your order remains pending.");
        setIsLoading(false);
        setActiveOrderId("");
      }
    },
    [isAuthenticated, onRequireAuth, onPaymentStatus, onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError]
  );

  return {
    orderProduct,
    isLoading,
    activeOrderId,
  };
};
