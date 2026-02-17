import axios from 'axios';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate, Outlet } from 'react-router-dom';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const ProtectedRoute = ({ allowedRole, redirectTo = "/login" }) => {
  // Store user after login
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 1. Start loading immediatel

  useEffect(() => {
    const controller = new AbortController()
    const token = localStorage.getItem('sparvi_token');

    const authenticateMe = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.user);
      } catch (err) {
        // setError(err.message);
        toast.error(err.message)
        localStorage.removeItem('sparvi_token');
      } finally {
        setIsLoading(false);
      }
    }

    authenticateMe()

    return () => controller.abort()
  }, [])


  const token = localStorage.getItem('sparvi_token');

  if (!token) {
    return <Navigate to={redirectTo} replace />;
  }

  if (isLoading) return <div>Loading...</div>;

  const allowedRoles = Array.isArray(allowedRole)
    ? allowedRole
    : allowedRole
      ? [allowedRole]
      : null;

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
