const User = require("../models/user.model.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { apiResponse } = require('../utils/apiResponse');

function normalizeAllowedSchoolIds(input) {
  if (!Array.isArray(input)) return [];
  return input.map((v) => String(v || '').trim()).filter(Boolean);
}

function defaultSchoolId() {
  return String(process.env.DEFAULT_SCHOOL_ID || '').trim() || 'local-dev';
}

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      const err = new Error('name, email, password, role are required');
      err.statusCode = 400;
      throw err;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json(apiResponse(false, 'User already exists'));
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const allowedSchoolIds = (() => {
      const explicit = normalizeAllowedSchoolIds(req.body?.allowedSchoolIds);
      if (explicit.length) return explicit;
      const schoolId = String(req.body?.schoolId || '').trim();
      if (schoolId) return [schoolId];
      return [defaultSchoolId()];
    })();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      allowedSchoolIds,
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedSchoolIds: Array.isArray(user.allowedSchoolIds) ? user.allowedSchoolIds : []
    };

    return res.status(201).json(apiResponse(true, 'User registered successfully', safeUser));
  } catch (error) {
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const err = new Error('email and password are required');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json(apiResponse(false, 'Invalid credentials'));
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json(apiResponse(false, 'Invalid credentials'));
    }

    const allowedSchoolIds = Array.isArray(user.allowedSchoolIds) && user.allowedSchoolIds.length
      ? user.allowedSchoolIds
      : [defaultSchoolId()];

    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        allowedSchoolIds,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json(
      apiResponse(true, 'Login successful', {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          allowedSchoolIds
        }
      })
    );
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password').lean();
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }
    return res.status(200).json(apiResponse(true, 'User fetched', user));
  } catch (err) {
    return next(err);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .select('-password')
      .lean();

    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    return res.status(200).json(apiResponse(true, 'User updated', user));
  } catch (err) {
    return next(err);
  }
};

const changePasswordById = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const requesterRole = String(req.user?.role || '').trim();
    const requesterId = String(req.user?.userId || '').trim();
    const targetId = String(req.params.id || '').trim();
    const isPrivileged = requesterRole === 'admin' || requesterRole === 'super-admin';
    const isSelf = requesterId && targetId && requesterId === targetId;

    if (!newPassword) {
      const err = new Error('newPassword is required');
      err.statusCode = 400;
      throw err;
    }

    if (!isPrivileged && !currentPassword) {
      const err = new Error('currentPassword is required');
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      const err = new Error('User not found');
      err.statusCode = 404;
      throw err;
    }

    if (!isPrivileged || isSelf) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json(apiResponse(false, 'Incorrect current password'));
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json(apiResponse(true, 'Password updated'));
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  register,
  login,
  getUserById,
  updateUser,
  changePasswordById,
};