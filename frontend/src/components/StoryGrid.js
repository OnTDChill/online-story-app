import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Tabs, Tab, Badge, Chip } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import StarIcon from '@mui/icons-material/Star';
import FilterListIcon from '@mui/icons-material/FilterList';

const StoryGrid = () => {
  const [value, setValue] = useState(0);
  const [stories, setStories] = useState([]);
  const [newStories, setNewStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        // Fetch top stories
        const topResponse = await axios.get('http://localhost:5000/api/stories', {
          params: { sort: 'popular', limit: 10 }
        });

        // Fetch new stories
        const newResponse = await axios.get('http://localhost:5000/api/stories', {
          params: { sort: 'latest', limit: 10 }
        });

        setStories(topResponse.data.stories || []);
        setNewStories(newResponse.data.stories || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stories:', err);
        setError('Failed to load stories');
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Function to generate random time for demo purposes
  const getRandomTime = () => {
    const hours = Math.floor(Math.random() * 48);
    const minutes = Math.floor(Math.random() * 60);
    if (hours === 0) {
      return `${minutes} phút trước`;
    }
    return `${hours} giờ trước`;
  };

  // Function to add NEW badge to some stories
  const isNew = (index) => {
    return index % 3 === 0; // Every third story will have NEW badge
  };

  // Function to add HOT badge to some stories
  const isHot = (index) => {
    return index % 4 === 1; // Every fourth story (offset by 1) will have HOT badge
  };

  return (
    <Box sx={{ width: '100%', bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
      {/* Top Section - Rankings */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <WhatshotIcon sx={{ mr: 1, color: '#ff4d4f' }} />
          Bảng Xếp Hạng
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1 }} />
          <Typography variant="body2">Bộ Lọc</Typography>
        </Box>
      </Box>

      {/* Tabs for different ranking categories */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="ranking categories"
          sx={{ '& .MuiTab-root': { fontSize: '0.8rem', minWidth: 'auto', px: 1.5 } }}>
          <Tab label="Đang Thịnh Hành" />
          <Tab label="Cập Nhật 24h" />
          <Tab label="Kim Thành Bảng" />
          <Tab label="Kim Bài Đề Cử" />
        </Tabs>
      </Box>

      {/* Grid of top stories */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          stories.map((story, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={story._id || index}>
              <Card sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Rank number */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bgcolor: '#000',
                    color: '#fff',
                    width: 24,
                    height: 24,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1
                  }}
                >
                  {index + 1}
                </Box>

                {/* NEW badge */}
                {isNew(index) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: '#52c41a',
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}
                  >
                    NEW
                  </Box>
                )}

                {/* HOT badge */}
                {isHot(index) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: '#ff4d4f',
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}
                  >
                    HOT
                  </Box>
                )}

                <CardMedia
                  component="img"
                  height="160"
                  image={story.thumbnail || `https://picsum.photos/seed/${index}/200/300`}
                  alt={story.title}
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://picsum.photos/seed/${index}/200/300`;
                  }}
                />
                <CardContent sx={{ p: 1, flexGrow: 1 }}>
                  <Typography variant="subtitle2" component={Link} to={`/story/${story._id}`}
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      textDecoration: 'none',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '2.5rem'
                    }}>
                    {story.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {story.author}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* New Updates Section */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
          <NewReleasesIcon sx={{ mr: 1, color: '#1890ff' }} />
          Mới Cập Nhật
        </Typography>
      </Box>

      {/* Tabs for different new update categories */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={0} aria-label="new updates categories"
          sx={{ '& .MuiTab-root': { fontSize: '0.8rem', minWidth: 'auto', px: 1.5 } }}>
          <Tab label="Chương Mới" />
          <Tab label="Truyện Mới" />
          <Tab label="Đề Cử Mới" />
          <Tab label="Mới Hoàn Thành" />
        </Tabs>
      </Box>

      {/* Grid of new stories */}
      <Grid container spacing={2}>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          newStories.map((story, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={story._id || index}>
              <Card sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
                {/* Time badge */}
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 70,
                    left: 0,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    px: 1,
                    py: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.7rem'
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: '0.9rem', mr: 0.5 }} />
                  {getRandomTime()}
                </Box>

                {/* NEW badge */}
                {isNew(index) && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: '#52c41a',
                      color: '#fff',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      fontWeight: 'bold',
                      zIndex: 1
                    }}
                  >
                    NEW
                  </Box>
                )}

                <CardMedia
                  component="img"
                  height="160"
                  image={story.thumbnail || `https://picsum.photos/seed/${index + 100}/200/300`}
                  alt={story.title}
                  sx={{ objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://picsum.photos/seed/${index + 100}/200/300`;
                  }}
                />
                <CardContent sx={{ p: 1, flexGrow: 1 }}>
                  <Typography variant="subtitle2" component={Link} to={`/story/${story._id}`}
                    sx={{
                      fontWeight: 'bold',
                      color: '#000',
                      textDecoration: 'none',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      height: '2.5rem'
                    }}>
                    {story.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    {story.author}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Box>
  );
};

export default StoryGrid;
