import Link from "next/link";
import { ScreenShare } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="bg-card border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-foreground"
          >
            <ScreenShare className="h-6 w-6 text-primary" />
            <span className="font-headline">ScreenSync</span>
          </Link>
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/">Upload</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/submissions">Submissions</Link>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
