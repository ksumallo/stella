'use client'

import { useAtom } from "jotai";
import { PDFObject } from "react-pdfobject";
import { FileIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { askFeedback } from "../workspace/gemini";
import { UploadedFile } from "../workspace/page";
import { Skeleton } from "@/components/ui/skeleton";
import { submissionFileAtom } from "@/app/states";

interface StellaFeedback {
    summary: string;
    general: string;
    positive: string;
    deficiencies: string;
    suggestions: string;
}

interface SimilarityReport {
    type: string;
    summary: string;
    score: number;
}


export default function ViewFeedbackPage() {
    const [submissionFile] = useAtom(submissionFileAtom)
    const [testFile] = useState<File | null>(null);
    const [testFileUrl] = useState<string | null>(null);

    const [similarity, setSimilarity] = useState<SimilarityReport>();
    const [stellaFeedback, setStellaFeedback] = useState<StellaFeedback>();
    const [instructorFeedback, setInstructorFeedback] = useState();

    const [expandStella, setExpandStella] = useState(false);
    const [expandInstructor, setExpandInstructor] = useState(false);

    useEffect(() => {
        if (!submissionFile) return;

        const uploadedFile: UploadedFile = {
            name: testFile?.name || '',
            type: testFile?.type || '',
            uri: testFileUrl || URL.createObjectURL(submissionFile),
            file: submissionFile,
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
    }, [submissionFile])

    return <main className='flex flex-col md:flex-row gap-8 p-8'>
        { /* Document Viewer */}
        <section className="flex-3">
            {submissionFile ? (
                <div className="h-[80svh] bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                    {submissionFile?.type === 'application/pdf' ? (
                        <PDFObject 
                        containerProps={{ className: "h-full" }}
                            url={URL.createObjectURL(submissionFile)} 
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
        <aside className="flex flex-col flex-2 gap-4 col-span-2">
            {/* Similarity Report Card */}
            <div className="rounded-xl overflow-hidden shadow-md bg-white">
                {/* Grade Header */}
                <div className="bg-green-700 text-white p-4 rounded-t-xl flex justify-between items-center">
                    <h2 className="text-2xl font-bold"> { /* Put grade here */ }</h2>
                    <span className="text-xl"> { /* Put grade here */ } </span>
                </div>
                
                {/* Similarity Report Section */}
                <div className="flex flex-col gap-4 p-4 bg-white">
                    <h3 className="text-2xl font-bold">Similarity Report</h3>

                    { similarity ? 
                    <p> {similarity?.summary} </p>
                    : <Skeleton className='h-[1ch] w-[10ch] bg-black/30'/> } 
                    
                    {/* Colored similarity bars */}
                    {/* <div className="flex flex-row gap-2">
                        <div className="flex-1 p-1 text-center rounded-md bg-red-300"> 75-100% Match </div>
                        <div className=" flex-1 p-1 text-center rounded-md bg-orange-200"> 11-75% Match </div>
                        <div className="flex-1 p-1 text-center rounded-md bg-yellow-200"> 1-10% Match </div>
                    </div> */}
                </div>
            </div>

            { /* STELLA Feedback Card */}
            <section>
                <div 
                    className={"w-full bg-yellow-300 px-4 py-1.5 font-bold flex justify-between items-center cursor-pointer" + (expandStella ? ' rounded-t-lg ' : ' rounded-lg ')}
                    onClick={() => { if (stellaFeedback) setExpandStella(!expandStella)}}
                >
                    <span className='italic text-yellow-800'>STELLA</span>
                    <span>{expandStella ? '▼' : '►'}</span>
                </div>
                <div className={`bg-yellow-100 border border-yellow-300 rounded-b-lg p-4 ${expandStella ? 'visible' : 'hidden'}`}>
                    { stellaFeedback ? (
                        <div className="flex flex-col gap-2">
                            <p className="flex-1">
                                {stellaFeedback.general}
                            </p>

                            {stellaFeedback.positive && (
                                <div className="mt-2">
                                    <h4 className="font-semibold text-green-700">Strengths:</h4>
                                    <p className="text-sm">{stellaFeedback.positive}</p>
                                </div>
                            )}
                            
                            {stellaFeedback.deficiencies && (
                                <div className="mt-2">
                                    <h4 className="font-semibold text-red-700">Areas for Improvement:</h4>
                                    <p className="text-sm">{stellaFeedback.deficiencies}</p>
                                </div>
                            )}
                            
                            {stellaFeedback.suggestions && (
                                <div className="mt-2">
                                    <h4 className="font-semibold text-blue-700">Suggestions:</h4>
                                    <p className="text-sm">{stellaFeedback.suggestions}</p>
                                </div>
                            )}
                            
                            {expandStella && (
                                <div className="animate-fadeIn">
                                </div>
                            )}
                        </div>
                    ) : <Skeleton className='h-[1ch] w-[10ch] bg-yellow-700/50'/> }
                </div>
            </section>
            
            {/* Instructor Feedback Card */}
            <section>
                <div 
                    className={`w-full bg-gray-300 rounded-t-lg px-4 py-1.5 flex justify-between items-center cursor-pointer ${expandInstructor ? ' rounded-t-lg ' : ' rounded-lg '}`}
                    onClick={() => { if (instructorFeedback) setExpandInstructor(!expandInstructor)}}
                >
                    <span className='text-gray-800 font-bold'> INSTRUCTOR </span>
                    <span>{expandInstructor ? '▼' : '►'}</span>
                </div>
                <div className={`border bg-gray-100  border-gray-300 rounded-b-lg p-4 transition-all duration-300 overflow-hidden ${expandInstructor ? 'visible' : 'hidden'}`}>
                    <div className="flex">
                        <p className="flex-1">
                            {instructorFeedback ?? <Skeleton className='h-[1ch] w-[10ch] bg-black/30'/> }
                        </p>
                    </div>
                </div>
            </section>
        </aside>
    </main>
}