const User = require("../models/User");

const getUser = async (userId) => {
  return await User.findById(userId).select("-password");
};

const createUser = async (userId, userData) => {
  let user = await User.findById(userId);
  if (!user) {
    user = new User({ _id: userId, ...userData });
    await user.save();
  } else {
    Object.assign(user, userData);
    await user.save();
  }
  return user;
};

const updateUser = async (userId, updates) => {
  return await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");
};

const deleteUser = async (userId) => {
  return await User.findByIdAndDelete(userId);
};

module.exports = { getUser, createUser, updateUser, deleteUser };
