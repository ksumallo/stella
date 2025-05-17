import { Message } from '@/components/blocks/conversation';
import { atomWithStorage } from 'jotai/utils'


interface Submission {
    references: File[];
    conversation: Message[];
    fileSubmission?: File;
    timestamp: Date;
}

export const submissionAtom = atomWithStorage<Submission | null>('submission', null)