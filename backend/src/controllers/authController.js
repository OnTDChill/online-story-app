const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      if (user.email === email) {
        return res.status(400).json({ message: 'Email đã được sử dụng!' });
      } else {
        return res.status(400).json({ message: 'Username đã được sử dụng!' });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ!" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'Đăng ký thành công!', user });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server! ' + error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Tài khoản không tồn tại!' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Sai mật khẩu!' });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Email không hợp lệ!" });
    }

    const payload = {
      userId: user._id,
      username: user.username,
      email: user.email,
      avatar: user.avatar || null,
      contact_info: user.contact_info || '',
      member_level: user.member_level,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

    res.json({ message: 'Đăng nhập thành công!', token });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!' + error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const requester = req.user;
    if (requester.role !== "Admin") {
      return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }
    const users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (requester.role !== "Admin" && requester.userId !== id) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, contact_info } = req.body;
    const requester = req.user;

    if (requester.role !== "Admin" && requester.userId !== id) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.contact_info = contact_info || user.contact_info;

    await user.save();

    res.status(200).json({ message: "Cập nhật thông tin người dùng thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const requester = req.user;

    if (requester.role !== "Admin" && requester.userId !== id) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Xóa người dùng thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    const requester = req.user;

    if (requester.userId !== id) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập!" });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại!" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Sai mật khẩu hiện tại!' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    res.status(200).json({ message: "Đổi mật khẩu thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server!", error: error.message });
  }
};

const updateAvatar = async (req, res) => {
  try {
    const userId = req.params.id;
    if (!req.file) return res.status(400).json({ message: 'Chưa có ảnh được tải lên!' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });

    if (user.avatar) {
      const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', user.avatar);
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    const tmpPath = req.file.path;
    const filename = req.file.filename;

    const destDir = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

    const destPath = path.join(destDir, filename);
    fs.renameSync(tmpPath, destPath);

    user.avatar = filename;
    await user.save();

    res.status(200).json({ message: 'Cập nhật avatar thành công!', avatar: filename });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
};
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};
const updateProfile = async (req, res) => {
  try {
    const { quote } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
    user.quote = quote || user.quote;
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server!', error: error.message });
  }
};
module.exports = { register, login, getMe, updateProfile };
