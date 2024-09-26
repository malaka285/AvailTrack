import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, TextField, Button, Box, Grid, Avatar } from '@mui/material';
import SidebarUser from './sidebarUser'; // Import SidebarUser

const UserProfile = () => {
    const [profile, setProfile] = useState({});
    const [password, setPassword] = useState('');
    const [profilePicture, setProfilePicture] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar
    const navigate = useNavigate(); // Untuk navigasi

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get('/api/profile'); // Ambil data profil dari API
                setProfile(response.data);
                setProfilePicture(response.data.profile_picture);
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdateProfile = async () => {
        try {
            await axios.post('/api/update-profile', { 
                password, 
                profile_picture: profilePicture 
            });
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleGoHome = () => {
        navigate('/user'); // Kembali ke halaman dashboard user
    };

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <>
            {/* Integrasi SidebarUser */}
            <SidebarUser open={sidebarOpen} toggleSidebar={toggleSidebar} />

            <Container>
                {/* Header Section */}
                <Box 
                    sx={{
                        backgroundColor: '#0E4751',
                        padding: '20px',
                        color: '#FFD700',
                        textAlign: 'center',
                        borderRadius: '8px',
                        marginBottom: '40px'
                    }}
                >
                    <Typography variant="h4" sx={{ fontFamily: 'Koulen, sans-serif', letterSpacing: '2px' }}>
                        Profile
                    </Typography>
                </Box>

                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        marginTop: '40px' 
                    }}
                >
                    <Avatar 
                        src={profilePicture} 
                        alt="Profile Picture" 
                        sx={{ width: 120, height: 120, marginBottom: '20px' }} 
                    />

                    <Grid container spacing={3} style={{ maxWidth: '600px' }}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Username"
                                value={profile.username || ''}
                                InputProps={{
                                    readOnly: true, // Username hanya ditampilkan dan tidak bisa diubah
                                }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                type="password"
                                label="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Profile Picture URL"
                                value={profilePicture}
                                onChange={(e) => setProfilePicture(e.target.value)}
                                placeholder="Enter profile picture URL"
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth 
                                onClick={handleUpdateProfile}
                            >
                                Update Profile
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <Button 
                                variant="outlined" 
                                color="secondary" 
                                fullWidth 
                                onClick={handleGoHome}
                            >
                                Home
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </>
    );
};

export default UserProfile;
