import { API_ENDPOINT } from "@/data/constants";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

interface AuthContextType {
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string) => Promise<{ ok: boolean }>;
  validateToken: (token: string) => Promise<{ ok: boolean }>;
  logout: () => void;
  navigate: NavigateFunction;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{
  children: React.ReactNode;
  isLogin?: boolean;
}> = ({ children, isLogin }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = useState<{
    token: string;
    validTo: number;
    role: string;
  } | null>(null);
  const [refreshToken, setRefreshToken] = useState<{
    token: string;
    validTo: number;
  } | null>(null);

  useEffect(() => {
    if (isLogin) {
      return;
    }
    const _accessToken = localStorage.getItem("accessToken");
    const _refreshToken = localStorage.getItem("refreshToken");
    console.log("Stored tokens", _accessToken, _refreshToken);
    try {
      if (!_accessToken || !_refreshToken) {
        navigate("/login");
        return;
      }
      setAccessToken(JSON.parse(_accessToken));
      setRefreshToken(JSON.parse(_refreshToken));
    } catch (e) {
      console.log("Error setting tokens", e);
    }
  }, [isLogin, navigate]);

  const callRefreshToken = useCallback(async () => {
    console.log("Refreshing access token");

    if (!refreshToken) {
      return;
    }

    const url = `${API_ENDPOINT}/auth/refresh`;
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Refresh-Token": refreshToken.token,
      },
    });

    if (result.ok) {
      const response = await result.json();
      if (response.accessToken && response.refreshToken) {
        localStorage.setItem(
          "accessToken",
          JSON.stringify(response.accessToken)
        );
        localStorage.setItem(
          "refreshToken",
          JSON.stringify(response.refreshToken)
        );
      }
    }
    return result.ok;
  }, [refreshToken]);

  useEffect(() => {
    if (accessToken && !isAuthenticated) {
      validateToken(accessToken.token).then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
          setLoading(false);
        } else {
          setIsAuthenticated(false);

          if (refreshToken) {
            callRefreshToken().then((ok) => {
              if (ok) {
                setIsAuthenticated(true);
                setLoading(false);
              } else {
                setIsAuthenticated(false);
              }
            });
          }
        }
      });
    }
  }, [accessToken, callRefreshToken, isAuthenticated, refreshToken]);

  const login = async (email: string) => {
    const url = `${API_ENDPOINT}/auth/login`;
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        redirectTo: window.location.origin + "/login/",
      }),
    });
    return { ok: result.ok };
  };

  const logout = () => {
    const url = `${API_ENDPOINT}/auth/logout`;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setAccessToken(null);
    setRefreshToken(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const validateToken = async (token: string) => {
    console.log("Validating token", token);
    const url = `${API_ENDPOINT}/auth/magic`;
    const result = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
      }),
    });

    if (result.ok) {
      const response = await result.json();
      if (response.accessToken && response.refreshToken) {
        localStorage.setItem(
          "accessToken",
          JSON.stringify(response.accessToken)
        );
        localStorage.setItem(
          "refreshToken",
          JSON.stringify(response.refreshToken)
        );

        console.log("Token validated", response);

        setIsAuthenticated(true);
        setLoading(false);

        return { ok: true };
      } else {
        console.log("Failed to validate token", response);
        return { ok: false };
      }
    }

    return { ok: false };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        navigate,
        validateToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return isAuthenticated ? <>{children}</> : null;
};
