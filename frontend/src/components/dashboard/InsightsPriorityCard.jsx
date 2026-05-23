import React from 'react';
import { Typography, Stack, Box, Chip } from '@mui/material';
import SectionCard from './SectionCard';

export default function InsightsPriorityCard({ criticalDimension, topLowDimensions }) {
  const criticalScore = criticalDimension ? Number(criticalDimension.promedio) : null;
  const criticalStateLabel = criticalScore !== null && criticalScore < 2.5 ? 'Atención inmediata' : 'Seguimiento';

  return (
    <SectionCard title="Alertas y prioridades">
      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1 }}>
        Dimensión crítica
      </Typography>
      {criticalDimension ? (
        <Box sx={{ p: 2, borderRadius: 2, background: '#FFF4F4', border: '1px solid #F3C7C7', mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: '#9A1B1B', mb: 0.75 }}>
            {criticalDimension.dimension}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.25 }}>
            Puntaje actual: {criticalScore.toFixed(2)}/5
          </Typography>
          <Chip
            size="small"
            label={criticalStateLabel}
            sx={{
              background: criticalScore < 2.5 ? '#FDECEA' : '#FFF4E5',
              color: criticalScore < 2.5 ? '#D32F2F' : '#B26A00',
              fontWeight: 600,
            }}
          />
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Aún no hay suficientes respuestas para identificar una dimensión crítica.
        </Typography>
      )}

      <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1.5 }}>
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
                background: index === 0 ? '#FDECEA' : '#F8F9FB',
                borderLeft: index === 0 ? '4px solid #D32F2F' : '4px solid #4A90E2',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {index + 1}. {dimension.dimension}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Puntaje actual: {Number(dimension.promedio).toFixed(2)}/5
              </Typography>
            </Box>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">
            Aún no hay suficientes respuestas para priorizar dimensiones.
          </Typography>
        )}
      </Stack>
    </SectionCard>
  );
}
