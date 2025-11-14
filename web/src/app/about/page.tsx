export default function AboutPage() {
  return (
    <div className="h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-card-foreground mb-4">About</h1>
        <p className="text-base text-muted-foreground mb-4">
          Credx is a lightweight marketplace that connects publishers with
          promoters to help get high-quality traffic and exposure for
          articles. We focus on transparent pricing, simple workflows, and
          measurable outcomes so both sides can get value from promotions.
        </p>

        <h2 className="text-xl font-semibold text-card-foreground mb-2">
          What we build
        </h2>
        <p className="text-base text-muted-foreground mb-4">
          We provide tools for publishers to list articles and for promoters to
          discover promotions, fund campaigns, and track transaction history.
          The platform includes an embeddable promotion queue, wallet and
          transaction tracking, and integrations for content discovery.
        </p>

        <h2 className="text-xl font-semibold text-card-foreground mb-2">
          Tech & architecture
        </h2>
        <p className="text-base text-muted-foreground mb-4">
          This project uses Next.js for the frontend, Prisma for database
          access, Supabase for auth and object storage, and a set of Python
          microservices for model training and background jobs. We aim for a
          modular, testable stack that can scale as usage grows.
        </p>

        <h2 className="text-xl font-semibold text-card-foreground mb-2">
          Contributors
        </h2>
        <p className="text-base text-muted-foreground">
          Current developers: Vedant Jain (vedantjain8) and Dheeraj (Dheeraj585).
        </p>
      </div>
    </div>
  );
}
 