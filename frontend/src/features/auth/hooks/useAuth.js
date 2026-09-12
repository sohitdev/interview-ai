import { useContext } from "react";
import { AuthContext } from "../auth.context.jsx";
import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
} from "../services/auth.api";

export const useAuth = () => {
  const { user, setUser, loading, setLoading } = useContext(AuthContext);

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await loginUser({ email, password });
      setUser(data.user);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await registerUser({ username, email, password });
      setUser(data.user);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (error) {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    setLoading(true);
    try {
      const data = await getCurrentUser();
      setUser(data.user);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    handleLogin,
    handleRegister,
    handleLogout,
    fetchCurrentUser,
  };
};
