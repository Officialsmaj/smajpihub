import { useCallback, useState } from "react";
import { axiosClient } from "../lib/axiosClient";
import type { PaymentDTO } from "../types/pi";

type PaymentCallbacks = {
  onReady?: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
};

const onIncompletePaymentFound = (_payment: PaymentDTO) => {
  console.info("Pi incomplete payment found before checkout.");
};

export const usePiPayment = () => {
  const [isPaying, setIsPaying] = useState(false);

  const payOrder = useCallback(async (orderId: string, amount: number, callbacks?: PaymentCallbacks) => {
    if (!window.Pi) {
      throw new Error("Open SMAJ PI HUB in Pi Browser to pay with Pi.");
    }

    setIsPaying(true);
    try {
      await window.Pi.authenticate(["payments"], onIncompletePaymentFound);
      await window.Pi.createPayment(
        {
          amount,
          memo: `SMAJ Store order ${orderId}`,
          metadata: { orderId },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            await axiosClient.post("/payments/approve", { orderId, paymentId });
            callbacks?.onReady?.();
          },
          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            await axiosClient.post("/payments/complete", { orderId, paymentId, txid });
            callbacks?.onComplete?.();
          },
          onCancel: () => {
            callbacks?.onCancel?.();
          },
          onError: (error: Error) => {
            callbacks?.onError?.(error.message || "Payment failed.");
          },
        }
      );
    } finally {
      setIsPaying(false);
    }
  }, []);

  return { isPaying, payOrder };
};
