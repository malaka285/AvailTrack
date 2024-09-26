import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    CircularProgress,
    Box,
    Snackbar,
    Alert,
    IconButton
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import axios from 'axios';
import SidebarAdmin from './sidebarAdmin'; // Import SidebarAdmin

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar state
    
    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:3000/users', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setUsers(response.data);
            setError('');
        } catch (error) {
            console.error('Error fetching users:', error);
            setError('Failed to fetch users. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = async () => {
        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post(
                'http://localhost:3000/admin-add-user',
                { username, password, domain },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setSuccessMessage('User added successfully!');
            setSnackbarOpen(true);
            fetchUsers();
            clearInputs();
        } catch (error) {
            console.error('Error adding user:', error);
            setError('Failed to add user. Please try again later.');
        }
    };

    const clearInputs = () => {
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setDomain('');
    };

    const handleDeleteUser = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`http://localhost:3000/users/${userId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setSuccessMessage('User deleted successfully!');
            setSnackbarOpen(true);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            setError('Failed to delete user. Please try again later.');
        }
    };

    return (
        <Container>
            {/* Sidebar Admin */}
            <SidebarAdmin open={sidebarOpen} toggleSidebar={toggleSidebar} />

            {/* Header with Menu Button */}
            <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                mb={4}
                sx={{ backgroundColor: '#0E4751', padding: 2, color: '#FFD700', borderRadius: 2 }}
            >
                <Typography variant="h4"  gutterBottom sx={{ fontFamily: 'Koulen, sans-serif', textAlign: 'center' }}>
                    USER MANAGEMENT
                </Typography>
            </Box>

            {/* Add User Form */}
            <Box mt={4}>
                <Box
                    sx={{
                        justifyContent: 'center',
                        alignitems: 'center',
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        padding: 3,
                        boxShadow: 3,
                        backgroundColor: '#0E4751',
                        color: 'white',
                        mb: 4,
                    }}
                >
                    <Typography variant="h6" gutterBottom sx={{ fontFamily: 'Koulen, sans-serif', textAlign:'center' }}>
                        Add New User
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                label="Username"
                                fullWidth
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Password"
                                type="password"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                                error={password.length > 0 && password.length < 8}
                                helperText={password.length > 0 && password.length < 8 ? 'Password must be at least 8 characters.' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Confirm Password"
                                type="password"
                                fullWidth
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                                error={confirmPassword.length > 0 && confirmPassword !== password}
                                helperText={confirmPassword.length > 0 && confirmPassword !== password ? 'Passwords do not match.' : ''}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Domain"
                                fullWidth
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                sx={{ backgroundColor: 'white', borderRadius: 1 }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Button variant="contained" align="center" sx={{backgroundColor:'#F0B905', '&:hover':{backgroundColor:'#d19f04'}, fontFamily: 'Koulen, sans-serif', borderRadius: '8px', boxShadow: 6, transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'scale(1.02)' }}} onClick={handleAddUser} fullWidth>
                                Add New User
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            {/* User List */}
            <Box mt={4}>
                <Typography variant="h5" align="center" gutterBottom sx={{ fontFamily: 'Koulen, sans-serif' }}>
                    User List
                </Typography>
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">
                        {error}
                    </Typography>
                ) : (
                    <Grid container spacing={3}>
                        {users.map((user) => (
                            <Grid item xs={12} sm={6} md={4} key={user.id}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        boxShadow: 6,
                                        borderRadius: '12px',
                                        transition: 'transform 0.2s ease-in-out',
                                        '&:hover': {
                                            transform: 'scale(1.05)',
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                                backgroundColor: '#004d00',
                                                padding: 1,
                                                borderRadius: '8px',
                                                color: 'white',
                                                fontFamily: 'Koulen',
                                            }}
                                        >
                                            {user.domain || "Nama Domain"}
                                        </Typography>
                                        <Typography variant="body2">
                                            ID: {user.id} <br />
                                            Status: {user.active ? 'Active' : 'Inactive'}<br />
                                            User: {user.username}
                                        </Typography>
                                    </CardContent>
                                    <CardActions>
                                        <Button
                                            size="small"
                                            color="secondary"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>

            {/* Snackbar for success messages */}
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert onClose={() => setSnackbarOpen(false)} severity="success" sx={{ width: '100%' }}>
                    {successMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default UserManagement;
