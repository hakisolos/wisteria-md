const user = require("../lib/database/user");

// Register a new user
nikka(
    {
        pattern: "register",
        desc: "registers a user",
        category: "user",
        react: "✅",
        use: ".register [premium]"
    },
    async(m, { match }) => {
        try {
            // Check if user is owner
            const isOwner = m.sender.split("@")[0] === "2349112171078";
            
            let targetJid, targetName;
            let registerAsPremium = match && match.toLowerCase().includes("premium");
            
            // If replying to someone and is owner, register that person
            if (m.quoted && isOwner) {
                targetJid = m.quoted.sender;
                try {
                    // Try to get the name from contact if available
                    const contact = await m.client.getContact(targetJid);
                    targetName = contact.name || contact.notify || "User";
                } catch (e) {
                    targetName = m.quoted.pushName || "User";
                }
            } else {
                // Register self
                targetJid = m.sender;
                targetName = m.pushName || "User";
                
                // Only owner can register as premium
                if (registerAsPremium && !isOwner) {
                    return m.reply("Only the owner can register premium accounts.");
                }
            }
            
            // Check if user is already registered
            const isRegistered = await user.isRegistered(targetJid);
            if (isRegistered) {
                return m.reply(targetJid === m.sender ? 
                    "You are already registered!" : 
                    "This user is already registered!");
            }
            
            // Get profile picture URL if available
            let ppUrl = "";
            try {
                ppUrl = await m.client.profilePictureUrl(targetJid, "image");
            } catch (error) {
                // No profile picture available
            }
            
            // Register user
            const newUser = await user.addUser(
                targetJid, 
                targetName, 
                "", 
                "", 
                ppUrl, 
                registerAsPremium && isOwner
            );
            
            const premiumText = registerAsPremium && isOwner ? " as premium user" : "";
            return m.reply(targetJid === m.sender ? 
                `Successfully registered${premiumText}! Welcome, ${targetName}!` : 
                `Successfully registered ${targetName}${premiumText}!`);
        } catch (error) {
            console.error("Registration error:", error);
            return m.reply("Failed to register. Please try again later.");
        }
    }
);
nikka(
    {
        pattern: "deleteuser",
        desc: "deletes a registered user",
        category: "user",
        react: "❌",
        use: ".deleteuser (reply to a registered user)"
    },
    async (m) => {
        try {
            const isOwner = m.sender.split("@")[0] === "2349112171078";

            if (!isOwner) {
                return m.reply("Only the owner can delete users, baby 💋");
            }

            let targetJid;

            if (m.quoted) {
                targetJid = m.quoted.sender;
            } else {
                return m.reply("Please reply to the user you want to delete 😢");
            }

            const isRegistered = await user.isRegistered(targetJid);
            if (!isRegistered) {
                return m.reply("This user isn't even registered, honey 🍃");
            }

            await user.removeUser(targetJid);
            return m.reply(`💔 Successfully deleted the user: ${targetJid.split("@")[0]} 💔`);
        } catch (error) {
            console.error("Delete user error:", error);
            return m.reply("Couldn't delete the user, my love. Try again later 😭");
        }
    }
);

