import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Fade,
  Zoom,
  Paper,
  LinearProgress,
  Chip,
  Stack,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Line, Bar } from "react-chartjs-2";
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
} from "chart.js";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../api";
import { BusinessContext } from "../context/BusinessContext";
import Loader from "../components/Loader";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
);

function AnimatedNumber({
  value,
  duration = 1000,
  suffix = "",
  decimals = 0,
  ...props
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = 0;
    const numericValue = Number(value) || 0;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setDisplay(progress * numericValue);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplay(numericValue);
      }
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span {...props}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function KpiCard({
  label,
  value,
  color,
  subtitle,
  suffix = "",
  decimals = 0,
  animated = true,
}) {
  return (
    <Card
      sx={{
        background: "#fff",
        borderRadius: 3,
        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
        height: "100%",
      }}
    >
      <CardContent>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h4" sx={{ color, fontWeight: 700, mb: 1 }}>
          {animated ? (
            <AnimatedNumber value={value} suffix={suffix} decimals={decimals} />
          ) : (
            `${Number(value || 0).toFixed(decimals)}${suffix}`
          )}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: "#666" }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyChartState({ message }) {
  return (
    <Box
      sx={{
        minHeight: 260,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 2,
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}

export default function BusinessDashboard() {
  const { businessData, loading } = useContext(BusinessContext);
  const [stats, setStats] = useState({
    total_empleados: 0,
    empleados_que_respondieron: 0,
    total_respuestas: 0,
    promedio_general: 0,
  });
  const [recommendations, setRecommendations] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const empresaId = businessData?.id;
        if (!empresaId) return;

        setDashboardLoading(true);

        const [statsResponse, recommendationsResponse] = await Promise.all([
          api.get(`api/survey/statistics/${empresaId}/`),
          api.get("api/survey/recommendations/"),
        ]);

        setStats(statsResponse.data);
        setRecommendations(recommendationsResponse.data);
      } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
      } finally {
        setDashboardLoading(false);
      }
    };

    if (businessData?.id) {
      fetchDashboardData();
    }
  }, [businessData]);

  useEffect(() => {
    const handleNav = () => {
      setShowLoader(true);
      setTimeout(() => setShowLoader(false), 1000);
    };
    window.addEventListener("dashboard-nav", handleNav);
    return () => window.removeEventListener("dashboard-nav", handleNav);
  }, []);

  const participationRate = useMemo(() => {
    if (!stats.total_empleados) return 0;
    return (stats.empleados_que_respondieron / stats.total_empleados) * 100;
  }, [stats]);

  const criticalDimension = useMemo(() => {
    const dimensions = recommendations?.promedios_dimensiones || [];
    if (!dimensions.length) return null;
    return [...dimensions].sort((a, b) => a.promedio - b.promedio)[0];
  }, [recommendations]);

  const topLowDimensions = useMemo(() => {
    const dimensions = recommendations?.promedios_dimensiones || [];
    return [...dimensions].sort((a, b) => a.promedio - b.promedio).slice(0, 3);
  }, [recommendations]);

  const lineData = useMemo(() => {
    if (!recommendations?.historico_labels?.length) return null;
    return {
      labels: recommendations.historico_labels,
      datasets: [
        {
          label: "Promedio General",
          data: recommendations.historico_data,
          fill: false,
          borderColor: "#4A90E2",
          backgroundColor: "#4A90E2",
          tension: 0.3,
        },
      ],
    };
  }, [recommendations]);

  const barData = useMemo(() => {
    if (!recommendations?.promedios_dimensiones?.length) return null;
    return {
      labels: recommendations.promedios_dimensiones.map(
        (item) => item.dimension,
      ),
      datasets: [
        {
          label: "Puntaje por dimensión",
          data: recommendations.promedios_dimensiones.map(
            (item) => item.promedio,
          ),
          backgroundColor: [
            "#4A90E2",
            "#9013FE",
            "#FF6F61",
            "#50E3C2",
            "#FFA500",
            "#5C6BC0",
          ],
          borderRadius: 8,
        },
      ],
    };
  }, [recommendations]);

  const executiveSummary = useMemo(() => {
    if (!recommendations) {
      return "Aún no hay suficientes datos para construir el resumen ejecutivo del clima laboral.";
    }

    const generalAverage = Number(recommendations.promedio_general || 0);
    const criticalLabel = criticalDimension
      ? `${criticalDimension.dimension} (${Number(criticalDimension.promedio).toFixed(2)})`
      : "sin datos suficientes";

    if (generalAverage === 0) {
      return `Todavía no hay respuestas suficientes para evaluar el clima laboral. La dimensión crítica actual es ${criticalLabel}.`;
    }

    if (generalAverage < 2.5) {
      return `El clima laboral presenta una señal de alerta. La participación actual es de ${participationRate.toFixed(1)}% y la dimensión más crítica es ${criticalLabel}. Conviene priorizar acciones correctivas inmediatas.`;
    }

    if (generalAverage < 3.5) {
      return `El clima laboral es aceptable, pero mejorable. La participación actual es de ${participationRate.toFixed(1)}% y la dimensión con mayor atención requerida es ${criticalLabel}.`;
    }

    return `El clima laboral muestra un resultado positivo. La participación actual es de ${participationRate.toFixed(1)}% y la dimensión con menor puntaje es ${criticalLabel}, por lo que aún hay oportunidades de mejora focalizadas.`;
  }, [recommendations, criticalDimension, participationRate]);

  const isLoading = loading || showLoader || dashboardLoading;

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, background: "#F4F6F8", overflowY: "auto" }}>
          <Navbar businessImg={businessData?.img} />
          <Loader />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: "calc(100% - 60px)",
            sm: "calc(100% - 80px)",
            md: "calc(100% - 100px)",
          },
          background: "#F4F6F8",
          overflowY: "auto",
          ml: 0,
        }}
      >
        <Navbar businessImg={businessData?.img} />
        <Box sx={{ p: 3, pt: 10, maxWidth: 1280, margin: "0 auto" }}>
          <Fade in timeout={700}>
            <Card
              sx={{
                mb: 3,
                background: "#fff",
                borderRadius: 3,
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                padding: 3,
              }}
            >
              <CardContent>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  justifyContent="space-between"
                  alignItems={{ xs: "flex-start", md: "center" }}
                  spacing={2}
                >
                  <Box>
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{ fontWeight: "bold", color: "#333" }}
                    >
                      Panel ejecutivo de clima laboral
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ color: "#666", lineHeight: 1.6, maxWidth: 900 }}
                    >
                      Revisa el estado general de tu empresa, identifica las
                      dimensiones más críticas y detecta oportunidades de mejora
                      desde una sola vista.
                    </Typography>
                  </Box>
                  <Chip
                    label={`Empresa: ${businessData?.name || "Sin nombre"}`}
                    sx={{
                      background: "#EAF2FF",
                      color: "#1F4E79",
                      fontWeight: 600,
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Fade>

          <Grid container spacing={3} sx={{ mb: 1 }}>
            {[
              {
                label: "Empleados Registrados",
                color: "#50E3C2",
                value: stats.total_empleados,
                subtitle: "Base total de colaboradores cargados en el sistema",
                decimals: 0,
              },
              {
                label: "Empleados Participantes",
                color: "#FF6F61",
                value: stats.empleados_que_respondieron,
                subtitle: "Personas que ya respondieron al menos una encuesta",
                decimals: 0,
              },
              {
                label: "Tasa de Participación",
                color: "#4A90E2",
                value: participationRate,
                subtitle: "Nivel de participación sobre el total de empleados",
                suffix: "%",
                decimals: 1,
              },
              {
                label: "Respuestas Totales",
                color: "#9013FE",
                value: stats.total_respuestas,
                subtitle: "Cantidad total de respuestas registradas",
                decimals: 0,
              },
              {
                label: "Promedio General",
                color: "#FFA500",
                value: stats.promedio_general,
                subtitle: "Promedio global del clima laboral en escala 1 a 5",
                decimals: 2,
              },
            ].map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={item.label}>
                <Zoom in style={{ transitionDelay: `${200 + idx * 120}ms` }}>
                  <Box sx={{ height: "100%" }}>
                    <KpiCard {...item} />
                  </Box>
                </Zoom>
              </Grid>
            ))}

            <Grid item xs={12} sm={6} md={4} lg={2.4}>
              <Zoom in style={{ transitionDelay: "850ms" }}>
                <Card
                  sx={{
                    background: "#fff",
                    borderRadius: 3,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
                    height: "100%",
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" color="textSecondary" gutterBottom>
                      Dimensión Crítica
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ color: "#D32F2F", fontWeight: 700, mb: 1 }}
                    >
                      {criticalDimension
                        ? criticalDimension.dimension
                        : "Sin datos"}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "#666", mb: 1 }}>
                      {criticalDimension
                        ? `Puntaje: ${Number(criticalDimension.promedio).toFixed(2)}/5`
                        : "Todavía no hay respuestas para evaluarla."}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        criticalDimension &&
                        Number(criticalDimension.promedio) < 2.5
                          ? "Atención inmediata"
                          : "Seguimiento"
                      }
                      sx={{
                        background:
                          criticalDimension &&
                          Number(criticalDimension.promedio) < 2.5
                            ? "#FDECEA"
                            : "#FFF4E5",
                        color:
                          criticalDimension &&
                          Number(criticalDimension.promedio) < 2.5
                            ? "#D32F2F"
                            : "#B26A00",
                        fontWeight: 600,
                      }}
                    />
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Fade in timeout={850}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
                    height: "100%",
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Resumen ejecutivo
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ color: "#555", lineHeight: 1.7, mb: 3 }}
                  >
                    {executiveSummary}
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1 }}
                  >
                    Participación actual
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(participationRate, 100)}
                    sx={{
                      height: 10,
                      borderRadius: 10,
                      mb: 1,
                      backgroundColor: "#E5EAF2",
                      "& .MuiLinearProgress-bar": {
                        backgroundColor:
                          participationRate >= 70
                            ? "#50E3C2"
                            : participationRate >= 40
                              ? "#FFA500"
                              : "#FF6F61",
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {participationRate.toFixed(1)}% de empleados han
                    participado.
                  </Typography>

                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    sx={{ mb: 1.5 }}
                  >
                    Prioridades inmediatas
                  </Typography>
                  <Stack spacing={1.5}>
                    {topLowDimensions.length > 0 ? (
                      topLowDimensions.map((dimension, index) => (
                        <Box
                          key={dimension.dimension}
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            background: index === 0 ? "#FDECEA" : "#F8F9FB",
                            borderLeft:
                              index === 0
                                ? "4px solid #D32F2F"
                                : "4px solid #4A90E2",
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {index + 1}. {dimension.dimension}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Puntaje actual:{" "}
                            {Number(dimension.promedio).toFixed(2)}/5
                          </Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Aún no hay suficientes respuestas para priorizar
                        dimensiones.
                      </Typography>
                    )}
                  </Stack>
                </Paper>
              </Fade>
            </Grid>

            <Grid item xs={12} md={8}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Fade in timeout={950}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Evolución histórica del clima laboral
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Observa si el promedio general mejora o empeora con el
                        paso del tiempo.
                      </Typography>
                      {lineData ? (
                        <Box sx={{ minHeight: 280 }}>
                          <Line
                            data={lineData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: true, position: "top" },
                              },
                              scales: {
                                y: { min: 0, max: 5, ticks: { stepSize: 1 } },
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        <EmptyChartState message="Todavía no hay histórico suficiente para mostrar esta gráfica." />
                      )}
                    </Paper>
                  </Fade>
                </Grid>

                <Grid item xs={12}>
                  <Fade in timeout={1050}>
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)",
                      }}
                    >
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Comparación de dimensiones
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 2 }}
                      >
                        Identifica rápidamente qué dimensiones tienen mejor y
                        peor desempeño dentro de tu empresa.
                      </Typography>
                      {barData ? (
                        <Box sx={{ minHeight: 320 }}>
                          <Bar
                            data={barData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: { legend: { display: false } },
                              scales: {
                                y: { min: 0, max: 5, ticks: { stepSize: 1 } },
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        <EmptyChartState message="Todavía no hay resultados por dimensión para construir esta comparación." />
                      )}
                    </Paper>
                  </Fade>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Acciones Rápidas
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    background: "#4A90E2",
                    color: "#fff",
                    transition: "transform 0.2s",
                    "&:hover": {
                      background: "#357ABD",
                      transform: "scale(1.04)",
                    },
                  }}
                  component={Link}
                  to="/business/dashboard/employees"
                >
                  Gestionar Empleados
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    background: "#9013FE",
                    color: "#fff",
                    transition: "transform 0.2s",
                    "&:hover": {
                      background: "#6C0EB8",
                      transform: "scale(1.04)",
                    },
                  }}
                  component={Link}
                  to="/business/dashboard/reports"
                >
                  Ver Reportes Detallados
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    background: "#FF6F61",
                    color: "#fff",
                    transition: "transform 0.2s",
                    "&:hover": {
                      background: "#E0554A",
                      transform: "scale(1.04)",
                    },
                  }}
                  component={Link}
                  to="/business/dashboard/settings"
                >
                  Configuración
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
