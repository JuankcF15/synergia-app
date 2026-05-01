import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserInfo } from '../api/user';
import { Box, CircularProgress } from '@mui/material';

export default function AdminProtectedRoute({ children }) {
  const [isAdmin, setIsAdmin] = useState(null);

  useEffect(() => {
    const checkAdmin = async () => {
      const user = await getUserInfo();
      setIsAdmin(user && user.is_superuser);
    };
    checkAdmin();
  }, []);

  if (isAdmin === null) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }
  if (!isAdmin) {
    return <Navigate to="/business/login" replace />;
  }
  return children;
}
