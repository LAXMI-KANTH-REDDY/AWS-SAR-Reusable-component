import React, { useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', path: '/' },
  { label: 'Track Application', path: '/track' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const renderNavButton = (item) => {
    const isActive = location.pathname === item.path;

    return (
      <Button
        key={item.path}
        component={Link}
        to={item.path}
        sx={{
          color: isActive ? 'primary.main' : 'text.primary',
          fontWeight: isActive ? 700 : 500,
          backgroundColor: isActive ? 'rgba(29, 78, 216, 0.08)' : 'transparent',
          borderRadius: 2,
          px: 2,
          py: 1,
        }}
      >
        {item.label}
      </Button>
    );
  };

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(148, 163, 184, 0.2)',
        backgroundColor: 'rgba(248, 250, 252, 0.88)',
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, width: '100%', mx: 'auto', py: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
              borderRadius: 2,
              color: 'white',
              boxShadow: '0 8px 20px rgba(29, 78, 216, 0.25)',
              mr: 2,
            }}
          >
            <SchoolIcon fontSize="medium" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
              ScholarshipHub
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Serverless Scholarship Portal
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1} sx={{ display: { xs: 'none', md: 'flex' } }}>
          {navItems.map(renderNavButton)}
        </Stack>

        <IconButton
          color="inherit"
          edge="end"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          sx={{ display: { xs: 'flex', md: 'none' }, color: 'text.primary' }}
        >
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{ sx: { width: 260 } }}
      >
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={Link}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                selected={location.pathname === item.path}
              >
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </AppBar>
  );
}
