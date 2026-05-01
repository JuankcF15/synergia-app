import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  MenuItem,
  Snackbar,
  Alert,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fade,
  Zoom,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import api from '../api'; // Usar la configuración centralizada de API
import { BusinessContext } from '../context/BusinessContext';
import Loader from '../components/Loader';

export default function EmployeesManagement() {
  const { businessData, updateBusinessData, loading } = useContext(BusinessContext);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [employeeData, setEmployeeData] = useState({
    name: '',
    email: '',
    position: '',
    department: '',
    is_active: true,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [accessCodes, setAccessCodes] = useState([]);
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    // Listen for navigation event to trigger loader
    const handleNav = () => {
      setShowLoader(true);
      setTimeout(() => setShowLoader(false), 1000);
    };
    window.addEventListener('dashboard-nav', handleNav);
    return () => window.removeEventListener('dashboard-nav', handleNav);
  }, []);

  useEffect(() => {
    setShowLoader(true);
    const timer = setTimeout(() => {
      setShowLoader(false);
      fetchEmployees();
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await api.get('api/employees/');
      setEmployees(response.data);
    } catch (error) {
      console.error('Error al cargar empleados:', error);
      setSnackbar({ open: true, message: 'Error al cargar empleados.', severity: 'error' });
    }
  };

  const fetchAccessCodes = async (employeeId) => {
    try {
      const response = await api.get(`api/survey/code/list/${employeeId}/`);
      setAccessCodes(response.data); // Actualiza el estado con los códigos obtenidos
    } catch (error) {
      console.error('Error al cargar códigos de acceso:', error);
      setSnackbar({ open: true, message: 'Error al cargar códigos de acceso.', severity: 'error' });
    }
  };
  

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee);
    // Limpia códigos al cambiar de empleado
    setAccessCodes([]);
    fetchAccessCodes(employee.id); // Obtiene los códigos del empleado seleccionado
  };

  

  const handleDialogOpen = () => {
    setSelectedEmployee(null);
    setEmployeeData({
      name: '',
      email: '',
      position: '',
      department: '',
      is_active: true,
    });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleEditEmployee = () => {
    if (selectedEmployee) {
      setEmployeeData(selectedEmployee);
      setDialogOpen(true);
    }
  };

  const handleDisableEmployee = async () => {
    if (selectedEmployee) {
      try {
        await api.patch(`api/employees/${selectedEmployee.id}/disable/`);
        setSnackbar({ open: true, message: 'Empleado deshabilitado exitosamente.', severity: 'success' });
        fetchEmployees();
        setSelectedEmployee(null);
      } catch (error) {
        console.error('Error al deshabilitar empleado:', error);
        setSnackbar({ open: true, message: 'Error al deshabilitar empleado.', severity: 'error' });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeData({ ...employeeData, [name]: name === 'is_active' ? value === 'true' : value });
  };

  const handleSubmit = async () => {
    if (!employeeData.name || !employeeData.email || !employeeData.position || !employeeData.department) {
      setSnackbar({ open: true, message: 'Por favor, completa todos los campos.', severity: 'error' });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(employeeData.email)) {
      setSnackbar({ open: true, message: 'El correo electrónico no es válido.', severity: 'error' });
      return;
    }

    // Verificar si el correo ya existe (solo para nuevos empleados)
    if (!selectedEmployee) {
      const emailExists = employees.some(emp => emp.email === employeeData.email);
      if (emailExists) {
        setSnackbar({ open: true, message: 'Ya existe un empleado con este correo electrónico.', severity: 'error' });
        return;
      }
    } else {
      // Para empleados existentes, verificar si el nuevo correo ya está en uso por otro empleado
      const emailExists = employees.some(emp => emp.email === employeeData.email && emp.id !== selectedEmployee.id);
      if (emailExists) {
        setSnackbar({ open: true, message: 'Ya existe otro empleado con este correo electrónico.', severity: 'error' });
        return;
      }
    }

    try {
      if (selectedEmployee) {
        await api.patch(`api/employees/${selectedEmployee.id}/`, employeeData);
        setSnackbar({ open: true, message: 'Empleado actualizado exitosamente.', severity: 'success' });
      } else {
        await api.post('api/employees/', employeeData);
        setSnackbar({ open: true, message: 'Empleado agregado exitosamente.', severity: 'success' });
      }

      fetchEmployees();
      handleDialogClose();
      setEmployeeData({
        name: '',
        email: '',
        position: '',
        department: '',
        is_active: true,
      });
    } catch (error) {
      console.error('Error al guardar empleado:', error.response?.data || error.message);
      // Manejar error específico de correo duplicado desde el backend
      if (error.response?.data?.email) {
        setSnackbar({ open: true, message: 'Ya existe un empleado con este correo electrónico.', severity: 'error' });
      } else {
        setSnackbar({ open: true, message: 'Error al guardar empleado.', severity: 'error' });
      }
    }
  };
  const handleGenerateCode = async () => {
    if (!selectedEmployee) return;
  
    try {
      const response = await api.post('api/survey/code/generate/', {
        employee_id: selectedEmployee.id,
      });
      console.log(response.data); // Imprime lo que obtienes en la respuesta
      const newCodes = response.data;
  
      if (Array.isArray(newCodes)) {
        setAccessCodes((prev) => [...prev, ...newCodes]);
      } else {
        // Maneja el caso donde newCodes no es iterable
        setSnackbar({ open: true, message: 'La respuesta no es un arreglo.', severity: 'error' });
      }
  
      setSnackbar({ open: true, message: 'Código(s) generado(s) correctamente.', severity: 'success' });
      handleSelectEmployee(selectedEmployee); // Actualiza la lista de códigos
    } catch (error) {
      console.error('Error al generar código:', error.response?.data || error.message);
      setSnackbar({ open: true, message: 'Error al generar código.', severity: 'error' });
    }
  };
  
  

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: '' });
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <Sidebar />
      <Box 
        component="main"
        sx={{ 
          flexGrow: 1,
          width: { xs: `calc(100% - 60px)`, sm: `calc(100% - 80px)`, md: `calc(100% - 100px)` },
          background: '#F4F6F8',
          overflowY: 'auto',
          ml: 0,
          position: 'relative',
        }}
      >
        <Navbar businessImg={businessData?.img} />
        {showLoader ? (
          <Loader />
        ) : (
        <Box sx={{ p: 3, pt: 10 }}>
          <Fade in timeout={700}>
            <Typography variant="h4" gutterBottom>
              Gestión de Empleados
            </Typography>
          </Fade>
          <Fade in timeout={900}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Seleccionar</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Correo</TableCell>
                    <TableCell>Cargo</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEmployee?.id === employee.id}
                          onChange={() => handleSelectEmployee(employee)}
                        />
                      </TableCell>
                      <TableCell>{employee.name}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell>
                        <Chip
                          label={employee.is_active ? 'Activo' : 'Inactivo'}
                          color={employee.is_active ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Fade>

          <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
            <Zoom in style={{ transitionDelay: '200ms' }}>
              <Button
                variant="contained"
                sx={{ background: '#4A90E2', color: '#fff' }}
                onClick={handleDialogOpen}
              >
                Agregar Empleado
              </Button>
            </Zoom>
            <Zoom in style={{ transitionDelay: '350ms' }}>
              <Button
                variant="contained"
                sx={{ background: '#FF6F61', color: '#fff' }}
                onClick={handleEditEmployee}
                disabled={!selectedEmployee}
              >
                Modificar Empleado
              </Button>
            </Zoom>
            <Zoom in style={{ transitionDelay: '500ms' }}>
              <Button
                variant="contained"
                sx={{ background: '#5865F2', color: '#fff' }}
                onClick={handleDisableEmployee}
                disabled={!selectedEmployee}
              >
                Deshabilitar Empleado
              </Button>
            </Zoom>
          </Box>

          {selectedEmployee && (
            <Fade in timeout={800}>
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Códigos de Acceso para: {selectedEmployee.name}
                </Typography>
                <Button variant="outlined" onClick={handleGenerateCode} sx={{ mb: 2 }}>
                  Generar Código
                </Button>
                {accessCodes.length > 0 ? (
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Código</TableCell>
                          <TableCell>Estado</TableCell>
                          <TableCell>Creado</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {accessCodes.map((code, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{code.code}</TableCell>
                            <TableCell>
                              <Chip
                                label={code.used ? 'Usado' : 'Disponible'}
                                color={code.used ? 'default' : 'success'}
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{new Date(code.created_at).toLocaleString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No hay códigos generados aún.
                  </Typography>
                )}
              </Box>
            </Fade>
          )}

          {/* Dialog para Agregar/Editar Empleado */}
          <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
            <DialogTitle>
              {selectedEmployee ? 'Editar Empleado' : 'Agregar Nuevo Empleado'}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Nombre"
                      name="name"
                      value={employeeData.name}
                      onChange={(e) => setEmployeeData({ ...employeeData, name: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Correo Electrónico"
                      name="email"
                      value={employeeData.email}
                      onChange={(e) => setEmployeeData({ ...employeeData, email: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Cargo"
                      name="position"
                      value={employeeData.position}
                      onChange={(e) => setEmployeeData({ ...employeeData, position: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Departamento"
                      name="department"
                      value={employeeData.department}
                      onChange={(e) => setEmployeeData({ ...employeeData, department: e.target.value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      fullWidth
                      label="Estado"
                      name="is_active"
                      value={employeeData.is_active ? 'true' : 'false'}
                      onChange={(e) => setEmployeeData({ ...employeeData, is_active: e.target.value === 'true' })}
                    >
                      <MenuItem value="true">Activo</MenuItem>
                      <MenuItem value="false">Inactivo</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDialogClose} color="inherit">
                Cancelar
              </Button>
              <Button
                onClick={handleSubmit}
                variant="contained"
                sx={{ background: '#4A90E2' }}
              >
                {selectedEmployee ? 'Guardar Cambios' : 'Agregar Empleado'}
              </Button>
            </DialogActions>
          </Dialog>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={4000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
        )}
      </Box>
    </Box>
  );
}
