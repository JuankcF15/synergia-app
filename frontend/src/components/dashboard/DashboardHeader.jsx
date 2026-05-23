import React from "react";
import { Typography, Stack, Box, Chip } from "@mui/material";

export default function DashboardHeader({ businessName, actions }) {
  return (
    <Box sx={{ mb: 4, mt: 1 }}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ mb: 0.5 }}
          >
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#121926" }}>
              Dashboard Ejecutivo
            </Typography>
            <Chip
              label={businessName || "Empresa"}
              size="small"
              sx={{
                background: "#F0F4F8",
                color: "#0B6BCB",
                fontWeight: 600,
                borderRadius: 1.5,
              }}
            />
          </Stack>
          <Typography variant="body2" sx={{ color: "#4B5565" }}>
            Revisa el estado general del clima laboral y detecta oportunidades
            de mejora.
          </Typography>
        </Box>
        {actions && (
          <Stack direction="row" spacing={1.5} alignItems="center">
            {actions}
          </Stack>
        )}
      </Stack>
    </Box>
  );
}
