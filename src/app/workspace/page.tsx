'use client'

import Conversation from "@/components/blocks/chat";
import { Button } from "@/components/ui/button";
import { FileIcon, Plus, X } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";

import { sendToGemini } from "./gemini";

type UploadedFile = {
    id: string;
    file: File;
    name: string;
    type: string;
};

export default function WorkspacePage() {
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    // Allowed file types
    const allowedFileTypes = [
        'application/pdf', // PDF files
        'text/plain', // TXT files
        'application/msword', // DOC files
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX files
    ];

    const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const newFiles = Array.from(e.target.files).filter(file => {
            // Check if file type is allowed
            if (!allowedFileTypes.includes(file.type)) {
                alert(`File type ${file.type} is not allowed. Please upload PDF, TXT, DOC, or DOCX files only.`);
                return false;
            }
            return true;
        });
        
        // Add new files to state
        const newUploadedFiles = newFiles.map(file => ({
            id: Math.random().toString(36).substring(2, 9), // Simple unique ID
            file,
            name: file.name,
            type: file.type,
        }));
        
        setUploadedFiles(prev => [...prev, ...newUploadedFiles]);
        
        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };
    
    const handleButtonClick = () => {
        // Trigger file input click
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };
    
    const removeFile = (id: string) => {
        setUploadedFiles(prev => prev.filter(file => file.id !== id));
    };

    return <main className='grid grid-cols-3 gap-8 p-8'>
        { /* Uploaded Files list */}
        <aside className="p-4 border-1 border-gray-300 rounded-xl">
            <div className='flex flex-col gap-4 mb-4'>
                {uploadedFiles.length > 0 ? (
                    uploadedFiles.map(file => (
                        <div key={file.id} className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl border border-gray-300 group">
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
                                onClick={() => removeFile(file.id)}
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
            <Conversation />
        </section>
    </main>
}