'use client'

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default async function LoginPage() {
    const router = useRouter();
    return <main className="flex flex-col p-16 justify-center items-center gap-8">
        <h1 className='text-6xl font-bold'> I am a... </h1>
        
        <div className='flex flex-row gap-8 mx-[10%]'>
            <Button
                onClick={() => router.push('/t/home')}
                className='bg-white border-gray-300 border-8 border-b-[1.5em] p-8 h-fit rounded-[3rem] flex-col'> 
                <Image
                    width={1000} height={1000} 
                    src='/illustrations/teacher.png' alt='image of a teacher'
                    className='h-64 w-64'  />
                <span className='text-3xl font-bold text-black'> Teacher </span>
            </Button>

            <Button
                onClick={() => router.push('/s/home')}
                className='bg-white border-gray-300 border-8 border-b-[1.5em] p-8 h-fit rounded-[3rem] flex-col'>
                <Image
                    width={1000} height={1000} 
                    src='/illustrations/alumni.png' alt='image of a teacher' 
                    className='h-64 w-64' />
                <span className='text-3xl font-bold text-black'> Student </span>
            </Button>
        </div>
    </main>
}