// Get user profile info
nikka(
    {
        pattern: "profile",
        desc: "shows user profile information",
        category: "user",
        react: "👤",
        use: ".profile"
    },
    async(m, { match }) => {
        try {
            let targetJid;
            
            // Check if message contains mentions
            if (match && match.includes("@")) {
                // Extract the mentioned number from the text
                const mentionedNumber = match.match(/@(\d+)/);
                if (mentionedNumber && mentionedNumber[1]) {
                    targetJid = `${mentionedNumber[1]}@s.whatsapp.net`;
                }
            }
            
            // If no mentions, check if replying to someone
            if (!targetJid && m.quoted) {
                targetJid = m.quoted.sender;
            }
            
            // If no mention or reply, use sender's JID
            if (!targetJid) {
                targetJid = m.sender;
            }
            
            const userData = await user.getUser(targetJid);
            
            if (!userData) {
                return m.reply(targetJid === m.sender ? 
                    "You are not registered! Use .register to register." : 
                    "This user is not registered.");
            }
            
            // Update last seen for the requesting user
            if (targetJid === m.sender) {
                await user.updateLastSeen(targetJid);
            }
            
            // Format join date
            const joinDate = userData.joinedAt.toLocaleDateString();
            
            // Create profile text
            let profileText = `*「 USER PROFILE 」*\n\n`;
            profileText += `*🪪 Name:* ${userData.name}\n`;
            profileText += `*📝 Description:* ${userData.description || "Not set"}\n`;
            profileText += `*🔖 About:* ${userData.about || "Not set"}\n`;
            profileText += `*🌟 Premium:* ${userData.isPremium ? "Yes" : "No"}\n`;
            profileText += `*📅 Joined:* ${joinDate}\n`;
            profileText += `*⚙️ Prefix:* ${userData.settings.prefix}\n`;
            
            // Try to get profile picture directly from WhatsApp
            try {
                const ppUrl = await m.client.profilePictureUrl(targetJid, 'image');
                
                // Send profile with picture
                await m.client.sendMessage(m.jid, { 
                    image: { url: ppUrl },
                    caption: profileText 
                });
            } catch (e) {
                // If no profile picture from WhatsApp, try database
                if (userData.ppUrl) {
                    await m.client.sendMessage(m.jid, { 
                        image: { url: userData.ppUrl },
                        caption: profileText 
                    });
                } else {
                    // No picture available, just send text
                    await m.reply(profileText);
                }
            }
        } catch (error) {
            console.error("Profile error:", error);
            return m.reply("Failed to fetch profile. Please try again later.");
        }
    }
);

// Set user description
nikka(
    {
        pattern: "setdesc",
        desc: "sets user description",
        category: "user",
        react: "📝",
        use: ".setdesc [description]"
    },
    async(m, { match }) => {
        try {
            const jid = m.sender;
            const desc = match;
            
            if (!desc) {
                return m.reply("Please provide a description to set.");
            }
            
            const userData = await user.getUser(jid);
            if (!userData) {
                return m.reply("You are not registered! Use .register to register.");
            }
            
            await user.updateUser(jid, { description: desc });
            return m.reply("Description updated successfully!");
        } catch (error) {
            console.error("Set description error:", error);
            return m.reply("Failed to update description. Please try again later.");
        }
    }
);

// Set user about
nikka(
    {
        pattern: "setabout",
        desc: "sets user about info",
        category: "user",
        react: "🔖",
        use: ".setabout [about text]"
    },
    async(m, { match }) => {
        try {
            const jid = m.sender;
            const about = match;
            
            if (!about) {
                return m.reply("Please provide about text to set.");
            }
            
            const userData = await user.getUser(jid);
            if (!userData) {
                return m.reply("You are not registered! Use .register to register.");
            }
            
            await user.updateUser(jid, { about: about });
            return m.reply("About info updated successfully!");
        } catch (error) {
            console.error("Set about error:", error);
            return m.reply("Failed to update about info. Please try again later.");
        }
    }
);

// Set user prefix
nikka(
    {
        pattern: "setprefix",
        desc: "sets custom command prefix",
        category: "user",
        react: "⚙️",
        use: ".setprefix [prefix]"
    },
    async(m, { match }) => {
        try {
            const jid = m.sender;
            const newPrefix = match;
            
            if (!newPrefix) {
                return m.reply("Please provide a prefix to set.");
            }
            
            if (newPrefix.length > 3) {
                return m.reply("Prefix must be 3 characters or less.");
            }
            
            const userData = await user.getUser(jid);
            if (!userData) {
                return m.reply("You are not registered! Use .register to register.");
            }
            
            await user.updateUserSetting(jid, "prefix", newPrefix);
            return m.reply(`Prefix updated successfully to "${newPrefix}"`);
        } catch (error) {
            console.error("Set prefix error:", error);
            return m.reply("Failed to update prefix. Please try again later.");
        }
    }
);

