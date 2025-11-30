import {
    DocsPage,
    DocsPageHeader,
    ExamplePreview,
    PageActions,
    PageDescription,
    PageTitle,
} from '@/components/docs-page';
import { PreviewWithFullscreen } from '@/components/ui/preview-with-controls';
import Page from '@/registry/new-york/blocks/block-editor/page';

export default function BlockEditorPage() {
    return (
        <DocsPage>
            <DocsPageHeader>
                <PageTitle>Fancy Editor</PageTitle>
                <PageDescription>A robust content editor.</PageDescription>
                <PageActions></PageActions>
            </DocsPageHeader>

            <PreviewWithFullscreen ratio={16 / 9}>
                <div className='h-full bg-card'>
                    <Page />
                </div>
            </PreviewWithFullscreen>

            <ExamplePreview>
                <div className='h-full bg-card'>
                    <Page />
                </div>
            </ExamplePreview>
        </DocsPage>
    );
}
