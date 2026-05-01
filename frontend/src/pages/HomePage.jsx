import {
    Box,
    Button,
    Typography,
    Paper,
    Avatar,
  } from '@mui/material';
  import BusinessIcon from '@mui/icons-material/Business';
  import PersonIcon from '@mui/icons-material/Person';
  import { useNavigate } from 'react-router-dom';
  import { motion } from 'framer-motion';
  
  export default function HomePage() {
    const navigate = useNavigate();
  
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #5865F2, #9B4DFF)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          px: 2,
        }}
      >
        <Paper
          elevation={6}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 4,
            textAlign: 'center',
            maxWidth: 600,
            width: '100%',
            backgroundColor: '#fff',
          }}
        >
          <Typography variant="h4" gutterBottom fontWeight="bold">
            Bienvenido a Synergia
          </Typography>
          <Typography variant="subtitle1" sx={{ mb: 4 }}>
            Selecciona tu rol para continuar
          </Typography>
  
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 3,
              justifyContent: 'center',
            }}
          >
            {/* Empleado */}
            <Box
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 3,
                bgcolor: '#f5f5f5',
                boxShadow: 2,
                textAlign: 'center',
              }}
            >
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <PersonIcon />
              </Avatar>
              <Typography variant="h6">Empleado</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Ingresa tu código para realizar la encuesta
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/survey')}
              >
                Soy Empleado
              </Button>
            </Box>
  
            {/* Empresa */}
            <Box
              sx={{
                flex: 1,
                p: 3,
                borderRadius: 3,
                bgcolor: '#f5f5f5',
                boxShadow: 2,
                textAlign: 'center',
              }}
            >
              <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                <BusinessIcon />
              </Avatar>
              <Typography variant="h6">Empresa</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Inicia sesión para administrar tu organización
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/business/login')}
              >
                Soy Empresa
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    );
  }
  