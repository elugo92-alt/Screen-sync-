import { UploadForm } from "@/components/UploadForm";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Submit Completion Confirmations
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Upload one or more screenshots of completed forms for our records.
          </p>
        </div>
        <UploadForm />
      </div>
    </div>
  );
}
