'use client'

import Conversation, { Message } from "@/components/blocks/conversation";
import { Button } from "@/components/ui/button";
import { FileIcon, Plus, X } from "lucide-react";
import { useState, useRef, ChangeEvent } from "react";
import { uploadToGemini } from "../workspace/gemini";


type UploadedFile = {
    id: string;
    file: File;
    name: string;
    type: string;
};

export default function WorkspacePage() {
    const [messages, setMessages] = useState<Message[]>([])
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

    return <div className='p-8'> 
        <div className="flex justify-end mb-4">
            <Button variant='primary' onClick={() => {}} > Submit </Button>
        </div>
        <main className='grid grid-cols-3 gap-8'>
            { /* Uploaded Files list */}
            <section className="col-span-2">
                <Conversation messages={messages} setMessages={setMessages}/>
            </section>
            <aside className="flex flex-col gap-4">
                {/* Similarity Report Card */}
                <div className="rounded-xl overflow-hidden shadow-md bg-white">
                    {/* Grade Header */}
                    <div className="bg-green-700 text-white p-4 rounded-t-xl flex justify-between items-center">
                        <h2 className="text-2xl font-bold">25/30</h2>
                        <span className="text-xl">Graded</span>
                    </div>
                    
                    {/* Similarity Report Section */}
                    <div className="p-4 bg-white">
                        <h3 className="text-2xl font-bold mb-3">Similarity Report</h3>
                        
                        {/* Colored similarity bars */}
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-full bg-red-300"></div>
                                <span className="whitespace-nowrap">75-100% Match</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-full bg-orange-200"></div>
                                <span className="whitespace-nowrap">11-75% Match</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-full bg-green-200"></div>
                                <span className="whitespace-nowrap">1-10% Match</span>
                            </div>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex mt-4">
                            <div className="bg-yellow-300 rounded-t-lg px-6 py-2 font-bold">
                                STELLA
                            </div>
                            <div className="bg-gray-300 rounded-t-lg px-6 py-2 ml-1">
                                INSTRUCTOR
                            </div>
                        </div>
                        
                        {/* Comment box */}
                        <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4 relative">
                            <div className="flex">
                                <p className="flex-1">
                                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt
                                </p>
                                <div className="w-12 h-12 flex-shrink-0">
                                    <div className="relative w-12 h-12">
                                        <div className="absolute inset-0 bg-yellow-300 rounded-full"></div>
                                        <div className="absolute inset-1 bg-yellow-200 rounded-full flex items-center justify-center">
                                            <div className="flex">
                                                <div className="w-1.5 h-1.5 bg-black rounded-full mx-0.5"></div>
                                                <div className="w-1.5 h-1.5 bg-black rounded-full mx-0.5"></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </main>
    </div> 
}