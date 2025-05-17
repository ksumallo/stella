'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import Image from "next/image";

type Message = {
    type: 'me' | 'ai';
    message: string;
    timestamp: Date;
}

export default function Conversation() {
    const [messages, setMessages] = useState<Message[]>([
        {
            type: 'ai',
            message: 'Hello! How can I help you today?',
            timestamp: new Date(),
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');

    const sendMessage = () => {
        if (inputMessage.trim() === '') return;
        
        // Add user message
        const userMessage: Message = {
            type: 'me',
            message: inputMessage,
            timestamp: new Date(),
        };
        
        // Clear input field
        setInputMessage('');
        
        // Update messages state with user message
        setMessages(prev => [...prev, userMessage]);
        
        // Simulate AI response after a short delay
        setTimeout(() => {
            const aiMessage: Message = {
                type: 'ai',
                message: `I received your message: "${inputMessage}"`,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className="flex flex-col h-[600px] border rounded-lg shadow-sm">
            {/* Chat Header */}
            <div className="bg-blackboard text-white p-4 rounded-t-lg flex items-center">
                <Image 
                    src="/stella.svg" 
                    alt="AI Avatar" 
                    width={40} 
                    height={40} 
                    className="mr-2" 
                />
                <h2 className="font-bold text-xl">STELLA Assistant</h2>
            </div>
            
            {/* Messages Container */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.type === 'me' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div 
                            className={`max-w-[70%] p-3 rounded-lg ${
                                msg.type === 'me' 
                                    ? 'bg-blackboard text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 rounded-tl-none'
                            }`}
                        >
                            {msg.message}
                            <div 
                                className={`text-xs mt-1 ${
                                    msg.type === 'me' ? 'text-gray-300' : 'text-gray-500'
                                }`}
                            >
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Input Area */}
            <div className="p-4 border-t flex gap-2 items-center">
                <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    className="flex-1"
                />
                <Button onClick={sendMessage} disabled={!inputMessage.trim()}>
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}