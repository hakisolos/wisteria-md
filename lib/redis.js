import { createClient } from "redis";

const client = createClient();

let isConnected = false;

client.on("error", (err) => {
    console.log("Redis Error :", err.message);
});

const connRedis = async () => {
    if (!isConnected) {
        await client.connect();
        isConnected = true;
        console.log("💖 Redis connected!");
    }
};

exports = {
    client,
    connRedis
}
