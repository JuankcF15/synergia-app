import React from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BusinessIcon from '@mui/icons-material/Business';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Link, useNavigate } from 'react-router-dom';

export default function AdminSidebar() {
  const navigate = useNavigate();
  // Helper to trigger loader on navigation
  const handleNav = (to) => {
    window.dispatchEvent(new Event('dashboard-nav'));
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/business/login');
  };

  return (
    <Box
      sx={{
        width: { xs: 60, sm: 80, md: 100 },
        background: '#1E1E1E',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Tooltip title="Empresas" placement="right">
        <IconButton component={Link} to="/admin/dashboard" sx={{ color: '#fff', mb: 2 }} onClick={() => handleNav('/admin/dashboard')}>
          <DashboardIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Gestión de empresas" placement="right">
        <IconButton component={Link} to="/admin/businesses" sx={{ color: '#fff', mb: 2 }} onClick={() => handleNav('/admin/businesses')}>
          <BusinessIcon />
        </IconButton>
      </Tooltip>
      <Divider sx={{ width: '80%', my: 2, backgroundColor: '#555' }} />
      <Tooltip title="Cerrar Sesión" placement="right">
        <IconButton onClick={handleLogout} sx={{ color: '#fff', mt: 'auto' }}>
          <ExitToAppIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}
