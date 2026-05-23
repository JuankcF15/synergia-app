import React from "react";
import { Typography, LinearProgress } from "@mui/material";
import SectionCard from "./SectionCard";

export default function ExecutiveSummaryCard({ summary, participationRate }) {
  return (
    <SectionCard title="Resumen ejecutivo">
      <Typography
        variant="body1"
        sx={{ color: "#555", lineHeight: 1.7, mb: 3 }}
      >
        {summary}
      </Typography>

      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
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
      <Typography variant="body2" color="text.secondary">
        {participationRate.toFixed(1)}% de empleados han participado.
      </Typography>
    </SectionCard>
  );
}
