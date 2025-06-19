const {connRedis, client} = require("../redis");

const RAM ={
    enable: async(jid) => {
        await connRedis()
        await client.hSet(`ram:${jid.split("@")}`, {
            enabled: "true"
        })
    },
    disable: async(jid) => {
        await connRedis()
        await client.hSet(`ram:${jid.split("@")}`, {
            enabled: "false"
        })
    },
    isEnabled: async(jid) => {
        await connRedis()
        const data = await client.hGetAll(`ram:${jid.split("@")}`)
        return data.enabled === "true"
    }


}
module.exports = RAM;