import { Message } from '@/components/blocks/conversation';
import { atom } from 'jotai';
import { UploadedFile } from './workspace/page';

export const uploadedFilesAtom = atom<UploadedFile[]>([])

export const conversationAtom = atom<Message[]>([])