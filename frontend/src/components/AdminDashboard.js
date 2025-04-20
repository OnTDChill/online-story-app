import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Container,
  Button,
  AppBar,
  Toolbar
} from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import StoriesManagement from './admin/StoriesManagement';
import UsersManagement from './admin/UsersManagement';
import StoryPlotManagement from './admin/StoryPlotManagement';
import RevenueReports from './admin/RevenueReports';
import AdminDashboardHome from './admin/AdminDashboardHome';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Render the active tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return <AdminDashboardHome />;
      case 1:
        return <UsersManagement />;
      case 2:
        return <StoriesManagement />;
      case 3:
        return <StoryPlotManagement />;
      case 4:
        return <RevenueReports />;
      default:
        return <AdminDashboardHome />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, mt: 8 }}>
      <AppBar position="static" sx={{ backgroundColor: '#424242' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        <Paper sx={{ width: '100%', bgcolor: '#1E1E1E', color: '#FFFFFF' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
              '& .MuiTab-root': { color: '#B0BEC5' },
              '& .Mui-selected': { color: '#0288D1' }
            }}
          >
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<PeopleIcon />} label="Users" />
            <Tab icon={<MenuBookIcon />} label="Stories" />
            <Tab icon={<MenuBookIcon />} label="Story Plots" />
            <Tab icon={<MonetizationOnIcon />} label="Revenue" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {renderTabContent()}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
