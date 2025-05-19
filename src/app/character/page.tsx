"use client";

import { Message } from "@/components/blocks/conversation";
import Conversation from "./conversation";
import { useState } from "react";
import { personalityAtom } from "./states";
import { useAtom } from "jotai";

export type UploadedFile = {
	sent: boolean;
	uri?: string;
	file: File;
	name: string;
	type: string;
	buffer?: string;
};

export default function CharacterPage() {
	const [personality, setPersonality] = useAtom(personalityAtom)
	const [messages, setMessages] = useState<Message[]>([])

	// No need for a separate inlineData conversion here
	// since we're handling it directly in the Gemini integration

	return (
		<div className="p-4 lg:p-8 min-h-screen flex flex-col">
			{/* Mobile View - Materials first, then Assignment Submission */}
			<aside className={`mb-4 lg:hidden`}>
				<div>
					<textarea
						value={personality}
						onChange={(e) => setPersonality(e.target.value)}
						placeholder="Set STELLA's personality"
						/>
				</div>
			</aside>

			{/* Desktop View */}
			<main className="flex flex-col lg:grid lg:grid-cols-6 gap-4 lg:gap-8 h-full">
				<aside className="hidden lg:flex lg:flex-col lg:col-span-2 gap-4 h-full">
					<textarea
							value={personality}
							onChange={(e) => setPersonality(e.target.value)}
							placeholder="Set STELLA's personality"
							/>
				</aside>

				{/* Conversation Area */}
				<section className="order-2 lg:col-span-4 h-full">
					<Conversation messages={messages} setMessages={setMessages} />
				</section>
			</main>
		</div>
	);
}
