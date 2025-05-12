'use client'

import { CircleHelp, Handshake, Home, Mail, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export interface ProfileAttrs {
    name: string;
    image: string;
}

export interface NavDestination {
    href: string;
    label: string;
    icon: React.ReactNode;
}

interface TopNavBarProps {
    profile?: ProfileAttrs;
    variant?: 'default' | 'landing';   
    destinations?: NavDestination[];
}

export function TopNavBar({
    variant = 'default',
    profile,
    destinations = []
} : TopNavBarProps) {
    return <nav className="flex items-center justify-between p-4 bg-gray-100">
        <h1 className='text-blackboard font-black'> LOGO </h1>

        <div className="flex items-center gap-12 mx-auto">
            <Link href="/about" className="flex items-center gap-2 hover:underline">
                <Star className="h-6 w-6" />
                <span className="text-lg font-semibold"> About </span>
            </Link>
            <Link href="/contact-us" className="flex items-center gap-2 hover:underline">
                <Mail className="h-6 w-6" />
                <span className="text-lg font-semibold"> Contact Us </span>
            </Link>
            <Link href="/home" className="flex items-center gap-2 hover:underline">
                <Home className="h-6 w-6" />
                <span className="text-lg font-semibold"> Home </span>
            </Link>
            <Link href="/join" className="flex items-center gap-2 hover:underline">
                <Handshake className="h-6 w-6" />
                <span className="text-lg font-semibold"> Join Us </span>
            </Link>
            <Link href="/help" className="flex items-center gap-2 hover:underline">
                <CircleHelp className="h-6 w-6" />
                <span className="text-lg font-semibold"> Help </span>
            </Link>
        </div>

        { variant !== 'landing' && 
        <section className="flex items-center gap-4"> 
            <span className='font-semibold'> {profile?.name || 'Unnamed User'} </span>
            <Image width={1000} 
                height={1000} 
                src={profile?.image || '/profile_placeholder.jpg'} 
                alt='profile_image'
                className="h-12 w-12 rounded-full border-white border-2 inset-shadow-black"/>
        </section>
        }
    </nav>
}