import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../api';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('api/forgot-password/', { email });
      setSnackbar({ open: true, message: 'Si el correo existe, se ha enviado una nueva contraseña.', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: err.response?.data?.error || 'Error al enviar el correo.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ background: 'linear-gradient(135deg, #5865F2, #9B4DFF)', px: 2, position: 'relative' }}
    >
      <Button
        variant="contained"
        onClick={() => navigate('/business/login')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          backgroundColor: 'white',
          color: 'black',
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          '&:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          },
        }}
        startIcon={<ArrowBackIcon />}
      >
        Volver
      </Button>
      <Paper elevation={6} sx={{ p: { xs: 3, sm: 4 }, width: '100%', maxWidth: 420, borderRadius: 3, textAlign: 'center', backgroundColor: '#fff' }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Recuperar contraseña
        </Typography>
        <Typography variant="body2" mb={2}>
          Ingresa tu correo electrónico y te enviaremos una nueva contraseña temporal.
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            label="Correo electrónico"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 2 }}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Enviar nueva contraseña'}
          </Button>
        </Box>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
