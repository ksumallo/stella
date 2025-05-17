'use client'

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import Image from "next/image";
import { sendToGemini } from '@/app/workspace/gemini';

import Markdown from 'react-markdown';
import { useAtom } from 'jotai';
import { uploadedFilesAtom } from '@/app/states';

export type Message = {
    type: 'me' | 'ai';
    message: string;
    timestamp: Date;
}

interface ConversationProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export default function Conversation({
    messages,
    setMessages,
}: ConversationProps) {
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [fileUris, setFileUris] = useAtom(uploadedFilesAtom);

    const sendMessage = async () => {
        if (inputMessage.trim() === '') return;
        
        // Add user message
        const userMessage: Message = {
            type: 'me',
            message: inputMessage,
            timestamp: new Date(),
        };
        
        // Clear input field and show loading state
        const userQuery = inputMessage;
        setInputMessage('');
        setIsLoading(true);
        
        // Update messages state with user message
        setMessages(prev => [...prev, userMessage]);
        
        try {
            // Use reference files if provided
            const response = await sendToGemini(userQuery, fileUris);
            setFileUris(fileUris.map(file => ({ ...file, sent: true })));
            
            console.log('Got message from Gemini:', response);
            const aiMessage: Message = {
                type: 'ai',
                message: response!,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (e) {
            console.error('Error sending message to Gemini:', e);
            const errorMessage: Message = {
                type: 'ai',
                message: 'Sorry, I encountered an error while processing your request.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
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
                        className={`flex ${msg.type === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div 
                            className={`max-w-[70%] p-3 rounded-lg ${
                                msg.type === 'me' 
                                    ? 'bg-blackboard text-white rounded-tr-none'
                                    : 'bg-white border border-gray-200 rounded-tl-none'
                            }`}> 
                            <Markdown>{msg.message}</Markdown>
                            <div 
                                className={`text-xs mt-1 ${
                                    msg.type === 'me' ? 'text-gray-300' : 'text-gray-500'
                                }`}>
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
                    placeholder={isLoading ? "STELLA is thinking..." : "Type your message..."}
                    className="flex-1"
                    disabled={isLoading}
                />
                <Button 
                    onClick={sendMessage} 
                    disabled={!inputMessage.trim() || isLoading}
                    className={isLoading ? "animate-pulse" : ""}
                >
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}