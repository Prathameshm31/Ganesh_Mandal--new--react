import { useState } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Badge,
  useMediaQuery,
  useTheme,
  Divider,
} from '@mui/material';
import {
  MdMenu,
  MdDashboard,
  MdPeople,
  MdPayments,
  MdEvent,
  MdAssessment,
  MdLocationCity,
  MdReceipt,
  MdNotifications,
  MdSettings,
  MdDarkMode,
  MdLightMode,
  MdLogout,
  MdAccountBalance,
  MdGroups,
} from 'react-icons/md';
import { useThemeMode } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/common/BrandLogo';
import logoImg from '../assets/logo/hindavi-swarajya-logo.png';

const DRAWER_WIDTH = 260;

const menuItems = [
  { text: 'Dashboard', icon: MdDashboard, path: '/' },
  { text: 'Members', icon: MdPeople, path: '/members' },
  { text: 'Donations', icon: MdPayments, path: '/donations' },
  { text: 'Activities', icon: MdEvent, path: '/activities' },
  { text: 'Ganesh Murti', icon: MdAccountBalance, path: '/murti' },
  { text: 'Volunteers', icon: MdGroups, path: '/volunteers' },
  { text: 'Reports', icon: MdAssessment, path: '/reports' },
  { text: 'Colony Management', icon: MdLocationCity, path: '/colony' },
  { text: 'Payment History', icon: MdReceipt, path: '/payments' },
  { text: 'Notifications', icon: MdNotifications, path: '/notifications' },
  { text: 'Settings', icon: MdSettings, path: '/settings' },
];

export default function MainLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const { mode, toggleTheme } = useThemeMode();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const currentTitle = menuItems.find(m => isActive(m.path))?.text || 'Dashboard';

  const handleNavClick = () => {
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BrandLogo />
      </Box>

      <Divider />

      <List sx={{ flex: 1, px: 1.5, py: 1 }}>
        {menuItems.map(item => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={NavLink}
                to={item.path}
                selected={active}
                onClick={handleNavClick}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  '&.Mui-selected': {
                    bgcolor: 'primary.main',
                    color: '#fff',
                    '&:hover': { bgcolor: 'primary.dark' },
                    '& .MuiListItemIcon-root': { color: '#fff' },
                    '& .MuiListItemText-primary': { fontWeight: 700 },
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255, 111, 0, 0.08)',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, fontSize: 20 }}>
                  <item.icon />
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 700 : 500 }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Divider />

      <Box sx={{ p: 1.5 }}>
        <ListItemButton
          onClick={logout}
          sx={{ borderRadius: 2, py: 1.2 }}
        >
          <ListItemIcon sx={{ minWidth: 40, fontSize: 20 }}>
            <MdLogout />
          </ListItemIcon>
          <ListItemText
            primary="Logout"
            primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          zIndex: muiTheme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              onClick={() => setMobileOpen(true)}
              sx={{ mr: 1 }}
              aria-label="Open menu"
            >
              <MdMenu />
            </IconButton>
          )}

          <Typography variant="h6" noWrap sx={{ flexGrow: 1, fontWeight: 600 }}>
            {currentTitle}
          </Typography>

          <IconButton onClick={toggleTheme} sx={{ mr: 0.5 }} aria-label="Toggle theme">
            {mode === 'dark' ? <MdLightMode /> : <MdDarkMode />}
          </IconButton>

          <IconButton sx={{ mr: 0.5 }} aria-label="Notifications">
            <Badge badgeContent={3} color="error">
              <MdNotifications />
            </Badge>
          </IconButton>

          <Avatar
            src={user?.avatar || undefined}
            sx={{
              bgcolor: 'primary.main',
              width: 36,
              height: 36,
              fontSize: 15,
              fontWeight: 700,
              ml: 0.5,
            }}
          >
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="Sidebar navigation"
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
          >
            {sidebarContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              '& .MuiDrawer-paper': {
                boxSizing: 'border-box',
                width: DRAWER_WIDTH,
              },
            }}
            open
          >
            {sidebarContent}
          </Drawer>
        )}
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: 10,
          px: { xs: 2, sm: 3 },
          pb: 4,
          minHeight: '100vh',
          bgcolor: 'background.default',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -60,
            left: -60,
            width: 280,
            height: 280,
            opacity: 0.035,
            pointerEvents: 'none',
            zIndex: 0,
            backgroundImage: `url(${logoImg})`,
            backgroundSize: 'contain',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top left',
          }}
        />
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
