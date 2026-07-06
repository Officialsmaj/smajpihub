import { useCallback, useState } from "react";

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

  const orderProduct = useCallback(
    async (_memo: string, _amount: number, _metadata: PaymentMetadata) => {
      if (!isAuthenticated) {
        onRequireAuth();
        return;
      }

      setIsLoading(false);
      setActiveOrderId("");
      onPaymentStatus?.("Pi payments are temporarily disabled. Please contact support.");
      void onPaymentComplete?.();
      return;
    },
    [isAuthenticated, onPaymentComplete, onPaymentStatus, onRequireAuth]
  );

  return {
    orderProduct,
    isLoading,
    activeOrderId,
  };
};
