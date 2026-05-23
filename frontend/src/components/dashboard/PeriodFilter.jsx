import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export const PERIOD_OPTIONS = [
  { value: '3', label: 'Últimos 3 periodos' },
  { value: '6', label: 'Últimos 6 periodos' },
  { value: '12', label: 'Últimos 12 periodos' },
  { value: 'all', label: 'Todo el histórico' },
];

export default function PeriodFilter({ value, onChange }) {
  return (
    <FormControl size="small" sx={{ minWidth: 210 }}>
      <InputLabel id="dashboard-period-label">Periodo</InputLabel>
      <Select
        labelId="dashboard-period-label"
        value={value}
        label="Periodo"
        onChange={(event) => onChange(event.target.value)}
      >
        {PERIOD_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
