import { GoogleGenAI, Type } from "@google/genai";
import { UploadedFile } from "./page";

// Define types for Gemini API request
type InlineData = {
	inlineData: {
		mimeType: string;
		data: string;
	};
};

const feedbackResponseSchema = {
	type: Type.OBJECT,
	properties: {
		similarity: {
			type: Type.OBJECT,
			properties: {
				type: { type: Type.STRING },
				summary: { type: Type.STRING },
				score: { type: Type.NUMBER },
			},
			propertyOrdering: ["type", "summary", "score"],
		},
		stella: {
			type: Type.OBJECT,
			properties: {
				general: { type: Type.STRING },
				positive: { type: Type.STRING },
				deficiencies: { type: Type.STRING },
				suggestions: { type: Type.STRING },
			},
			propertyOrdering: ["general", "positive", "deficiencies", "suggestions"],
		},
		instructor: { type: Type.STRING },
	},
	propertyOrdering: ["similarity", "stella", "instructor"],
};

// Define the system instruction for the AI
const systemInstruction = `
[GENERAL INSTUCTIONS]
You are an AI chatbot named STELLA (System for Transparent Engagement with LLMs for Learning and Assessment). 
You are designed to assist students in their assessment, be it a paper or code, while adhering to learning objectives and goals. 
Your primary task is to answer the students' queries. 
You should provide accurate and relevant information to help them understand the subject matter. 
However, you must not provide direct answers to any questions that are part of an assignment or exam. 
Instead, guide the students in finding the right resources or information to complete their tasks independently. 
Your goal is to support their learning process while ensuring academic integrity to promote responsible and ethical use of AI. 
Therefore, for the student's information, your conversation with the student will be submitted along with their assignment to the instructor and the instructor will have a full view of this conversation. 
For instances where the student exhibits a misunderstanding of the subject matter, inform the student in a friendly and informative manner. 
Refrain from overwhelming the student with lengthy explainations, but state where the misconception lies then formulate questions that will prompt the student to question their current understanding and encourage them to ask more questions that will clarify the topic or further their understanding of the topic. 
You should also encourage them to think critically and independently about their work. If a student asks for help with a specific assignment or exam question, it is preferred that you redirect them to the relevant resources, such as the material that they uploaded to the workspace.
`;

const rubrik = `
[ASSIGNMENT INSTRUCTIONS]
This assignment requires you to write a brief reflection paper on the provided article, "A Multiuser, Multisite, and Platform-Independent On-the-Cloud Framework for Interactive Immersion in Holographic XR." 

Instructions:
1) Read the provided article carefully.
2) Consider the guide questions below as prompts for your reflection. 
3) Draft a single paragraph (maximum 200 words) or at most 3-5 lines for each question that summarizes your reflection.
4) Ensure your reflection draws directly on information presented in the article and the guide questions.
5) Save and submit your reflection as a PDF file.


Guide Questions:
1) The paper identifies challenges for advanced XR, such as high computational demands and facilitating multiuser, multisite synergy. How does the Holo-Cloud framework's cloud-deployable, server-based architecture and emphasis on platform independence serve as a solution to these core technical problems?
2) Drawing on the experimental results presented (e.g., figures and tables showing resource utilization), what specific observations demonstrate Holo-Cloud's ability to manage resources efficiently and maintain performance when handling varying loads, such as during data loading or supporting multiple users?
3) Based on the discussion, what is one technical limitation or challenge of the current Holo-Cloud framework identified by the authors, and what is one area of future work or a proposed solution mentioned to address this issue or extend the framework.

Rubrics:
1) Content & Relevance (5 point): Reflection accurately identifies and discusses key concepts and details from the source paper, addressing themes from the guide questions.
2) Insight & Critical Thinking (5 point): Reflection goes beyond mere summary, offering a brief analysis, interpretation, or connection based on the information presented in the paper and the guide questions.
3) Clarity & Conciseness (3 point): Reflection is clearly written, easy to understand, and efficiently conveys ideas within the word limit without unnecessary jargon or repetition.
4) Adherence to Constraints (1 point): Reflection is a single paragraph, does not exceed 200 words, and is submitted in the required PDF format.
5) Mechanics (1 point): Reflection contains minimal errors in grammar, spelling, punctuation, and sentence structure.
`;

