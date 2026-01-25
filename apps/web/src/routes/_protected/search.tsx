import { useQuery } from "@tanstack/react-query";
import { Camera, Filter, Search, Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { FieldWrapper as Field } from "@/components/ui/field-wrapper";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiTrpc } from "@/utils/trpc";

export default function SearchPage() {
	const [searchQuery, setSearchQuery] = useState("");
	const [minRating, setMinRating] = useState<number | undefined>(undefined);
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const { data: reviews, isLoading } = useQuery(
		apiTrpc.post.getAll.queryOptions({
			search: debouncedSearch || undefined,
			minRating: minRating,
			limit: 50,
			offset: 0,
		}),
	);

	const handleSearch = () => {
		setDebouncedSearch(searchQuery);
	};

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	const handleRatingChange = (value: string | null) => {
		if (!value || value === "all") {
			setMinRating(undefined);
		} else {
			setMinRating(Number(value));
		}
	};

	const filteredCount = reviews?.length || 0;

	return (
		<div className="min-h-screen">
			<div className="container mx-auto max-w-7xl px-4 py-12">
				<div
					className={`mb-12 ${mounted ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : ""}`}
				>
					<h1 className="mb-3 text-4xl font-bold text-cyan-600 dark:text-cyan-400">
						Recherche
					</h1>
					<p className="text-lg text-slate-600 dark:text-slate-300">
						Trouvez les toilettes parfaites par lieu ou note
					</p>
				</div>

				{/* Search Filters */}
				<div
					className={`mb-10 rounded-3xl p-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg ${mounted ? "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100" : ""}`}
				>
					<div className="mb-6 flex items-center gap-3">
						<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600">
							<Filter className="h-5 w-5 text-white" />
						</div>
						<h2 className="text-2xl font-bold">Filtres</h2>
					</div>

					<div className="grid gap-6 md:grid-cols-2">
						<Field label="Rechercher un Lieu">
							<div className="flex gap-3">
								<Input
									placeholder="Nom du lieu..."
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									onKeyPress={handleKeyPress}
									className="flex-1 border-slate-200 text-base dark:border-slate-700"
								/>
								<Button
									onClick={handleSearch}
									className="bg-cyan-600 hover:bg-cyan-700 h-11 px-6 font-semibold text-white"
								>
									<Search className="h-5 w-5" />
								</Button>
							</div>
						</Field>

						<Field label="Note Minimale">
							<Select
								value={minRating?.toString() || "all"}
								onValueChange={handleRatingChange}
							>
								<SelectTrigger className="h-11 border-slate-200 text-base dark:border-slate-700">
									<SelectValue placeholder="Toutes les notes" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Toutes les notes</SelectItem>
									<SelectItem value="1">
										<div className="flex items-center gap-2">
											<Star className="h-4 w-4 fill-current text-yellow-500" />
											1+ Étoile
										</div>
									</SelectItem>
									<SelectItem value="2">
										<div className="flex items-center gap-2">
											<Star className="h-4 w-4 fill-current text-yellow-500" />
											2+ Étoiles
										</div>
									</SelectItem>
									<SelectItem value="3">
										<div className="flex items-center gap-2">
											<Star className="h-4 w-4 fill-current text-yellow-500" />
											3+ Étoiles
										</div>
									</SelectItem>
									<SelectItem value="4">
										<div className="flex items-center gap-2">
											<Star className="h-4 w-4 fill-current text-yellow-500" />
											4+ Étoiles
										</div>
									</SelectItem>
									<SelectItem value="5">
										<div className="flex items-center gap-2">
											<Star className="h-4 w-4 fill-current text-yellow-500" />
											5 Étoiles
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</Field>
					</div>

					{(debouncedSearch || minRating) && (
						<div className="mt-6 rounded-xl bg-cyan-50 px-4 py-3 dark:bg-cyan-900/20">
							<p className="text-sm font-medium text-cyan-700 dark:text-cyan-300">
								✓ {filteredCount} résultat{filteredCount !== 1 ? "s" : ""} trouvé
								{filteredCount !== 1 ? "s" : ""}
								{debouncedSearch && ` pour "${debouncedSearch}"`}
								{minRating && ` avec ${minRating}+ étoiles`}
							</p>
						</div>
					)}
				</div>

				{/* Results */}
				{isLoading ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className="rounded-2xl p-6 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10"
							>
								<Skeleton className="mb-4 h-6 w-3/4" />
								<Skeleton className="mb-3 h-4 w-1/2" />
								<Skeleton className="h-20 w-full" />
							</div>
						))}
					</div>
				) : reviews && reviews.length > 0 ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{reviews.map((review: any, idx: number) => (
							<Link
								key={review.id}
								to={`/reviews/${review.id}`}
								className={
									mounted
										? "animate-in fade-in slide-in-from-bottom-4 duration-500"
										: ""
								}
								style={{ animationDelay: `${idx * 50}ms` }}
							>
								<div className="h-full rounded-2xl p-6 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 transition-all hover:-translate-y-1 hover:shadow-xl">
									<div className="mb-4 flex items-start justify-between">
										<h3 className="line-clamp-1 text-xl font-bold">
											{review.title}
										</h3>
										{review.avgRating && (
											<div className="bg-cyan-600 dark:bg-cyan-700 ml-3 flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-white">
												<Star className="h-4 w-4 fill-current" />
												{Number(review.avgRating).toFixed(1)}
											</div>
										)}
									</div>
									<div className="mb-4 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
										<span className="font-medium">
											Par {review.userName || "Anonyme"}
										</span>
									</div>
									<p className="line-clamp-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
										{review.description}
									</p>
									<div className="mt-6 flex items-center justify-between border-t border-slate-200/50 pt-4 text-xs font-medium text-slate-500 dark:border-slate-700/50 dark:text-slate-400">
										<span className="flex items-center gap-1">
											<Star className="h-3 w-3" />
											{Number(review.ratingCount) || 0} notes
										</span>
										<span className="flex items-center gap-1">
											<Camera className="h-3 w-3" />
											{Number(review.mediaCount) || 0} photos
										</span>
										<span className="capitalize">{review.price}</span>
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div
						className={`rounded-3xl p-16 text-center bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 ${mounted ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : ""}`}
					>
						<Search className="mx-auto mb-6 h-16 w-16 text-cyan-500 opacity-50" />
						<h3 className="mb-3 text-xl font-bold text-slate-700 dark:text-slate-300">
							Aucun résultat
						</h3>
						<p className="text-base text-slate-600 dark:text-slate-400">
							{debouncedSearch || minRating
								? "Essayez d'ajuster vos filtres"
								: "Lancez une recherche pour découvrir des avis"}
						</p>
					</div>
				)}
			</div>
		</div>
	);
}
