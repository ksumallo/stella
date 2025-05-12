'use client'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import { Calendar1Icon, CircleHelp, Handshake, Home, Mail, Send, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export default function ComponentShowcase() {
    const [date, setDate] = useState<Date>()

    return <main className='flex flex-col items-center justify-center w-full h-full'>
        <span id='logo' className='text-8xl font-bold text-center text-white'> STELLA </span>
        <h1 className="text-4xl font-bold w-full">Component Showcase</h1>
        <h2 className="my-4 text-xl font-medium self-start">This is a showcase of various components.</h2>
       
       { /* Top Nav Bar */ }
        <nav className="flex w-full items-center justify-between p-4 bg-gray-100">
            <h1 className='text-blackboard font-black'> LOGO </h1>
            <div className="flex items-center gap-4">
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
            <section className="flex items-center gap-4"> 
                <span className='font-semibold'> Dexter Villegas </span>
                <Image width={1000} 
                    height={1000} 
                    src={'/profile_placeholder.jpg'} 
                    alt='profile_image'
                    className="h-12 w-12 rounded-full border-white border-2 inset-shadow-black"/>
            </section>
        </nav>

        { /* Top Nav Bar */ }
        <nav className="flex w-full items-center justify-between p-4 bg-gray-100">
            <h1 className='text-blackboard font-black'> LOGO </h1>
            <div className="flex items-center gap-4">
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
            <section className="flex items-center gap-4"> 
                <span className='font-semibold'> Dexter Villegas </span>
                <Image width={1000} 
                    height={1000} 
                    src={'/profile_placeholder.jpg'} 
                    alt='profile_image'
                    className="h-12 w-12 rounded-full border-white border-2 inset-shadow-black"/>
            </section>
        </nav>

        { /* Buttons */ }
        <header className='text-2xl font-bold self-start'> Buttons </header>
        <section> 
            <div className="grid grid-cols-3 gap-8"> 
                <Button variant="primary">Primary Button</Button>
                <Button variant="secondary">Secondary Button</Button>
                <Button variant="destructive">Tertiary Button</Button>

                <Button variant="outline">Secondary Button</Button>
                <Button variant="ghost">Tertiary Button</Button>
                <Button variant="link">Tertiary Button</Button>

                <Badge variant='default'> CMSC 128 </Badge>
                <div>
                  <Badge variant='outline'> Due Tomorrow </Badge>
                  <Badge variant='secondary'> Timed </Badge>
                </div>
                <Badge variant='destructive'> Late </Badge>
            </div>
        </section> 

        { /* Form Elements */ }

        <header className='text-2xl font-bold self-start'> Form Elements </header>
        <section className="grid grid-cols-2 gap-8">
          { /* Text Input Field */}
            <Input placeholder="Ask STELLA..." className="mb-4 bg-white border-gray-500 rounded-lg" /> 

          { /* Date Picker */ }
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[240px] justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <Calendar1Icon />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </section>

        { /* Misc Components */ }
        <section className="grid grid-cols-3 gap-8">
          { /* List Item */}
          <div>
            <header className='text-2xl font-bold self-start'> List Item </header>
            <div className='flex flex-row items-center w-full gap-6 m-2 p-2 bg-white border-2 border-b-6 border-gray-300 rounded-xl'>
              { /* Leading */ }
              <div> 
                <Image 
                  width={1000} 
                  height={1000} 
                  src='/profile_placeholder.jpg' 
                  alt='list-leading-img' 
                  className='w-12 h-12'
                  />
              </div>

              { /* Leading */ }
              <span className='align-middle flex-1'> List Item 1 </span>

              { /* Trailing */ }
              <div> 
                <Link href='#'>
                  <Button variant="primary" className="w-full">
                    <Send className="h-4 w-4" />
                    Send
                  </Button>
                </Link>
              </div>
            </div> 
          </div>

          { /* Subject Card */}
          <div>
            <header className='text-2xl font-bold self-start'> Subject Card</header>
            <div className='grid grid-rows-2 m-2 rounded-xl border-2 overflow-hidden'>
              <div className='flex flex-col p-4 border-b-2 bg-blackboard'>
                <span className="text-2xl text-white font-bold"> CMSC 128 </span>
                <span className="text-white"> Reginald Neil Recario  </span>
              </div>
              <div className='flex flex-col px-4 py-2'>
                <span className='font-semibold'> Assignments </span>
                <span className='text-sm'> Due tomorrow </span>
              </div>
            </div>
          </div>

          { /* Mascot */}
          <div>
            <header className='text-2xl font-bold self-start'> STELLA Mascot </header>
            <Image
              width={1000}
              height={1000}
              src='/stella.svg' 
              alt='mascot' 
              className='w-56 h-56 ' />
          </div>
        </section>


    </main>;
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem"