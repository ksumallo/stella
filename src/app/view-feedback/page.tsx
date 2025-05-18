'use client'

import { useAtom } from "jotai";
import { submissionAtom } from "@/lib/sessionStorage";
import { PDFObject } from "react-pdfobject";
import { FileIcon, Upload, X } from "lucide-react";
import { useState, useRef, ChangeEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { askFeedback } from "../workspace/gemini";
import { UploadedFile } from "../workspace/page";

function TestSubmissionBin({ onFileChange }: { onFileChange: (file: File | null) => void }) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            setSelectedFile(null);
            onFileChange(null);
            return;
        }
        
        const file = e.target.files[0];
        setSelectedFile(file);
        onFileChange(file);
        
        // Reset file input value to allow selecting the same file again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClickSelectFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        onFileChange(null);
    };

    return (
        <div className="flex flex-col">
            <p className="text-gray-600 text-sm mb-4">
                Select a file to test the AI-driven feedback system. This is for testing purposes only.
            </p>
            
            {selectedFile ? (
                <div className="space-y-4">
                    {/* Selected file preview */}
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg">
                            <FileIcon className="h-8 w-8 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-md font-semibold text-blue-700 truncate">
                                {selectedFile.name}
                            </h3>
                            <p className="text-sm text-blue-600">
                                {selectedFile.type || 'Document'}
                            </p>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-gray-500"
                            onClick={handleRemoveFile}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                    
                    {/* View feedback button */}
                    <Button 
                        className="w-full"
                        variant="default"
                    >
                        View AI Feedback
                    </Button>
                </div>
            ) : (
                <div 
                    onClick={handleClickSelectFile}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                >
                    <Upload className="h-10 w-10 text-gray-400 mb-3" />
                    <h3 className="font-medium text-gray-700 mb-1">Upload file for testing</h3>
                    <p className="text-sm text-gray-500 text-center mb-2">
                        Click to select a PDF, DOC, or TXT file
                    </p>
                    
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".pdf,.txt,.doc,.docx"
                        className="hidden"
                    />
                </div>
            )}
        </div>
    );
}

export default function ViewFeedbackPage() {
    const [submission] = useAtom(submissionAtom)
    const [testFile, setTestFile] = useState<File | null>(null);
    const [testFileUrl, setTestFileUrl] = useState<string | null>(null);

    const [similarity, setSimilarity] = useState({});
    const [stellaFeedback, setStellaFeedback] = useState({});
    const [instructorFeedback, setInstructorFeedback] = useState('');

    const [expandStella, setExpandStella] = useState(false);
    const [expandInstructor, setExpandInstructor] = useState(false);

    // Function to handle file selection
    const handleTestFileChange = (file: File | null) => {
        console.log('Uploaded a new file:', file);
        // Clear previous URL if it exists
        if (testFileUrl) {
            URL.revokeObjectURL(testFileUrl);
        }
        
        setTestFile(file);
        
        if (file) {
            const url = URL.createObjectURL(file);
            setTestFileUrl(url);
        } else {
            setTestFileUrl(null);
        }
    };

    useEffect(() => {
        if (!testFile) return;

        const uploadedFile: UploadedFile = {
            name: testFile?.name || '',
            type: testFile?.type || '',
            uri: testFileUrl || URL.createObjectURL(testFile),
            file: testFile,
            sent: false,
        }

        askFeedback(uploadedFile)
            .then((data) => {
                const feedback = JSON.parse(data ?? '');
                setSimilarity(feedback.similarity || 'No report available');
                setStellaFeedback(feedback.stella || 'No feedback provided');
                setInstructorFeedback(feedback.instructor || '(Blank)');
            })
            .catch((error) => {
                console.error('Error asking for feedback:', error);
            })
    }, [testFile])

    return <main className='grid grid-cols-3 gap-8 p-8'>
        { /* Document Viewer */}
        <section className="col-span-2">
            {testFileUrl ? (
                <div className="h-full bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                    {testFile?.type === 'application/pdf' ? (
                        <PDFObject 
                            url={testFileUrl} 
                            height="100%"
                            width="100%"
                        />
                    ) : (
                        <div className="p-8 flex flex-col items-center justify-center h-full">
                            <FileIcon className="h-16 w-16 text-blue-400 mb-4" />
                            <h3 className="text-xl font-medium text-gray-800 mb-2">File Selected</h3>
                            <p className="text-gray-600 text-center mb-4">
                                {testFile?.name} ({testFile?.type || 'Unknown type'})
                            </p>
                            <p className="text-sm text-gray-500 text-center">
                                For non-PDF files, this is just a preview placeholder.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="h-full bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center">
                    <div className="text-center p-8">
                        <FileIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-500 mb-1">No test document selected</h3>
                        <p className="text-gray-400 text-sm">Select a file in the submission bin to test feedback</p>
                    </div>
                </div>
            )}
        </section>

        {/* Feedback Section */}
        <aside className="flex flex-col gap-4">
            {/* Similarity Report Card */}
            <div className="rounded-xl overflow-hidden shadow-md bg-white">
                {/* Grade Header */}
                <div className="bg-green-700 text-white p-4 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-2xl font-bold">25/30</h2>
                    <span className="text-xl">Graded</span>
                </div>
                
                {/* Similarity Report Section */}
                <div className="flex flex-col gap-4 p-4 bg-white">
                    <h3 className="text-2xl font-bold">Similarity Report</h3>

                    <p> {similarity.summary} </p>
                    
                    {/* Colored similarity bars */}
                    <div className="flex flex-row gap-2">
                        <div className="flex-1 p-1 text-center rounded-md bg-red-300"> 75-100% Match </div>
                        <div className=" flex-1 p-1 text-center rounded-md bg-orange-200"> 11-75% Match </div>
                        <div className="flex-1 p-1 text-center rounded-md bg-yellow-200"> 1-10% Match </div>
                    </div>
                    
                    {/* Tabs */}
                    <div className="w-full bg-yellow-300 rounded-t-lg px-4 py-1.5 font-bold">
                        STELLA
                    </div>
                    
                    {/* STELLA Feedback Card */}
                    <div className=" bg-yellow-100 border border-yellow-300 rounded-b-lg p-4 relative">
                        <div className="flex">
                            <p className="flex-1">
                                {stellaFeedback.general}
                            </p>
                        </div>
                    </div>
                    
                    {/* Instructor Feedback Card */}
                    <div className="w-full bg-gray-300 rounded-t-lg px-4 py-1.5">
                        INSTRUCTOR
                    </div>
                    <div className="border border-gray-300 rounded-b-lg p-4 relative">
                        <div className="flex">
                            <p className="flex-1">
                                {instructorFeedback}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="rounded-xl overflow-hidden shadow-md bg-white">
                { /* Submission Bin */ }
                <div className="bg-blue-600 text-white p-4 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-xl font-bold">Test Submission</h2>
                    <span className="text-sm bg-blue-700 px-3 py-1 rounded-full">For Testing</span>
                </div>
                
                <div className="p-4 bg-white">
                    <TestSubmissionBin onFileChange={handleTestFileChange} />
                </div>
            </div>
        </aside>
    </main>
}