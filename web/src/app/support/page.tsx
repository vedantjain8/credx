export default function SupportPage() {
  return (
    <div className="h-screen bg-background text-foreground p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-card-foreground mb-4">Support</h1>
        <p className="text-base text-muted-foreground mb-6">
          Need help? Below are a few frequently asked questions and answers to
          help you get started.
        </p>

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              How do I create a promotion?
            </h3>
            <p className="text-base text-muted-foreground">
              Create an account, add your website, and submit an article URL to
              the promotion queue with your budget. Promoters can then find
              and fund promotions.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              How does billing and wallet work?
            </h3>
            <p className="text-base text-muted-foreground">
              The platform uses a simple wallet. Add funds to your wallet to
              fund promotions; transactions and balances are shown in the
              wallet page.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              Where can I report bugs or request features?
            </h3>
            <p className="text-base text-muted-foreground">
              For bugs and feature requests, open an issue on the project
              repository or contact the current developers via their GitHub
              profiles.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
