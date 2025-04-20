import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  CircularProgress
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import axios from 'axios';

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStories: 0,
    totalChapters: 0,
    newUsersToday: 0,
    totalViews: 0,
    revenueToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/admin/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load dashboard statistics');
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress sx={{ color: '#0288D1' }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#0288D1' }} />,
      color: '#424242'
    },
    { 
      title: 'Total Stories', 
      value: stats.totalStories, 
      icon: <MenuBookIcon sx={{ fontSize: 40, color: '#0288D1' }} />,
      color: '#424242'
    },
    { 
      title: 'Total Views', 
      value: stats.totalViews, 
      icon: <VisibilityIcon sx={{ fontSize: 40, color: '#0288D1' }} />,
      color: '#424242'
    },
    { 
      title: 'New Users Today', 
      value: stats.newUsersToday, 
      icon: <PeopleIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      color: '#424242'
    },
    { 
      title: 'Total Chapters', 
      value: stats.totalChapters, 
      icon: <MenuBookIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      color: '#424242'
    },
    { 
      title: 'Revenue Today', 
      value: `$${stats.revenueToday.toFixed(2)}`, 
      icon: <MonetizationOnIcon sx={{ fontSize: 40, color: '#4CAF50' }} />,
      color: '#424242'
    }
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288D1' }}>
        Dashboard Overview
      </Typography>
      
      <Grid container spacing={3} sx={{ mt: 1 }}>
        {statCards.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ bgcolor: card.color, color: '#FFFFFF', height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6" component="div">
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ mt: 1 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  {card.icon}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default AdminDashboardHome;
