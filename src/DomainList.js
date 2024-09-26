import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, CardActions, Button, CircularProgress, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarAdmin from './sidebarAdmin'; // Import SidebarAdmin

const DomainList = () => {
    const [domains, setDomains] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false); // State for sidebar

    const navigate = useNavigate();

    const fetchDomains = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/domains', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setDomains(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching domains:', error);
            setError('Failed to fetch domains. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDomains();
    }, []);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <Container>
            {/* Sidebar Admin */}
            <SidebarAdmin open={sidebarOpen} toggleSidebar={toggleSidebar} />

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
                    DAFTAR DOMAIN
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'Arial', color: '#fff' }}>
                    Monitor your domain
                </Typography>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" mt={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Typography color="error" align="center" mt={4}>
                    {error}
                </Typography>
            ) : (
                <Grid container spacing={3}>
                    {domains.length > 0 ? (
                        domains.map((domain) => (
                            <Grid item xs={12} sm={6} md={4} key={domain.id}>
                                <Card 
                                    sx={{ 
                                        borderRadius: '12px', 
                                        boxShadow: '0 4px 10px rgba(0,0,0,0.1)', 
                                        textAlign: 'center', 
                                        overflow: 'hidden',
                                        transition: 'transform 0.3s ease-in-out',
                                        '&:hover': { transform: 'scale(1.05)' }
                                    }}
                                >
                                    <CardContent 
                                        sx={{
                                            backgroundColor: '#004d00',
                                            color: 'white',
                                            padding: '15px',
                                        }}
                                    >
                                        <Typography variant="h6" sx={{ fontFamily: 'Arial', fontWeight: 'bold' }}>
                                            {domain.domain_name || 'Nama Domain'}
                                        </Typography>
                                    </CardContent>
                                    <CardContent>
                                        <Typography variant="body2" color="textSecondary">
                                            ID: {domain.id}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            Created At: {new Date(domain.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                            User: {domain.username || 'admin123'}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button 
                                            size="small" 
                                            variant="contained" 
                                            sx={{ 
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                                backgroundColor: '#0E4751',
                                                color: '#FFD700',
                                                borderRadius: '20px',
                                                marginBottom: '10px',
                                                '&:hover': { backgroundColor: '#004d00' }
                                            }} 
                                            onClick={() => navigate(`/domain/${domain.id}`)}
                                        >
                                            View Details
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        <Typography variant="body1" align="center" mt={4}>
                            No domains available.
                        </Typography>
                    )}
                </Grid>
            )}
        </Container>
    );
};

export default DomainList;
