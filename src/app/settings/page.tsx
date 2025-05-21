"use client";

import { personalityAtom } from "../character/states";
import { useAtom } from "jotai";
import { responseStructureAtom, systemInstructionsAtom } from "../states";

export type UploadedFile = {
	sent: boolean;
	uri?: string;
	file: File;
	name: string;
	type: string;
	buffer?: string;
};

export default function SettingsPage() {
	const [personality, setPersonality] = useAtom(personalityAtom)
	const [systemInstruction, setSystemInstruction] = useAtom(systemInstructionsAtom)
    const [responseStructure, setResponseStructure] = useAtom(responseStructureAtom)

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
			<main className="flex flex-row gap-8">
				<aside className="p-4 flex flex-col gap-4 flex-1 border-2 border-gray-400 rounded-xl">
                    <h2 className='text-xl font-bold'> How do you want STELLA to respond for every prompt? </h2>
					<textarea
                        className='h-[70vh] p-4 bg-blackboard w-full border-2 border-gray-400 rounded-md text-white text-shadow-md text-shadow-black/20'
                        value={systemInstruction}
                        onChange={(e) => setSystemInstruction(e.target.value)}
                        placeholder="I want STELLA to be..."
                        />
				</aside>

				<aside className="p-4 flex-1 border-2 border-gray-400 rounded-xl ">
                    <h2 className='text-xl font-bold'> What should be the structure of STELLA's responses? </h2>
                    <h4 className='text-md font-semibold'> Be as specific and clear as possible. </h4>
					<textarea
                        className='h-[70vh] p-4 bg-blackboard w-full border-2 border-gray-400 rounded-md text-white text-shadow-md text-shadow-black/20'
                        value={responseStructure}
                        onChange={(e) => setResponseStructure(e.target.value)}
                        placeholder="I want STELLA to structure its response like..."
							/>
				</aside>
			</main>
		</div>
	);
}
