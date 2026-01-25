import { Rating, RatingButton } from "@/components/kibo-ui/rating";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { FieldWrapper as Field } from "@/components/ui/field-wrapper";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadDropzone, type ImageUploadDropzoneRef } from "@/components/upload-dropzone";
import { apiTrpc, apiTrpcClient, queryClient } from "@/utils/trpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Camera, Plus, Sparkles, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { toast } from "sonner";
import { z } from "zod";

const createReviewSchema = z.object({
	title: z.string().min(1, "Location name is required").max(255),
	description: z.string().min(10, "Description must be at least 10 characters").max(1024),
	price: z.string().max(50),
});

type CreateReviewForm = z.infer<typeof createReviewSchema>;

export default function Feed() {
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [rating, setRating] = useState(0);
	const [mounted, setMounted] = useState(false);
	const uploadRef = useRef<ImageUploadDropzoneRef>(null);

	useEffect(() => {
		setMounted(true);
	}, []);

	const { data: reviews, isLoading } = useQuery(
		apiTrpc.post.getAll.queryOptions({
			limit: 50,
			offset: 0,
		}),
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<CreateReviewForm>({
		resolver: zodResolver(createReviewSchema),
		defaultValues: {
			price: "Free",
		},
	});

	const createMutation = useMutation({
		mutationFn: async (data: CreateReviewForm & { mediaUrls?: string[]; rating: number }) => {
			// Créer le post
			const result = await apiTrpcClient.post.create.mutate({
				title: data.title,
				description: data.description,
				price: data.price,
				mediaUrls: data.mediaUrls,
			});

			// Si une note est fournie, l'enregistrer automatiquement
			if (data.rating > 0) {
				await apiTrpcClient.post.rate.mutate({
					postId: result.id,
					value: data.rating.toString() as "0" | "1" | "2" | "3" | "4" | "5",
				});
			}

			return result;
		},
		onSuccess: () => {
			toast.success("Avis créé avec succès !");
			// Invalider toutes les queries qui commencent par post.getAll
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey[0]) &&
					query.queryKey[0][0] === "post" &&
					query.queryKey[0][1] === "getAll",
			});
			setIsDialogOpen(false);
			reset();
			setRating(0);
		},
		onError: (error: any) => {
			toast.error(error.message || "Échec de la création");
		},
	});

	const onSubmit = async (data: CreateReviewForm) => {
		let mediaUrls: string[] = [];

		if (uploadRef.current?.hasFile()) {
			try {
				const uploadedFiles = await uploadRef.current.upload();
				mediaUrls = uploadedFiles.map((f: { url: string }) => f.url);
			} catch (error) {
				toast.error("Échec de l'upload des images");
				console.error("Image upload error:", error);
				return;
			}
		}

		createMutation.mutate({ ...data, mediaUrls, rating });
	};

	return (
		<div className="min-h-screen">
			<div className="container mx-auto max-w-7xl px-4">
				<div
					className={`mb-12 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between ${mounted ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : ""}`}
				>
					<div>
						<h1 className="mb-3 text-4xl font-bold text-cyan-600 dark:text-cyan-400">
							Feed
						</h1>
						<p className="flex items-center gap-2 text-lg text-slate-600 dark:text-slate-300">
							<Sparkles className="h-5 w-5 text-cyan-500" />
							Les derniers avis de notre communauté
						</p>
					</div>
					<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
						<DialogTrigger
							render={
								<Button
									size="lg"
									className="bg-cyan-600 hover:bg-cyan-700 h-12 px-6 text-base font-semibold text-white"
								>
									<Plus className="mr-2 h-5 w-5" />
									Créer un Avis
								</Button>
							}
						/>
						<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
							<DialogHeader>
								<DialogTitle className="text-2xl font-bold">
									Nouvel Avis
								</DialogTitle>
								<DialogDescription className="text-base">
									Partagez votre expérience avec la communauté
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
								<Field
									label="Nom du Lieu"
									invalid={!!errors.title}
									errorText={errors.title?.message}
								>
									<Input
										{...register("title")}
										placeholder="ex: Starbucks Centre-Ville"
										className="text-base"
									/>
								</Field>

								<Field
									label="Note Globale"
									invalid={rating === 0}
									errorText={
										rating === 0 ? "Veuillez sélectionner une note" : undefined
									}
								>
									<Rating value={rating} onValueChange={setRating}>
										{[...Array(5)].map((_, i) => (
											<RatingButton key={i} />
										))}
									</Rating>
								</Field>

								<Field
									label="Description"
									invalid={!!errors.description}
									errorText={errors.description?.message}
								>
									<Textarea
										{...register("description")}
										placeholder="Propreté, accessibilité, équipements..."
										rows={4}
										className="text-base"
									/>
								</Field>

								<Field
									label="Accès / Prix"
									invalid={!!errors.price}
									errorText={errors.price?.message}
								>
									<Input
										{...register("price")}
										placeholder="Gratuit, Payant, Clients uniquement, etc."
										className="text-base"
									/>
								</Field>

								<Field label="Photos (Optionnel)">
									<ImageUploadDropzone ref={uploadRef} onChange={() => {}} />
								</Field>

								<div className="flex justify-end gap-3 pt-2">
									<Button
										type="button"
										variant="outline"
										onClick={() => setIsDialogOpen(false)}
										className="text-base"
									>
										Annuler
									</Button>
									<Button
										type="submit"
										disabled={createMutation.isPending || rating === 0}
										className="bg-cyan-600 hover:bg-cyan-700 text-base text-white"
									>
										{createMutation.isPending ? "Création..." : "Publier"}
									</Button>
								</div>
							</form>
						</DialogContent>
					</Dialog>
				</div>

				{isLoading ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="glass-card rounded-2xl p-6">
								<Skeleton className="mb-4 h-6 w-3/4" />
								<Skeleton className="mb-3 h-4 w-1/2" />
								<Skeleton className="h-20 w-full" />
							</div>
						))}
					</div>
				) : reviews && reviews.length > 0 ? (
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{reviews.map((review, idx) => (
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
									</div>
								</div>
							</Link>
						))}
					</div>
				) : (
					<div
						className={`rounded-3xl p-16 text-center bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 ${mounted ? "animate-in fade-in slide-in-from-bottom-4 duration-500" : ""}`}
					>
						<Sparkles className="mx-auto mb-6 h-16 w-16 text-cyan-500 animate-pulse" />
						<p className="mb-6 text-xl font-semibold text-slate-700 dark:text-slate-300">
							Aucun avis pour le moment
						</p>
						<Button
							onClick={() => setIsDialogOpen(true)}
							size="lg"
							className="bg-cyan-600 hover:bg-cyan-700 h-12 px-8 text-base font-semibold text-white"
						>
							<Plus className="mr-2 h-5 w-5" />
							Créez le premier avis
						</Button>
					</div>
				)}
			</div>
		</div>
	);
}
