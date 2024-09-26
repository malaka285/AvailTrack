import React, { useState } from 'react';
import axios from 'axios';
import { Container, Typography, TextField, Button, CircularProgress, Box, Link } from '@mui/material';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        // Validasi input
        if (!username || !password) {
            toast.error('Username and password are required');
            return;
        }

        // Validasi panjang password
        if (password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            return;
        }

        setLoading(true);
        try {
            console.log('Sending login request:', { username, password }); // Debug log untuk request
            const response = await axios.post('http://localhost:3000/login', { username, password });
            
            // Log respon dari server
            console.log('Login response:', response);

            // Memeriksa apakah token diterima dari API
            if (response.data && response.data.token) {
                toast.success(response.data.message || 'Login successful');
                localStorage.setItem('token', response.data.token);
                
                // Redirect berdasarkan peran
                if (response.data.isAdmin) {
                    window.location.href = '/admin'; // Ganti dengan URL dashboard admin
                } else {
                    window.location.href = '/user'; // Ganti dengan URL dashboard user
                }
            } else {
                console.log('No token in response data');
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            console.error('Login Error:', error);
            toast.error(error.response?.data?.error || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (event) => {
        if (event.key === 'Enter') {
            handleLogin(); // Panggil fungsi login saat Enter ditekan
        }
    };

    return (
        <Container 
            maxWidth="sm" 
            sx={{
                mt: 8, 
                textAlign: 'center', 
                bgcolor: '#1c2b39', // Background gelap
                p: 4, 
                borderRadius: 2, 
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                color: '#fff',
                position: 'relative', 
                display: 'flex', 
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            {/* Simulasi Logo */}
            <Box sx={{ 
                bgcolor: '#ff0000', 
                height: 80, 
                width: 100, 
                mb: 4, 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                borderRadius: 2 
            }}>
                <Typography variant="h6" color="white">AvailTrack</Typography>
            </Box>
            
            <Typography 
                variant="h4" 
                gutterBottom
                sx={{ mb: 4 }}
            >
                LOGIN
            </Typography>

            <TextField 
                label="Username" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                fullWidth 
                margin="normal"
                sx={{ mb: 2, bgcolor: '#fff', borderRadius: 1 }}
            />
            <TextField 
                type="password" 
                label="Password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                fullWidth 
                margin="normal"
                sx={{ mb: 2, bgcolor: '#fff', borderRadius: 1 }}
                onKeyPress={handleKeyPress} // Menambahkan event listener Enter
            />

            {/* Forgot Password */}
            <Box sx={{ textAlign: 'right', width: '100%' }}>
                <Link href="#" underline="hover" sx={{ color: '#fff' }}>
                    Forgot password?
                </Link>
            </Box>

            <Box sx={{ position: 'relative', mt: 3 }}>
                <Button 
                    onClick={handleLogin} 
                    variant="contained" 
                    sx={{ 
                        bgcolor: '#ffc107', 
                        color: '#333', 
                        py: 1.5, 
                        fontSize: '16px',
                        '&:hover': { bgcolor: '#ffb300' }
                    }}
                    disabled={loading} 
                    fullWidth
                >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'LOGIN'}
                </Button>
            </Box>

            <ToastContainer />
        </Container>
    );
};

export default Login;