// Toggle notifications setting
nikka(
    {
        pattern: "notifications",
        desc: "toggle notifications on/off",
        category: "user",
        react: "🔔",
        use: ".notifications [on/off]"
    },
    async(m, { match }) => {
        try {
            const jid = m.sender;
            const status = match ? match.toLowerCase() : "";
            
            if (!["on", "off"].includes(status)) {
                return m.reply("Please specify either 'on' or 'off'.");
            }
            
            const userData = await user.getUser(jid);
            if (!userData) {
                return m.reply("You are not registered! Use .register to register.");
            }
            
            const notificationStatus = status === "on";
            await user.updateUserSetting(jid, "notifications", notificationStatus);
            return m.reply(`Notifications turned ${status} successfully!`);
        } catch (error) {
            console.error("Notifications error:", error);
            return m.reply("Failed to update notification settings. Please try again later.");
        }
    }
);

// Admin command: List all users
nikka(
    {
        pattern: "allusers",
        desc: "lists all registered users (admin only)",
        category: "admin",
        react: "📊",
        use: ".allusers"
    },
    async(m) => {
        try {
            // Check if user is owner
            const isOwner = m.sender.split("@")[0] === "2349112171078";
            
            if (!isOwner) {
                return m.reply("This command is for the owner only.");
            }
            
            const allUsers = await user.listAllUsers();
            const userCount = allUsers.length;
            
            let usersList = `*「 REGISTERED USERS 」*\n\n`;
            usersList += `*Total Users:* ${userCount}\n\n`;
            
            allUsers.forEach((user, index) => {
                usersList += `${index + 1}. ${user.name} ${user.isPremium ? "🌟" : ""}\n`;
            });
            
            return m.reply(usersList);
        } catch (error) {
            console.error("List users error:", error);
            return m.reply("Failed to list users. Please try again later.");
        }
    }
);

// Admin command: Make a user premium
nikka(
    {
        pattern: "premium",
        desc: "grants premium status to a user (owner only)",
        category: "admin",
        react: "🌟",
        use: ".premium @user"
    },
    async(m, { match }) => {
        try {
            // Check if user is owner
            const isOwner = m.sender.split("@")[0] === "2349112171078";
            
            if (!isOwner) {
                return m.reply("This command is for the owner only.");
            }
            
            let targetJid;
            
            // Check if message contains mentions
            if (match && match.includes("@")) {
                // Extract the mentioned number from the text
                const mentionedNumber = match.match(/@(\d+)/);
                if (mentionedNumber && mentionedNumber[1]) {
                    targetJid = `${mentionedNumber[1]}@s.whatsapp.net`;
                }
            }
            
            // If no mentions, check if replying to someone
            if (!targetJid && m.quoted) {
                targetJid = m.quoted.sender;
            }
            
            if (!targetJid) {
                return m.reply("Please mention a user or reply to their message.");
            }
            
            const userData = await user.getUser(targetJid);
            if (!userData) {
                return m.reply("This user is not registered.");
            }
            
            const updatedUser = await user.togglePremium(targetJid);
            const premiumStatus = updatedUser.isPremium ? "granted to" : "removed from";
            
            return m.reply(`Premium status ${premiumStatus} ${updatedUser.name}!`);
        } catch (error) {
            console.error("Premium toggle error:", error);
            return m.reply("Failed to update premium status. Please try again later.");
        }
    }
);

