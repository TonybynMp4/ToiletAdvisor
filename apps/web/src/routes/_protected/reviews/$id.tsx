import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Calendar, DollarSign, MessageCircle, Send, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { z } from "zod";
import { Rating, RatingButton } from "@/components/kibo-ui/rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "@/components/ui/carousel";
import { FieldWrapper as Field } from "@/components/ui/field-wrapper";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/hooks/use-session";
import { apiTrpc, apiTrpcClient, queryClient } from "@/utils/trpc";

const commentSchema = z.object({
	content: z.string().min(1, "Comment cannot be empty").max(1024),
});

type CommentForm = z.infer<typeof commentSchema>;

export default function ReviewDetail() {
	const { id } = useParams();
	const { user } = useSession();
	const [userRating, setUserRating] = useState(0);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const { data: review, isLoading } = useQuery(
		apiTrpc.post.getById.queryOptions({ id: id || "" }),
	);

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
	} = useForm<CommentForm>({
		resolver: zodResolver(commentSchema),
	});

	const rateMutation = useMutation({
		mutationFn: async (value: string) => {
			return await apiTrpcClient.post.rate.mutate({
				postId: id || "",
				value: value as "0" | "1" | "2" | "3" | "4" | "5",
			});
		},
		onSuccess: () => {
			toast.success("Note enregistrée !");
			// Invalider les queries pour ce post
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey[0]) &&
					query.queryKey[0][0] === "post" &&
					query.queryKey[0][1] === "getById",
			});
		},
		onError: (error: any) => {
			toast.error(error.message || "Échec de la notation");
		},
	});

	const commentMutation = useMutation({
		mutationFn: async (data: CommentForm) => {
			return await apiTrpcClient.comment.create.mutate({
				postId: id || "",
				content: data.content,
			});
		},
		onSuccess: () => {
			toast.success("Commentaire publié !");
			// Invalider les queries pour ce post
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey[0]) &&
					query.queryKey[0][0] === "post" &&
					query.queryKey[0][1] === "getById",
			});
			reset();
		},
		onError: (error: any) => {
			toast.error(error.message || "Échec de la publication");
		},
	});

	const deleteCommentMutation = useMutation({
		mutationFn: async (commentId: string) => {
			return await apiTrpcClient.comment.delete.mutate({ id: commentId });
		},
		onSuccess: () => {
			toast.success("Commentaire supprimé !");
			// Invalider les queries pour ce post
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey[0]) &&
					query.queryKey[0][0] === "post" &&
					query.queryKey[0][1] === "getById",
			});
		},
		onError: (error: any) => {
			toast.error(error.message || "Échec de la suppression");
		},
	});

	const handleRatingChange = (value: number) => {
		setUserRating(value);
		rateMutation.mutate(value.toString());
	};

	const onSubmitComment = (data: CommentForm) => {
		commentMutation.mutate(data);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen">
				<div className="container mx-auto max-w-6xl px-4">
					<Skeleton className="mb-6 h-10 w-64" />
					<Skeleton className="mb-8 h-96 w-full rounded-3xl" />
					<Skeleton className="h-64 w-full rounded-3xl" />
				</div>
			</div>
		);
	}

	if (!review) {
		return (
			<div className="min-h-screen">
				<div className="container mx-auto max-w-5xl px-4">
					<div className="rounded-3xl p-16 text-center bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
						<h2 className="mb-4 text-3xl font-bold">Avis introuvable</h2>
						<p className="mb-8 text-lg text-slate-600 dark:text-slate-300">
							Cet avis n'existe pas ou a été supprimé
						</p>
						<Button
							render={<Link to="/feed">Retour au Feed</Link>}
							className="bg-cyan-600 hover:bg-cyan-700 text-white"
						/>
					</div>
				</div>
			</div>
		);
	}

	const userExistingRating = review.ratings?.find((r) => r.userId === user?.id);

	return (
		<div className="min-h-screen">
			<div className="container mx-auto max-w-6xl px-4 py-2 space-y-4">
				<Button
					variant="ghost"
					render={
						<Link to="/feed" className="flex items-center gap-2">
							<ArrowLeft className="h-5 w-5" />
							Retour au Feed
						</Link>
					}
					nativeButton={false}
					className={`mb-8 ${mounted ? "animate-in fade-in slide-in-from-left-4 duration-500 delay-100" : ""}`}
				/>

				<div className="grid gap-4 lg:grid-cols-2">
					<div className="rounded-3xl p-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
						<div className="mb-6 flex items-start justify-between">
							<div className="flex-1">
								<h1 className="mb-4 text-4xl font-bold text-slate-900 dark:text-slate-100">
									{review.title}
								</h1>
								<div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
									<span className="flex items-center gap-2 font-medium">
										Par {review.userName || "Anonyme"}
									</span>
									<span className="flex items-center gap-2">
										<Calendar className="h-4 w-4 text-purple-500" />
										{new Date(review.createdAt).toLocaleDateString("fr-FR")}
									</span>
								</div>
							</div>
							{review.avgRating && (
								<div className="bg-cyan-600 dark:bg-cyan-700 ml-4 flex shrink-0 items-center gap-2 rounded-2xl px-5 py-3 text-lg font-bold text-white">
									<Star className="h-6 w-6 fill-current" />
									{Number(review.avgRating).toFixed(1)}
								</div>
							)}
						</div>

						{/* Images Carousel */}
						{review.media && review.media.length > 0 && (
							<div className="mb-8">
								<Carousel className="w-[90%] mx-auto" orientation="horizontal">
									<CarouselContent>
										{review.media.map((item) => (
											<CarouselItem key={item.id}>
												<div className="overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
													<img
														src={item.url}
														alt="Média de l'avis"
														className="size-full object-contain max-h-96"
													/>
												</div>
											</CarouselItem>
										))}
									</CarouselContent>
									{review.media.length > 1 && (
										<>
											<CarouselPrevious />
											<CarouselNext />
										</>
									)}
								</Carousel>
							</div>
						)}

						{/* Description */}
						<div className="mb-6">
							<h3 className="mb-3 text-xl font-bold">Avis Détaillé</h3>
							<p className="whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-300">
								{review.description}
							</p>
						</div>

						{/* Details */}
						<div className="flex flex-wrap items-center gap-4 border-t border-slate-200/50 pt-6 dark:border-slate-700/50">
							<div className="flex items-center gap-2 rounded-xl bg-amber-100 dark:bg-amber-900/30 px-4 py-2 font-semibold text-amber-700 dark:text-amber-300">
								<DollarSign className="h-4 w-4" />
								{review.price}
							</div>
							<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
								<Star className="mb-1 inline h-4 w-4" />{" "}
								{review.ratings?.length || 0} notes
							</span>
							<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
								<MessageCircle className="mb-1 inline h-4 w-4" />{" "}
								{review.comments?.length || 0} commentaires
							</span>
						</div>
					</div>

					{/* Comments Section */}
					<div className="rounded-3xl p-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
						<h2 className="mb-6 flex items-center gap-3 text-2xl font-bold">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600">
								<MessageCircle className="h-5 w-5 text-white" />
							</div>
							Commentaires ({review.comments?.length || 0})
						</h2>

						{/* Add Comment Form */}
						{user && (
							<form
								onSubmit={handleSubmit(onSubmitComment)}
								className="mb-8 space-y-4"
							>
								<Field
									label="Ajouter un commentaire"
									invalid={!!errors.content}
									errorText={errors.content?.message}
								>
									<Textarea
										{...register("content")}
										placeholder="Partagez votre avis..."
										rows={3}
										className="border-slate-200 text-base dark:border-slate-700"
									/>
								</Field>
								<Button
									type="submit"
									disabled={commentMutation.isPending}
									className="bg-cyan-600 hover:bg-cyan-700 flex items-center gap-2 font-semibold text-white"
								>
									<Send className="h-4 w-4" />
									{commentMutation.isPending ? "Envoi..." : "Publier"}
								</Button>
							</form>
						)}

						<Separator className="my-8" />

						{/* Comments List */}
						<div className="space-y-5">
							{review.comments && review.comments.length > 0 ? (
								review.comments.map((comment) => (
									<div
										key={comment.id}
										className="flex gap-4 rounded-2xl bg-slate-50/50 p-4 dark:bg-slate-800/30"
									>
										<Avatar className="h-12 w-12 border-2 border-cyan-200 dark:border-cyan-800">
											<AvatarImage
												src={comment.userProfilePicture || undefined}
											/>
											<AvatarFallback className="bg-cyan-600 text-white">
												{comment.userName?.charAt(0).toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
										<div className="flex-1">
											<div className="flex items-center justify-between">
												<div>
													<p className="font-bold">
														{comment.userName || "Anonyme"}
													</p>
													<p className="text-xs text-slate-500 dark:text-slate-400">
														{new Date(
															comment.createdAt,
														).toLocaleDateString("fr-FR")}
													</p>
												</div>
												{user?.id === comment.userId && (
													<Button
														variant="ghost"
														size="sm"
														onClick={() =>
															deleteCommentMutation.mutate(comment.id)
														}
														disabled={deleteCommentMutation.isPending}
														className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
													>
														<Trash2 className="h-4 w-4" />
													</Button>
												)}
											</div>
											<p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
												{comment.content}
											</p>
										</div>
									</div>
								))
							) : (
								<p className="py-8 text-center text-slate-500 dark:text-slate-400">
									Aucun commentaire. Soyez le premier !
								</p>
							)}
						</div>
					</div>
				</div>

				{/* Sidebar */}
				<div
					className={`space-y-4 ${mounted ? "animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300" : ""}`}
				>
					{/* Author Card */}
					<div className="rounded-2xl p-6 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
						<h3 className="mb-4 text-lg font-bold">Auteur</h3>
						<div className="flex items-center gap-3">
							<Avatar className="h-14 w-14 border-2 border-purple-200 dark:border-purple-800">
								<AvatarImage src={review.userProfilePicture || undefined} />
								<AvatarFallback className="bg-cyan-600 text-lg font-bold text-white">
									{review.userName?.charAt(0).toUpperCase() || "U"}
								</AvatarFallback>
							</Avatar>
							<div>
								<p className="font-bold">{review.userName || "Anonyme"}</p>
								<p className="text-xs text-slate-500 dark:text-slate-400">
									Membre de la communauté
								</p>
							</div>
						</div>
					</div>

					{/* Rate This Location */}
					{user && (
						<div className="rounded-2xl p-6 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
							<h3 className="mb-2 text-lg font-bold">Notez ce Lieu</h3>
							<p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
								{userExistingRating
									? "Vous avez déjà noté ce lieu"
									: "Partagez votre expérience"}
							</p>
							<Rating
								value={
									userExistingRating
										? Number(userExistingRating.value)
										: userRating
								}
								onValueChange={handleRatingChange}
								readOnly={!!userExistingRating}
							>
								{[...Array(5)].map((_, i) => (
									<RatingButton key={i} size={36} />
								))}
							</Rating>
							{userExistingRating && (
								<p className="mt-3 text-sm font-semibold text-cyan-600 dark:text-cyan-400">
									✓ Votre note: {userExistingRating.value} étoiles
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
