// frontend/src/components/admin/RevenueReports.js - Simplified version
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import axios from 'axios';

const RevenueReports = () => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('day');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Initialize dates
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    setStartDate(formatDate(thirtyDaysAgo));
    setEndDate(formatDate(today));
  }, []);

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/admin/revenue', {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          period,
          startDate,
          endDate
        }
      });
      setRevenueData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load revenue data');
      setLoading(false);
      setSnackbar({
        open: true,
        message: 'Failed to load revenue data',
        severity: 'error'
      });
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchRevenueData();
    }
  }, [startDate, endDate]);

  const handlePeriodChange = (event) => {
    setPeriod(event.target.value);
  };

  const handleApplyFilters = () => {
    fetchRevenueData();
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Calculate total revenue
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.total, 0);

  if (loading && revenueData.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
        <CircularProgress sx={{ color: '#0288D1' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: '#0288D1' }}>
        Revenue Reports
      </Typography>
      
      <Paper sx={{ p: 3, mb: 3, bgcolor: '#424242', color: '#FFFFFF' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: '#B0BEC5' }}>Time Period</InputLabel>
              <Select
                value={period}
                label="Time Period"
                onChange={handlePeriodChange}
                sx={{ color: '#FFFFFF', bgcolor: '#333333' }}
              >
                <MenuItem value="day">Daily</MenuItem>
                <MenuItem value="month">Monthly</MenuItem>
                <MenuItem value="year">Yearly</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ 
                color: '#FFFFFF',
                bgcolor: '#333333',
                '& .MuiInputLabel-root': { color: '#B0BEC5' },
                '& .MuiOutlinedInput-input': { color: '#FFFFFF' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ 
                color: '#FFFFFF',
                bgcolor: '#333333',
                '& .MuiInputLabel-root': { color: '#B0BEC5' },
                '& .MuiOutlinedInput-input': { color: '#FFFFFF' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button 
              variant="contained" 
              onClick={handleApplyFilters}
              fullWidth
              sx={{ height: '56px', bgcolor: '#0288D1' }}
            >
              Apply Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, bgcolor: '#424242', color: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Total Revenue
            </Typography>
            <Typography variant="h3" sx={{ color: '#4CAF50' }}>
              ${totalRevenue.toFixed(2)}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, color: '#B0BEC5' }}>
              {startDate} - {endDate}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, bgcolor: '#424242', color: '#FFFFFF', height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Revenue Data
            </Typography>
            {revenueData.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Date</TableCell>
                      <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Revenue</TableCell>
                      <TableCell sx={{ color: '#FFFFFF', fontWeight: 'bold' }}>Transactions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {revenueData.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ color: '#FFFFFF' }}>{item.date}</TableCell>
                        <TableCell sx={{ color: '#4CAF50' }}>${item.total.toFixed(2)}</TableCell>
                        <TableCell sx={{ color: '#FFFFFF' }}>{item.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
                <Typography>No data available for the selected period</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RevenueReports;