import type { RedisClientType } from "redis";
import { env } from "@toiletadvisor/env/auth";
import { createClient } from "redis";

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
	if (!redisClient) {
		redisClient = createClient({
			url: env.REDIS_URL,
		}) as RedisClientType;

		redisClient.on("error", (err) => {
			console.error("Redis Client Error", err);
		});

		await redisClient.connect();
	}

	return redisClient;
}
