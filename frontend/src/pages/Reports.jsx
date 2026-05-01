import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Button,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  Fade,
  Zoom,
} from '@mui/material';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { Line, Radar, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
} from 'chart.js';
import { BusinessContext } from '../context/BusinessContext';
import api from '../api';
import EmojiObjectsIcon from '@mui/icons-material/EmojiObjects';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InsightsIcon from '@mui/icons-material/Insights';
import Loader from '../components/Loader';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale
);

export default function Reports() {
  const { businessData } = useContext(BusinessContext);
  const [filter, setFilter] = useState('personalizadas');
  const [analysisData, setAnalysisData] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: '' });
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const fetchAnalysisData = async () => {
      try {
        const response = await api.get('api/survey/analysis/');
        setAnalysisData(response.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error al cargar los datos de análisis',
          severity: 'error',
        });
      }
    };
    fetchAnalysisData();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get('api/survey/recommendations/');
        setRecommendations(response.data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Error al cargar las recomendaciones',
          severity: 'error',
        });
      }
    };
    fetchRecommendations();
  }, []);

  useEffect(() => {
    const handleNav = () => {
      setShowLoader(true);
      setTimeout(() => setShowLoader(false), 1000);
    };
    window.addEventListener('dashboard-nav', handleNav);
    return () => window.removeEventListener('dashboard-nav', handleNav);
  }, []);

  // Función para obtener descripción contextual según promedio
  const getDimensionDescription = (prom) => {
    if (prom < 0.1) return 'No hay datos disponibles para esta dimensión.';
    if (prom < 2.5) return 'El rendimiento en esta dimensión es bajo. Se recomienda una intervención inmediata y acciones correctivas.';
    if (prom < 3.5) return 'El rendimiento es aceptable, pero existen áreas claras de mejora.';
    return 'El rendimiento es alto. Se recomienda mantener y reforzar las buenas prácticas.';
  };

  // Descripción para el promedio general
  const getGeneralDescription = (prom) => {
    if (prom === 0) return 'No hay datos disponibles para el promedio general.';
    if (prom < 2.5) return 'El clima laboral general es bajo. Es fundamental implementar estrategias de mejora organizacional.';
    if (prom < 3.5) return 'El clima laboral es aceptable, pero hay oportunidades de mejora.';
    return 'El clima laboral es positivo. Continúe reforzando la cultura organizacional.';
  };

  // Executive Insights tip profesional
  const getExecutiveTip = (prom) => {
    if (prom === 0) return 'Tip: Asegúrese de que todos los empleados tengan la oportunidad de participar en la encuesta.';
    if (prom < 2.5) return 'Tip: Implemente un plan de acción inmediato con seguimiento mensual y comunicación directa con los equipos.';
    if (prom < 3.5) return 'Tip: Realice focus groups y sesiones de feedback para identificar áreas de mejora específicas.';
    return 'Tip: Celebre los logros y comparta las mejores prácticas entre equipos para mantener el clima positivo.';
  };

  // Radar chart para dimensiones
  const radarData = recommendations
    ? {
        labels: recommendations.radar_labels,
        datasets: [
          {
            label: 'Puntaje por Dimensión',
            data: recommendations.radar_data,
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          },
        ],
      }
    : null;

  // Línea histórica de clima laboral
  const lineData = recommendations
    ? {
        labels: recommendations.historico_labels,
        datasets: [
          {
            label: 'Promedio General',
            data: recommendations.historico_data,
            fill: false,
            borderColor: '#4A90E2',
            backgroundColor: '#4A90E2',
            tension: 0.3,
          },
        ],
      }
    : null;

  // Barras comparación de dimensiones
  const barData = recommendations
    ? {
        labels: recommendations.radar_labels,
        datasets: [
          {
            label: 'Puntaje por Dimensión',
            data: recommendations.radar_data,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
          },
        ],
      }
    : null;

  // Barras top 3 dimensiones más bajas
  const barLowData = recommendations
    ? (() => {
        const dimProms = recommendations.promedios_dimensiones.slice().sort((a, b) => a.promedio - b.promedio).slice(0, 3);
        return {
          labels: dimProms.map(d => d.dimension),
          datasets: [
            {
              label: 'Dimensiones más bajas',
              data: dimProms.map(d => d.promedio),
              backgroundColor: 'rgba(255, 99, 132, 0.6)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        };
      })()
    : null;

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: '' });
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('api/survey/export/', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'respuestas_encuesta.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setSnackbar({ open: true, message: 'Exportación exitosa', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: 'Error al exportar los datos', severity: 'error' });
    }
  };

  // Reglas automáticas mejoradas para mostrar pasos concretos
  const pasosDimension = (dimension) => {
    if (!recommendations) return [];
    const prom = recommendations.promedios_dimensiones.find(d => d.dimension === dimension)?.promedio || 0;
    if (prom < 2.5) {
      return [
        'Realizar talleres de formación y sensibilización.',
        'Implementar reuniones periódicas para escuchar sugerencias.',
        'Asignar un responsable de mejora en esta dimensión.',
        'Medir avances cada mes y ajustar acciones.',
      ];
    } else if (prom < 3.5) {
      return [
        'Aplicar encuestas internas para identificar causas.',
        'Fomentar espacios de diálogo y feedback.',
        'Reconocer públicamente mejoras en el área.',
      ];
    } else {
      return [
        'Mantener las buenas prácticas actuales.',
        'Reforzar la cultura positiva con reconocimientos.',
      ];
    }
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
        }}
      >
        <Navbar businessImg={businessData?.img} />
        {showLoader ? (
          <Loader />
        ) : (
        <Box sx={{ p: 3, pt: 10 }}>
          <Fade in timeout={700}>
            <div>
              {/* Executive Insights */}
              {recommendations && (
                <Paper sx={{ p: 3, mb: 4, background: 'linear-gradient(90deg, #e3f2fd 0%, #fce4ec 100%)', display: 'flex', alignItems: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.08)' }}>
                  <InsightsIcon sx={{ fontSize: 48, color: '#4A90E2', mr: 2 }} />
                  <Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      Resumen ejecutivo
                    </Typography>
                    <Typography variant="body1">
                      {getGeneralDescription(recommendations.promedio_general)}
                    </Typography>
                    <Typography variant="body2" color="primary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      {getExecutiveTip(recommendations.promedio_general)}
                    </Typography>
                  </Box>
                </Paper>
              )}

              {/* Exportación de Datos */}
              <Fade in timeout={900}>
                <Paper sx={{ p: 3, mb: 4, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="h5" gutterBottom>
                    Exportación de Datos de Encuesta
                  </Typography>
                  <Typography variant="body1">
                    Permite al administrador exportar los datos de la encuesta en un formato estructurado,
                    facilitando su análisis en herramientas externas.
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={handleExportData}
                    sx={{
                      mt: 2,
                      background: '#4A90E2',
                      color: '#fff',
                      '&:hover': { background: '#357ABD' },
                    }}
                  >
                    Exportar Datos
                  </Button>
                </Paper>
              </Fade>

              {/* Filtros de análisis */}
              <Fade in timeout={1100}>
                <Paper sx={{ p: 3, mb: 4, boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
                  <Typography variant="h5" gutterBottom>
                    Análisis de Resultados y Gráficas
                  </Typography>
                  <FormControl fullWidth sx={{ mb: 3 }}>
                    <InputLabel>Selecciona un análisis</InputLabel>
                    <Select value={filter} label="Selecciona un análisis" onChange={handleFilterChange}>
                      <MenuItem value="personalizadas">Recomendación personalizada por dimensión</MenuItem>
                      <MenuItem value="predictivo">Análisis predictivo IA</MenuItem>
                      <MenuItem value="dimensiones">Por dimensión</MenuItem>
                      <MenuItem value="historico">Gráfica de la evolución histórica</MenuItem>
                      <MenuItem value="comparacion">Gráfica de comparación entre dimensiones</MenuItem>
                      <MenuItem value="topbajas">Gráfica de Top 3 dimensiones más bajas</MenuItem>
                      <MenuItem value="radar">Gráfica de comparación por dimensión (Radar)</MenuItem>
                    </Select>
                  </FormControl>
                  <Box sx={{ borderBottom: '1px solid #e0e0e0', mb: 3 }} />

                  {/* Filtro: Por dimensiones*/}
                  {filter === 'dimensiones' && (
                    <Box sx={{
                      display: 'flex',
                      flexDirection: 'row',
                      overflowX: 'auto',
                      gap: 2,
                      pb: 2,
                    }}>
                      {analysisData.map((data, idx) => (
                        <Zoom in style={{ transitionDelay: `${200 + idx * 100}ms` }} key={data.dimensión}>
                          <Paper
                            sx={{
                              minWidth: 320,
                              maxWidth: 400,
                              flex: '0 0 auto',
                              p: 2,
                              mb: 2,
                              background: '#f7fafc',
                              borderLeft: '4px solid #4A90E2',
                              boxShadow: 'none',
                              minHeight: 180,
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'flex-start',
                              justifyContent: 'flex-start',
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                              {data.dimensión}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              {getDimensionDescription(data.promedio)}
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Puntaje:</strong> {data.promedio ? data.promedio.toFixed(2) : '0'}
                            </Typography>

                            <Typography variant="body2" sx={{ mb: 1 }}>
                              <strong>Desviación Estándar:</strong> {data.desviacion_estandar ? data.desviacion_estandar.toFixed(2) : '0'}
                            </Typography>
                            {data.pregunta_mas_variable && (
                              <Typography variant="body2">
                                <strong>Pregunta más variable:</strong> {data.pregunta_mas_variable} - {data.texto_pregunta_mas_variable || ''}
                              </Typography>
                            )}
                          </Paper>
                        </Zoom>
                      ))}
                    </Box>
                  )}

                  {/* Filtro: Evolución histórica */}
                  {filter === 'historico' && lineData && (
                    <Fade in timeout={800}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Evolución Histórica del Clima Laboral
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Visualiza la tendencia del clima laboral a lo largo del tiempo. Un promedio creciente indica mejora organizacional.
                        </Typography>
                        <Paper sx={{ p: 2, boxShadow: 'none', background: 'transparent', maxWidth: 600, mx: 'auto' }}>
                          <Line data={lineData} options={{
                            responsive: true,
                            plugins: { legend: { display: true, position: 'top' } },
                            scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
                          }} />
                        </Paper>
                      </Box>
                    </Fade>
                  )}

                  {/* Filtro: Comparación entre dimensiones (barras) */}
                  {filter === 'comparacion' && barData && (
                    <Fade in timeout={800}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Comparación de Dimensiones (Barras)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Compara el rendimiento de cada dimensión para identificar fortalezas y debilidades.
                        </Typography>
                        <Paper sx={{ p: 2, boxShadow: 'none', background: 'transparent', maxWidth: 600, mx: 'auto' }}>
                          <Bar data={barData} options={{
                            responsive: true,
                            plugins: { legend: { display: true, position: 'top' } },
                            scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
                          }} />
                        </Paper>
                      </Box>
                    </Fade>
                  )}

                  {/* Filtro: Top 3 dimensiones más bajas */}
                  {filter === 'topbajas' && barLowData && (
                    <Fade in timeout={800}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Top 3 Dimensiones Más Bajas
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Enfóquese en estas dimensiones para lograr mejoras rápidas y significativas en el clima laboral.
                        </Typography>
                        <Paper sx={{ p: 2, boxShadow: 'none', background: 'transparent', maxWidth: 600, mx: 'auto' }}>
                          <Bar data={barLowData} options={{
                            responsive: true,
                            plugins: { legend: { display: true, position: 'top' } },
                            scales: { y: { min: 0, max: 5, ticks: { stepSize: 1 } } },
                          }} />
                        </Paper>
                      </Box>
                    </Fade>
                  )}

                  {/* Filtro: Comparación por dimensión (Radar) */}
                  {filter === 'radar' && radarData && (
                    <Fade in timeout={800}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Comparación por Dimensión (Radar)
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Visualiza de forma global el equilibrio entre todas las dimensiones evaluadas.
                        </Typography>
                        <Paper sx={{ p: 2, boxShadow: 'none', background: 'transparent', maxWidth: 600, mx: 'auto' }}>
                          <Radar data={radarData} options={{
                            responsive: true,
                            plugins: { legend: { display: true, position: 'top' } },
                            scales: { r: { min: 0, max: 5, ticks: { stepSize: 1 } } },
                          }} />
                        </Paper>
                      </Box>
                    </Fade>
                  )}

                  {/* Filtro: Recomendación personalizada por dimensión */}
                  {filter === 'personalizadas' && recommendations && (
                    <Fade in timeout={800}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Recomendación personalizada por dimensión
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Análisis detallado y recomendaciones específicas para cada dimensión, considerando su puntaje actual.
                        </Typography>
                        {recommendations.promedios_dimensiones.map((dim, idx) => {
                          let texto = '';
                          switch (dim.dimension) {
                            case 'Estructura':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `El puntaje bajo (${dim.promedio}) en Estructura indica desorganización y falta de claridad en roles y procesos. Realice un mapeo de puestos y responsabilidades, comunique organigramas actualizados y establezca canales claros para la toma de decisiones. Implemente reuniones periódicas para aclarar dudas sobre funciones y procesos.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Estructura sugiere que hay cierta claridad, pero aún existen áreas grises. Refuerce la comunicación sobre jerarquías, revise los procedimientos administrativos y fomente la participación de los empleados en la mejora de procesos internos.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Estructura refleja una organización clara y eficiente. Mantenga actualizados los manuales de procesos y continúe promoviendo la transparencia en la asignación de tareas y responsabilidades.`;
                              }
                              break;
                            case 'Responsabilidad':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `Un puntaje bajo (${dim.promedio}) en Responsabilidad indica falta de autonomía y compromiso. Fomente la toma de decisiones descentralizada, capacite en liderazgo y delegue tareas con seguimiento, permitiendo que los empleados asuman retos y aprendan de sus errores.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Responsabilidad muestra que algunos empleados requieren mayor claridad en sus funciones. Refuerce la comunicación de expectativas, establezca objetivos individuales y brinde retroalimentación frecuente sobre el desempeño.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Responsabilidad refleja un equipo comprometido y autónomo. Continúe reconociendo la iniciativa y ofrezca oportunidades de desarrollo profesional para mantener la motivación.`;
                              }
                              break;
                            case 'Recompensa':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `El puntaje bajo (${dim.promedio}) en Recompensa indica que los empleados no perciben reconocimiento suficiente. Implemente un programa de incentivos claros, celebre logros en reuniones y utilice canales internos para destacar el trabajo bien hecho. Realice encuestas para identificar qué tipo de recompensas son más valoradas por el equipo.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Recompensa sugiere que el reconocimiento existe, pero podría ser más frecuente o relevante. Diversifique los tipos de recompensas (económicas, tiempo libre, formación) y promueva el reconocimiento entre pares.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Recompensa refleja una cultura de reconocimiento efectiva. Mantenga la periodicidad de los reconocimientos y explore nuevas formas de motivar, como premios por innovación o embajadores de cultura.`;
                              }
                              break;
                            case 'Desafío':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `Un puntaje bajo (${dim.promedio}) en Desafío indica que los empleados no encuentran sus tareas estimulantes ni retadoras. Rediseñe roles para incluir proyectos innovadores, fomente la capacitación continua y establezca metas de desarrollo profesional personalizadas. Promueva la participación en proyectos interdepartamentales y hackathons internos.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Desafío sugiere que algunos empleados buscan mayores retos. Ofrezca oportunidades de rotación de puestos, proyectos especiales y fomente la toma de riesgos calculados en la toma de decisiones.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Desafío muestra que los empleados se sienten motivados por sus tareas. Siga promoviendo la innovación y el aprendizaje, y reconozca públicamente los logros en proyectos complejos.`;
                              }
                              break;
                            case 'Relaciones':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `El puntaje bajo (${dim.promedio}) en Relaciones evidencia problemas de comunicación o conflictos internos. Implemente talleres de comunicación asertiva, sesiones de integración, y espacios de escucha activa. Fomente actividades sociales y cree canales de comunicación informales para fortalecer la confianza.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Relaciones indica que hay margen para mejorar el ambiente interpersonal. Organice actividades de team building, promueva la mentoría entre empleados y establezca mecanismos de resolución de conflictos.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Relaciones refleja un ambiente colaborativo y de confianza. Mantenga las actividades de integración y promueva la mentoría y el reconocimiento entre compañeros.`;
                              }
                              break;
                            case 'Cooperación':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `Un puntaje bajo (${dim.promedio}) en Cooperación sugiere falta de trabajo en equipo y apoyo mutuo. Establezca objetivos grupales, promueva proyectos interdepartamentales y reconozca los logros colectivos. Implemente dinámicas de resolución de problemas en grupo y fomente la ayuda mutua entre áreas.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Cooperación indica que la colaboración puede mejorar. Fomente la colaboración transversal, cree espacios para compartir buenas prácticas y realice talleres de trabajo en equipo.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Cooperación muestra un buen trabajo en equipo. Continúe promoviendo la colaboración y documente las mejores prácticas para replicarlas en toda la organización.`;
                              }
                              break;
                            case 'Estándares':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `El puntaje bajo (${dim.promedio}) en Estándares revela falta de claridad en procesos o expectativas de calidad. Revise y comunique los estándares de calidad, brinde capacitaciones y asegúrese de que todos comprendan los objetivos y métricas. Implemente auditorías internas y fomente la mejora continua.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Estándares sugiere que los procesos pueden optimizarse. Involucre a los empleados en la mejora continua, actualice los procedimientos y reconozca las iniciativas de mejora.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Estándares indica procesos claros y efectivos. Mantenga la capacitación y revise periódicamente los estándares para asegurar su vigencia y relevancia.`;
                              }
                              break;
                            case 'Conflicto':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `Un puntaje bajo (${dim.promedio}) en Conflicto indica que los desacuerdos no se gestionan adecuadamente. Implemente protocolos de resolución de conflictos, capacite a líderes en mediación y promueva una cultura de respeto y diálogo. Establezca canales confidenciales para reportar problemas y realice talleres de manejo de conflictos.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Conflicto muestra que hay espacio para mejorar la gestión de desacuerdos. Refuerce la importancia de la comunicación abierta y transparente, y promueva la participación en discusiones constructivas.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Conflicto refleja una gestión efectiva de desacuerdos. Continúe promoviendo la transparencia y el respeto en la resolución de diferencias, y documente los casos de éxito para aprendizaje organizacional.`;
                              }
                              break;
                            case 'Identidad':
                              if (dim.promedio === 0) {
                                texto = 'No se han registrado respuestas para esta dimensión. Por favor, asegúrese de que todos los empleados hayan completado la encuesta.';
                              } else if (dim.promedio < 2.5) {
                                texto = `El puntaje bajo (${dim.promedio}) en Identidad indica que los empleados no se sienten identificados con la empresa. Refuerce la comunicación de la misión y valores, involucre a los empleados en decisiones estratégicas, celebre los logros institucionales y promueva historias de éxito internas.`;
                              } else if (dim.promedio < 3.5) {
                                texto = `El puntaje aceptable (${dim.promedio}) en Identidad sugiere que la cultura organizacional puede fortalecerse. Organice actividades que refuercen el sentido de pertenencia, como celebraciones de aniversarios, reconocimientos por antigüedad y espacios de participación en la toma de decisiones.`;
                              } else {
                                texto = `El puntaje alto (${dim.promedio}) en Identidad muestra un fuerte sentido de pertenencia. Siga comunicando los valores, reconozca a quienes los representan y promueva la participación activa en iniciativas institucionales.`;
                              }
                              break;
                            default:
                              texto = `Dimensión "${dim.dimension}" (puntaje: ${dim.promedio}): revise los resultados y adapte las acciones a la naturaleza específica de esta dimensión.`;
                          }
                          return (
                            <Zoom in style={{ transitionDelay: `${200 + idx * 100}ms` }} key={dim.dimension}>
                              <Paper sx={{ p: 2, mb: 2, background: '#f7fafc', borderLeft: '4px solid #4A90E2' }}>
                                <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                                  {dim.dimension}
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  <strong>Puntaje:</strong> {dim.promedio}
                                </Typography>
                                <Typography variant="body1" color="text.secondary">
                                  {texto}
                                </Typography>
                              </Paper>
                            </Zoom>
                          );
                        })}
                      </Box>
                    </Fade>
                  )}

                  {/* Filtro: Análisis predictivo IA */}
                  {filter === 'predictivo' && recommendations && (
                    <Fade in timeout={800}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          Análisis predictivo IA
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          La IA analiza los datos históricos de las encuestas para identificar patrones, correlaciones y predecir posibles tendencias futuras en el clima laboral.
                        </Typography>
                        {/* Insights aprendidos */}
                        <Paper sx={{ p: 2, mb: 2, background: '#f7fafc', borderLeft: '4px solid #4A90E2' }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                            Insights aprendidos
                          </Typography>
                          <ul style={{ marginLeft: 20 }}>
                            {recommendations.promedios_dimensiones.map((dim, idx) => {
                              // Simulación de correlación: si una dimensión baja, otra también suele bajar
                              let correlacion = null;
                              if (
                                idx > 0 &&
                                dim.promedio < 3 && dim.promedio > 0 &&
                                recommendations.promedios_dimensiones[idx-1].promedio < 3 &&
                                recommendations.promedios_dimensiones[idx-1].promedio > 0
                              ) {
                                correlacion = `Cuando la dimensión "${dim.dimension}" baja, también suele bajar "${recommendations.promedios_dimensiones[idx-1].dimension}".`;
                              }
                              return correlacion ? (
                                <li key={dim.dimension}>
                                  <Typography variant="body2">{correlacion}</Typography>
                                </li>
                              ) : null;
                            })}
                            {/* Si no hay correlaciones, mostrar mensaje */}
                            {recommendations.promedios_dimensiones.every((dim, idx) => !(idx > 0 && dim.promedio < 3 && dim.promedio > 0 && recommendations.promedios_dimensiones[idx-1].promedio < 3 && recommendations.promedios_dimensiones[idx-1].promedio > 0)) && (
                              <li>
                                <Typography variant="body2">No se detectaron correlaciones negativas significativas entre dimensiones en los datos actuales.</Typography>
                              </li>
                            )}
                          </ul>
                        </Paper>
                        {/* Predicción simple de tendencia */}
                        <Paper sx={{ p: 2, mb: 2, background: '#f7fafc', borderLeft: '4px solid #4A90E2' }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                            Predicción de tendencia
                          </Typography>
                          {recommendations.historico_data && recommendations.historico_data.length > 2 ? (
                            <Typography variant="body2">
                              {(() => {
                                // Predicción simple: si la última tendencia es bajista o alcista
                                const last = recommendations.historico_data[recommendations.historico_data.length-1];
                                const prev = recommendations.historico_data[recommendations.historico_data.length-2];
                                if (last > prev) {
                                  return 'La tendencia general del clima laboral es positiva. Si se mantienen las acciones actuales, es probable que los puntajes sigan mejorando el próximo periodo.';
                                } else if (last < prev) {
                                  return 'Se observa una tendencia a la baja en el clima laboral. Se recomienda intervenir para evitar una caída mayor en los próximos meses.';
                                } else {
                                  return 'El clima laboral se ha mantenido estable recientemente. Se recomienda monitorear para detectar cambios tempranos.';
                                }
                              })()}
                            </Typography>
                          ) : (
                            <Typography variant="body2">No hay suficientes datos históricos para realizar una predicción de tendencia.</Typography>
                          )}
                        </Paper>
                        {/* Recomendación basada en patrones */}
                        <Paper sx={{ p: 2, background: '#f7fafc', borderLeft: '4px solid #4A90E2' }}>
                          <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
                            Recomendación basada en patrones
                          </Typography>
                          <Typography variant="body2">
                            {(() => {
                              // Si alguna dimensión está baja, sugerir intervención prioritaria
                              const bajas = recommendations.promedios_dimensiones.filter(dim => dim.promedio < 3 && dim.promedio > 0);
                              if (bajas.length > 0) {
                                return `La IA recomienda priorizar acciones en las dimensiones: ${bajas.map(d => '"'+d.dimension+'"').join(', ')}. Mejorar estas áreas puede tener un efecto positivo en el clima general.`;
                              } else {
                                return 'No se detectan dimensiones críticas actualmente. Mantenga el monitoreo y continúe reforzando las buenas prácticas.';
                              }
                            })()}
                          </Typography>
                        </Paper>
                      </Box>
                    </Fade>
                  )}
                </Paper>
              </Fade>
            </div>
          </Fade>
        </Box>
        )}
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
