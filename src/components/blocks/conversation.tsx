"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Send } from "lucide-react";
import Image from "next/image";
import { sendToGemini } from "@/app/workspace/gemini";

import Markdown from "react-markdown";
import { useAtom } from "jotai";
import { uploadedFilesAtom } from "@/app/states";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type Message = {
	type: "me" | "ai";
	message: string;
	timestamp: Date;
};

// Define the LLM models available for selection
const LLM_MODELS = [
	{ id: "gemini-pro", name: "Gemini 2.0 Flash", provider: "Google" },
	{ id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", provider: "Anthropic" },
	{ id: "gpt-4o", name: "GPT-4o", provider: "OpenAI" },
];

interface ConversationProps {
	messages: Message[];
	setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function Conversation({ messages, setMessages }: ConversationProps) {
	const [inputMessage, setInputMessage] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [fileUris, setFileUris] = useAtom(uploadedFilesAtom);
	const [selectedModel, setSelectedModel] = useState(LLM_MODELS[0]);

	const sendMessage = async () => {
		if (inputMessage.trim() === "") return;

		// Add user message
		const userMessage: Message = {
			type: "me",
			message: inputMessage,
			timestamp: new Date(),
		};

		// Clear input field and show loading state
		const userQuery = inputMessage;
		setInputMessage("");
		setIsLoading(true);

		// Update messages state with user message
		setMessages((prev) => [...prev, userMessage]);

		try {
			// Use reference files if provided
			// In a real implementation, you would pass the selectedModel.id to sendToGemini
			const response = await sendToGemini(userQuery, fileUris);
			setFileUris(fileUris.map((file) => ({ ...file, sent: true })));

			console.log(`Got message from ${selectedModel.name}:`, response);
			const aiMessage: Message = {
				type: "ai",
				message: response!,
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, aiMessage]);
		} catch (e) {
			console.error(`Error sending message to ${selectedModel.name}:`, e);
			const errorMessage: Message = {
				type: "ai",
				message: "Sorry, I encountered an error while processing your request.",
				timestamp: new Date(),
			};
			setMessages((prev) => [...prev, errorMessage]);
		} finally {
			setIsLoading(false);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			sendMessage();
		}
	};

	return (
		<div className="flex flex-col w-full h-full min-h-[600px] rounded-xl border-gray-300 border-3 border-b-6">
			{/* Chat Header */}
			<div className="bg-blackboard text-white p-4 rounded-t-lg flex items-center justify-between -mx-[3px] -mt-[3px]">
				<div className="flex items-center">
					<Image src="/stella.svg" alt="AI Avatar" width={40} height={40} className="mr-2" />
					<h2 className="font-extrabold text-xl">STELLA Assistant</h2>
				</div>

				{/* Model Selection Dropdown */}
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="primary"
							className="text-black bg-white flex items-center gap-2  border border-b-4 active:border-b-2 border-r-2 border-t-2 border-l-2 "
						>
							{selectedModel.name}
							<ChevronDown className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuLabel className="font-extrabold">Select Model</DropdownMenuLabel>
						<DropdownMenuSeparator />
						{LLM_MODELS.map((model) => (
							<DropdownMenuItem key={model.id} onClick={() => setSelectedModel(model)} className="flex items-center justify-between">
								<span>{model.name}</span>
								<span className="text-xs text-muted-foreground ml-2">{model.provider}</span>
							</DropdownMenuItem>
						))}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>

			{/* Messages Container */}
			<div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50 min-h-0">
				{messages.map((msg, index) => (
					<div key={index} className={`flex ${msg.type === "me" ? "justify-end" : "justify-start"}`}>
						<div
							className={`max-w-[70%] py-3 px-5 rounded-xl ${
								msg.type === "me"
									? "bg-green-600/10 text-gray-700 rounded-br-none border-b-6 border-3 border-green-700/60"
									: "bg-white border-3 border-gray-200 rounded-bl-none border-b-6"
							}`}
						>
							<Markdown>{msg.message}</Markdown>
							<div className={`text-xs mt-1 ${msg.type === "me" ? "text-gray-500" : "text-gray-500"}`}>
								{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
								{msg.type === "ai" && <span className="ml-1">• {selectedModel.name}</span>}
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Input Area */}
			<div className="p-4 border-t flex gap-2 items-center flex-shrink-0">
				<Input
					value={inputMessage}
					onChange={(e) => setInputMessage(e.target.value)}
					onKeyDown={handleKeyDown}
					placeholder={isLoading ? `${selectedModel.name} is thinking...` : "Type your message..."}
					className="flex-1"
					disabled={isLoading}
				/>
				<Button
					variant="primary"
					onClick={sendMessage}
					disabled={!inputMessage.trim() || isLoading}
					className={`${isLoading ? "animate-pulse" : ""} items-center justify-center h-10 w-10`}
				>
					<Send className="-ml-[0.5px] h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
