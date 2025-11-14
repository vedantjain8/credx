import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-card-foreground mb-4">Docs</h1>
        <p className="text-base text-muted-foreground mb-4">
          View the documentation for Credx on GitHub:{" "}
          <Link
            href="https://github.com/vedantjain8/credx"
            className="text-primary hover:underline"
          >
            here
          </Link>
        </p>
      </div>
    </div>
  );
}
