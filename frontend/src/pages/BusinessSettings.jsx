import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BusinessContext } from '../context/BusinessContext';
import api from '../api';
import Loader from '../components/Loader';

export default function BusinessSettings() {
  const { businessData, loading } = useContext(BusinessContext);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const handleNav = () => {
      setShowLoader(true);
      setTimeout(() => setShowLoader(false), 1000);
    };
    window.addEventListener('dashboard-nav', handleNav);
    return () => window.removeEventListener('dashboard-nav', handleNav);
  }, []);

  const handleChangePassword = async () => {
    // Validaciones básicas
    if (!currentPassword || !newPassword || !confirmPassword) {
      setSnackbar({ 
        open: true, 
        message: 'Por favor, complete todos los campos.', 
        severity: 'error' 
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      setSnackbar({ 
        open: true, 
        message: 'La nueva contraseña no coincide con la confirmación.', 
        severity: 'error' 
      });
      return;
    }

    if (newPassword.length < 8) {
      setSnackbar({ 
        open: true, 
        message: 'La nueva contraseña debe tener al menos 8 caracteres.', 
        severity: 'error' 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await api.post('api/change-password/', {
        old_password: currentPassword,
        new_password: newPassword,
        new_password2: confirmPassword
      });

      setSnackbar({ 
        open: true, 
        message: 'Contraseña actualizada correctamente.', 
        severity: 'success' 
      });

      // Limpiar campos
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const errorMessage = error.response?.data?.old_password || 
                          error.response?.data?.new_password ||
                          error.response?.data?.new_password2 ||
                          error.response?.data?.message ||
                          'Error al actualizar la contraseña.';
      
      setSnackbar({ 
        open: true, 
        message: errorMessage, 
        severity: 'error' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading || showLoader) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, background: '#F4F6F8', overflowY: 'auto' }}>
          <Navbar businessImg={businessData?.img} />
          <Loader />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          width: { xs: `calc(100% - 60px)`, sm: `calc(100% - 80px)`, md: `calc(100% - 100px)` },
          background: '#F4F6F8',
          overflowY: 'auto',
          ml: 0
        }}
      >
        <Navbar businessImg={businessData?.img} />
        <Box sx={{ p: 3, pt: 10 }}>
          <Typography variant="h4" gutterBottom>
            Configuración de usuario
          </Typography>
          <Paper sx={{ p: 3, mb: 4, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
            <Typography variant="h6" gutterBottom>
              Cambio de Contraseña
            </Typography>
            <TextField
              fullWidth
              type="password"
              label="Contraseña Actual"
              variant="outlined"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              sx={{ mb: 3 }}
              disabled={isSubmitting}
            />
            <TextField
              fullWidth
              type="password"
              label="Nueva Contraseña"
              variant="outlined"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 3 }}
              disabled={isSubmitting}
              helperText="La contraseña debe tener al menos 8 caracteres"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirmar Nueva Contraseña"
              variant="outlined"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
              disabled={isSubmitting}
            />

            <Button
              variant="contained"
              sx={{
                background: '#4A90E2',
                color: '#fff',
                '&:hover': { background: '#357ABD' },
              }}
              onClick={handleChangePassword}
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isSubmitting ? 'Actualizando...' : 'Actualizar Contraseña'}
            </Button>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}