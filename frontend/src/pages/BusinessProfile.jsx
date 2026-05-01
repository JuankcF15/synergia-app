import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  Divider,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Fade,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { BusinessContext } from '../context/BusinessContext';
import Loader from '../components/Loader';

// Importar fuentes empresariales desde Google Fonts (solo para pruebas, ideal mover a index.html si te gusta)
const fontLink = document.createElement('link');
fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700&family=Montserrat:wght@700&display=swap';
fontLink.rel = 'stylesheet';
document.head.appendChild(fontLink);

export default function BusinessProfile() {
  const { businessData, updateBusinessData, loading } = useContext(BusinessContext);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const handleNav = () => {
      setShowLoader(true);
      setTimeout(() => setShowLoader(false), 1000);
    };
    window.addEventListener('dashboard-nav', handleNav);
    return () => window.removeEventListener('dashboard-nav', handleNav);
  }, []);

  const handleEditOpen = () => {
    setFormData(businessData);
    setIsEditOpen(true);
  };

  const handleEditClose = () => setIsEditOpen(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEditSave = async () => {
    try {
      await updateBusinessData(formData);
      setIsEditOpen(false);
    } catch (error) {
      console.error('Error al guardar los cambios:', error);
    }
  };

  const handleAvatarClick = () => {
    document.getElementById('fileInput').click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);

    const formData = new FormData();
    formData.append('img', file);

    try {
      await updateBusinessData(formData);
    } catch (error) {
      console.error('Error al subir la imagen:', error);
    }
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
    <Box sx={{ display: 'flex', height: '100vh', fontFamily: 'Inter, Arial, sans-serif' }}>
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
        <Box sx={{ p: 3, pt: 10, maxWidth: 900, minHeight: '80vh', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Fade in timeout={700}>
            <Card
              sx={{
                mb: 3,
                background: 'linear-gradient(135deg, #4A90E2, #9013FE)',
                color: '#fff',
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                fontFamily: 'Montserrat, Inter, Arial, sans-serif',
              }}
            >
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <div onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
                      <Avatar
                        sx={{
                          bgcolor: '#FF6F61',
                          width: 80,
                          height: 80,
                          fontSize: '2rem',
                          border: '3px solid #fff',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
                        }}
                        src={businessData.img ? businessData.img : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80'}
                      >
                        {!businessData.img && businessData.name.charAt(0)}
                      </Avatar>
                    </div>
                    <input
                      id="fileInput"
                      type="file"
                      style={{ display: 'none' }}
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h4" fontWeight="bold" sx={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
                      {businessData.name}
                    </Typography>
                    <Typography variant="body1" sx={{ fontFamily: 'Inter, Arial, sans-serif' }}>{businessData.description}</Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      sx={{ background: '#FF6F61', color: '#fff' }}
                      onClick={handleEditOpen}
                    >
                      Editar Perfil
                    </Button>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>

          <Fade in timeout={900}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: 800, background: '#f7fafc', fontFamily: 'Inter, Arial, sans-serif' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom sx={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>
                    Detalles de la Empresa
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container columnSpacing={6} rowSpacing={4}>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle1" color="textSecondary">
                        NIT:
                      </Typography>
                      <Typography variant="body1">{businessData.nit}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle1" color="textSecondary">
                        Dirección:
                      </Typography>
                      <Typography variant="body1">{businessData.address}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle1" color="textSecondary">
                        Teléfono:
                      </Typography>
                      <Typography variant="body1">{businessData.phone_number}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle1" color="textSecondary">
                        Sitio Web:
                      </Typography>
                      <Typography variant="body1">{businessData.website}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Typography variant="subtitle1" color="textSecondary">
                        País:
                      </Typography>
                      <Typography variant="body1">{businessData.country}</Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ width: '100%', textAlign: 'center', mt: 6, mb: 2, color: '#b0b0b0', fontSize: 15, fontFamily: 'Inter, Arial, sans-serif' }}>
            Synergia Solutions © {new Date().getFullYear()} — Consultora en clima laboral y desarrollo organizacional
          </Box>

          <Dialog open={isEditOpen} onClose={handleEditClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ fontFamily: 'Montserrat, Inter, Arial, sans-serif' }}>Editar Perfil de Empresa</DialogTitle>
            <DialogContent dividers sx={{ bgcolor: '#F4F6F8', fontFamily: 'Inter, Arial, sans-serif' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 2,
                }}
              >
                <Box sx={{ flex: '1 1 calc(33.33% - 16px)' }}>
                  <TextField
                    fullWidth
                    label="Nombre de la Empresa"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(33.33% - 16px)' }}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(33.33% - 16px)' }}>
                  <TextField
                    fullWidth
                    label="NIT"
                    name="nit"
                    value={formData.nit || ''}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(33.33% - 16px)' }}>
                  <TextField
                    fullWidth
                    label="Dirección"
                    name="address"
                    value={formData.address || ''}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(33.33% - 16px)' }}>
                  <TextField
                    fullWidth
                    label="Teléfono"
                    name="phone_number"
                    value={formData.phone_number || ''}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(33.33% - 16px)' }}>
                  <TextField
                    fullWidth
                    label="Sitio Web"
                    name="website"
                    value={formData.website || ''}
                    onChange={handleInputChange}
                  />
                </Box>
                <Box sx={{ flex: '1 1 calc(33.33% - 16px)' }}>
                  <TextField
                    fullWidth
                    label="Pais"
                    name="country"
                    value={formData.country || ''}
                    onChange={handleInputChange}
                  />
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose} color="secondary">
                Cancelar
              </Button>
              <Button
                variant="contained"
                sx={{ background: '#4A90E2', color: '#fff' }}
                onClick={handleEditSave}
              >
                Guardar Cambios
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
    </Box>
  );
}