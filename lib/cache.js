const NodeCache = require("node-cache");
const crypto = require('crypto');

class LightningCache {
    constructor() {
        this.messageCache = new NodeCache({ 
            stdTTL: 300,
            checkperiod: 60,
            useClones: false,
            maxKeys: 10000
        });
        
        this.userCache = new NodeCache({ 
            stdTTL: 1800,
            checkperiod: 120,
            useClones: false,
            maxKeys: 5000
        });
        
        this.groupCache = new NodeCache({ 
            stdTTL: 3600,
            checkperiod: 300,
            useClones: false,
            maxKeys: 1000
        });
        
        this.commandCache = new NodeCache({ 
            stdTTL: 0,
            useClones: false,
            maxKeys: 2000
        });
        
        this.mediaCache = new NodeCache({ 
            stdTTL: 600,
            checkperiod: 120,
            useClones: false,
            maxKeys: 3000
        });
        
        this.permissionCache = new NodeCache({ 
            stdTTL: 900,
            checkperiod: 180,
            useClones: false,
            maxKeys: 5000
        });

        this.quickLookup = new Map();
        this.recentMessages = new Map();
        this.userProfiles = new Map();
        
        this.lruCache = new Map();
        this.maxLRUSize = 1000;
        
        this.batchQueue = [];
        this.batchTimer = null;
        
        this.setupCacheOptimizations();
    }
    
    setupCacheOptimizations() {
        setInterval(() => {
            if (this.lruCache.size > this.maxLRUSize) {
                const keysToDelete = Array.from(this.lruCache.keys()).slice(0, 200);
                keysToDelete.forEach(key => this.lruCache.delete(key));
            }
        }, 60000);
        
        setInterval(() => {
            this.processBatchQueue();
        }, 100);
    }
    
    isDuplicateMessage(msgId) {
        if (this.recentMessages.has(msgId)) {
            return true;
        }
        
        this.recentMessages.set(msgId, Date.now());
        
        if (this.recentMessages.size > 1000) {
            const now = Date.now();
            for (const [id, timestamp] of this.recentMessages.entries()) {
                if (now - timestamp > 300000) {
                    this.recentMessages.delete(id);
                }
            }
        }
        
        return false;
    }
    
    getUserPermissions(userId) {
        const cacheKey = `perm_${userId}`;
        
        if (this.lruCache.has(cacheKey)) {
            const data = this.lruCache.get(cacheKey);
            this.lruCache.delete(cacheKey);
            this.lruCache.set(cacheKey, data);
            return data;
        }
        
        const cached = this.permissionCache.get(cacheKey);
        if (cached) {
            this.lruCache.set(cacheKey, cached);
            return cached;
        }
        
        return null;
    }
    
    setUserPermissions(userId, permissions) {
        const cacheKey = `perm_${userId}`;
        this.permissionCache.set(cacheKey, permissions);
        this.lruCache.set(cacheKey, permissions);
    }
    
    cacheUserProfile(userId, profile) {
        this.userProfiles.set(userId, {
            ...profile,
            lastAccessed: Date.now()
        });
        
        this.batchQueue.push({
            type: 'user',
            key: `user_${userId}`,
            value: profile
        });
    }
    
    getUserProfile(userId) {
        const memProfile = this.userProfiles.get(userId);
        if (memProfile) {
            memProfile.lastAccessed = Date.now();
            return memProfile;
        }
        
        const cached = this.userCache.get(`user_${userId}`);
        if (cached) {
            this.userProfiles.set(userId, { ...cached, lastAccessed: Date.now() });
            return cached;
        }
        
        return null;
    }
    
    cacheGroupMetadata(groupId, metadata) {
        const cacheKey = `group_${groupId}`;
        
        this.quickLookup.set(cacheKey, {
            data: metadata,
            timestamp: Date.now()
        });
        
        this.batchQueue.push({
            type: 'group',
            key: cacheKey,
            value: metadata
        });
    }
    
    getGroupMetadata(groupId) {
        const cacheKey = `group_${groupId}`;
        
        const quick = this.quickLookup.get(cacheKey);
        if (quick && (Date.now() - quick.timestamp) < 600000) {
            return quick.data;
        }
        
        const cached = this.groupCache.get(cacheKey);
        if (cached) {
            this.quickLookup.set(cacheKey, {
                data: cached,
                timestamp: Date.now()
            });
            return cached;
        }
        
        return null;
    }
    
    cacheCommandResponse(command, args, userId, response) {
        const hash = this.generateHash(`${command}_${args}_${userId}`);
        const cacheKey = `cmd_${hash}`;
        
        this.commandCache.set(cacheKey, {
            response,
            timestamp: Date.now(),
            hitCount: 1
        });
    }
    
    getCommandResponse(command, args, userId) {
        const hash = this.generateHash(`${command}_${args}_${userId}`);
        const cacheKey = `cmd_${hash}`;
        
        const cached = this.commandCache.get(cacheKey);
        if (cached) {
            cached.hitCount++;
            cached.lastAccessed = Date.now();
            this.commandCache.set(cacheKey, cached);
            return cached.response;
        }
        
        return null;
    }
    
