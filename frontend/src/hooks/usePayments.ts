import { useCallback, useState } from "react";
import { axiosClient } from "../lib/axiosClient";
import type { PaymentDTO } from "../types/pi";

type PaymentMetadata = {
  productId: string;
  orderId: string;
};

type UsePaymentsArgs = {
  isAuthenticated: boolean;
  onRequireAuth: () => void;
  onPaymentStatus?: (message: string) => void;
};

export const usePayments = ({ isAuthenticated, onRequireAuth, onPaymentStatus }: UsePaymentsArgs) => {
  const [isLoading, setIsLoading] = useState(false);

  const onReadyForServerApproval = useCallback(async (paymentId: string) => {
    try {
      await axiosClient.post("/payments/approve", { paymentId });
    } catch (err) {
      console.error("Error approving payment:", err);
    }
  }, []);

  const onReadyForServerCompletion = useCallback(async (paymentId: string, txid: string) => {
    try {
      await axiosClient.post("/payments/complete", { paymentId, txid });
      onPaymentStatus?.("Pi payment completed. Your order is now paid.");
    } catch (err) {
      console.error("Error completing payment:", err);
    }
  }, [onPaymentStatus]);

  const onCancel = useCallback(async (paymentId: string) => {
    try {
      await axiosClient.post("/payments/cancelled_payment", { paymentId });
      onPaymentStatus?.("Pi payment was cancelled.");
    } catch (err) {
      console.error("Error cancelling payment:", err);
    }
  }, [onPaymentStatus]);

  const onError = useCallback((error: Error, payment?: PaymentDTO) => {
    console.error("Payment error:", error, payment);
    onPaymentStatus?.("Pi payment failed. Please try again in Pi Browser.");
    setIsLoading(false);
  }, [onPaymentStatus]);

  const orderProduct = useCallback(
    async (memo: string, amount: number, metadata: PaymentMetadata) => {
      if (!isAuthenticated) {
        onRequireAuth();
        return;
      }

      if (!window.Pi) {
        onRequireAuth();
        return;
      }

      setIsLoading(true);
      try {
        await window.Pi.createPayment(
          { amount, memo, metadata },
          {
            onReadyForServerApproval,
            onReadyForServerCompletion,
            onCancel,
            onError,
          }
        );
      } catch (err) {
        console.error("Error creating payment:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, onRequireAuth, onReadyForServerApproval, onReadyForServerCompletion, onCancel, onError]
  );

  return {
    orderProduct,
    isLoading,
  };
};
