import React, { useState } from 'react';
import { Box, Paper, TextField, Typography, Button, Avatar, Link, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import LockIcon from '@mui/icons-material/Lock';

export default function BusinessRegister() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nit: '',
    phone_number: '',
    address: '',
    website: '',
    description: '',
  });
  const [error, setError] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validaciones
    if (!formData.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError('El correo electrónico no es válido.');
      return;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (!formData.name || !formData.nit) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      await api.post('api/register/', {
        email: formData.email,
        password: formData.password,
        business: {
          name: formData.name,
          nit: formData.nit,
          phone_number: formData.phone_number,
          address: formData.address,
          website: formData.website,
          description: formData.description,
        },
      });
      setSuccessOpen(true);
    } catch (err) {
      if (err.response?.data?.email) {
        setError('El correo electrónico ya está registrado.');
      } else if (err.response?.data?.business?.nit) {
        setError('El NIT ya está registrado.');
      } else {
        setError('Error al registrar el negocio. Verifica los datos e inténtalo de nuevo.');
      }
    }
  };

  const handleSuccessClose = () => {
    setSuccessOpen(false);
    navigate('/business/login');
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{
        background: 'linear-gradient(135deg, #5865F2, #9B4DFF)',
        px: { xs: 3, sm: 4, md: 3 },
        py: { xs: 3, sm: 6, md: 0 },
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: { xs: 3, sm: 4 },
          width: '100%',
          maxWidth: 1000,
          borderRadius: 3,
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
          <LockIcon />
        </Avatar>
        <Typography variant="h5" gutterBottom fontWeight="bold" textAlign="center">
          Registro de Empresa
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          {error && (
            <Typography
              color="error"
              variant="body2"
              sx={{
                mb: 2,
                textAlign: 'center',
              }}
            >
              {error}
            </Typography>
          )}

          <Box
            display="flex"
            flexDirection={{ xs: 'column', md: 'row' }}
            gap={4}
            mt={3}
          >
            {/* Columna 1 */}
            <Box flex={1} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Correo electrónico"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="ejemplo@empresa.com"
              />
              <TextField
                label="Contraseña"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Mínimo 6 caracteres"
              />
              <TextField
                label="Confirmar contraseña"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder="Repite la contraseña"
              />
            </Box>

            {/* Columna 2 */}
            <Box flex={1} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Nombre de la empresa"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Synergia Solutions S.A.S."
              />
              <TextField
                label="NIT"
                name="nit"
                value={formData.nit}
                onChange={handleChange}
                required
                placeholder="900123456-7"
              />
              <TextField
                label="Teléfono"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+57 3101234567"
              />
              <TextField
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Calle 45 #23-67, Bogotá"
              />
            </Box>

            {/* Columna 3 */}
            <Box flex={1} display="flex" flexDirection="column" gap={2}>
              <TextField
                label="Sitio Web"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://www.miempresa.com"
              />
              <TextField
                label="Descripción"
                name="description"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleChange}
                placeholder="Consultora especializada en clima laboral y desarrollo organizacional."
              />
            </Box>
          </Box>

          <Button
            type="submit"
            variant="contained"
            sx={{ mt: 4, width: '100%' }}
          >
            Registrarse
          </Button>

          <Typography
            variant="body2"
            sx={{ mt: 2, textAlign: 'center' }}
          >
            ¿Ya tienes una cuenta?{' '}
            <Link
              component="button"
              variant="body2"
              onClick={() => navigate('/business/login')}
              sx={{ textDecoration: 'underline', cursor: 'pointer' }}
            >
              Inicia sesión
            </Link>
          </Typography>
        </Box>
        {/* Modal de éxito */}
        <Dialog open={successOpen} onClose={handleSuccessClose} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold', color: '#4A90E2' }}>¡Registro exitoso!</DialogTitle>
          <DialogContent sx={{ textAlign: 'center', pb: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Tu empresa ha sido registrada correctamente.<br />Ya puedes iniciar sesión.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Button variant="contained" onClick={handleSuccessClose} sx={{ background: '#4A90E2', color: '#fff' }}>
              Ir a iniciar sesión
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
}