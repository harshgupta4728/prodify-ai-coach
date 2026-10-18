// Underlined tabs for editor-like panels (problem description, output console).
// Plain utility classes, so tailwind-merge can override the default pill-style tabs.
export const TAB_STRIP =
  "h-10 w-full shrink-0 justify-start gap-1 rounded-none border-0 border-b bg-transparent p-0 px-2";

export const TAB_STRIP_TRIGGER =
  "h-10 gap-1.5 rounded-none border-b-2 border-transparent px-2.5 text-xs data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground";
