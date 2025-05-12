'use client'

import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function LandingPage() {
    const router = useRouter()
    return <main className='flex flex-col bg-blackboard p-8 justify-center items-center gap-4'>
        <h1 className='w-full text-center text-8xl text-white font-black'> STELLA </h1>
        <p className='self-center text-center px-8 py-8 text-3xl text-white font-bold'> System for Transparent Engagement with LLMs <br /> for Learning and Assessment </p>

        <div className='inline-block'>
            <Button 
                onClick={() => router.push('/login')}
                className='inline-flex flex-row  py-8 bg-white text-black font-bold'> 
                <span className="text-3xl"> Let&apos;s go! </span>
                <ChevronRight className='h-8 w-8' /> 
            </Button>
        </div>

        <section className='flex flex-row gap-8 mx-[10%]'>
            {/* Large Language Models */}
            <div className='flex flex-1 flex-col items-center'>
                <p className='text-center text-white text-lg font-semibold'> Jampacked with your favorite Large Language Models. 🤯 </p>
                <div className="flex flex-row gap-4 py-4    ">
                    <Image
                        width={512} height={512}
                        src='/logos/chatgpt.png' alt='chatgpt-logo'
                        className='h-16 w-16' />

                    <Image
                        width={512} height={512}
                        src='/logos/claude.png' alt='claude-logo'
                        className='h-16 w-16' />

                    <Image
                        width={512} height={512}
                        src='/logos/gemini.png' alt='gemini-logo'
                        className='h-16 w-16' />

                    <Image
                        width={512} height={512}
                        src='/logos/deepseek.png' alt='deepseek-logo'
                        className='h-16 w-16' />
                </div>
            </div>  

            {/* Learning Management Systems */} 
            <div className='flex flex-1 flex-col items-center'>
                <p className='text-center text-white text-lg font-semibold'> Works with platforms you love. Easy to setup. No need to start over! 👍 </p>
                <div className="flex flex-row gap-4 py-4    ">
                    <Image
                        width={512} height={512}
                        src='/logos/gclassroom.png' alt='google-classroom-logo'
                        className='h-16 w-16' />

                    <Image
                        width={512} height={512}
                        src='/logos/githubclass.svg' alt='github-classroom-logo'
                        className='h-16 w-16' />

                    <Image
                        width={512} height={512}
                        src='/logos/moodle.png' alt='moodle-logo'
                        className='h-16 w-16' />

                    <Image
                        width={512} height={512}
                        src='/logos/canvas.png' alt='canvas-logo'
                        className='h-16 w-16' />

                </div>
            </div>  

            {/* Supported by Organizations */}
            <div className='flex flex-1 flex-col items-center'>
                <p className='text-center text-white text-lg font-semibold'> Sponsored and supported by the following organizations 🫶 </p>
                <div className="flex flex-row gap-4 py-4    ">
                    <Image
                        width={512} height={512}
                        src='/logos/up.png' alt='up-logo'
                        className='h-16 w-16' />

                    <Image
                        width={512} height={512}
                        src='/logos/cas.png' alt='uplb-cas-logo'
                        className='h-16 w-16' />

                    <Image
                        width={512} height={512}
                        src='/logos/ics.png' alt='uplb-ics-logo'
                        className='h-16 w-16' />

                </div>
            </div>
        </section>
    </main>
}