// Admin command: Ban user
nikka(
    {
        pattern: "ban",
        desc: "bans a user (owner only)",
        category: "admin",
        react: "🚫",
        use: ".ban @user [reason]"
    },
    async(m, { match }) => {
        try {
            // Check if user is owner
            const isOwner = m.sender.split("@")[0] === "2349112171078";
            
            if (!isOwner) {
                return m.reply("This command is for the owner only.");
            }
            
            let targetJid;
            
            // Check if message contains mentions
            if (match && match.includes("@")) {
                // Extract the mentioned number from the text
                const mentionedNumber = match.match(/@(\d+)/);
                if (mentionedNumber && mentionedNumber[1]) {
                    targetJid = `${mentionedNumber[1]}@s.whatsapp.net`;
                }
            }
            
            // If no mentions, check if replying to someone
            if (!targetJid && m.quoted) {
                targetJid = m.quoted.sender;
            }
            
            if (!targetJid) {
                return m.reply("Please mention a user or reply to their message.");
            }
            
            // Extract ban reason
            let reason = "";
            if (match) {
                // Remove the mention part from the reason if it exists
                reason = match.replace(/@\d+/g, "").trim();
            }
            
            const userData = await user.getUser(targetJid);
            if (!userData) {
                return m.reply("This user is not registered.");
            }
            
            await user.banUser(targetJid, reason);
            return m.reply(`User ${userData.name} has been banned.\nReason: ${reason || "Not specified"}`);
        } catch (error) {
            console.error("Ban user error:", error);
            return m.reply("Failed to ban user. Please try again later.");
        }
    }
);

// Admin command: Unban user
nikka(
    {
        pattern: "unban",
        desc: "unbans a user (owner only)",
        category: "admin",
        react: "✅",
        use: ".unban @user"
    },
    async(m, { match }) => {
        try {
            // Check if user is owner
            const isOwner = m.sender.split("@")[0] === "2349112171078";
            
            if (!isOwner) {
                return m.reply("This command is for the owner only.");
            }
            
            let targetJid;
            
            // Check if message contains mentions
            if (match && match.includes("@")) {
                // Extract the mentioned number from the text
                const mentionedNumber = match.match(/@(\d+)/);
                if (mentionedNumber && mentionedNumber[1]) {
                    targetJid = `${mentionedNumber[1]}@s.whatsapp.net`;
                }
            }
            
            // If no mentions, check if replying to someone
            if (!targetJid && m.quoted) {
                targetJid = m.quoted.sender;
            }
            
            if (!targetJid) {
                return m.reply("Please mention a user or reply to their message.");
            }
            
            const userData = await user.getUser(targetJid);
            if (!userData) {
                return m.reply("This user is not registered.");
            }
            
            if (!userData.ban) {
                return m.reply("This user is not banned.");
            }
            
            await user.unbanUser(targetJid);
            return m.reply(`User ${userData.name} has been unbanned.`);
        } catch (error) {
            console.error("Unban user error:", error);
            return m.reply("Failed to unban user. Please try again later.");
        }
    }
);

// Check banned users
nikka(
    {
        pattern: "bannedusers",
        desc: "lists all banned users (owner only)",
        category: "admin",
        react: "📋",
        use: ".bannedusers"
    },
    async(m) => {
        try {
            // Check if user is owner
            const isOwner = m.sender.split("@")[0] === "2349112171078";
            
            if (!isOwner) {
                return m.reply("This command is for the owner only.");
            }
            
            const bannedUsers = await user.getBannedUsers();
            
            if (bannedUsers.length === 0) {
                return m.reply("There are no banned users.");
            }
            
            let bannedList = `*「 BANNED USERS 」*\n\n`;
            bannedList += `*Total Banned:* ${bannedUsers.length}\n\n`;
            
            bannedUsers.forEach((user, index) => {
                bannedList += `${index + 1}. ${user.name}\n`;
                bannedList += `   Reason: ${user.banReason || "Not specified"}\n\n`;
            });
            
            return m.reply(bannedList);
        } catch (error) {
            console.error("Banned users list error:", error);
            return m.reply("Failed to list banned users. Please try again later.");
        }
    }
);

