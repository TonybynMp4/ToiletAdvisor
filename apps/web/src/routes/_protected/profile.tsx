import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Check, Image, Lock, Sparkles, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImageUploadDropzone, type ImageUploadDropzoneRef } from "@/components/upload-dropzone";
import { apiTrpc, apiTrpcClient, authTrpcClient, queryClient } from "@/utils/trpc";

const updateProfileSchema = z.object({
	name: z.string().min(1, "Le nom est requis").max(255),
});

const updatePasswordSchema = z
	.object({
		currentPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
		newPassword: z
			.string()
			.min(8, "Le mot de passe doit contenir au moins 8 caractères")
			.regex(/[A-Z]/, "Le mot de passe doit contenir au moins une lettre majuscule")
			.regex(/[a-z]/, "Le mot de passe doit contenir au moins une lettre minuscule")
			.regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: "Les mots de passe ne correspondent pas",
		path: ["confirmPassword"],
	});

type UpdateProfileForm = z.infer<typeof updateProfileSchema>;
type UpdatePasswordForm = z.infer<typeof updatePasswordSchema>;

export default function Profile() {
	const uploadRef = useRef<ImageUploadDropzoneRef>(null);
	const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
	const [activeTab, setActiveTab] = useState<"profile" | "password" | "photo">("profile");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const { data: profile, isLoading } = useQuery(apiTrpc.user.getProfile.queryOptions());

	const {
		register: registerProfile,
		handleSubmit: handleSubmitProfile,
		formState: { errors: errorsProfile },
	} = useForm<UpdateProfileForm>({
		resolver: zodResolver(updateProfileSchema),
		values: {
			name: profile?.name || "",
		},
	});

	const {
		register: registerPassword,
		handleSubmit: handleSubmitPassword,
		formState: { errors: errorsPassword },
		reset: resetPassword,
	} = useForm<UpdatePasswordForm>({
		resolver: zodResolver(updatePasswordSchema),
	});

	const updateProfileMutation = useMutation({
		mutationFn: async (data: { name?: string; profilePictureUrl?: string }) => {
			return await apiTrpcClient.user.updateProfile.mutate(data);
		},
		onSuccess: () => {
			toast.success("Profil mis à jour avec succès !");
			// Invalider et refetch la query profile
			queryClient.invalidateQueries({
				predicate: (query) =>
					Array.isArray(query.queryKey[0]) &&
					query.queryKey[0][0] === "user" &&
					query.queryKey[0][1] === "getProfile",
			});
		},
		onError: (error: any) => {
			toast.error(error.message || "Échec de la mise à jour du profil");
		},
	});

	const updatePasswordMutation = useMutation({
		mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
			return await authTrpcClient.auth.updatePassword.mutate(data);
		},
		onSuccess: () => {
			toast.success("Mot de passe mis à jour avec succès !");
			resetPassword();
		},
		onError: (error: any) => {
			toast.error(error.message || "Échec de la mise à jour du mot de passe");
		},
	});

	const onSubmitProfile = (data: UpdateProfileForm) => {
		updateProfileMutation.mutate({ name: data.name });
	};

	const onSubmitPassword = (data: UpdatePasswordForm) => {
		updatePasswordMutation.mutate({
			currentPassword: data.currentPassword,
			newPassword: data.newPassword,
		});
	};

	const handlePhotoUpload = async () => {
		if (!uploadRef.current?.hasFile()) {
			toast.error("Veuillez d'abord sélectionner une photo");
			return;
		}

		setIsUploadingPhoto(true);
		try {
			const uploadedFiles = await uploadRef.current.upload();
			if (uploadedFiles.length > 0) {
				await updateProfileMutation.mutateAsync({
					profilePictureUrl: uploadedFiles[0].url,
				});
			}
		} catch {
			toast.error("Échec du téléchargement de la photo");
		} finally {
			setIsUploadingPhoto(false);
		}
	};

	if (isLoading) {
		return (
			<div className="min-h-screen">
				<div className="mx-auto max-w-6xl px-4 py-12">
					<div className="animate-pulse space-y-8">
						<div className="h-12 w-64 rounded-xl bg-slate-200 dark:bg-slate-800" />
						<div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen">
			<div className="mx-auto max-w-6xl px-4 py-12">
				{/* Header */}
				<div
					className={`mb-12 ${mounted ? "animate-in fade-in duration-600 delay-100" : ""}`}
				>
					<div className="flex items-center gap-4 mb-3">
						<Sparkles className="h-8 w-8 text-cyan-500" />
						<h1 className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">
							Paramètres du profil
						</h1>
					</div>
					<p className="text-slate-600 dark:text-slate-400">
						Personnalisez votre expérience ToiletAdvisor
					</p>
				</div>

				<div className="grid gap-8 lg:grid-cols-12">
					{/* Sidebar with Avatar */}
					<div
						className={`lg:col-span-4 ${mounted ? "animate-in fade-in slide-in-from-bottom-4 duration-600 delay-200" : ""}`}
					>
						<div className="rounded-2xl p-8 sticky top-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg transition-all hover:-translate-y-1">
							<div className="flex flex-col items-center text-center">
								<div className="mb-6">
									<Avatar className="h-32 w-32 border-4 border-white dark:border-slate-800 shadow-xl">
										<AvatarImage
											src={profile?.profilePictureUrl || undefined}
										/>
										<AvatarFallback className="text-4xl font-bold bg-cyan-600 text-white">
											{profile?.name?.charAt(0).toUpperCase() || "U"}
										</AvatarFallback>
									</Avatar>
								</div>

								<h2 className="text-2xl font-bold mb-2">
									{profile?.name || "Utilisateur"}
								</h2>
								<p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
									Membre depuis{" "}
									{profile?.createdAt
										? new Date(profile.createdAt).toLocaleDateString("fr-FR", {
												month: "short",
												year: "numeric",
											})
										: "Inconnu"}
								</p>

								<div className="flex gap-2 mb-6">
									<span className="px-3 py-1 text-xs font-semibold rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-700 dark:text-cyan-300">
										{profile?.isAdmin ? "Administrateur" : "Évaluateur"}
									</span>
								</div>

								<div className="w-full space-y-2">
									<button
										onClick={() => setActiveTab("profile")}
										className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
											activeTab === "profile"
												? "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
												: "hover:bg-slate-100 dark:hover:bg-slate-800"
										}`}
									>
										<User className="h-5 w-5" />
										Infos générales
									</button>
									<button
										onClick={() => setActiveTab("password")}
										className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
											activeTab === "password"
												? "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
												: "hover:bg-slate-100 dark:hover:bg-slate-800"
										}`}
									>
										<Lock className="h-5 w-5" />
										Sécurité
									</button>
									<button
										onClick={() => setActiveTab("photo")}
										className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all ${
											activeTab === "photo"
												? "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-300"
												: "hover:bg-slate-100 dark:hover:bg-slate-800"
										}`}
									>
										<Image className="h-5 w-5" />
										Photo de profil
									</button>
								</div>
							</div>
						</div>
					</div>

					{/* Main Content */}
					<div
						className={`lg:col-span-8 ${mounted ? "animate-in fade-in slide-in-from-bottom-4 duration-600 delay-300" : ""}`}
					>
						{activeTab === "profile" && (
							<div className="rounded-2xl p-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
								<h3 className="text-2xl font-bold mb-6">Informations générales</h3>
								<form
									onSubmit={handleSubmitProfile(onSubmitProfile)}
									className="space-y-6"
								>
									<div>
										<Label className="text-sm font-semibold mb-2 block">
											Nom d'affichage
										</Label>
										<Input
											{...registerProfile("name")}
											placeholder="Votre nom"
											className="h-12 border-2 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20 transition-all"
										/>
										{errorsProfile.name && (
											<p className="text-sm text-red-500 mt-2">
												{errorsProfile.name.message}
											</p>
										)}
									</div>

									<div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50">
										<div className="flex items-center gap-2 text-sm">
											<Check className="h-4 w-4 text-green-500" />
											<span className="text-slate-600 dark:text-slate-400">
												Compte créé :{" "}
												{profile?.createdAt
													? new Date(
															profile.createdAt,
														).toLocaleDateString("fr-FR", {
															month: "long",
															day: "numeric",
															year: "numeric",
														})
													: "Inconnu"}
											</span>
										</div>
									</div>

									<Button
										type="submit"
										disabled={updateProfileMutation.isPending}
										className="w-full h-12 bg-cyan-600 text-white font-semibold hover:bg-cyan-700"
									>
										{updateProfileMutation.isPending
											? "Enregistrement..."
											: "Enregistrer les modifications"}
									</Button>
								</form>
							</div>
						)}

						{activeTab === "password" && (
							<div className="rounded-2xl p-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
								<h3 className="text-2xl font-bold mb-2">Changer le mot de passe</h3>
								<p className="text-slate-600 dark:text-slate-400 mb-6">
									Le mot de passe doit contenir au moins 8 caractères avec
									majuscules, minuscules et chiffres
								</p>
								<form
									onSubmit={handleSubmitPassword(onSubmitPassword)}
									className="space-y-6"
								>
									<div>
										<Label className="text-sm font-semibold mb-2 block">
											Mot de passe actuel
										</Label>
										<Input
											{...registerPassword("currentPassword")}
											type="password"
											placeholder="Entrez le mot de passe actuel"
											className="h-12 border-2 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20 transition-all"
										/>
										{errorsPassword.currentPassword && (
											<p className="text-sm text-red-500 mt-2">
												{errorsPassword.currentPassword.message}
											</p>
										)}
									</div>

									<div>
										<Label className="text-sm font-semibold mb-2 block">
											Nouveau mot de passe
										</Label>
										<Input
											{...registerPassword("newPassword")}
											type="password"
											placeholder="Entrez le nouveau mot de passe"
											className="h-12 border-2 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20 transition-all"
										/>
										{errorsPassword.newPassword && (
											<p className="text-sm text-red-500 mt-2">
												{errorsPassword.newPassword.message}
											</p>
										)}
									</div>

									<div>
										<Label className="text-sm font-semibold mb-2 block">
											Confirmer le nouveau mot de passe
										</Label>
										<Input
											{...registerPassword("confirmPassword")}
											type="password"
											placeholder="Confirmez le nouveau mot de passe"
											className="h-12 border-2 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20 transition-all"
										/>
										{errorsPassword.confirmPassword && (
											<p className="text-sm text-red-500 mt-2">
												{errorsPassword.confirmPassword.message}
											</p>
										)}
									</div>

									<Button
										type="submit"
										disabled={updatePasswordMutation.isPending}
										className="w-full h-12 bg-cyan-600 text-white font-semibold hover:bg-cyan-700"
									>
										{updatePasswordMutation.isPending
											? "Mise à jour..."
											: "Mettre à jour le mot de passe"}
									</Button>
								</form>
							</div>
						)}

						{activeTab === "photo" && (
							<div className="rounded-2xl p-8 bg-white/80 dark:bg-slate-800/50 backdrop-blur-lg border border-white/30 dark:border-white/10 shadow-lg">
								<h3 className="text-2xl font-bold mb-6">Photo de profil</h3>

								<div className="mb-8 p-6 rounded-xl bg-cyan-50 dark:bg-cyan-950/30">
									<div className="flex items-center gap-6">
										<Avatar className="h-24 w-24 border-4 border-white dark:border-slate-800 shadow-xl">
											<AvatarImage
												src={profile?.profilePictureUrl || undefined}
											/>
											<AvatarFallback className="text-3xl font-bold bg-cyan-600 text-white">
												{profile?.name?.charAt(0).toUpperCase() || "U"}
											</AvatarFallback>
										</Avatar>
										<div>
											<p className="font-bold text-lg mb-1">
												{profile?.name}
											</p>
											<p className="text-sm text-slate-600 dark:text-slate-400">
												{profile?.profilePictureUrl
													? "Photo de profil actuelle"
													: "Aucune photo de profil définie"}
											</p>
										</div>
									</div>
								</div>

								<div className="space-y-6">
									<div>
										<Label className="text-sm font-semibold mb-3 block">
											Télécharger une nouvelle photo
										</Label>
										<ImageUploadDropzone ref={uploadRef} onChange={() => {}} />
									</div>

									<Button
										onClick={handlePhotoUpload}
										disabled={
											isUploadingPhoto || updateProfileMutation.isPending
										}
										className="w-full h-12 bg-cyan-600 text-white font-semibold hover:bg-cyan-700"
									>
										{isUploadingPhoto
											? "Téléchargement..."
											: "Télécharger la photo"}
									</Button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
