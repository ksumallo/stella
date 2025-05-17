'use client'

import { useAtom } from "jotai";
import { submissionAtom } from "@/lib/sessionStorage";
import { PDFObject } from "react-pdfobject";

export default function ViewFeedbackPage() {
    const [submission] = useAtom(submissionAtom)

    console.log('submission', submission?.fileSubmission)

    return <main className='grid grid-cols-3 gap-8 p-8'>
        { /* Uploaded Files list */}
        <section className="col-span-2">
            { submission?.fileSubmission ? <PDFObject url={URL.createObjectURL(submission.fileSubmission)} /> : 'No document found'}
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
}