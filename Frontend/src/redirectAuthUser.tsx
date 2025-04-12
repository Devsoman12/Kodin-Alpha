import { Navigate } from "react-router-dom";
import { useAuthStore } from "./context/AuthContext";
import { ReactNode, use } from "react";

interface RedirectAuthenticatedUserProps {
    children: ReactNode;
  }
  
  const RedirectAuthenticatedUser: React.FC<RedirectAuthenticatedUserProps> = ({ children }) => {
    const { isAuthenticated, user} = useAuthStore();
    if (user && isAuthenticated && !user.isverified) {
      return <Navigate to='/register2fa' replace />;
    }else{
      return <>{children}</>;
    }
  };
  
  export default RedirectAuthenticatedUser;
  