    cacheMedia(mediaId, metadata) {
        this.mediaCache.set(`media_${mediaId}`, {
            ...metadata,
            cached: Date.now()
        });
    }
    
    getMediaMetadata(mediaId) {
        return this.mediaCache.get(`media_${mediaId}`);
    }
    
    processBatchQueue() {
        if (this.batchQueue.length === 0) return;
        
        const batch = this.batchQueue.splice(0, 50);
        
        for (const item of batch) {
            switch (item.type) {
                case 'user':
                    this.userCache.set(item.key, item.value);
                    break;
                case 'group':
                    this.groupCache.set(item.key, item.value);
                    break;
                case 'message':
                    this.messageCache.set(item.key, item.value);
                    break;
            }
        }
    }
    
    generateHash(str) {
        return crypto.createHash('md5').update(str).digest('hex').substring(0, 16);
    }
    
    warmCache(dataLoader) {
        if (typeof dataLoader === 'function') {
            dataLoader(this);
        }
    }
    
    getStats() {
        return {
            messages: {
                keys: this.messageCache.keys().length,
                hits: this.messageCache.getStats().hits,
                misses: this.messageCache.getStats().misses
            },
            users: {
                keys: this.userCache.keys().length,
                hits: this.userCache.getStats().hits,
                misses: this.userCache.getStats().misses
            },
            groups: {
                keys: this.groupCache.keys().length,
                hits: this.groupCache.getStats().hits,
                misses: this.groupCache.getStats().misses
            },
            commands: {
                keys: this.commandCache.keys().length,
                hits: this.commandCache.getStats().hits,
                misses: this.commandCache.getStats().misses
            },
            quickLookupSize: this.quickLookup.size,
            lruCacheSize: this.lruCache.size,
            recentMessagesSize: this.recentMessages.size,
            userProfilesSize: this.userProfiles.size,
            batchQueueSize: this.batchQueue.length
        };
    }
    
    clearCache(type) {
        switch (type) {
            case 'messages':
                this.messageCache.flushAll();
                this.recentMessages.clear();
                break;
            case 'users':
                this.userCache.flushAll();
                this.userProfiles.clear();
                break;
            case 'groups':
                this.groupCache.flushAll();
                break;
            case 'commands':
                this.commandCache.flushAll();
                break;
            case 'all':
                this.messageCache.flushAll();
                this.userCache.flushAll();
                this.groupCache.flushAll();
                this.commandCache.flushAll();
                this.mediaCache.flushAll();
                this.permissionCache.flushAll();
                this.quickLookup.clear();
                this.lruCache.clear();
                this.recentMessages.clear();
                this.userProfiles.clear();
                this.batchQueue.length = 0;
                break;
        }
    }
    
    emergencyClear() {
        this.quickLookup.clear();
        this.lruCache.clear();
        this.recentMessages.clear();
        
        const messageKeys = this.messageCache.keys();
        const userKeys = this.userCache.keys();
        const groupKeys = this.groupCache.keys();
        
        messageKeys.slice(0, Math.floor(messageKeys.length / 2)).forEach(key => {
            this.messageCache.del(key);
        });
        
        userKeys.slice(0, Math.floor(userKeys.length / 2)).forEach(key => {
            this.userCache.del(key);
        });
        
        groupKeys.slice(0, Math.floor(groupKeys.length / 2)).forEach(key => {
            this.groupCache.del(key);
        });
    }
}

const lightningCache = new LightningCache();

const cacheHelpers = {
    isMessageDuplicate: (msgId) => lightningCache.isDuplicateMessage(msgId),
    cacheUser: (userId, userData) => lightningCache.cacheUserProfile(userId, userData),
    getUser: (userId) => lightningCache.getUserProfile(userId),
    getUserPerms: (userId) => lightningCache.getUserPermissions(userId),
    setUserPerms: (userId, perms) => lightningCache.setUserPermissions(userId, perms),
    cacheGroup: (groupId, metadata) => lightningCache.cacheGroupMetadata(groupId, metadata),
    getGroup: (groupId) => lightningCache.getGroupMetadata(groupId),
    cacheCommand: (cmd, args, userId, response) => lightningCache.cacheCommandResponse(cmd, args, userId, response),
    getCommand: (cmd, args, userId) => lightningCache.getCommandResponse(cmd, args, userId),
    cacheMedia: (mediaId, metadata) => lightningCache.cacheMedia(mediaId, metadata),
    getMedia: (mediaId) => lightningCache.getMediaMetadata(mediaId),
    getStats: () => lightningCache.getStats(),
    clearCache: (type) => lightningCache.clearCache(type),
    warmCache: (loader) => lightningCache.warmCache(loader)
};

module.exports = {
    LightningCache,
    lightningCache,
    cacheHelpers
};