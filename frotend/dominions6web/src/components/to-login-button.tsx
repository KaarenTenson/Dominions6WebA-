import { useNavigate } from "react-router-dom";

export const ToLoginButton = () => {
  const navigate = useNavigate();

  const goToLogin = () => {
    navigate("/login");
  };

  return (
    <div>
      {/* Navigate button */}
      <button onClick={goToLogin}>
        Go to Login
      </button>
    </div>
  );
};