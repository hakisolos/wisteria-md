const { connRedis, client } = require("../redis");

const cacheRedis = {
    cacheGroup: async (jid, sock) => {
        try {
            await connRedis();
            if (!jid) return;

            const data = await sock.groupMetadata(jid);
            await client.set(jid, JSON.stringify(data), { EX: 60 * 5 }); 

        } catch (e) {
            console.log("cacheGroup error ❌:", e);
        }
    },
    

    getGroupData: async (jid) => {
        try {
            await connRedis();
            if (!jid) return;
            const data = await client.get(jid);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.log("getGroupData error ❌:", e);
        }
    },

    existGroupData: async (jid) => {
        try {
            await connRedis();
            const data = await client.get(jid);
            return !(data);
        } catch (e) {
            console.log("existGroupData error ❌:", e);
        }
    }
};

module.exports = cacheRedis;
