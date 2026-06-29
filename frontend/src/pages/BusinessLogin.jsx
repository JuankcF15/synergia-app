import { Box, Paper, Typography, TextField, Button, Link, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import api from '../api';
import { getUserInfo } from '../api/user';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

export default function EmpresaLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await api.post('api/token/', {
        username: email,
        password,
      });

      const { access, refresh } = response.data;

      localStorage.setItem(ACCESS_TOKEN, access);
      localStorage.setItem(REFRESH_TOKEN, refresh);

      // Obtener info del usuario para saber si es superuser
      const userInfo = await getUserInfo();
      if (userInfo && userInfo.is_superuser) {
        navigate('/admin/dashboard');
      } else {
        navigate('/business/dashboard');
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError('Credenciales inválidas. Inténtalo de nuevo.');
      } else {
        setError('Ocurrió un error. Por favor, inténtalo más tarde.');
      }
    }
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
      {/* Botón Volver al Inicio */}     
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
        <Avatar
          sx={{
            m: '0 auto',
            bgcolor: 'primary.main',
            mb: 2,
          }}
        >
          <LockOutlinedIcon />
        </Avatar>

        <Typography variant="h5" gutterBottom fontWeight="bold">
          Iniciar sesión
        </Typography>

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}

        <Box component="form" noValidate onSubmit={handleLogin}>
          <TextField
            margin="normal"
            fullWidth
            label="Correo electrónico"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            fullWidth
            label="Contraseña"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Iniciar sesión
          </Button>

          <Box display="flex" justifyContent="space-between" mt={1}>
            <Link onClick={() => navigate('/business/forgot-password')} variant="body2">
              ¿Olvidaste tu contraseña?
            </Link>
            <Link onClick={() => navigate('/business/register')} variant="body2">
              Registrarse
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
