'use client'

import Conversation, { Message } from "@/components/blocks/conversation";
import { Button } from "@/components/ui/button";
import { FileIcon, Plus, X } from "lucide-react";
import { useState, useRef, ChangeEvent, useMemo, useEffect } from "react";

import { deleteFromGemini, getGeminiFiles, sendToGemini, uploadToGemini } from "./gemini";
import { useAtom } from "jotai";
import { conversationAtom, submissionAtom, uploadedFilesAtom } from "../states";
import { buffer } from "stream/consumers";

export type UploadedFile = {
    sent: boolean;
    uri?: string;
    file: File;
    name: string;
    type: string;
    buffer?: string
};

export default function WorkspacePage() {
    const [submission, setSubmission] = useAtom(submissionAtom)
    const [messages, setMessages] = useAtom(conversationAtom)

    const [fileUris, setFileUris] = useAtom(uploadedFilesAtom)
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [isFilesProcessed, setIsFilesProcessed] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch files from Gemini on component mount

    // Convert a File to base64 string
    const fileToBase64 = (file: File): Promise<string> => {
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
    };

    // No need for a separate inlineData conversion here 
    // since we're handling it directly in the Gemini integration
    
    // Allowed file types
    const allowedFileTypes = [
        'application/pdf', // PDF files
        'text/plain', // TXT files
        'application/msword', // DOC files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
    ];

    const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const newFiles = Array.from(e.target.files).filter(file => {
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
                    buffer: base64Content
                });
            } catch (error) {
                console.error("Error converting file to base64:", error);
            }
        }
        
        console.log('Uploading files:', processedFiles);

        await uploadToGemini(processedFiles).then((res) => {
            console.log('Uploaded files:', res);
            setIsFilesProcessed(true);
            setFileUris(res);
        })

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const inlineData = useMemo(() => {
        console.log('New inlineData:', uploadedFiles);
        return uploadedFiles.map(file => ({
            inlineData: {
                mimeType: file.type,
                data: file.buffer || '' // Use the pre-processed base64 data
            }
        }));
    }, [uploadedFiles])
    
    const handleButtonClick = () => {
        // Trigger file input click
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    const removeFile = (toDelete: UploadedFile) => {
        deleteFromGemini(toDelete).then(() => {
            setUploadedFiles(prev => prev.filter(file => file.uri !== toDelete.uri));
        }).catch((error) => {
            console.error('[Gemini] Error deleting file:', error);
        })
        setIsFilesProcessed(false); // Reset processed state when files change
    };

    return <div className='p-8'> 
        <div className="flex justify-end mb-4">
            <Button 
                variant='primary' 
                onClick={() => {}}
                disabled={isSubmitting || uploadedFiles.length === 0}
            > 
                {isSubmitting ? "Submitting..." : isFilesProcessed ? "Submitted" : "Submit"} 
            </Button>
        </div>
        <main className='grid grid-cols-3 gap-8'>
            { /* Uploaded Files list */}
            <aside className="p-4 border-1 border-gray-300 rounded-xl">
                <div className='flex flex-col gap-4 mb-4'>
                    {fileUris.length > 0 ? (
                        fileUris.map(file => (
                            <div key={file.uri} className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl border border-gray-300 group">
                                <div className="flex-shrink-0 bg-gray-300 p-2 rounded-xl">
                                    <FileIcon className="h-12 w-12 text-gray-500" />
                                </div>
                                <div className="flex flex-col flex-1">
                                    <h3 className="text-lg font-semibold text-gray-700">{file.name}</h3>
                                    <span className="text-gray-500">
                                        {file.type === 'application/pdf' ? 'PDF File' :
                                        file.type === 'text/plain' ? 'Text File' :
                                        file.type.includes('word') ? 'Word Document' :
                                        'Document'}
                                    </span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeFile(file)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))
                    ) : (
                        <div className="text-center p-8 text-gray-500">
                            <p>No files uploaded yet</p>
                            <p className="text-sm">Upload PDF, TXT, DOC, or DOCX files</p>
                        </div>
                    )}
                </div>

                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.doc,.docx"
                    className="hidden"
                    multiple
                />

                <Button variant='primary' className="w-full" onClick={handleButtonClick}> 
                    <Plus className="mr-2" />
                    Upload material
                </Button>

            </aside>
            <section className="col-span-2">
                <Conversation 
                    messages={messages} 
                    setMessages={setMessages} 
                    referenceFiles={fileUris}
                />
            </section>
        </main>
    </div> 
}