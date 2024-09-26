import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Container,
    Typography,
    Paper,
} from '@mui/material';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

// Import DashboardHeader dan SidebarAdmin
import DashboardHeader from './HeaderDashboard';
import SidebarAdmin from './sidebarAdmin';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [openSidebar, setOpenSidebar] = useState(false);
    const navigate = useNavigate();

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const response = await axios.get(`http://localhost:3000/users?timestamp=${new Date().getTime()}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error.response ? error.response.data : error.message);
        }
    };

    useEffect(() => {
        fetchData();
        const intervalId = setInterval(fetchData, 2000);
        return () => clearInterval(intervalId);
    }, []);

    // Data and configuration for the bar chart
    const chartData = {
        labels: users.map(user => user.username),
        datasets: [
            {
                label: 'Jumlah Login',
                data: users.map(user => user.nlogin || 0),
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1,
            }
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
            title: {
                display: true,
                text: 'Jumlah Login per User',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <Container>
            {/* Integrasi Dashboard Header */}
            <DashboardHeader />

            {/* Sidebar dari SidebarAdmin */}
            <SidebarAdmin open={openSidebar} onClose={() => setOpenSidebar(false)} />

            {/* Bar Chart for login count */}
            <Typography variant="h5" style={{ marginTop: '40px', marginBottom: '20px' }}></Typography>
            <Paper style={{ padding: '20px' }}>
                <Bar data={chartData} options={chartOptions} />
            </Paper>
        </Container>
    );
};

export default AdminDashboard;
