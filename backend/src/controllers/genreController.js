const Genre = require('../models/Genre');
const Story = require('../models/Story');

const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    const genresWithCount = await Promise.all(
      genres.map(async (genre) => {
        const storyCount = await Story.countDocuments({ genre: genre.name });
        return { ...genre._doc, storyCount };
      })
    );
    res.json(genresWithCount);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createGenre = async (req, res) => {
  const { name } = req.body;
  try {
    let genre = await Genre.findOne({ name });
    if (genre) {
      return res.status(400).json({ message: 'Genre already exists' });
    }
    genre = new Genre({ name });
    await genre.save();
    res.json(genre);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getGenres, createGenre };