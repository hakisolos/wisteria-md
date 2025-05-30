const eco = require("discord-mongoose-economy");

const user = {
  initEconomy: async (uri) => {
    try {
      await eco.connect(uri || "mongodb+srv://hakixer:mynameisexcel2@mern-app.6jk1agk.mongodb.net/?retryWrites=true&w=majority&appName=mern-app");
      console.log("economy active");
      return { success: true, message: "economy active" };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  createUser: async (jid) => {
    try {
      if (!jid) return { success: false, message: 'Jid parameter needed' };
      const user = await eco.create(jid);
      return { success: true, data: user };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  deleteUser: async (jid) => {
    try {
      if (!jid) return { success: false, message: 'Jid parameter needed' };
      const result = await eco.delete(jid);
      return { success: true, data: result };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  capacity: async (jid, capacity) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      if (!capacity) return { success: false, message: 'capacity required' };
      const cap = await eco.giveCapacity(jid, capacity);
      return { success: true, data: cap };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  userBal: async (jid) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      const balance = await eco.balance(jid);
      return { success: true, data: balance };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  giveMoney: async (jid, amount) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      if (!amount) return { success: false, message: 'amount required' };
      const result = await eco.give(jid, amount);
      return { success: true, data: result };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  deductMoney: async (jid, amount) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      if (!amount) return { success: false, message: 'amount required' };
      const result = await eco.deduct(jid, amount);
      return { success: true, data: result };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  dailyReward: async (jid, amount) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      if (!amount) return { success: false, message: 'amount required' };
      const result = await eco.daily(jid, amount);
      return { success: true, data: result };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  depositMoney: async (jid, amount) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      if (!amount) return { success: false, message: 'amount required' };
      const result = await eco.deposit(jid, amount);
      return { success: true, data: result };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  withdrawMoney: async (jid, amount) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      if (!amount) return { success: false, message: 'amount required' };
      const result = await eco.withdraw(jid, amount);
      return { success: true, data: result };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  leaderboard: async (count) => {
    try {
      if (!count) return { success: false, message: 'count required' };
      const result = await eco.lb(count);
      return { success: true, data: result };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  transferMoney: async (fromJid, toJid, amount) => {
    try {
      if (!fromJid) return { success: false, message: 'sender id required' };
      if (!toJid) return { success: false, message: 'receiver id required' };
      if (!amount) return { success: false, message: 'amount required' };
      
      const senderBal = await eco.balance(fromJid);
      if (senderBal.wallet < amount) {
        return { success: false, message: 'insufficient balance' };
      }
      
      await eco.deduct(fromJid, amount);
      await eco.give(toJid, amount);
      
      return { success: true, message: 'transfer successful', amount: amount };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  addBank: async (jid, amount) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      if (!amount) return { success: false, message: 'amount required' };
      const result = await eco.giveCapacity(jid, amount);
      return { success: true, data: result };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  },

  getUserRank: async (jid) => {
    try {
      if (!jid) return { success: false, message: 'user id required' };
      const leaderboard = await eco.lb(1000);
      const rank = leaderboard.findIndex(user => user.userID === jid) + 1;
      return { success: true, data: { rank: rank || 'Not ranked' } };
    } catch (e) {
      console.log(e);
      return { success: false, error: e };
    }
  }
};

module.exports = user;