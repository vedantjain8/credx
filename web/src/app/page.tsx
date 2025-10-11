"use client";

import { useAuth } from "./context/auth";
import { useRouter } from "next/navigation";
import PageLoadSpinner from "./loading";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <PageLoadSpinner />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            Amplify Your Articles, Earn While You Engage
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Connect promoters with eager readers. Promote your content to the
            right audience and reward engagement seamlessly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (!user) router.push("/login");
                if (user) router.push("/dashboard");
              }}
              className="bg-primary-foreground text-primary px-8 py-3 rounded-lg font-semibold hover:bg-primary-foreground/90 transition-all duration-300 transform hover:scale-105"
            >
              Join Now
            </button>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/10 animate-pulse pointer-events-none"></div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-muted">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up delay-200">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-secondary-foreground">📝</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                Promote Your Articles
              </h3>
              <p className="text-muted-foreground">
                Host your ads on partner websites that showcase our widget,
                reaching targeted readers effortlessly.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up delay-200">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-secondary-foreground">🌐</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                Websites Earn Credits
              </h3>
              <p className="text-muted-foreground">
                Partner sites display ads and earn rewards based on views and
                interactions, boosting their revenue.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up delay-400">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-accent-foreground">👤</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                Readers Get Rewarded
              </h3>
              <p className="text-muted-foreground">
                Engage with articles and earn credits for your clicks, making
                reading interactive and beneficial.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-6 bg-background">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Why Choose Us?
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center justify-center place-items-center text-center">
            <div className="animate-fade-in-left w-full max-w-md">
              <h3 className="text-3xl font-semibold text-primary mb-4">
                For Promoters
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start justify-center">
                  <span className="text-primary mr-2">✓</span> Targeted reach to
                  engaged audiences
                </li>
                <li className="flex items-start justify-center">
                  <span className="text-primary mr-2">✓</span> Seamless ad
                  hosting on partner sites
                </li>
                <li className="flex items-start justify-center">
                  <span className="text-primary mr-2">✓</span> Transparent and
                  efficient promotion
                </li>
              </ul>
            </div>
            <div className="animate-fade-in-right w-full max-w-md">
              <h3 className="text-3xl font-semibold text-primary mb-4">
                For Websites & Readers
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex items-start justify-center">
                  <span className="text-primary mr-2">✓</span> Monetize your
                  site with our widget
                </li>
                <li className="flex items-start justify-center">
                  <span className="text-primary mr-2">✓</span> Reward readers
                  for interactions
                </li>
                <li className="flex items-start justify-center">
                  <span className="text-primary mr-2">✓</span> Build a community
                  of active users
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-muted">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-12">
            Key Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up delay-200">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-secondary-foreground">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                Targeted Promotion
              </h3>
              <p className="text-muted-foreground">
                Reach the perfect audience with smart matching algorithms.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up delay-200">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-secondary-foreground">💰</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                Earn Credits
              </h3>
              <p className="text-muted-foreground">
                Turn engagement into rewards for websites and readers alike.
              </p>
            </div>
            <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 animate-slide-up delay-400">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-accent-foreground">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-2">
                Seamless Integration
              </h3>
              <p className="text-muted-foreground">
                Easy widget setup for websites with minimal effort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6 bg-muted">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-foreground mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <details className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <summary className="font-semibold text-card-foreground cursor-pointer">
                How do I start promoting my articles?
              </summary>
              <p className="text-muted-foreground mt-2">
                Sign up as a promoter, upload your content, and select partner
                websites to host your ads.
              </p>
            </details>
            <details className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <summary className="font-semibold text-card-foreground cursor-pointer">
                Can websites integrate the widget easily?
              </summary>
              <p className="text-muted-foreground mt-2">
                Yes, our simple embed code makes integration quick and
                hassle-free.
              </p>
            </details>
            <details className="bg-card p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
              <summary className="font-semibold text-card-foreground cursor-pointer">
                How do readers earn credits?
              </summary>
              <p className="text-muted-foreground mt-2">
                By engaging with promoted articles on partner sites, readers
                accumulate credits automatically.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-6 bg-primary text-primary-foreground text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8">
            Join thousands of promoters and readers in our growing network.
          </p>
          <button className="bg-primary-foreground text-primary px-10 py-4 rounded-lg font-semibold hover:bg-primary-foreground/90 transition-all duration-300 transform hover:scale-105">
            Sign Up Now
          </button>
        </div>
      </section>
    </div>
  );
}
