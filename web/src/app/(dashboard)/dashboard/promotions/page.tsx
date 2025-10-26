// app/dashboard/promotions/page.tsx
"use client";

import { useAuth } from "@/app/context/auth";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Website = {
  website_id: string;
  domain_name: string;
  status: string;
};

type Article = {
  id: string;
  title: string;
  promotions: {
    status: "active" | "completed" | "inactive";
    budget: string;
    credits_spent: string;
  }[];
};

type ArticlesByWebsite = {
  [key: string]: Article[];
};

export default function PromotionsPage() {
  const { user, session, loading: isAuthLoading } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContent, setSelectedContent] = useState<Article | null>(null);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(
    null,
  );

  const [websites, setWebsites] = useState<Website[]>([]);
  const [articles, setArticles] = useState<ArticlesByWebsite>({});

  const [loadingWebsites, setLoadingWebsites] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchArticlesForWebsite = async (websiteId: string) => {
    try {
      setLoadingArticles(true);

      const response = await fetch(
        `/api/dashboard/articles?websiteId=${websiteId}`,
        { method: "GET" },
      );
      if (!response.ok) throw new Error("Failed to fetch articles.");
      const data = await response.json();
      setArticles((prev) => ({ ...prev, [websiteId]: data }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred fetching articles",
      );
    } finally {
      setLoadingArticles(false);
    }
  };

  const handleWebsiteSelect = (websiteId: string) => {
    const newSelectedId = selectedWebsiteId === websiteId ? null : websiteId;
    setSelectedWebsiteId(newSelectedId);

    // Fetch articles only if a new website is selected and we don't have its data yet
    if (newSelectedId && !articles[newSelectedId]) {
      fetchArticlesForWebsite(newSelectedId);
    }
  };

  const handlePromotionSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    if (!selectedContent || !selectedWebsiteId) return;

    const formData = new FormData(event.currentTarget);
    const budget = formData.get("budget");

    try {
      const response = await fetch("/api/dashboard/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_id: selectedContent.id,
          budget: Number(budget),
          status: "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create promotion.");
      }

      await fetchArticlesForWebsite(selectedWebsiteId);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "An unknown error occurred.");
    } finally {
      handleCloseModal();
    }
  };

  // Effect to fetch the list of websites on page load
  useEffect(() => {
    const fetchWebsites = async () => {
      if (!session) {
        setLoadingWebsites(false);
        return;
      }
      try {
        setLoadingWebsites(true);
        const response = await fetch("/api/dashboard/website");
        if (!response.ok) throw new Error("Failed to fetch websites.");
        const data = await response.json();
        setWebsites(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoadingWebsites(false);
      }
    };
    fetchWebsites();
  }, [session]);

  const handlePromoteClick = (content: Article) => {
    console.log("Article selected for promotion:", content);
    setSelectedContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedContent(null);
  };

  if (isAuthLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p>Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <p>Please log in to view promotions.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen w-full bg-background p-8 text-foreground">
      <div>
        <h1 className="text-3xl font-bold text-foreground">My Promotions</h1>
        <p className="mt-2 text-muted-foreground">
          Select a website to view its articles and manage promotions.
        </p>

        <div className="mt-8 space-y-4">
          {loadingWebsites && (
            <p className="text-muted-foreground">Loading websites...</p>
          )}
          {error && <p className="text-destructive">{error}</p>}
          {!loadingWebsites && !error && websites.length === 0 && (
            <p className="text-destructive">NO WEBSITES</p>
          )}

          {!loadingWebsites &&
            !error &&
            websites.map((website) => (
              <div
                key={website.website_id}
                className="overflow-hidden rounded-lg bg-background border border-border"
              >
                <Button
                  onClick={() => handleWebsiteSelect(website.website_id)}
                  className="flex w-full items-center justify-between p-4 text-left"
                >
                  <span className="font-medium text-foreground">
                    {website.domain_name}
                  </span>
                  <span
                    className={`transform text-muted-foreground transition-transform duration-200 ${
                      selectedWebsiteId === website.website_id
                        ? "rotate-180"
                        : ""
                    }`}
                  >
                    ▼
                  </span>
                </Button>

                {selectedWebsiteId === website.website_id && (
                  <div className="border-t border-border">
                    {loadingArticles && (
                      <p className="p-4 text-muted-foreground">
                        Loading articles...
                      </p>
                    )}
                    {!loadingArticles && (
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                              Title
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                              Budget / Spent
                            </th>
                            <th className="relative px-6 py-3"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border bg-background">
                          {articles[website.website_id]?.map((item) => {
                            const promotion = item.promotions?.[0];
                            const status = promotion
                              ? promotion.status
                              : "not_promoted";
                            const budget = promotion ? promotion.budget : "0";
                            const spent = promotion
                              ? promotion.credits_spent
                              : "0";

                            return (
                              <tr key={item.id}>
                                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                                  {item.title}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm">
                                  <span
                                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                                      status === "active"
                                        ? "bg-primary/20 text-primary"
                                        : status === "completed"
                                          ? "bg-muted text-muted-foreground"
                                          : "bg-accent/20 text-accent-foreground"
                                    }`}
                                  >
                                    {status.replace("_", " ").toUpperCase()}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                                  ${parseFloat(budget).toFixed(2)} / $
                                  {parseFloat(spent).toFixed(2)}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                  {status === "not_promoted" && (
                                    <Button
                                      onClick={() => handlePromoteClick(item)}
                                      className="text-primary hover:text-primary/80"
                                    >
                                      Promote
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-card p-6 shadow-xl border border-border">
            <h2 className="text-xl font-bold text-card-foreground">
              Create Promotion
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You are promoting:{" "}
              <span className="font-semibold text-foreground">
                {selectedContent?.title}
              </span>
            </p>
            <form onSubmit={handlePromotionSubmit} className="mt-4">
              <div>
                <label
                  htmlFor="budget"
                  className="block text-sm font-medium text-card-foreground"
                >
                  Budget (in Credits)
                </label>
                <div className="mt-1">
                  <Input
                    type="number"
                    name="budget"
                    id="budget"
                    className="block w-full rounded-md border border-border bg-input text-foreground shadow-sm focus:border-ring focus:ring-ring/50 sm:text-sm"
                    placeholder="e.g., 100"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-4">
                <Button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  Start Promotion
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
