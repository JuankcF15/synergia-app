import React, { useEffect, useState, useContext, useMemo } from "react";
import {
  Box,
  Typography,
  Grid,
  Button,
  Fade,
  Zoom,
  Paper,
  Divider,
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
import SectionCard, {
  EmptyChartState,
} from "../components/dashboard/SectionCard";
import ExecutiveSummaryCard from "../components/dashboard/ExecutiveSummaryCard";
import InsightsPriorityCard from "../components/dashboard/InsightsPriorityCard";
import PeriodFilter from "../components/dashboard/PeriodFilter";

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
  const [selectedPeriod, setSelectedPeriod] = useState("6");

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

  const historicalSeries = useMemo(() => {
    const labels = recommendations?.historico_labels || [];
    const data = recommendations?.historico_data || [];

    if (!labels.length || !data.length) return { labels: [], data: [] };

    if (selectedPeriod === "all") {
      return { labels, data };
    }

    const count = Number(selectedPeriod);
    return {
      labels: labels.slice(-count),
      data: data.slice(-count),
    };
  }, [recommendations, selectedPeriod]);

  const lineData = useMemo(() => {
    if (!historicalSeries.labels.length) return null;
    return {
      labels: historicalSeries.labels,
      datasets: [
        {
          label: "Promedio General",
          data: historicalSeries.data,
          fill: true,
          borderColor: "#3B82F6",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 4,
        },
      ],
    };
  }, [historicalSeries]);

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
          backgroundColor: "#3B82F6",
          borderRadius: 4,
          barThickness: 32,
        },
      ],
    };
  }, [recommendations]);

  const topLowBarData = useMemo(() => {
    if (!topLowDimensions.length) return null;
    return {
      labels: topLowDimensions.map((item) => item.dimension),
      datasets: [
        {
          label: "Dimensiones con menor puntaje",
          data: topLowDimensions.map((item) => item.promedio),
          backgroundColor: "#EF4444",
          borderRadius: 4,
          barThickness: 24,
        },
      ],
    };
  }, [topLowDimensions]);

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
        <Box
          sx={{ p: 3, pt: 10, maxWidth: 1280, margin: "0 auto", width: "100%" }}
        >
          <Fade in timeout={700}>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                mb: 4,
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    color: "#111827",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Panel Ejecutivo
                </Typography>
                <Typography variant="body1" sx={{ color: "#6B7280", mt: 0.5 }}>
                  Visión general del clima laboral en{" "}
                  {businessData?.name || "tu empresa"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/business/dashboard/employees"
                  sx={{
                    color: "#374151",
                    borderColor: "#D1D5DB",
                    textTransform: "none",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#F3F4F6",
                      borderColor: "#D1D5DB",
                    },
                  }}
                >
                  Empleados
                </Button>
                <Button
                  variant="contained"
                  component={Link}
                  to="/business/dashboard/reports"
                  sx={{
                    background: "#111827",
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 600,
                    boxShadow: "none",
                    "&:hover": { background: "#374151", boxShadow: "none" },
                  }}
                >
                  Reporte Completo
                </Button>
              </Box>
            </Box>
          </Fade>

          {/* CINTA DE ESTADÍSTICAS (Stats Strip) */}
          <Fade in timeout={800}>
            <Paper
              elevation={0}
              sx={{
                mb: 4,
                p: 0,
                borderRadius: 3,
                border: "1px solid #E5EAF2",
                background: "#ffffff",
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                overflow: "hidden",
              }}
            >
              {[
                {
                  label: "Empleados Base",
                  value: stats.total_empleados,
                  decimals: 0,
                },
                {
                  label: "Participantes",
                  value: stats.empleados_que_respondieron,
                  decimals: 0,
                },
                {
                  label: "Participación",
                  value: participationRate,
                  suffix: "%",
                  decimals: 1,
                },
                {
                  label: "Respuestas",
                  value: stats.total_respuestas,
                  decimals: 0,
                },
                {
                  label: "Clima Global",
                  value: stats.promedio_general,
                  decimals: 2,
                  color:
                    stats.promedio_general >= 3.5
                      ? "#10B981"
                      : stats.promedio_general >= 2.5
                        ? "#F59E0B"
                        : "#EF4444",
                },
              ].map((item, idx, arr) => (
                <React.Fragment key={item.label}>
                  <Box
                    sx={{
                      flex: 1,
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: { xs: "flex-start", md: "center" },
                      textAlign: { xs: "left", md: "center" },
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: "#64748B",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        fontSize: "0.75rem",
                        mb: 1,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{ color: item.color || "#0F172A", fontWeight: 800 }}
                    >
                      {Number(item.value || 0).toFixed(item.decimals)}
                      {item.suffix || ""}
                    </Typography>
                  </Box>
                  {idx < arr.length - 1 && (
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{
                        display: { xs: "none", md: "block" },
                        borderColor: "#E5EAF2",
                      }}
                    />
                  )}
                  {idx < arr.length - 1 && (
                    <Divider
                      orientation="horizontal"
                      flexItem
                      sx={{
                        display: { xs: "block", md: "none" },
                        borderColor: "#E5EAF2",
                      }}
                    />
                  )}
                </React.Fragment>
              ))}
            </Paper>
          </Fade>

          {/* LAYOUT PRINCIPAL 8/4 */}
          <Grid container spacing={3}>
            {/* LADO IZQUIERDO (8) - Gráficas Principales */}
            <Grid item xs={12} sm={7} md={7} lg={8}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", md: "row" },
                  gap: 3,
                }}
              >
                {/* Gráfica de Evolución */}
                <Box sx={{ flex: 1 }}>
                  <Fade in timeout={1000}>
                    <Box>
                      <SectionCard
                        title="Evolución del Clima Laboral"
                        subtitle="Tendencia del promedio general en el tiempo"
                        action={
                          <PeriodFilter
                            value={selectedPeriod}
                            onChange={setSelectedPeriod}
                          />
                        }
                      >
                        {lineData ? (
                          <Box sx={{ height: 350, mt: 2 }}>
                            <Line
                              data={lineData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: { display: false },
                                  tooltip: {
                                    backgroundColor: "#111827",
                                    padding: 12,
                                    titleFont: { size: 13 },
                                    bodyFont: { size: 14, weight: "bold" },
                                    displayColors: false,
                                  },
                                },
                                scales: {
                                  y: {
                                    min: 0,
                                    max: 5,
                                    ticks: { stepSize: 1, color: "#64748B" },
                                    grid: {
                                      color: "#F1F5F9",
                                      drawBorder: false,
                                    },
                                  },
                                  x: {
                                    ticks: { color: "#64748B" },
                                    grid: { display: false, drawBorder: false },
                                  },
                                },
                                interaction: {
                                  intersect: false,
                                  mode: "index",
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <EmptyChartState
                            message="Todavía no hay histórico suficiente."
                            minHeight={350}
                          />
                        )}
                      </SectionCard>
                    </Box>
                  </Fade>
                </Box>

                {/* Gráfica de Desempeño */}
                <Box sx={{ flex: 1 }}>
                  <Fade in timeout={1100}>
                    <Box>
                      <SectionCard
                        title="Desempeño por Dimensión"
                        subtitle="Comparativa de todas las áreas evaluadas"
                      >
                        {barData ? (
                          <Box sx={{ height: 350, mt: 2 }}>
                            <Bar
                              data={barData}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                  legend: { display: false },
                                  tooltip: {
                                    backgroundColor: "#111827",
                                    padding: 12,
                                    displayColors: false,
                                  },
                                },
                                scales: {
                                  y: {
                                    min: 0,
                                    max: 5,
                                    ticks: { stepSize: 1, color: "#64748B" },
                                    grid: { color: "#F1F5F9" },
                                    border: { display: false },
                                  },
                                  x: {
                                    ticks: { color: "#64748B" },
                                    grid: { display: false },
                                    border: { display: false },
                                  },
                                },
                              }}
                            />
                          </Box>
                        ) : (
                          <EmptyChartState
                            message="Faltan datos para construir la comparativa."
                            minHeight={350}
                          />
                        )}
                      </SectionCard>
                    </Box>
                  </Fade>
                </Box>
              </Box>
            </Grid>

            {/* LADO DERECHO (4) - Lateral (Sidebar) de Insights */}
            <Grid item xs={12} sm={5} md={5} lg={4}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                }}
              >
                <Fade in timeout={1200}>
                  <Box>
                    <ExecutiveSummaryCard
                      summary={executiveSummary}
                      participationRate={participationRate}
                    />
                  </Box>
                </Fade>

                <Fade in timeout={1300}>
                  <Box>
                    <InsightsPriorityCard
                      criticalDimension={criticalDimension}
                      topLowDimensions={topLowDimensions}
                    />
                  </Box>
                </Fade>

                <Fade in timeout={1400}>
                  <Box>
                    <SectionCard
                      title="Top 3 Áreas Críticas"
                      subtitle="Atender con prioridad"
                    >
                      {topLowBarData ? (
                        <Box sx={{ height: 260, mt: 2 }}>
                          <Bar
                            data={topLowBarData}
                            options={{
                              indexAxis: "y",
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: { display: false },
                                tooltip: {
                                  backgroundColor: "#111827",
                                  padding: 12,
                                  displayColors: false,
                                },
                              },
                              scales: {
                                x: {
                                  min: 0,
                                  max: 5,
                                  ticks: { stepSize: 1, color: "#64748B" },
                                  grid: { color: "#F1F5F9" },
                                  border: { display: false },
                                },
                                y: {
                                  ticks: {
                                    color: "#64748B",
                                    font: { weight: "600" },
                                  },
                                  grid: { display: false },
                                  border: { display: false },
                                },
                              },
                            }}
                          />
                        </Box>
                      ) : (
                        <EmptyChartState
                          message="No hay suficientes datos."
                          minHeight={260}
                        />
                      )}
                    </SectionCard>
                  </Box>
                </Fade>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
