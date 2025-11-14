export default function BlogPage() {
  return (
    <div className="h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-card-foreground mb-4">Blog</h1>
        <p className="text-base text-muted-foreground mb-4">
          Read the latest updates, stories, and product announcements from
          Credx.
        </p>

        <h2 className="text-xl font-semibold text-card-foreground mb-2">
          Upcoming features
        </h2>
        <ul className="list-disc pl-5 text-base text-muted-foreground">
          <li>Improved promoter discovery with personalized recommendations</li>
          <li>Automated campaign reporting and analytics dashboards</li>
          <li>API endpoints for programmatic promotions and integrations</li>
        </ul>
      </div>
    </div>
  );
}
