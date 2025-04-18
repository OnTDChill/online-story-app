const Genre = require("../models/Genre");
const Story = require("../models/Story");

const createGenre = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Tên danh mục là bắt buộc!" });

    const existingGenre = await Genre.findOne({ name });
    if (existingGenre) return res.status(400).json({ message: "Danh mục đã tồn tại!" });

    const genre = new Genre({ name });
    await genre.save();
    res.status(201).json({ message: "Danh mục được tạo thành công!", genre });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.status(200).json(genres);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ message: "Không tìm thấy danh mục!" });
    res.status(200).json(genre);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const updateGenre = async (req, res) => {
  try {
    const { name } = req.body;
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).json({ message: "Danh mục không tồn tại!" });
    
    genre.name = name || genre.name;

    await genre.save();
    res.status(200).json({ message: "Cập nhật danh mục thành công!", genre });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const deleteGenre = async (req, res) => {
  try {
    const { id } = req.params;
    
    const genre = await Genre.findById(id);
    if (!genre) return res.status(404).json({ message: "Danh mục không tồn tại!" });

    await Genre.findByIdAndDelete(id);
    res.status(200).json({ message: "Xóa danh mục thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const getStoriesByGenre = async (req, res) => {
  try {
    const { genreName } = req.params;
    const stories = await Story.find({ genre: genreName });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

module.exports = { createGenre, getGenres, getGenreById, updateGenre, deleteGenre, getStoriesByGenre };