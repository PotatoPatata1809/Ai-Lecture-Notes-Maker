import Header from '@/components/header';
import LectureScribe from '@/components/lecture-scribe';

export default function Home() {
  return (
    <div className="flex flex-col min-h-svh bg-background text-foreground">
      <Header />
      <main className="flex-1 container mx-auto flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <LectureScribe />
      </main>
    </div>
  );
}
