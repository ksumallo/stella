"use client";

import { Search, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface ProfileAttrs {
	name: string;
	image: string;
}

export interface NavDestination {
	href: string;
	label: string;
	icon: React.ReactNode;
}

interface TopNavBarProps {
	profile?: ProfileAttrs;
	variant?: "default" | "landing";
	destinations?: NavDestination[];
}

export function TopNavBar({ variant = "default", profile }: TopNavBarProps) {
	return (
		<nav className="sticky top-0 z-50 flex flex-row items-center justify-between p-2 bg-white border-b shadow-xl">
			<div className="flex flex-1 items-center gap-4">
				{/* Star logo */}
				<Link href="/" className="flex items-center">
					<div className=" rounded-md p-1">
						<Star className="h-8 w-8 text-amber-400 fill-amber-400" />
					</div>
				</Link>

				{/* Navigation path */}
				<div className="flex flex-1 items-center text-white">
					<div className="text-green-600 font-extrabold">Student</div>
					<span className="mx-2 text-zinc-400">&gt;</span>
					<div className="text-zinc-500">XYZ 140</div>
					<span className="mx-2 text-zinc-400">&gt;</span>
					<span className="text-zinc-500">Reflection Paper #1</span>
				</div>
			</div>

			{/* Search bar */}
			<div className="flex flex-1  w-full justify-center">
				<div className="relative flex items-center">
					<Search className="absolute left-3 text-zinc-400 h-5 w-5" />
					<input
						type="text"
						placeholder="Ask STELLA"
						className="w-full bg-white border border-zinc-300 rounded-full py-2 pl-10 pr-4 text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
					/>
				</div>
			</div>

			{/* User profile */}
			{variant !== "landing" && (
				<div className="flex flex-1 items-center justify-end gap-3">
					<span className="text-white font-medium">{profile?.name || "Dexter Villegas"}</span>
					<Image
						width={40}
						height={40}
						src={profile?.image || "/profile_placeholder.jpg"}
						alt="profile_image"
						className="h-10 w-10 rounded-full border-2 border-zinc-600"
					/>
				</div>
			)}
		</nav>
	);
}
