import { createClient } from "redis";

let redisClient: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
	if (!redisClient) {
		redisClient = createClient({
			url: process.env.REDIS_URL || "redis://localhost:6379",
		});
		await redisClient.connect();
	}
	return redisClient;
}
