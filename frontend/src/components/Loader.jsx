import React from 'react';
import { Box, CircularProgress } from '@mui/material';

export default function Loader() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        minHeight: 300,
        width: '100%',
      }}
    >
      <CircularProgress size={48} sx={{ color: '#4A90E2' }} />
    </Box>
  );
}
