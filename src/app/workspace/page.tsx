"use client";

import Conversation from "@/components/blocks/conversation";
import { Button } from "@/components/ui/button";
import { FileIcon, Plus, X, Upload, CheckCircle2, ChevronUp, ChevronDown } from "lucide-react";
import { useRef, ChangeEvent, useState, useEffect } from "react";

import { deleteFromGemini, uploadToGemini } from "./gemini";
import { useAtom } from "jotai";
import { conversationAtom, submissionFileAtom, uploadedFilesAtom } from "../states";
import { submissionAtom } from "../states";

export type UploadedFile = {
	sent: boolean;
	uri?: string;
	file: File;
	name: string;
	type: string;
	buffer?: string;
};

export default function WorkspacePage() {
	const [messages, setMessages] = useAtom(conversationAtom);
	const [fileUris, setFileUris] = useAtom(uploadedFilesAtom);
	const [submission, setSubmission] = useAtom(submissionAtom);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	const fileInputRef = useRef<HTMLInputElement>(null);
	const submissionFileInputRef = useRef<HTMLInputElement>(null);

    const [submissionFile, setSubmissionFile] = useAtom(submissionFileAtom)
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSubmitted, setIsSubmitted] = useState(false);

	// Fetch files from Gemini on component mount

	// Convert a File to base64 string
	const fileToBase64 = (file: File): Promise<string> => {
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
	};

	// No need for a separate inlineData conversion here
	// since we're handling it directly in the Gemini integration

	// Allowed file types
	const allowedFileTypes = [
		"application/pdf", // PDF files
		"text/plain", // TXT files
		"application/msword", // DOC files
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX files
	];

	const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return;

		const newFiles = Array.from(e.target.files).filter((file) => {
			// Check if file type is allowed
			if (!allowedFileTypes.includes(file.type)) {
				alert(`File type ${file.type} is not allowed. Please upload PDF, TXT, DOC, or DOCX files only.`);
				return false;
			}
			return true;
		});

		// Process each file: create UploadedFile objects and convert files to base64
		const processedFiles: UploadedFile[] = [];

		for (const file of newFiles) {
			try {
				const base64Content = await fileToBase64(file);
				processedFiles.push({
					sent: false,
					uri: URL.createObjectURL(file), // Create a temporary URL for the file
					file: file,
					name: file.name,
					type: file.type,
					buffer: base64Content,
				});
			} catch (error) {
				console.error("Error converting file to base64:", error);
			}
		}

		console.log("Uploading files:", processedFiles);

		await uploadToGemini(processedFiles).then((res) => {
			console.log("Uploaded files:", res);
			setFileUris(res);
		});

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

    useEffect(() => {
        // Load assignment resource file on component mount
        const loadAssignmentResource = async () => {
            try {
                // Fetch the file from the public directory
                const response = await fetch('/assignment/assignment_resource.pdf');
                const blob = await response.blob();
                
                // Create a File object from the blob
                const file = new File([blob], 'assignment_resource.pdf', { 
                    type: 'application/pdf',
                    lastModified: new Date().getTime()
                });
                
                // Convert to base64
                const base64Content = await fileToBase64(file);
                
                // Create an UploadedFile object
                const uploadedFile: UploadedFile = {
                    sent: false,
                    uri: URL.createObjectURL(file),
                    file: file,
                    name: file.name,
                    type: file.type,
                    buffer: base64Content
                };
                
                console.log("Loading assignment resource:", uploadedFile);
                
                // Upload to Gemini
                uploadToGemini([uploadedFile]).then((res) => {
                    console.log("Uploaded assignment resource:", res);
                    setFileUris(prev => [...prev, ...res]);
                }).catch(error => {
                    console.error("Error uploading assignment resource:", error);
                });
                
            } catch (error) {
                console.error("Error loading assignment resource:", error);
            }
        };
        
        loadAssignmentResource();
    }, [])

	const handleButtonClick = () => {
		// Trigger file input click
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const removeFile = (toDelete: UploadedFile) => {
		deleteFromGemini(toDelete)
			.then(() => {
				setFileUris((prev) => prev.filter((file) => file.uri !== toDelete.uri));
			})
			.catch((error) => {
				console.error("[Gemini] Error deleting file:", error);
			}); // Reset processed state when files change
	};

	const handleSubmissionFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.files || e.target.files.length === 0) return;

		// Only allow one file for submission
		const file = e.target.files[0];

		if (!allowedFileTypes.includes(file.type)) {
			alert(`File type ${file.type} is not allowed. Please upload PDF, TXT, DOC, or DOCX files only.`);
			return;
		}

		setSubmissionFile(file);
        
        // Clear previous URL if it exists
        if (submission?.submissionFileUrl) {
            URL.revokeObjectURL(submission?.submissionFileUrl);
        }
        
        if (file) {
            const url = URL.createObjectURL(file);
            setSubmission({
                references: fileUris.map((f) => f.file),
                conversation: messages,
                fileSubmission: submissionFile!,
                timestamp: new Date(),
                submissionFileUrl: url,
            });
        } else {
            setSubmission({
                references: fileUris.map((f) => f.file),
                conversation: messages,
                fileSubmission: submissionFile!,
                timestamp: new Date(),
                submissionFileUrl: undefined,
            });
        }

		// Reset file input
		if (submissionFileInputRef.current) {
			submissionFileInputRef.current.value = "";
		}
	};

	const handleSubmissionButtonClick = () => {
		if (submissionFileInputRef.current) {
			submissionFileInputRef.current.click();
		}
	};

	const removeSubmissionFile = () => {
		setSubmissionFile(null);
	};

	const handleSubmit = async () => {
		if (!submissionFile) {
			alert("Please upload a submission file first.");
			return;
		}

		setIsSubmitting(true);

		try {
			// Create submission object
			setSubmission({
				references: fileUris.map((f) => f.file),
				conversation: messages,
				fileSubmission: submissionFile,
				timestamp: new Date(),
			});

			setIsSubmitted(true);
		} catch (error) {
			console.error("Error submitting assignment:", error);
			alert("Failed to submit assignment. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="p-4 min-h-screen flex flex-col">
			<div className="flex justify-between mb-4">
				<div className="flex items-center gap-2">
					{/* Materials toggle button */}
					<Button variant="ghost" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} className="flex items-center gap-2 lg:hidden">
						{isSidebarCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
						{isSidebarCollapsed ? "Show Materials" : "Hide Materials"}
					</Button>
				</div>
			</div>

			{/* Mobile View - Materials first, then Assignment Submission */}
			<div className={`mb-4 lg:hidden`}>
				{/* Uploaded Materials Section - Mobile */}
				<div className={`bg-white border-gray-300 border-b-6 border-3 rounded-xl p-4 mb-4 ${isSidebarCollapsed ? "hidden" : "block"}`}>
					<h2 className="text-lg font-extrabold text-gray-800 mb-3">Reference Materials</h2>
					<div className="flex flex-col gap-4 mb-4">
						{
							<div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col gap-4 items-center justify-center">
								{fileUris.map((file) => (
									<div key={file.uri} className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl border border-gray-300 group w-full">
										<div className="flex-shrink-0 bg-gray-300 p-2 rounded-xl">
											<FileIcon className="h-8 w-8 text-gray-500" />
										</div>
										<div className="flex flex-col flex-1 min-w-0">
											<h3 className="text-base font-semibold text-gray-700 truncate">{file.name}</h3>
											<span className="text-sm text-gray-500">
												{file.type === "application/pdf"
													? "PDF File"
													: file.type === "text/plain"
													? "Text File"
													: file.type.includes("word")
													? "Word Document"
													: "Document"}
											</span>
										</div>
										<Button variant="ghost" size="icon" className="opacity-100 transition-opacity" onClick={() => removeFile(file)}>
											<X className="h-4 w-4" />
										</Button>
									</div>
								))}

								{fileUris.length < 1 ? (
									<>
										<FileIcon className="h-10 w-10 text-gray-400 mb-2" />
										<p className="text-gray-500 text-center mb-1">No files uploaded yet</p>
										<p className="text-gray-400 text-sm text-center mb-4">Upload PDF, TXT, DOC, or DOCX files</p>
									</>
								) : (
									<></>
								)}
								<Button variant="outline" className="w-full border-gray-300" onClick={handleButtonClick}>
									<Plus className="mr-2" />
									Upload material
								</Button>
							</div>
						}
					</div>

					{/* Hidden file input */}
					<input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.doc,.docx" className="hidden" multiple />
				</div>

				{/* Assignment Submission Section - Mobile */}
				<div className="bg-white border-b-6 border-3 border-gray-300 rounded-xl p-4">
					<h2 className="text-lg font-extrabold text-gray-800 mb-3">Assignment Submission</h2>

					{isSubmitted ? (
						<div className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
							<CheckCircle2 className="h-10 w-10 text-green-500 mb-2" />
							<h3 className="text-base font-medium text-green-700">Successfully Submitted!</h3>
							<p className="text-sm text-green-600 text-center mt-1">Your work has been submitted at {submission?.timestamp.toLocaleString()}</p>
						</div>
					) : (
						<>
							{submissionFile ? (
								<div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-200 group mb-4">
									<div className="flex-shrink-0 bg-blue-100 p-2 rounded-xl">
										<FileIcon className="h-8 w-8 text-blue-500" />
									</div>
									<div className="flex flex-col flex-1 min-w-0">
										<h3 className="text-sm font-semibold text-blue-700 truncate">{submissionFile.name}</h3>
										<span className="text-xs text-blue-600">Ready for submission</span>
									</div>
									<Button variant="ghost" size="icon" className="opacity-100 transition-opacity" onClick={removeSubmissionFile}>
										<X className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center mb-4">
									<Upload className="h-10 w-10 text-gray-400 mb-2" />
									<p className="text-gray-500 text-center mb-1">Upload your final submission file</p>
									<p className="text-gray-400 text-sm text-center">PDF, TXT, DOC, or DOCX</p>

									<input type="file" ref={submissionFileInputRef} onChange={handleSubmissionFileUpload} accept=".pdf,.txt,.doc,.docx" className="hidden" />

									<Button variant="outline" onClick={handleSubmissionButtonClick} className="border-gray-300 w-full mt-4">
										Select File
									</Button>
								</div>
							)}
							<Button variant="primary" onClick={handleSubmit} disabled={isSubmitting || isSubmitted || !submissionFile} className="w-full mb-4">
								{isSubmitting ? "Submitting..." : isSubmitted ? "Submitted" : "Submit"}
							</Button>
							<div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
								<p className="text-sm text-amber-700">
									<strong>Note:</strong> Your submission will include your final document, all reference materials, and the conversation history.
								</p>
							</div>
						</>
					)}
				</div>
			</div>

			{/* Desktop View */}
			<main className="flex flex-col lg:grid lg:grid-cols-6 gap-4 lg:gap-8 h-full">
				<aside className="hidden lg:flex lg:flex-col lg:col-span-2 gap-4 h-full">
					{/* Uploaded Materials - Desktop */}
					<div className="flex flex-col gap-4 overflow-y-auto p-4 border-b-6 border-3 border-gray-300 rounded-xl min-h-[300px]">
						<h2 className="text-lg font-extrabold text-gray-800 mb-3">Reference Materials</h2>
						<div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col gap-4 items-center justify-center">
							{fileUris.map((file) => (
								<div key={file.uri} className="flex items-center gap-2 p-3 bg-gray-100 rounded-xl border border-gray-300 group w-full">
									<div className="flex-shrink-0 bg-gray-300 p-2 rounded-xl">
										<FileIcon className="h-8 w-8 text-gray-500" />
									</div>
									<div className="flex flex-col flex-1 min-w-0">
										<h3 className="text-base font-semibold text-gray-700 truncate">{file.name}</h3>
										<span className="text-sm text-gray-500">
											{file.type === "application/pdf"
												? "PDF File"
												: file.type === "text/plain"
												? "Text File"
												: file.type.includes("word")
												? "Word Document"
												: "Document"}
										</span>
									</div>
									<Button variant="ghost" size="icon" className="opacity-100 transition-opacity" onClick={() => removeFile(file)}>
										<X className="h-4 w-4" />
									</Button>
								</div>
							))}

							{fileUris.length < 1 ? (
								<>
									<FileIcon className="h-10 w-10 text-gray-400 mb-2" />
									<p className="text-gray-500 text-center mb-1">No files uploaded yet</p>
									<p className="text-gray-400 text-sm text-center mb-4">Upload PDF, TXT, DOC, or DOCX files</p>
								</>
							) : (
								<></>
							)}
							<Button variant="outline" className="w-full border-gray-300" onClick={handleButtonClick}>
								<Plus className="mr-2" />
								Upload material
							</Button>
						</div>
						{/* Hidden file input */}
						<input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.txt,.doc,.docx" className="hidden" multiple />
					</div>

					{/* Assignment submission bin - Desktop view */}
					<div className="bg-white flex flex-col gap-4 overflow-y-auto p-4 border-b-6 border-3 border-gray-300 rounded-xl h-full">
						<h2 className="text-lg font-extrabold text-gray-800 mb-3">Assignment Submission</h2>

						{isSubmitted ? (
							<div className="flex flex-col items-center justify-center p-6 bg-green-50 rounded-lg border border-green-200">
								<CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
								<h3 className="text-lg font-medium text-green-700">Successfully Submitted!</h3>
								<p className="text-base text-green-600 text-center mt-1">Your work has been submitted at {submission?.timestamp.toLocaleString()}</p>
							</div>
						) : (
							<>
								{submissionFile ? (
									<div className="flex items-center gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200 group mb-4 h-full">
										<div className="flex-shrink-0 bg-blue-100 p-2 rounded-xl">
											<FileIcon className="h-10 w-10 text-blue-500" />
										</div>
										<div className="flex flex-col flex-1 min-w-0">
											<h3 className="text-md font-semibold text-blue-700 truncate">{submissionFile.name}</h3>
											<span className="text-sm text-blue-600">Ready for submission</span>
										</div>
										<Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={removeSubmissionFile}>
											<X className="h-4 w-4" />
										</Button>
									</div>
								) : (
									<div className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center h-full">
										<Upload className="h-10 w-10 text-gray-400 mb-2" />
										<p className="text-gray-500 text-center mb-1">Upload your final submission file</p>
										<p className="text-gray-400 text-sm text-center mb-4">PDF, TXT, DOC, or DOCX</p>

										<input type="file" ref={submissionFileInputRef} onChange={handleSubmissionFileUpload} accept=".pdf,.txt,.doc,.docx" className="hidden" />

										<Button variant="outline" onClick={handleSubmissionButtonClick} className="border-gray-300 mt-4 w-full">
											Select File
										</Button>
									</div>
								)}
								<Button variant="primary" onClick={handleSubmit} disabled={isSubmitting || isSubmitted || !submissionFile} className="w-full">
									{isSubmitting ? "Submitting..." : isSubmitted ? "Submitted" : "Submit"}
								</Button>
								<div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
									<p className="text-sm text-amber-700">
										<strong>Note:</strong> Your submission will include your final document, all reference materials, and the conversation history.
									</p>
								</div>
							</>
						)}
					</div>
				</aside>

				{/* Conversation Area */}
				<section className="order-2 lg:col-span-4 h-full">
					<Conversation messages={messages} setMessages={setMessages} />
				</section>
			</main>
		</div>
	);
}
