const {createClient} = require("redis")

const client = createClient();

client.on("error", (err) => {
    console.log(err)
})

const connRedis = async() => {
    if(!client.isOpen) await client.connect()
}

module.exports = {client, connRedis}
