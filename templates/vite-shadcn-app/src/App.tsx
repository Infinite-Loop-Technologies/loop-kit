import { Button } from '@loop-kit/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@loop-kit/ui/card';
import { Input } from '@loop-kit/ui/input';
import { Label } from '@loop-kit/ui/label';
import { Prose } from '@loop-kit/ui/prose';
import { Textarea } from '@loop-kit/ui/textarea';

export default function App() {
    return (
        <main className='mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-6 py-16'>
            <Card className='w-full'>
                <CardHeader>
                    <CardTitle>{{ app_title }}</CardTitle>
                    <CardDescription>
                        Vite + Tailwind + shadcn setup with shared loop-kit UI components.
                    </CardDescription>
                </CardHeader>

                <CardContent className='space-y-4'>
                    <div className='grid gap-2'>
                        <Label htmlFor='name'>Name</Label>
                        <Input id='name' placeholder='Ada Lovelace' />
                    </div>

                    <div className='grid gap-2'>
                        <Label htmlFor='notes'>Notes</Label>
                        <Textarea id='notes' placeholder='Write something...' />
                    </div>

                    <Prose>
                        <p>
                            Pull registry blocks with <code>pnpm dlx shadcn@latest add
                            @loop-cn/prose</code>.
                        </p>
                    </Prose>
                </CardContent>

                <CardFooter className='justify-end'>
                    <Button>Continue</Button>
                </CardFooter>
            </Card>
        </main>
    );
}
