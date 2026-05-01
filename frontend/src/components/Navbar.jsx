import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Avatar, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import SettingsIcon from '@mui/icons-material/Settings'; // <-- importa el ícono
import synergiaIcon from '../assets/synergia-logo2.png'; // <-- este es el ícono, no el logo completo

export default function Navbar({ businessImg }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        background: 'linear-gradient(135deg, #4A90E2, #9013FE)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        zIndex: 1201,
      }}
    >
      <Toolbar>
        {/* Logo + texto interactivo */}
        <Box
          component={Link}
          to="/business/dashboard"
          sx={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
            mr: 2,
            '&:hover .logo-text': {
              color: '#FF6F61',
              transform: 'translateY(-3px)',
              letterSpacing: '0.05em',
            },
            '&:hover .logo-icon': {
              transform: 'scale(1.05)',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
            },
          }}
        >
          <Box
            component="img"
            src={synergiaIcon}
            alt="Synergia Icon"
            className="logo-icon"
            sx={{
              height: '40px',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              marginRight: 1,
            }}
          />
          <Typography
            variant="h6"
            className="logo-text"
            sx={{
              color: '#ffffff',
              fontWeight: 700,
              fontFamily: `'Inter', 'Roboto', 'sans-serif'`,
              fontSize: '1.5rem',
              transition: 'color 0.3s ease, transform 0.3s ease, letter-spacing 0.3s ease',
            }}
          >
            Synergia
          </Typography>
        </Box>

        {/* Avatar y botón de configuración */}
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center' }}>
          <IconButton sx={{ p: 0 }}  component={Link} to="/business/dashboard/profile">
            <Avatar sx={{ bgcolor: '#FF6F61' }} src={businessImg ? businessImg : 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=facearea&w=256&h=256&facepad=2&q=80'}>
              {!businessImg && 'U'}
            </Avatar>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
