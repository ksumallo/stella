import { Message } from '@/components/blocks/conversation';
import { atom } from 'jotai';
import { UploadedFile } from './workspace/page';

type Submission = {
    references: File[];
    conversation: Message[];
    fileSubmission: File;
    timestamp: Date;
}

export const uploadedFilesAtom = atom<UploadedFile[]>([])

export const conversationAtom = atom<Message[]>([])

export const submissionAtom = atom<Submission>()