import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Grid, Avatar, Fade, CircularProgress, Divider, Button } from '@mui/material';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api';
import BusinessIcon from '@mui/icons-material/Business';

export default function AdminBusinessProfile() {
  const { id } = useParams();
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        // Usar el endpoint admin para obtener todos los datos de la empresa
        const res = await api.get(`/api/admin/companies/${id}/`);
        setCompany(res.data);
      } catch (err) {
        setCompany(null);
      }
    };
    const fetchStats = async () => {
      try {
        const res = await api.get(`/api/survey/statistics/${id}/`);
        setStats(res.data);
      } catch (err) {
        setStats(null);
      }
    };
    Promise.all([fetchCompany(), fetchStats()]).finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, background: '#F4F6F8', overflowY: 'auto' }}>
          <AdminNavbar />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <CircularProgress />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!company) {
    return (
      <Box sx={{ display: 'flex', height: '100vh' }}>
        <AdminSidebar />
        <Box sx={{ flexGrow: 1, background: '#F4F6F8', overflowY: 'auto' }}>
          <AdminNavbar />
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <Typography variant="h6">Empresa no encontrada.</Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AdminSidebar />
      <Box component="main" sx={{ flexGrow: 1, width: { xs: `calc(100% - 60px)`, sm: `calc(100% - 80px)`, md: `calc(100% - 100px)` }, background: '#F4F6F8', overflowY: 'auto', ml: 0 }}>
        <AdminNavbar />
        <Box sx={{ p: 3, pt: 10, maxWidth: 900, minHeight: '80vh', margin: '0 auto', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Fade in timeout={700}>
            <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #4A90E2, #9013FE)', color: '#fff', borderRadius: 3, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item>
                    <Avatar
                      sx={{ bgcolor: '#FF6F61', width: 80, height: 80, fontSize: '2rem', border: '3px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }}
                      src={company.img || undefined}
                    >
                      {!company.img && <BusinessIcon fontSize="large" />}
                    </Avatar>
                  </Grid>
                  <Grid item xs>
                    <Typography variant="h4" fontWeight="bold">{company.name}</Typography>
                    <Typography variant="body1">{company.description || 'Sin descripción.'}</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Fade>

          <Fade in timeout={900}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: 800, background: '#f7fafc' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Detalles de la Empresa</Typography>
                  <Divider sx={{ mb: 2 }} />
                  <Grid container columnSpacing={6} rowSpacing={4}>
                    <Grid item xs={12} sm={6} md={4}><Typography variant="subtitle1" color="text.secondary">País:</Typography><Typography variant="body1">{company.country}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={4}><Typography variant="subtitle1" color="text.secondary">NIT:</Typography><Typography variant="body1">{company.nit || 'N/A'}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={4}><Typography variant="subtitle1" color="text.secondary">Dirección:</Typography><Typography variant="body1">{company.address || 'N/A'}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={4}><Typography variant="subtitle1" color="text.secondary">Teléfono:</Typography><Typography variant="body1">{company.phone_number || 'N/A'}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={4}><Typography variant="subtitle1" color="text.secondary">Sitio Web:</Typography><Typography variant="body1">{company.website || 'N/A'}</Typography></Grid>
                    <Grid item xs={12} sm={6} md={4}><Typography variant="subtitle1" color="text.secondary">Empleados:</Typography><Typography variant="body1">{stats.total_empleados}</Typography></Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          </Fade>

          <Fade in timeout={1100}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 4 }}>
              <Card sx={{ p: 2, borderRadius: 3, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: 800, background: '#fff' }}>
                <CardContent>
                  <Typography variant="h5" gutterBottom>Estadísticas</Typography>
                  <Divider sx={{ mb: 2 }} />
                  {stats ? (
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle1" color="text.secondary">Respuestas Totales</Typography><Typography variant="h6">{stats.total_respuestas}</Typography></Grid>
                      <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle1" color="text.secondary">Empleados Participantes</Typography><Typography variant="h6">{stats.empleados_que_respondieron}</Typography></Grid>
                      <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle1" color="text.secondary">Empleados Registrados</Typography><Typography variant="h6">{stats.total_empleados}</Typography></Grid>
                      <Grid item xs={12} sm={6} md={3}><Typography variant="subtitle1" color="text.secondary">Promedio General</Typography><Typography variant="h6">{stats.promedio_general}</Typography></Grid>
                    </Grid>
                  ) : (
                    <Typography variant="body1">No hay estadísticas disponibles.</Typography>
                  )}
                </CardContent>
              </Card>
            </Box>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}
