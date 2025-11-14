export default function CareersPage() {
  return (
    <div className="h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-card-foreground mb-4">Careers</h1>
        <p className="text-base text-muted-foreground mb-6">
          While we&apos;re always happy to hear from interested contributors, the
          following profiles represent the current developers of this
          project. You can view their work and reach out via GitHub.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a
            href="https://github.com/vedantjain8"
            target="_blank"
            rel="noreferrer"
            className="block p-4 rounded-lg border border-border bg-card hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-card-foreground">Vedant Jain</h3>
            <p className="text-sm text-muted-foreground">GitHub: vedantjain8</p>
            <p className="text-sm text-muted-foreground mt-2">Current developer</p>
          </a>

          <a
            href="https://github.com/Dheeraj585"
            target="_blank"
            rel="noreferrer"
            className="block p-4 rounded-lg border border-border bg-card hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-card-foreground">Dheeraj</h3>
            <p className="text-sm text-muted-foreground">GitHub: Dheeraj585</p>
            <p className="text-sm text-muted-foreground mt-2">Current developer</p>
          </a>
        </div>
      </div>
    </div>
  );
}
