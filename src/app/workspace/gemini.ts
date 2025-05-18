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
        score: { type: Type.NUMBER }
      },
      propertyOrdering: ["type", "summary", "score"]
    },
    stella: {
      type: Type.OBJECT,
      properties: {
        general: { type: Type.STRING },
        positive: { type: Type.STRING },
        deficiencies: { type: Type.STRING },
        suggestions: { type: Type.STRING }
      },
      propertyOrdering: ["general", "positive", "deficiencies", "suggestions"]
    },
    instructor: { type: Type.STRING }
  },
  propertyOrdering: ["similarity", "stella", "instructor"]
}

// Define the system instruction for the AI
const systemInstruction = "You are an AI chatbot named STELLA (System for Transparent Engagement with LLMs for Learning and Assessment). You are designed to assist students in their assessment, be it a paper or code, while adhering to learning objectives and goals. Your primary task is to answer the students' queries. You should provide accurate and relevant information to help them understand the subject matter. However, you must not provide direct answers to any questions that are part of an assignment or exam. Instead, guide the students in finding the right resources or information to complete their tasks independently. Your goal is to support their learning process while ensuring academic integrity to promote responsible and ethical use of AI. Therefore, for the student's information, your conversation with the student will be submitted along with their assignment to the instructor and the instructor will have a full view of this conversation. For instances where the student exhibits a misunderstanding of the subject matter, inform the student in a friendly and informative manner. Refrain from overwhelming the student with lengthy explainations, but state where the misconception lies then formulate questions that will prompt the student to question their current understanding and encourage them to ask more questions that will clarify the topic or further their understanding of the topic. You should also encourage them to think critically and independently about their work. If a student asks for help with a specific assignment or exam question, you should redirect them to the relevant resources, such as the material that they uploaded to the workspace.";

const ai = new GoogleGenAI({ 
  apiKey: 'AIzaSyDm_stszpExkqPLytA8ElziPIpzE10wJmc', 
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
      const base64Content = base64String.split(',')[1];
      resolve(base64Content);
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
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
        data: base64Data
      }
    };
  } catch (error) {
    console.error(`Error converting file ${file.name} to inlineData:`, error);
    throw error; // Re-throw error to be caught by caller
  }
}

export async function sendToGemini(prompt: string, inlineData: UploadedFile[]) {
  // console.log("Sending message to Gemini with files: ", inlineData);

  const filtered = inlineData.filter(file => file.sent === false);

  const files = filtered.map(file => {
    return { fileData: { fileUri: file.uri, mimeType: file.type }}
  })

  const response = await chat.sendMessage({
    message: [prompt, ...files]
  })

  console.log('[Gemini]', response);

  return response.text;
}

export async function askFeedback(submission: UploadedFile, references?: UploadedFile[]) {
  console.log("Asking Gemini for feedback on : ", submission.name);

  
  const uploadSuccess = await ai.files.upload({
    file: submission.file
  })
  
  if (!uploadSuccess) {
    console.error('[Gemini] Error uploading file:', uploadSuccess);
    return;
  }

  const rubrik = 'Provide your feedback on this submission. For the instructor, simulate the succinct  feedback that instructors usually give and provide a score out of 30 and a succinct comment on the submission. For STELLA, the feedback should be comprehensive and constructive and should help the student understand their strengths and weaknesses in the submission. For the similarity report, test the submission file against other materials included in the submission.';

  const includedFiles = references ? references.map(file =>
    ({ fileData: { fileUri: file.uri, mimeType: file.type }})
  ) : []

  // const response = await ai.models.generateContent({ [rubrik, { fileData: { fileUri: submission.uri, mimeType: submission.type }}]})
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: feedbackResponseSchema
    },
    contents: [rubrik, { fileData: { fileUri: uploadSuccess.uri, mimeType: uploadSuccess.mimeType }}, ...includedFiles]
  })

  console.log('[Gemini]', response.text);

  return response.text;
}

export async function uploadToGemini(inlineData: UploadedFile[]) {
  console.log("Sending message to Gemini with files: ", inlineData);

  await inlineData.forEach((file) => {
    ai.files.upload({
      file: file.file
    }).then((res) => {
      console.log('[Gemini]', res)
      file.uri = res.uri!;
    }).catch((error) => {
      console.error('[Gemini] Error uploading file:', error);
    })
  })

  return inlineData;
}

export async function getGeminiFiles() {
  console.log("Getting files from Gemini");

  const files = []

  // Get the pager from the API
  const filePager = await ai.files.list();
  for await (const file of filePager) {
    files.push(file.name);
  }

  return files;
}

export async function deleteFromGemini(file: UploadedFile) {
  console.log("Deleting file from gemini: ", );

  await ai.files.delete({
    name: file.name
  })
  .then((res) => { 
    console.log('[Gemini]', res)
    return file
  })
  .catch((error) => {
    console.error('[Gemini] Error deleting file:', error);
  })
}