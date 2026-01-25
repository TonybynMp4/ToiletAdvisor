import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
	index("./routes/home.tsx"),
	layout("./routes/_protected/layout.tsx", [
		route("feed", "./routes/_protected/feed.tsx"),
		route("search", "./routes/_protected/search.tsx"),
		route("profile", "./routes/_protected/profile.tsx"),
		route("reviews/:id", "./routes/_protected/reviews/$id.tsx"),
	]),
	route("login", "./routes/auth/login.tsx"),
	route("register", "./routes/auth/register.tsx"),
] satisfies RouteConfig;
