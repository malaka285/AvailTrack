import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, Box, ListItemIcon, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import DomainIcon from '@mui/icons-material/Domain';
import GroupIcon from '@mui/icons-material/Group';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard'; // Import ikon dashboard

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open) => () => {
    setIsOpen(open);
  };

  const handleMenuClick = (path) => {
    navigate(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
    setIsOpen(false);
  };

  return (
    <>
      <IconButton onClick={toggleDrawer(true)} sx={{ position: 'fixed', top: '1rem', left: '1rem' }}>
        <MenuIcon fontSize="large" />
      </IconButton>

      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} onClick={toggleDrawer(false)}>
          {/* Tambahkan judul 'AvailTrack' di atas list */}
          <Typography variant="h6" noWrap component="div" sx={{ p: 2, fontFamily: 'Koulen' }}>
            AvailTrack
          </Typography>
          <List>
            {/* Tombol Dashboard baru */}
            <ListItem button onClick={() => handleMenuClick('/admin')}>
              <ListItemIcon><DashboardIcon /></ListItemIcon> {/* Gunakan ikon Dashboard */}
              <ListItemText primary="Dashboard" />
            </ListItem>

            {/* Tombol Profile */}
            <ListItem button onClick={() => handleMenuClick('/profile')}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>

            {/* Tombol Daftar Domain */}
            <ListItem button onClick={() => handleMenuClick('/daftar-domain')}>
              <ListItemIcon><DomainIcon /></ListItemIcon>
              <ListItemText primary="Daftar Domain" />
            </ListItem>

            {/* Tombol Manajemen User dan Domain */}
            <ListItem button onClick={() => handleMenuClick('/manajemen-user')}>
              <ListItemIcon><GroupIcon /></ListItemIcon>
              <ListItemText primary="Manajemen User dan Domain" />
            </ListItem>

            {/* Tombol Logout */}
            <ListItem button onClick={handleLogout}>
              <ListItemIcon><ExitToAppIcon /></ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Sidebar;
