import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Box,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
} from 'chart.js';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import UpdateIcon from '@mui/icons-material/Update';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi';
import BugReportIcon from '@mui/icons-material/BugReport';
import SidebarUser from './sidebarUser'; // Import SidebarUser.js
import HeaderDashboard from './HeaderDashboard'; // Import HeaderDashboard
import EmailIcon from '@mui/icons-material/Email'; // New icon for email status

// Register the components needed for chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
);

// Define theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    h3: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
    },
    h6: {
      fontSize: '1.25rem',
      fontWeight: 'medium',
    },
    body1: {
      fontSize: '1rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          transition: 'transform 0.3s ease',
          '&:hover': {
            transform: 'scale(1.05)',
          },
          borderRadius: '10px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          backgroundColor: '#243447', // Background color sesuai desain Figma
          color: '#ffffff', // Warna teks putih
        },
      },
    },
  },
});

// Dynamic style based on status
const getCardStyle = (alive, serviceActive) => ({
  backgroundColor: alive === 'Yes' && serviceActive === 'active' ? '#d4edda' : '#f8d7da',
  padding: '1rem',
});

const backgroundStyle = {
  background: '#1B1F3B', // Background dark sesuai desain Figma
  minHeight: '100vh',
  width: '100%',
  padding: '2rem',
};