const ai = new GoogleGenAI({
	apiKey: "AIzaSyDm_stszpExkqPLytA8ElziPIpzE10wJmc",
});

// Make API request with proper format
const chat = ai.chats.create({
	// const response = await ai.models.generateContent({
	model: "gemini-2.0-flash",
	history: [],
	config: {
		systemInstruction: systemInstruction,
	},
});

// Convert a File to base64 string for Gemini inlineData format
export async function fileToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			// The result contains the data URL with prefix (data:mimetype;base64,)
			// We need to extract just the base64 part
			const base64String = reader.result as string;
			const base64Content = base64String.split(",")[1];
			resolve(base64Content);
		};
		reader.onerror = () => reject(new Error("Failed to read file"));
		reader.readAsDataURL(file);
	});
}

// Generate inlineData object for Gemini API
export async function fileToInlineData(file: File): Promise<InlineData> {
	try {
		const base64Data = await fileToBase64(file);
		return {
			inlineData: {
				mimeType: file.type,
				data: base64Data,
			},
		};
	} catch (error) {
		console.error(`Error converting file ${file.name} to inlineData:`, error);
		throw error; // Re-throw error to be caught by caller
	}
}

export async function sendToGemini(prompt: string, inlineData: UploadedFile[]) {
	// console.log("Sending message to Gemini with files: ", inlineData);

	const filtered = inlineData.filter((file) => file.sent === false);

	const files = filtered.map((file) => {
		return { fileData: { fileUri: file.uri, mimeType: file.type } };
	});

	const response = await chat.sendMessage({
		message: [rubrik, prompt, ...files],
	});

	console.log("[Gemini]", response);

	return response.text;
}

export async function chatToGemini(prompt: string, personality: string) {
	const response = await chat.sendMessage({
		message: [prompt, "[Personality:]\n" + personality],
	});

	console.log("[Gemini]", response);

	return response.text;
}

export async function askFeedback(submission: UploadedFile, references?: UploadedFile[]) {
	console.log("Asking Gemini for feedback on : ", submission.name);

	const uploadSuccess = await ai.files.upload({
		file: submission.file,
	});

	if (!uploadSuccess) {
		console.error("[Gemini] Error uploading file:", uploadSuccess);
		return;
	}

	const specificInstructions =
		"Reflect the grading based on the rubric on the instructor`s feedback instead of STELLA. This simulates the instructor grading the assignment and we refrain from letting the AI give the numeric grade. The role of STELLA is merely to provide insights to the instructor to help them grade the assignment.";

	const includedFiles = references ? references.map((file) => ({ fileData: { fileUri: file.uri, mimeType: file.type } })) : [];

	// const response = await ai.models.generateContent({ [rubrik, { fileData: { fileUri: submission.uri, mimeType: submission.type }}]})
	const response = await ai.models.generateContent({
		model: "gemini-2.0-flash",
		config: {
			systemInstruction: systemInstruction,
			responseMimeType: "application/json",
			responseSchema: feedbackResponseSchema,
		},
		contents: [specificInstructions, rubrik, { fileData: { fileUri: uploadSuccess.uri, mimeType: uploadSuccess.mimeType } }, ...includedFiles],
	});

	console.log("[Gemini]", response.text);

	return response.text;
}

export async function uploadToGemini(inlineData: UploadedFile[]) {
	console.log("Sending message to Gemini with files: ", inlineData);

	await inlineData.forEach((file) => {
		ai.files
			.upload({
				file: file.file,
			})
			.then((res) => {
				console.log("[Gemini]", res);
				file.uri = res.uri!;
			})
			.catch((error) => {
				console.error("[Gemini] Error uploading file:", error);
			});
	});

	return inlineData;
}

export async function getGeminiFiles() {
	console.log("Getting files from Gemini");

	const files = [];

	// Get the pager from the API
	const filePager = await ai.files.list();
	for await (const file of filePager) {
		files.push(file.name);
	}

	return files;
}

export async function deleteFromGemini(file: UploadedFile) {
	console.log("Deleting file from gemini: ");

	await ai.files
		.delete({
			name: file.name,
		})
		.then((res) => {
			console.log("[Gemini]", res);
			return file;
		})
		.catch((error) => {
			console.error("[Gemini] Error deleting file:", error);
		});
}
