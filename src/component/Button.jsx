import { Button as AntButton } from "antd";

const Button = ({
  children,
  type = "default",
  onClick,
  className = "",
  ariaLabel,
  disabled = false,
  loading = false,
  ...props
}) => {
  return (
    <AntButton
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
      loading={loading}
      className={className}
      {...props}
    >
      {children}
    </AntButton>
  );
};

export default Button;
