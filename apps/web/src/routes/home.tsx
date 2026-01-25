import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import type { Route } from "./+types/home";

export function meta(_: Route.MetaArgs) {
	return [
		{ title: "ToiletAdvisor - Trouvez et Évaluez les Meilleurs Toilettes" },
		{
			name: "description",
			content:
				"Découvrez et partagez des avis sur les toilettes du monde entier. Trouvez des installations propres et accessibles près de chez vous.",
		},
	];
}

export default function Home(_: Route.ComponentProps) {
	return (
		<div className="min-h-screen">
			{/* Hero Section */}
			<section className="px-4 py-24 lg:py-32">
				<div className="mx-auto max-w-4xl text-center">
					<h1 className="mb-6 text-5xl font-bold leading-tight sm:text-6xl">
						Trouvez et partagez les meilleurs toilettes publiques
					</h1>
					<p className="mx-auto mb-10 max-w-2xl text-lg text-slate-600 dark:text-slate-400">
						Consultez les avis de la communauté et aidez les autres à trouver des
						toilettes propres et accessibles.
					</p>
					<div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
						<Button
							render={
								<Link to="/register" className="flex items-center gap-2">
									Commencer
								</Link>
							}
							size="lg"
							className="bg-cyan-600 hover:bg-cyan-700 text-white"
						/>
						<Button
							render={<Link to="/login">Se Connecter</Link>}
							size="lg"
							variant="outline"
						/>
					</div>
				</div>
			</section>
		</div>
	);
}
