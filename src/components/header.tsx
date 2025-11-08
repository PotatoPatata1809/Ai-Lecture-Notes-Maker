import { PenSquare } from 'lucide-react';

export default function Header() {
  return (
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto flex h-16 items-center gap-3">
        <PenSquare className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold tracking-tight text-foreground">
          Lecture Scribe
        </h1>
      </div>
    </header>
  );
}
