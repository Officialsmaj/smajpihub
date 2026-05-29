import type { ButtonHTMLAttributes, ReactNode } from "react";
import { useAuthContext } from "../contexts/AuthContext";

type LoginWithPiButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> & {
  loadingContent?: ReactNode;
};

const LoginWithPiButton = ({ children, disabled, loadingContent, ...props }: LoginWithPiButtonProps) => {
  const { loginWithPi, isLoading } = useAuthContext();

  return (
    <button type="button" {...props} onClick={loginWithPi} disabled={disabled || isLoading}>
      {isLoading && loadingContent ? loadingContent : children}
    </button>
  );
};

export default LoginWithPiButton;
