import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { cn } from '@/lib/utils';

type MarkdownProps = {
    content: string;
    className?: string;
};

export function Markdown({ content, className }: MarkdownProps) {
    return (
        <div className={cn('prose max-w-none dark:prose-invert', className)}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>
    );
}