// Check active users
nikka(
    {
        pattern: "activeusers",
        desc: "lists recently active users (owner only)",
        category: "admin",
        react: "🔍",
        use: ".activeusers [hours]"
    },
    async(m, { match }) => {
        try {
            // Check if user is owner
            const isOwner = m.sender.split("@")[0] === "2349112171078";
            
            if (!isOwner) {
                return m.reply("This command is for the owner only.");
            }
            
            // Get hours parameter, default is 24
            const hours = parseInt(match) || 24;
            
            const activeUsers = await user.getRecentlyActiveUsers(hours);
            
            if (activeUsers.length === 0) {
                return m.reply(`No users have been active in the last ${hours} hours.`);
            }
            
            let activeList = `*「 ACTIVE USERS 」*\n\n`;
            activeList += `*Active in last ${hours} hours:* ${activeUsers.length}\n\n`;
            
            activeUsers.forEach((user, index) => {
                const lastActive = user.lastSeen ? new Date(user.lastSeen).toLocaleString() : "Unknown";
                activeList += `${index + 1}. ${user.name} ${user.isPremium ? "🌟" : ""}\n`;
                activeList += `   Last active: ${lastActive}\n`;
            });
            
            return m.reply(activeList);
        } catch (error) {
            console.error("Active users list error:", error);
            return m.reply("Failed to list active users. Please try again later.");
        }
    }
);

// Search users
nikka(
    {
        pattern: "searchuser",
        desc: "search for users by name",
        category: "user",
        react: "🔍",
        use: ".searchuser [query]"
    },
    async(m, { match }) => {
        try {
            const query = match;
            
            if (!query) {
                return m.reply("Please provide a search query.");
            }
            
            const results = await user.searchUsersByName(query);
            
            if (results.length === 0) {
                return m.reply(`No users found matching "${query}".`);
            }
            
            let resultsList = `*「 USER SEARCH RESULTS 」*\n\n`;
            resultsList += `*Query:* ${query}\n`;
            resultsList += `*Results:* ${results.length}\n\n`;
            
            results.forEach((user, index) => {
                resultsList += `${index + 1}. ${user.name} ${user.isPremium ? "🌟" : ""}\n`;
            });
            
            return m.reply(resultsList);
        } catch (error) {
            console.error("User search error:", error);
            return m.reply("Failed to search users. Please try again later.");
        }
    }
);

// Update profile picture
nikka(
    {
        pattern: "setpp",
        desc: "updates user profile picture",
        category: "user",
        react: "🖼️",
        use: ".setpp"
    },
    async(m) => {
        try {
            const jid = m.sender;
            
            // Check if user is registered
            const userData = await user.getUser(jid);
            if (!userData) {
                return m.reply("You are not registered! Use .register to register.");
            }
            
            // Check if message contains image
            if (!m.quoted || !m.quoted.mimetype || !m.quoted.mimetype.includes("image")) {
                return m.reply("Please reply to an image to set as your profile picture.");
            }
            
            // Download the image
            const media = await m.quoted.download();
            
            // Upload to profile picture (this will depend on your setup)
            // For this example, we'll assume it's stored somewhere and the URL is returned
            // You may need to implement your own image hosting solution
            let ppUrl = "";
            try {
                // This is a placeholder for your image upload implementation
                // ppUrl = await uploadImage(media);
                ppUrl = "IMAGE_URL_HERE"; // Replace with actual upload logic
                
                // Update user profile picture in database
                await user.updateUser(jid, { ppUrl });
                return m.reply("Profile picture updated successfully!");
            } catch (error) {
                console.error("Image upload error:", error);
                return m.reply("Failed to upload profile picture. Please try again later.");
            }
        } catch (error) {
            console.error("Set profile picture error:", error);
            return m.reply("Failed to update profile picture. Please try again later.");
        }
    }
);

