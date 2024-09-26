import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemText, IconButton, Box, ListItemIcon, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import DomainIcon from '@mui/icons-material/Domain';
import GroupIcon from '@mui/icons-material/Group';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LockIcon from '@mui/icons-material/Lock';

const Sidebaruser = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (open) => () => {
    setIsOpen(open);
  };

  const handleMenuClick = (path) => {
    navigate(path); // Navigasi ke halaman yang dituju
    setIsOpen(false); // Menutup drawer setelah navigasi
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Hapus token atau autentikasi
    navigate('/login'); // Arahkan ke halaman login
    setIsOpen(false); // Menutup drawer setelah logout
  };

  return (
    <>
      {/* Tombol untuk membuka sidebar */}
      <IconButton onClick={toggleDrawer(true)} sx={{ position: 'fixed', top: '1rem', left: '1rem' }}>
        <MenuIcon fontSize="large" />
      </IconButton>

      {/* Drawer untuk Sidebar */}
      <Drawer anchor="left" open={isOpen} onClose={toggleDrawer(false)}>
        <Box sx={{ width: 250 }} onClick={toggleDrawer(false)}>
          <Typography variant="h6" noWrap component="div" sx={{ p: 2, fontFamily: 'Koulen' }}>
          AvailTrack
          </Typography>
          <List>
            <ListItem button onClick={() => handleMenuClick('/profile-user')}>
              <ListItemIcon><PersonIcon /></ListItemIcon>
              <ListItemText primary="ProfileUser" />
            </ListItem>

            <ListItem button onClick={() => handleMenuClick('/daftar-domain')}>
              <ListItemIcon><DomainIcon /></ListItemIcon>
              <ListItemText primary="Daftar Domain" />
            </ListItem>

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

export default Sidebaruser;
