import React, { useState } from 'react';
import { Box, Paper, Typography, TextField, Button, Snackbar, Alert } from '@mui/material';
import { motion } from 'framer-motion';
import api from '../api'; // Suponiendo que tienes un archivo de configuración para tus peticiones API
import { useNavigate } from 'react-router-dom'; // Para redirigir después de la validación
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; // Asegúrate de tener este ícono instalado

export default function EmpleadoCodigo() {
  const [accessCode, setAccessCode] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });

  const navigate = useNavigate(); // Hook para redirigir a otra página

  // Función para manejar el cambio del campo de código
  const handleChange = (e) => {
    setAccessCode(e.target.value);
  };

  // Función para manejar la validación del código
  const handleValidateCode = async () => {
    if (!accessCode) {
      setSnackbar({ open: true, message: 'Por favor, ingresa un código.', severity: 'error' });
      return;
    }

    try {
      const response = await api.post('api/survey/code/validate/', { code: accessCode });
      
      if (response.data.is_valid) {
        // Si el código es válido, redirigir o hacer algo
        navigate('/survey/ongoing', { state: { code: accessCode } });
      } else {
        // Verifica el mensaje que viene de la respuesta
        if (response.data.message === 'El código ya ha sido utilizado.') {
          setSnackbar({ open: true, message: 'Este código ya ha sido utilizado.', severity: 'warning' });
        } else {
          setSnackbar({ open: true, message: 'Código no válido.', severity: 'error' });
        }
      }
    } catch (error) {
      console.error('Error al validar código:', error);
      setSnackbar({ open: true, message: 'Error al validar el código.', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: '' });
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #5865F2, #9B4DFF)',
        px: 2,
        position: 'relative',
      }}
    >
      <Button
        variant="contained"
        onClick={() => navigate('/')}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,          backgroundColor: 'white',
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
        Volver al inicio
      </Button>

      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: 420,
          borderRadius: 3,
          textAlign: 'center',
          backgroundColor: '#fff',
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Ingresar código
        </Typography>

        <Typography variant="body2" mb={2}>
          Digita el código que te proporcionó tu empresa para comenzar la encuesta.
        </Typography>

        <TextField
          label="Código de acceso"
          fullWidth
          margin="normal"
          value={accessCode}
          onChange={handleChange}
        />

        <Button
          fullWidth
          variant="contained"
          sx={{ mt: 2 }}
          onClick={handleValidateCode}
        >
          Comenzar encuesta
        </Button>
      </Paper>

      {/* Snackbar para mostrar errores o mensajes */}
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
