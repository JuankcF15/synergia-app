import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Fade, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api';

export default function AdminDashboard() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await api.get('api/admin/companies/');
        setCompanies(res.data);
      } catch (err) {
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCompanies();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await api.get('api/admin/export/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'synergia_export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      alert('Error al exportar los datos globales.');
    }
    setExporting(false);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <AdminSidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: `calc(100% - 60px)`, sm: `calc(100% - 80px)`, md: `calc(100% - 100px)` },
          background: '#F4F6F8',
          overflowY: 'auto',
          ml: 0,
        }}
      >
        <AdminNavbar />
        <Box sx={{ p: 3, pt: 10, maxWidth: 1200, margin: '0 auto' }}>
          <Fade in timeout={700}>
            <Card
              sx={{
                mb: 3,
                background: '#fff',
                borderRadius: 3,
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
                padding: 3,
              }}
            >
              <CardContent>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
                  Bienvenido al Panel de Administración
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                  Gestiona empresas, revisa datos globales y exporta información para análisis avanzados.
                </Typography>
              </CardContent>
            </Card>
          </Fade>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Accesos Rápidos
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<BusinessIcon />}
                  sx={{
                    background: '#4A90E2',
                    color: '#fff',
                    transition: 'transform 0.2s',
                    '&:hover': { background: '#357ABD', transform: 'scale(1.04)' },
                  }}
                  component={Link}
                  to="/admin/businesses"
                >
                  Gestión de Empresas
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<FileDownloadIcon />}
                  sx={{
                    background: '#9013FE',
                    color: '#fff',
                    transition: 'transform 0.2s',
                    '&:hover': { background: '#6C0EB8', transform: 'scale(1.04)' },
                  }}
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? <CircularProgress size={24} color="inherit" /> : 'Exportar Datos Globales'}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
