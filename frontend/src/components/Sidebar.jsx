import React from 'react';
import { Box, IconButton, Tooltip, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PollIcon from '@mui/icons-material/BarChart';
import InsightsIcon from '@mui/icons-material/Insights';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import GroupIcon from '@mui/icons-material/Group'; // Icono para Gestión de Empleados
import { Link } from 'react-router-dom';

export default function Sidebar() {
  // Helper to trigger loader on navigation
  const handleNav = (to) => {
    window.dispatchEvent(new Event('dashboard-nav'));
  };

  return (
    <Box
      sx={{
        width: {xs: 60, sm: 80, md: 100},
        background: '#1E1E1E',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        py: 2,
        boxShadow: '2px 0 5px rgba(0, 0, 0, 0.1)',
      }}
    >
      <Tooltip title="Inicio" placement="right">
        <IconButton component={Link} to="/dashboard" sx={{ color: '#fff', mb: 2 }} onClick={() => handleNav('/dashboard')}>
          <DashboardIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Perfil de la Empresa" placement="right">
        <IconButton component={Link} to="/business/dashboard/profile" sx={{ color: '#fff', mb: 2 }} onClick={() => handleNav('/business/dashboard/profile')}>
          <PersonIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Gestión de Empleados" placement="right">
        <IconButton component={Link} to="/business/dashboard/employees" sx={{ color: '#fff', mb: 2 }} onClick={() => handleNav('/business/dashboard/employees')}>
          <GroupIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Reportes" placement="right">
        <IconButton component={Link} to="/business/dashboard/reports" sx={{ color: '#fff', mb: 2 }} onClick={() => handleNav('/business/dashboard/reports')}>
          <InsightsIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title="Configuración" placement="right">
        <IconButton component={Link} to="/business/dashboard/settings" sx={{ color: '#fff', mb: 2 }} onClick={() => handleNav('/business/dashboard/settings')}>
          <SettingsApplicationsIcon />
        </IconButton>
      </Tooltip>
      <Divider sx={{ width: '80%', my: 2, backgroundColor: '#555' }} />
      <Tooltip title="Cerrar Sesión" placement="right">
        <IconButton component={Link} to="/business/logout" sx={{ color: '#fff', mt: 'auto' }}>
          <ExitToAppIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
}