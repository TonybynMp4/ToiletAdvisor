import { env } from "@toiletadvisor/env/file";
import cors from "cors";
import express from "express";
import { createRouteHandler } from "uploadthing/express";
import { uploadRouter } from "./uploadthing";

const app = express();

app.use(
	cors({
		origin: env.CORS_ORIGIN,
		methods: ["GET", "POST", "OPTIONS"],
	}),
);

app.use(express.json());

app.get("/health", (_req, res) => {
	res.status(200).send("OK");
});

app.use(
	"/api/uploadthing",
	createRouteHandler({
		router: uploadRouter,
		config: {
			token: env.UPLOADTHING_TOKEN,
			logLevel: "Error",
		},
	}),
);

app.listen(env.PORT, () => {
	console.log(`Server is running on http://localhost:${env.PORT}`);
});
