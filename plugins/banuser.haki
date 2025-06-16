const { nikka } = require('../lib/cmd');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const bannedUsersPath = path.join(__dirname, '../lib/database/storage/bannedUsers.json');

const loadBannedUsers = () => {
  try {
    if (!fs.existsSync(bannedUsersPath)) {
      fs.writeFileSync(bannedUsersPath, JSON.stringify([]));
      return [];
    }
    const data = fs.readFileSync(bannedUsersPath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(error);
    return [];
  }
};

const saveBannedUsers = (bannedUsers) => {
  try {
    fs.writeFileSync(bannedUsersPath, JSON.stringify(bannedUsers, null, 2));
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

const isUserBanned = (jid) => {
  const bannedUsers = loadBannedUsers();
  return bannedUsers.includes(jid);
};

const banUser = (jid) => {
  const bannedUsers = loadBannedUsers();
  if (!bannedUsers.includes(jid)) {
    bannedUsers.push(jid);
    return saveBannedUsers(bannedUsers);
  }
  return true;
};

const unbanUser = (jid) => {
  const bannedUsers = loadBannedUsers();
  const index = bannedUsers.indexOf(jid);
  if (index !== -1) {
    bannedUsers.splice(index, 1);
    return saveBannedUsers(bannedUsers);
  }
  return false;
};

nikka(
  {
    pattern: 'ban',
    desc: 'Ban a user from using the bot',
    category: 'admin',
  },
  async (m, { text, args }) => {
    const senderNumber = m.sender.split('@')[0];
    const isOwner = config.OWNER === senderNumber || 
      (config.SUDO && config.SUDO.includes(senderNumber));
    
    if (!isOwner) {
      return await m.reply('❌ This command can only be used by the bot owner or sudo users.');
    }
    
    let userToBan = null;
    
    if (m.quoted) {
      userToBan = m.quoted.sender;
    } else if (args[0]) {
      let userArg = args[0];
      if (userArg.includes('@')) {
        userArg = userArg.replace('@', '');
      }
      if (!userArg.includes('@s.whatsapp.net')) {
        userArg = userArg + '@s.whatsapp.net';
      }
      userToBan = userArg;
    }
    
    if (!userToBan) {
      return await m.reply('❌ Please reply to a message or provide a user ID to ban.');
    }
    
    const userNumber = userToBan.split('@')[0];
    if (userNumber === config.OWNER || (config.SUDO && config.SUDO.includes(userNumber))) {
      return await m.reply('❌ You cannot ban the bot owner or sudo users.');
    }
    
    const banned = banUser(userToBan);
    
    if (banned) {
      return await m.reply(`✅ Successfully banned user: ${userToBan.split('@')[0]}`);
    } else {
      return await m.reply('❌ Failed to ban user. Please try again.');
    }
  }
);

nikka(
  {
    pattern: 'unban',
    desc: 'Unban a user from using the bot',
    category: 'admin',
  },
  async (m, { text, args }) => {
    const senderNumber = m.sender.split('@')[0];
    const isOwner = config.OWNER === senderNumber || 
      (config.SUDO && config.SUDO.includes(senderNumber));
    
    if (!isOwner) {
      return await m.reply('❌ This command can only be used by the bot owner or sudo users.');
    }
    
    let userToUnban = null;
    
    if (m.quoted) {
      userToUnban = m.quoted.sender;
    } else if (args[0]) {
      let userArg = args[0];
      if (userArg.includes('@')) {
        userArg = userArg.replace('@', '');
      }
      if (!userArg.includes('@s.whatsapp.net')) {
        userArg = userArg + '@s.whatsapp.net';
      }
      userToUnban = userArg;
    }
    
    if (!userToUnban) {
      return await m.reply('❌ Please reply to a message or provide a user ID to unban.');
    }
    
    const unbanned = unbanUser(userToUnban);
    
    if (unbanned) {
      return await m.reply(`✅ Successfully unbanned user: ${userToUnban.split('@')[0]}`);
    } else {
      return await m.reply('❌ User is not banned or failed to unban.');
    }
  }
);

nikka(
  {
    pattern: 'banlist',
    desc: 'List all banned users',
    category: 'admin',
  },
  async (m, { text }) => {
    const senderNumber = m.sender.split('@')[0];
    const isOwner = config.OWNER === senderNumber || 
      (config.SUDO && config.SUDO.includes(senderNumber));
    
    if (!isOwner) {
      return await m.reply('❌ This command can only be used by the bot owner or sudo users.');
    }
    
    const bannedUsers = loadBannedUsers();
    
    if (bannedUsers.length === 0) {
      return await m.reply('✅ No users are currently banned.');
    }
    
    const formattedList = bannedUsers.map(user => {
      const number = user.split('@')[0];
      return `- ${number}`;
    }).join('\n');
    
    return await m.reply(`*📋 Banned Users List:*\n\n${formattedList}`);
  }
);

module.exports = {
  isUserBanned,
  banUser,
  unbanUser,
  loadBannedUsers
};