function UserDashboard() {
  const [networkStatus, setNetworkStatus] = useState({});
  const [sslCert, setSslCert] = useState({});
  const [serviceStatus, setServiceStatus] = useState({});
  const [systemUpdates, setSystemUpdates] = useState({});
  const [networkAccess, setNetworkAccess] = useState({});
  const [vulnerabilityScan, setVulnerabilityScan] = useState({});
  const [uptimeData, setUptimeData] = useState({});
  const [emailServiceStatus, setEmailServiceStatus] = useState({});
  const [loadingStatus, setLoadingStatus] = useState({
    network: true,
    ssl: true,
    service: true,
    updates: true,
    access: true,
    scan: true,
    uptime: true,
    email: true, // new state for email service loading
  });
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [domains, setDomains] = useState('');
  const navigate = useNavigate();

  const sendNotificationEmail = async () => {
    try {
      const response = await emailjs.send('service_inlwaa9', 'template_uru9xro', {
        from_name: domains,
        from_email: username,
        message: 'Host tidak aktif!',
      });
      console.log('Email sent successfully!', response);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }

      const userInfoResponse = await axios.get('http://localhost:3000/user-info', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsername(userInfoResponse.data.username || 'Unknown User');
      setDomains(userInfoResponse.data.domains || 'Unknown Domain');

      const fetchPromises = [
        axios.get('http://localhost:3000/network-status', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          setNetworkStatus(res.data);
          setLoadingStatus(prev => ({ ...prev, network: false }));
        }),
        axios.get('http://localhost:3000/ssl-cert', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          setSslCert(res.data);
          setLoadingStatus(prev => ({ ...prev, ssl: false }));
        }),
        axios.get('http://localhost:3000/service-status', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          setServiceStatus(res.data);
          setLoadingStatus(prev => ({ ...prev, service: false }));
        }),
        axios.get('http://localhost:3000/system-updates', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          const cleanedUpdate = res.data.lastUpdate
            ? res.data.lastUpdate.trim().replace(/\s\s+/g, ' ')
            : 'N/A';
          setSystemUpdates({ lastUpdate: cleanedUpdate });
          setLoadingStatus(prev => ({ ...prev, updates: false }));
        }),
        axios.get('http://localhost:3000/network-access', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          setNetworkAccess(res.data);
          setLoadingStatus(prev => ({ ...prev, access: false }));
        }),
        axios.get('http://localhost:3000/vulnerability-scan', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          setVulnerabilityScan(res.data);
          setLoadingStatus(prev => ({ ...prev, scan: false }));
        }),
        axios.get('http://localhost:3000/uptime-downtime', {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          setUptimeData(res.data);
          setLoadingStatus(prev => ({ ...prev, uptime: false }));
        }),
        axios.get(`http://localhost:3000/email-service/${domains}`, {
          headers: { Authorization: `Bearer ${token}` },
        }).then(res => {
          setEmailServiceStatus(res.data);
          setLoadingStatus(prev => ({ ...prev, email: false }));
        }),
      ];

      await Promise.all(fetchPromises);
    } catch (error) {
      console.error('Error fetching data', error);
      setError('Failed to fetch data. Please try again later.');
    }
  };

  useEffect(() => {
    fetchData(); // Fetch data on initial mount

    const intervalId = setInterval(() => {
      fetchData(); // Fetch data every 60 seconds
    }, 60000); // Adjust the interval as needed

    return () => clearInterval(intervalId); // Cleanup the interval on unmount
  }, []);

  useEffect(() => {
    if (networkStatus.alive === false) {
      sendNotificationEmail();
    }
  }, [networkStatus.alive]);

  // Data for charts
  const uptimeDataChart = {
    labels: ['Uptime (seconds)', 'Downtime (seconds)'],
    datasets: [
      {
        label: 'Time (seconds)',
        data: [
          uptimeData.uptime || 0,
          uptimeData.downtime || 0,
        ],
        borderColor: '#ffffff', // Sesuaikan dengan warna desain
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        borderWidth: 2,
        pointBackgroundColor: '#FFD700', // Warna poin di chart
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff', // Warna putih untuk legend
        },
      },
      title: {
        display: true,
        text: 'Uptime and Downtime Chart',
        color: '#ffffff', // Warna putih untuk judul
        font: {
          size: 18,
          family: 'Orbitron, sans-serif', // Font futuristik
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff', // Warna putih untuk sumbu X
        },
      },
      y: {
        ticks: {
          color: '#ffffff', // Warna putih untuk sumbu Y
        },
      },
    },
  };

  return (
    <ThemeProvider theme={theme}>
      <Container sx={backgroundStyle}>
        <HeaderDashboard /> {/* Tambahkan HeaderDashboard */}
        <SidebarUser /> {/* Tambahkan SidebarUser */}

        <Grid container spacing={3}>
          {/* Uptime Chart */}
          <Grid item xs={12}>
            <Card sx={{ backgroundColor: '#243447', color: '#ffffff' }}>
              <CardContent>
                <Typography variant="h6" align="center" gutterBottom>
                  Uptime and Downtime Chart
                </Typography>
                <Line data={uptimeDataChart} options={chartOptions} />
              </CardContent>
            </Card>
          </Grid>

          {/* Network Status Card */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={getCardStyle(networkStatus.alive ? 'Yes' : 'No', serviceStatus.status)}>
              <CardContent>
                {loadingStatus.network ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NetworkCheckIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Network Status</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">Host: {networkStatus.host || 'N/A'}</Typography>
                    <Typography variant="body1">Alive: {networkStatus.alive ? 'Yes' : 'No'}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* SSL Certificate */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={getCardStyle('Yes', serviceStatus.status)}>
              <CardContent>
                {loadingStatus.ssl ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SecurityIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">SSL Certificate</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">Valid Until: {sslCert.certExpiryDate || 'N/A'}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Service Status */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={getCardStyle('Yes', serviceStatus.status)}>
              <CardContent>
                {loadingStatus.service ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SettingsIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Service Status</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">Service Status: {serviceStatus.status || 'N/A'}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* System Updates */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={getCardStyle('Yes', 'active')}>
              <CardContent>
                {loadingStatus.updates ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <UpdateIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">System Updates</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">Last Update: {systemUpdates.lastUpdate || 'N/A'}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Network Access */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={getCardStyle('Yes', 'active')}>
              <CardContent>
                {loadingStatus.access ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <NetworkWifiIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Network Access</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">Access Level: {networkAccess.networkAccess || 'N/A'}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Vulnerability Scan */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={getCardStyle('Yes', 'active')}>
              <CardContent>
                {loadingStatus.scan ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <BugReportIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Vulnerability Scan</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">Scan Status: {vulnerabilityScan.scanResults || 'N/A'}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Email Service Status */}
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={getCardStyle(emailServiceStatus.status, 'active')}>
              <CardContent>
                {loadingStatus.email ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmailIcon color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6">Email Service Status</Typography>
                    </Box>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="body1">
                      MX Records: {emailServiceStatus.mxRecords?.map(record => record.exchange).join(', ') || 'N/A'}
                    </Typography>
                    <Typography variant="body1">SMTP Status: {emailServiceStatus.status || 'N/A'}</Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </ThemeProvider>
  );
}

export default UserDashboard;
