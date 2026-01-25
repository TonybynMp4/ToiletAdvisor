import { useQuery } from "@tanstack/react-query";
import { apiTrpc, authTrpc } from "@/utils/trpc";
import type { Route } from "./+types/home";

const TITLE_TEXT = `
 ██████╗ ███████╗████████╗████████╗███████╗██████╗
 ██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝██╔════╝██╔══██╗
 ██████╔╝█████╗     ██║      ██║   █████╗  ██████╔╝
 ██╔══██╗██╔══╝     ██║      ██║   ██╔══╝  ██╔══██╗
 ██████╔╝███████╗   ██║      ██║   ███████╗██║  ██║
 ╚═════╝ ╚══════╝   ╚═╝      ╚═╝   ╚══════╝╚═╝  ╚═╝

 ████████╗    ███████╗████████╗ █████╗  ██████╗██╗  ██╗
 ╚══██╔══╝    ██╔════╝╚══██╔══╝██╔══██╗██╔════╝██║ ██╔╝
    ██║       ███████╗   ██║   ███████║██║     █████╔╝
    ██║       ╚════██║   ██║   ██╔══██║██║     ██╔═██╗
    ██║       ███████║   ██║   ██║  ██║╚██████╗██║  ██╗
    ╚═╝       ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝
 `;

export function meta(_: Route.MetaArgs) {
    return [
        { title: "toiletadvisor" },
        { name: "description", content: "toiletadvisor is a web application" },
    ];
}

export default function Home(_: Route.ComponentProps) {
    const healthChecks = {
        api: useQuery(apiTrpc.healthCheck.queryOptions()),
        auth: useQuery(authTrpc.healthCheck.queryOptions()),
    };

    return (
        <div className="container mx-auto max-w-3xl px-4 py-2">
            <pre className="overflow-x-auto font-mono text-sm">{TITLE_TEXT}</pre>
            <div className="grid gap-6">
                <section className="rounded-lg border p-4">
                    <h2 className="mb-2 font-medium">APIs Status</h2>
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-2 w-2 rounded-full ${healthChecks.api.data ? "bg-green-500" : "bg-red-500"}`}
                        />
                        <span className="text-sm text-muted-foreground">
                            {healthChecks.api.isLoading
                                ? "Checking API..."
                                : "API " + (healthChecks.api.data ? "Connected" : "Disconnected")}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className={`h-2 w-2 rounded-full ${healthChecks.auth.data ? "bg-green-500" : "bg-red-500"}`}
                        />
                        <span className="text-sm text-muted-foreground">
                            {healthChecks.auth.isLoading
                                ? "Checking Auth..."
                                : "Auth " + (healthChecks.auth.data ? "Connected" : "Disconnected")}
                        </span>
                    </div>
                </section>
            </div>
        </div>
    );
}
