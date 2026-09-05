import { ScreenshotEditor } from "@/components/editor/screenshot-editor";
import { EditorProvider } from "@/lib/editor-store";

export default function Home() {
  return (
    <EditorProvider>
      <ScreenshotEditor />
    </EditorProvider>
  );
}
