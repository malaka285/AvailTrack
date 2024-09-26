import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, Card, CardContent, CircularProgress, Divider, Box } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import VulnerabilityScan from './VulnerabilityScan';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import UpdateIcon from '@mui/icons-material/Update';
import NetworkWifiIcon from '@mui/icons-material/NetworkWifi';
import BugReportIcon from '@mui/icons-material/BugReport';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', 
    },
    secondary: {
      main: '#dc004e', 
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
        },
      },
    },
  },
});

const cardStyle = {
  backgroundColor: '#f5f5f5',
  borderRadius: '10px',
  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
};

const backgroundStyle = {
  background: 'linear-gradient(to right, #ff7e5f, #feb47b)', 
  minHeight: '100vh',
  width: '100%',
  position: 'relative',
  padding: '2rem',
};

function App() {
    const [networkStatus, setNetworkStatus] = useState({});
    const [sslCert, setSslCert] = useState({});
    const [serviceStatus, setServiceStatus] = useState({});
    const [systemUpdates, setSystemUpdates] = useState({});
    const [backupStatus, setBackupStatus] = useState({});
    const [networkAccess, setNetworkAccess] = useState({});
    const [vulnerabilityScan, setVulnerabilityScan] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const networkResponse = await axios.get('http://localhost:4000/network-status');
                setNetworkStatus(networkResponse.data);

                const sslCertResponse = await axios.get('http://localhost:4000/ssl-cert');
                setSslCert(sslCertResponse.data);

                const serviceStatusResponse = await axios.get('http://localhost:4000/service-status');
                setServiceStatus(serviceStatusResponse.data);

                const systemUpdatesResponse = await axios.get('http://localhost:4000/system-updates');
                const cleanedUpdate = systemUpdatesResponse.data.lastUpdate ? systemUpdatesResponse.data.lastUpdate.trim().replace(/\s\s+/g, ' ') : 'N/A';
                setSystemUpdates({ lastUpdate: cleanedUpdate });

                const networkAccessResponse = await axios.get('http://localhost:4000/network-access');
                setNetworkAccess(networkAccessResponse.data);

                const vulnerabilityScanResponse = await axios.get('http://localhost:4000/vulnerability-scan');
                setVulnerabilityScan(vulnerabilityScanResponse.data);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data', error);
                setNetworkStatus({ host: 'Error', alive: false });
                setSslCert({ certExpiryDate: 'Error' });
                setServiceStatus([]);
                setSystemUpdates({ lastUpdate: 'Error' });
                setBackupStatus({ backupStatus: 'Error' });
                setNetworkAccess({ networkAccess: 'Error' });
                setVulnerabilityScan({ scanResults: 'Error' });
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return (
            <ThemeProvider theme={theme}>
                <Container sx={backgroundStyle}>
                    <Typography variant="h4" gutterBottom align="center">
                        Loading...
                    </Typography>
                    <CircularProgress color="primary" />
                </Container>
            </ThemeProvider>
        );
    }

    return (
        <ThemeProvider theme={theme}>
            <Container sx={backgroundStyle}>
                <Typography variant="h3" gutterBottom align="center" sx={{ mb: 4 }}>
                    Monitoring Dashboard
                </Typography>

                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <NetworkCheckIcon color="primary" sx={{ mr: 2 }} />
                                    <Typography variant="h6">Network Status</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1">Host: {networkStatus.host || 'N/A'}</Typography>
                                <Typography variant="body1">Alive: {networkStatus.alive ? 'Yes' : 'No'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <SecurityIcon color="primary" sx={{ mr: 2 }} />
                                    <Typography variant="h6">SSL Certificate</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1">Expiry Date: {sslCert.certExpiryDate || 'N/A'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <SettingsIcon color="primary" sx={{ mr: 2 }} />
                                    <Typography variant="h6">Service Status</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1">Service: {serviceStatus.service || 'N/A'}</Typography>
                                <Typography variant="body1">Status: {serviceStatus.status || 'N/A'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <UpdateIcon color="primary" sx={{ mr: 2 }} />
                                    <Typography variant="h6">System Updates</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="body1">Last Update: {systemUpdates.lastUpdate || 'N/A'}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12} sm={6} md={4}>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <NetworkWifiIcon color="primary" sx={{ mr: 2 }} />
                                    <Typography variant="h6">Network Access</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <pre>{networkAccess.networkAccess || 'N/A'}</pre>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={12}>
                        <Card sx={cardStyle}>
                            <CardContent>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <BugReportIcon color="primary" sx={{ mr: 2 }} />
                                    <Typography variant="h6">Vulnerability Scan</Typography>
                                </Box>
                                <Divider sx={{ my: 2 }} />
                                <VulnerabilityScan scanResults={vulnerabilityScan.scanResults || 'N/A'} />
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </ThemeProvider>
    );
}

export default App;
