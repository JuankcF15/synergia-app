import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Grid, Button, Fade, Zoom, Avatar } from '@mui/material';
import AdminNavbar from '../components/AdminNavbar';
import AdminSidebar from '../components/AdminSidebar';
import api from '../api';
import BusinessIcon from '@mui/icons-material/Business';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function BusinessManager() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

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
    let url = '/api/admin/export/';
    let filename = 'synergia_export.csv';
    try {
      const res = await api.get(url, { responseType: 'blob' });
      const blob = new Blob([res.data]);
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error al exportar los datos.');
    }
  };

  const handleCardClick = (id) => {
    window.dispatchEvent(new Event('dashboard-nav'));
    window.location.href = `/synergia/businesses/${id}`;
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
                  Gestión de Empresas
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', lineHeight: 1.6 }}>
                  Visualiza todas las empresas registradas y exporta los datos globales en formato CSV o Excel.
                </Typography>
              </CardContent>
            </Card>
          </Fade>

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              sx={{ background: '#9013FE', color: '#fff', '&:hover': { background: '#6C0EB8' } }}
              onClick={handleExport}
            >
              Exportar Datos (CSV)
            </Button>
          </Box>

          <Grid container spacing={3}>
            {loading ? (
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                  <BusinessIcon sx={{ fontSize: 60, color: '#ccc', mr: 2 }} />
                  <Typography variant="h6" color="textSecondary">Cargando empresas...</Typography>
                </Box>
              </Grid>
            ) : companies.length === 0 ? (
              <Grid item xs={12}>
                <Typography variant="h6" color="textSecondary" align="center">
                  No hay empresas registradas.
                </Typography>
              </Grid>
            ) : (
              companies.map((company, idx) => (
                <Grid item xs={12} sm={6} md={4} key={company.id}>
                  <Zoom in style={{ transitionDelay: `${200 + idx * 100}ms` }}>
                    <Card
                      sx={{
                        background: 'linear-gradient(135deg, #fff, #f7f0ff 80%)',
                        borderRadius: 4,
                        boxShadow: '0 4px 16px rgba(144,19,254,0.08)',
                        cursor: 'pointer',
                        transition: 'transform 0.15s, box-shadow 0.15s',
                        '&:hover': {
                          transform: 'scale(1.03)',
                          boxShadow: '0 8px 24px rgba(144,19,254,0.18)',
                          border: '2px solid #9013FE',
                        },
                        p: 2
                      }}
                      onClick={() => handleCardClick(company.id)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <Avatar src={company.img || undefined} sx={{ width: 56, height: 56, mr: 2, bgcolor: '#f3e6ff', color: '#9013FE', fontSize: 32 }}>
                            {!company.img && <BusinessIcon fontSize="large" />}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', fontSize: 20 }}>{company.name}</Typography>
                            <Typography variant="body2" color="textSecondary">{company.country}</Typography>
                          </Box>
                        </Box>
                        <Typography variant="body1" sx={{ color: '#666', mb: 0.5 }}>
                          Empleados: <b>{company.num_empleados}</b>
                        </Typography>
                        <Typography variant="body1" sx={{ color: '#666' }}>
                          Promedio Global: <b style={{ color: '#9013FE' }}>{company.promedio !== null ? company.promedio : '0'}</b>
                        </Typography>
                      </CardContent>
                    </Card>
                  </Zoom>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
