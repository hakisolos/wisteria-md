const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  jid: { type: String, required: true, unique: true },
  name: { type: String },
  description: { type: String, default: "" },
  about: { type: String, default: "" },
  ppUrl: { type: String, default: "" },
  isPremium: { type: Boolean, default: false },
  joinedAt: { type: Date, default: Date.now },
  settings: {
    prefix: { type: String, default: "." },
    notifications: { type: Boolean, default: true }
  },
  lastSeen: { type: Date },
  ban: { type: Boolean, default: false },
  banReason: { type: String, default: "" }
});

const User = mongoose.model("User", userSchema);

const user = {
  /**
   * Add a new user to the database
   * @param {String} jid User's JID
   * @param {String} name User's name
   * @param {String} description User's description
   * @param {String} about User's about
   * @param {String} ppUrl User's profile picture URL
   * @param {Boolean} isPremium User's premium status
   * @returns {Object} User object
   */
  async addUser(jid, name, description = "", about = "", ppUrl = "", isPremium = false) {
  isPremium = Boolean(isPremium); // make sure it's true boolean only 😘
  
  const existing = await User.findOne({ jid });
  if (existing) return existing;

  const newUser = new User({ jid, name, description, about, ppUrl, isPremium });
  return await newUser.save();
},


  /**
   * Remove a user from the database
   * @param {String} jid User's JID
   * @returns {Object} Removed user object
   */
  async removeUser(jid) {
    return await User.findOneAndDelete({ jid });
  },

  /**
   * Get a user from the database
   * @param {String} jid User's JID
   * @returns {Object} User object
   */
  async getUser(jid) {
    return await User.findOne({ jid });
  },

  /**
   * Check if a user is registered in the database
   * @param {String} jid User's JID
   * @returns {Boolean} True if user is registered, false otherwise
   */
  async isRegistered(jid) {
    const user = await User.findOne({ jid });
    return !!user;
  },

  /**
   * Check if a user has premium status
   * @param {String} jid User's JID
   * @returns {Boolean} True if user has premium, false otherwise
   */
  async isPremium(jid) {
    const user = await User.findOne({ jid });
    return user ? user.isPremium : false;
  },

  /**
   * List all users in the database
   * @returns {Array} Array of user objects
   */
  async listAllUsers() {
    return await User.find({});
  },

  /**
   * Update a specific user setting
   * @param {String} jid User's JID
   * @param {String} key Setting key
   * @param {any} value Setting value
   * @returns {Object} Updated user object
   */
  async updateUserSetting(jid, key, value) {
    const user = await User.findOne({ jid });
    if (!user) return null;
    user.settings[key] = value;
    return await user.save();
  },

  /**
   * Update user data with specified fields
   * @param {String} jid User's JID
   * @param {Object} updates Object containing fields to update
   * @returns {Object} Updated user object
   */
  async updateUser(jid, updates) {
    return await User.findOneAndUpdate(
      { jid },
      { $set: updates },
      { new: true }
    );
  },

  /**
   * Get the total count of users
   * @returns {Number} User count
   */
  async getUserCount() {
    return await User.countDocuments();
  },

  /**
   * Get all premium users
   * @returns {Array} Array of premium user objects
   */
  async getUsersWithPremium() {
    return await User.find({ isPremium: true });
  },

  /**
   * Toggle user's premium status
   * @param {String} jid User's JID
   * @returns {Object} Updated user object
   */
  async togglePremium(jid) {
    const user = await User.findOne({ jid });
    if (!user) return null;
    user.isPremium = !user.isPremium;
    return await user.save();
  },

  /**
   * Update user's last seen timestamp
   * @param {String} jid User's JID
   * @returns {Object} Updated user object
   */
  async updateLastSeen(jid) {
    return await User.findOneAndUpdate(
      { jid },
      { $set: { lastSeen: new Date() } },
      { new: true }
    );
  },

  /**
   * Ban a user
   * @param {String} jid User's JID
   * @param {String} reason Ban reason
   * @returns {Object} Updated user object
   */
  async banUser(jid, reason = "") {
    return await User.findOneAndUpdate(
      { jid },
      { $set: { ban: true, banReason: reason } },
      { new: true }
    );
  },

  /**
   * Unban a user
   * @param {String} jid User's JID
   * @returns {Object} Updated user object
   */
  async unbanUser(jid) {
    return await User.findOneAndUpdate(
      { jid },
      { $set: { ban: false, banReason: "" } },
      { new: true }
    );
  },

  /**
   * Check if a user is banned
   * @param {String} jid User's JID
   * @returns {Boolean} True if user is banned, false otherwise
   */
  async isBanned(jid) {
    const user = await User.findOne({ jid });
    return user ? user.ban : false;
  },

  /**
   * Get all banned users
   * @returns {Array} Array of banned user objects
   */
  async getBannedUsers() {
    return await User.find({ ban: true });
  },

  /**
   * Search users by name
   * @param {String} query Search query
   * @returns {Array} Array of matching user objects
   */
  async searchUsersByName(query) {
    return await User.find({ name: { $regex: query, $options: 'i' } });
  },

  /**
   * Get users recently seen within a specific timeframe
   * @param {Number} hours Number of hours to look back
   * @returns {Array} Array of recently active user objects
   */
  async getRecentlyActiveUsers(hours = 24) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return await User.find({ lastSeen: { $gte: cutoff } });
  }
};

module.exports = user;