// Get user count stats
nikka(
    {
        pattern: "userstats",
        desc: "shows user statistics",
        category: "admin",
        react: "📊",
        use: ".userstats"
    },
    async(m) => {
        try {
            // Check if user is admin for detailed stats
            const isAdmin = m.isAdmin || m.isBotAdmin;
            
            const totalUsers = await user.getUserCount();
            const premiumUsers = await user.getUsersWithPremium();
            const bannedUsers = await user.getBannedUsers();
            const activeUsers = await user.getRecentlyActiveUsers(24);
            
            let statsText = `*「 USER STATISTICS 」*\n\n`;
            statsText += `*Total Users:* ${totalUsers}\n`;
            statsText += `*Premium Users:* ${premiumUsers.length}\n`;
            
            if (isAdmin) {
                statsText += `*Banned Users:* ${bannedUsers.length}\n`;
                statsText += `*Active (24h):* ${activeUsers.length}\n`;
                
                // Calculate percentage of premium users
                const premiumPercentage = (premiumUsers.length / totalUsers * 100).toFixed(1);
                statsText += `*Premium Ratio:* ${premiumPercentage}%\n`;
                
                // Calculate active user percentage
                const activePercentage = (activeUsers.length / totalUsers * 100).toFixed(1);
                statsText += `*Active Ratio:* ${activePercentage}%\n`;
            }
            
            return m.reply(statsText);
        } catch (error) {
            console.error("User stats error:", error);
            return m.reply("Failed to fetch user statistics. Please try again later.");
        }
    }
);

nikka(
{
pattern: "setpremium",
desc: "gives premium status to a user (owner only)",
category: "admin",
react: "💎",
use: ".setpremium (reply to a user)"
},
async(m, { match }) => {
    try {
        // Check if user is owner
        const isOwner = m.sender.split("@")[0] === "2349112171078";

        if (!isOwner) {
            return m.reply("This command is for the owner only.");
        }
        
        let targetJid;
        
        // Check if message contains mentions
        if (match && match.includes("@")) {
            // Extract the mentioned number from the text
            const mentionedNumber = match.match(/@(\d+)/);
            if (mentionedNumber && mentionedNumber[1]) {
                targetJid = `${mentionedNumber[1]}@s.whatsapp.net`;
            }
        }
        
        // If no mentions, check if replying to someone
        if (!targetJid && m.quoted) {
            targetJid = m.quoted.sender;
        }
        
        if (!targetJid) {
            return m.reply("Please mention a user or reply to their message.");
        }
        
        const userData = await user.getUser(targetJid);
        if (!userData) {
            return m.reply("This user is not registered!");
        }
        
        // Check if user is already premium
        if (userData.isPremium) {
            return m.reply(`${userData.name} is already a premium user!`);
        }
        
        // Set user as premium
        await user.togglePremium(targetJid);
        
        return m.reply(`✨ ${userData.name} has been upgraded to premium status! ✨`);
    } catch (error) {
        console.error("Set premium error:", error);
        return m.reply("Failed to set premium status. Please try again later.");
    }
}
);


nikka(
{
pattern: "delpremium",
desc: "removes premium status from a user (owner only)",
category: "admin",
react: "📉",
use: ".delpremium (reply to a premium user)"
},
async(m, { match }) => {
    try {
        // Check if user is owner
        const isOwner = m.sender.split("@")[0] === "2349112171078";

        if (!isOwner) {
            return m.reply("This command is for the owner only.");
        }
        
        let targetJid;
        
        // Check if message contains mentions
        if (match && match.includes("@")) {
            // Extract the mentioned number from the text
            const mentionedNumber = match.match(/@(\d+)/);
            if (mentionedNumber && mentionedNumber[1]) {
                targetJid = `${mentionedNumber[1]}@s.whatsapp.net`;
            }
        }
        
        // If no mentions, check if replying to someone
        if (!targetJid && m.quoted) {
            targetJid = m.quoted.sender;
        }
        
        if (!targetJid) {
            return m.reply("Please mention a user or reply to their message.");
        }
        
        const userData = await user.getUser(targetJid);
        if (!userData) {
            return m.reply("This user is not registered!");
        }
        
        // Check if user is not premium
        if (!userData.isPremium) {
            return m.reply(`${userData.name} is not a premium user!`);
        }
        
        // Remove premium status
        await user.togglePremium(targetJid);
        
        return m.reply(`${userData.name}'s premium status has been revoked.`);
    } catch (error) {
        console.error("Remove premium error:", error);
        return m.reply("Failed to remove premium status. Please try again later.");
    }
}
);