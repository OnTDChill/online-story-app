const Notification = require('../models/Notification');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', notifications: [] });
  }
};

const createNotification = async (req, res) => {
  try {
    const { title, count } = req.body;
    const notification = new Notification({ title, count });
    await notification.save();
    res.status(201).json({ message: 'Tạo thông báo thành công!', notification });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, count } = req.body;
    const notification = await Notification.findByIdAndUpdate(
      id,
      { title, count },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo!' });
    }
    res.json({ message: 'Cập nhật thông báo thành công!', notification });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      return res.status(404).json({ message: 'Không tìm thấy thông báo!' });
    }
    res.json({ message: 'Xóa thông báo thành công!' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};

module.exports = { getNotifications, createNotification, updateNotification, deleteNotification };