import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  CircularProgress,
  IconButton,
  Snackbar,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Grid
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import axios from 'axios';

const StoryPlotManagement = () => {
  const [plots, setPlots] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalPlots, setTotalPlots] = useState(0);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentPlot, setCurrentPlot] = useState(null);
  const [storyFilter, setStoryFilter] = useState('');
  const [formData, setFormData] = useState({
    storyId: '',
    plotPoints: [],
    mainCharacters: [],
    settings: [],
    themes: [],
    notes: ''
  });
  const [newPlotPoint, setNewPlotPoint] = useState({ title: '', description: '', order: 1, status: 'planned' });
  const [newCharacter, setNewCharacter] = useState({ name: '', description: '', role: '' });
  const [newSetting, setNewSetting] = useState({ name: '', description: '' });
  const [newTheme, setNewTheme] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch stories and plots on mount
  useEffect(() => {
    fetchStories();
    fetchPlots();
  }, [page, rowsPerPage, storyFilter]);

  const fetchStories = async () => {
    try {
      const response = await axios.get('/api/stories');
      setStories(response.data);
    } catch (err) {
      setError('Failed to fetch stories');
      setSnackbar({ open: true, message: 'Failed to fetch stories', severity: 'error' });
    }
  };

  const fetchPlots = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/plots', {
        params: { page: page + 1, limit: rowsPerPage, storyId: storyFilter }
      });
      setPlots(response.data.plots);
      setTotalPlots(response.data.total);
    } catch (err) {
      setError('Failed to fetch plots');
      setSnackbar({ open: true, message: 'Failed to fetch plots', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Form handling
  const handleFormChange = (field) => (event) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  // Plot point handling
  const handleAddPlotPoint = () => {
    if (newPlotPoint.title && newPlotPoint.description) {
      setFormData({
        ...formData,
        plotPoints: [...formData.plotPoints, { ...newPlotPoint, order: formData.plotPoints.length + 1 }]
      });
      setNewPlotPoint({ title: '', description: '', order: formData.plotPoints.length + 2, status: 'planned' });
    }
  };

  // Character handling
  const handleAddCharacter = () => {
    if (newCharacter.name && newCharacter.role) {
      setFormData({
        ...formData,
        mainCharacters: [...formData.mainCharacters, newCharacter]
      });
      setNewCharacter({ name: '', description: '', role: '' });
    }
  };

  // Setting handling
  const handleAddSetting = () => {
    if (newSetting.name) {
      setFormData({
        ...formData,
        settings: [...formData.settings, newSetting]
      });
      setNewSetting({ name: '', description: '' });
    }
  };

  // Theme handling
  const handleAddTheme = () => {
    if (newTheme) {
      setFormData({
        ...formData,
        themes: [...formData.themes, newTheme]
      });
      setNewTheme('');
    }
  };

  // CRUD operations
  const handleCreatePlot = async () => {
    try {
      await axios.post('/api/plots', formData);
      setOpenCreateDialog(false);
      setFormData({
        storyId: '',
        plotPoints: [],
        mainCharacters: [],
        settings: [],
        themes: [],
        notes: ''
      });
      fetchPlots();
      setSnackbar({ open: true, message: 'Plot created successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to create plot', severity: 'error' });
    }
  };

  const handleEditPlot = async () => {
    try {
      await axios.put(`/api/plots/${currentPlot.id}`, formData);
      setOpenEditDialog(false);
      fetchPlots();
      setSnackbar({ open: true, message: 'Plot updated successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update plot', severity: 'error' });
    }
  };

  const handleDeletePlot = async () => {
    try {
      await axios.delete(`/api/plots/${currentPlot.id}`);
      setOpenDeleteDialog(false);
      fetchPlots();
      setSnackbar({ open: true, message: 'Plot deleted successfully', severity: 'success' });
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to delete plot', severity: 'error' });
    }
  };

  // Dialog handlers
  const handleOpenCreateDialog = () => {
    setFormData({
      storyId: '',
      plotPoints: [],
      mainCharacters: [],
      settings: [],
      themes: [],
      notes: ''
    });
    setOpenCreateDialog(true);
  };

  const handleOpenEditDialog = (plot) => {
    setCurrentPlot(plot);
    setFormData({
      storyId: plot.storyId,
      plotPoints: plot.plotPoints || [],
      mainCharacters: plot.mainCharacters || [],
      settings: plot.settings || [],
      themes: plot.themes || [],
      notes: plot.notes || ''
    });
    setOpenEditDialog(true);
  };

  const handleOpenDeleteDialog = (plot) => {
    setCurrentPlot(plot);
    setOpenDeleteDialog(true);
  };

  // Snackbar close
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Story Plot Management</Typography>
      
      <Box sx={{ mb: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Story</InputLabel>
          <Select
            value={storyFilter}
            onChange={(e) => setStoryFilter(e.target.value)}
            label="Filter by Story"
          >
            <MenuItem value="">All Stories</MenuItem>
            {stories.map((story) => (
              <MenuItem key={story.id} value={story.id}>{story.title}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          sx={{ ml: 2 }}
          onClick={handleOpenCreateDialog}
        >
          Create New Plot
        </Button>
      </Box>

      {loading ? (
        <CircularProgress />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Story Title</TableCell>
                <TableCell>Plot Points</TableCell>
                <TableCell>Main Characters</TableCell>
                <TableCell>Settings</TableCell>
                <TableCell>Themes</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {plots.map((plot) => (
                <TableRow key={plot.id}>
                  <TableCell>{plot.story?.title || 'N/A'}</TableCell>
                  <TableCell>{plot.plotPoints?.length || 0}</TableCell>
                  <TableCell>
                    {plot.mainCharacters?.map((c) => c.name).join(', ') || 'None'}
                  </TableCell>
                  <TableCell>
                    {plot.settings?.map((s) => s.name).join(', ') || 'None'}
                  </TableCell>
                  <TableCell>
                    {plot.themes?.map((t) => (
                      <Chip key={t} label={t} sx={{ m: 0.5 }} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleOpenEditDialog(plot)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleOpenDeleteDialog(plot)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalPlots}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openCreateDialog || openEditDialog} onClose={() => setOpenCreateDialog(false) || setOpenEditDialog(false)}>
        <DialogTitle>{openCreateDialog ? 'Create New Plot' : 'Edit Plot'}</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2 }}>
            <InputLabel>Story</InputLabel>
            <Select
              value={formData.storyId}
              onChange={handleFormChange('storyId')}
              label="Story"
            >
              {stories.map((story) => (
                <MenuItem key={story.id} value={story.id}>{story.title}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Plot Points */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Plot Points</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Title"
                    value={newPlotPoint.title}
                    onChange={(e) => setNewPlotPoint({ ...newPlotPoint, title: e.target.value })}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Description"
                    value={newPlotPoint.description}
                    onChange={(e) => setNewPlotPoint({ ...newPlotPoint, description: e.target.value })}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                  />
                  <FormControl fullWidth margin="normal">
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={newPlotPoint.status}
                      onChange={(e) => setNewPlotPoint({ ...newPlotPoint, status: e.target.value })}
                    >
                      <MenuItem value="planned">Planned</MenuItem>
                      <MenuItem value="in_progress">In Progress</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                  <Button onClick={handleAddPlotPoint} startIcon={<AddIcon />}>
                    Add Plot Point
                  </Button>
                </Grid>
                {formData.plotPoints.map((point, index) => (
                  <Grid item xs={12} key={index}>
                    <Chip
                      label={`${point.title} (${point.status})`}
                      onDelete={() => {
                        setFormData({
                          ...formData,
                          plotPoints: formData.plotPoints.filter((_, i) => i !== index)
                        });
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Characters */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Main Characters</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    value={newCharacter.name}
                    onChange={(e) => setNewCharacter({ ...newCharacter, name: e.target.value })}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Description"
                    value={newCharacter.description}
                    onChange={(e) => setNewCharacter({ ...newCharacter, description: e.target.value })}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                  />
                  <TextField
                    label="Role"
                    value={newCharacter.role}
                    onChange={(e) => setNewCharacter({ ...newCharacter, role: e.target.value })}
                    fullWidth
                    margin="normal"
                  />
                  <Button onClick={handleAddCharacter} startIcon={<AddIcon />}>
                    Add Character
                  </Button>
                </Grid>
                {formData.mainCharacters.map((char, index) => (
                  <Grid item xs={12} key={index}>
                    <Chip
                      label={`${char.name} (${char.role})`}
                      onDelete={() => {
                        setFormData({
                          ...formData,
                          mainCharacters: formData.mainCharacters.filter((_, i) => i !== index)
                        });
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Settings */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Settings</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Name"
                    value={newSetting.name}
                    onChange={(e) => setNewSetting({ ...newSetting, name: e.target.value })}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="Description"
                    value={newSetting.description}
                    onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                  />
                  <Button onClick={handleAddSetting} startIcon={<AddIcon />}>
                    Add Setting
                  </Button>
                </Grid>
                {formData.settings.map((setting, index) => (
                  <Grid item xs={12} key={index}>
                    <Chip
                      label={setting.name}
                      onDelete={() => {
                        setFormData({
                          ...formData,
                          settings: formData.settings.filter((_, i) => i !== index)
                        });
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Themes */}
          <Accordion sx={{ mt: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Themes</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Theme"
                    value={newTheme}
                    onChange={(e) => setNewTheme(e.target.value)}
                    fullWidth
                    margin="normal"
                  />
                  <Button onClick={handleAddTheme} startIcon={<AddIcon />}>
                    Add Theme
                  </Button>
                </Grid>
                {formData.themes.map((theme, index) => (
                  <Grid item xs={12} key={index}>
                    <Chip
                      label={theme}
                      onDelete={() => {
                        setFormData({
                          ...formData,
                          themes: formData.themes.filter((_, i) => i !== index)
                        });
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>

          <TextField
            label="Notes"
            value={formData.notes}
            onChange={handleFormChange('notes')}
            fullWidth
            margin="normal"
            multiline
            rows={4}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreateDialog(false) || setOpenEditDialog(false)}>Cancel</Button>
          <Button
            onClick={openCreateDialog ? handleCreatePlot : handleEditPlot}
            variant="contained"
            disabled={!formData.storyId}
          >
            {openCreateDialog ? 'Create' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Plot</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this plot?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeletePlot} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
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

export default StoryPlotManagement;