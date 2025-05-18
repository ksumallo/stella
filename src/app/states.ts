import { Message } from '@/components/blocks/conversation';
import { atom } from 'jotai';
import { UploadedFile } from './workspace/page';

export const uploadedFilesAtom = atom<UploadedFile[]>([])

export const conversationAtom = atom<Message[]>([])
export interface Submission {
    references: File[];
    conversation: Message[];
    fileSubmission?: File;
    timestamp: Date;
    submissionFileUrl?: string;
}

export const submissionAtom = atom<Submission>()

export const submissionFileAtom = atom<File | null>(null);