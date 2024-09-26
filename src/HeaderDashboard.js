import React from 'react';
import { Box, Typography } from '@mui/material';

const DashboardHeader = () => {
  return (
    <Box 
      sx={{
        backgroundColor: '#0E4751', // Sesuaikan dengan warna header di gambar
        padding: '20px',
        width: '100%', // Full width dari kiri ke kanan
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        borderBottom: '2px solid #FFC107', // Warna kuning sebagai garis bawah atau aksen
        position: 'relative',
        left: 0,
        right: 0,
      }}
    >
      <Typography 
        variant="h4" 
        sx={{ 
          color: '#FFC107', // Warna kuning untuk teks DASHBOARD
          fontWeight: 'bold',
          letterSpacing: '5px', // Memberikan jarak antar huruf
          textAlign: 'center'
        }}
      >
        DASHBOARD
      </Typography>
      <Typography 
        variant="subtitle1" 
        sx={{ 
          color: '#ffffff', // Warna putih untuk teks selamat datang
          marginTop: '10px'
        }}
      >
        Welcome to dashboard
      </Typography>
    </Box>
  );
}

export default DashboardHeader;
