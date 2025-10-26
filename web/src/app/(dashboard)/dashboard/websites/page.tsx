"use client";
import Link from "next/link";
import { useAuth } from "@/app/context/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; 

type Website = {
  website_id: string;
  domain_name: string;
  status: string;
};

type Article = {
  content_id: string;
  title: string;
  category: string;
};

type QueueItemType = {
  website_id: string;
  article_url: string;
  budget: number;
  promoter_id: string;
};

export default function DashboardWebsitesPage() {
  const { user, session, loading } = useAuth();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [articles, setArticles] = useState<Record<string, Article[]>>({});
  const [article_url, setArticleUrl] = useState<string>("");
  const [budgetValue, setBudgetValue] = useState<number>(0);
  const [selectedWebsiteId, setSelectedWebsiteId] = useState<string | null>(
    null
  );
  const [sendData, setSendData] = useState<QueueItemType | null>(null);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false); 

  useEffect(() => {
    if (loading) return;
    if (!user || !session) return;

    async function fetchWebsites() {
      try {
        const res = await fetch("/api/dashboard/website", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();
        if (res.status !== 200) {
          setError(data.message);
          setWebsites([]);
          return;
        }
        setWebsites(data.websites);
      } catch (err) {
        console.error("Error fetching websites:", err);
        setWebsites([]);
      }
    }

    fetchWebsites();
  }, [user, session, loading]);

  const fetchArticlesForWebsite = async (websiteId: string) => {
    try {
      setLoadingArticles(true);
      const res = await fetch(`/api/dashboard/website/${websiteId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setArticles((prev) => ({ ...prev, [websiteId]: data.message }));
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoadingArticles(false);
      console.log(articles);
    }
  };

  const handleWebsiteSelect = (websiteId: string) => {
    const newSelectedId = selectedWebsiteId === websiteId ? null : websiteId;
    setSelectedWebsiteId(newSelectedId);

    if (newSelectedId && !articles[newSelectedId]) {
      fetchArticlesForWebsite(newSelectedId);
    }
  };

  async function addNewArticle(
    website_id: string,
    article_url: string,
    budget: number
  ) {
    if (!website_id || !article_url) {
      setError("Article URL cannot be empty.");
      return;
    }

    try {
      const res = await fetch("/api/bloc/queue", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(sendData),
      }).then((res) => {
        if (res.status === 200) {
          fetchArticlesForWebsite(website_id);
          setShowDialog(true);
        }
        return res.json();
      });
      if (res.status !== 200) {
        setError(res.message || "Failed to add article to queue.");
      } else {
        alert(
          "Article successfully added to the promotion queue. Check back later for results."
        );
      }
    } catch (error) {
      console.error("Error adding new article:", error);
    }
  }

  return (
    <div className="h-screen bg-background text-foreground p-6">
      {error && <div className="text-destructive mb-3 text-sm">{error}</div>}
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-card-foreground">
            Your Websites
          </h2>
          <Link href="/dashboard/websites/new">
            <Button className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Add New Website
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {websites.map((website) => (
            <div
              key={website.website_id}
              className="overflow-hidden rounded-lg bg-card border border-border"
            >
              <Button
                onClick={() => handleWebsiteSelect(website.website_id)}
                className="flex w-full items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-card-foreground">
                  {website.domain_name}
                </span>
                <span
                  className={`transform text-muted-foreground transition-transform duration-200 ${
                    selectedWebsiteId === website.website_id ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </span>
              </Button>

              {selectedWebsiteId === website.website_id && (
                <div className="border-t border-border">
                  <div className="flex justify-between items-end p-4">
                    <Input
                      placeholder="Article URL..."
                      className="mr-4"
                      value={article_url}
                      onChange={(e) => setArticleUrl(e.target.value)}
                    ></Input>
                    <Button
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl hover:bg-primary/80 transition-colors"
                      onClick={() => {
                        setError(null); 
                        setSendData({
                          website_id: website.website_id,
                          article_url,
                          budget: budgetValue || 0,
                          promoter_id: user!.id,
                        });
                        setShowDialog(true);
                      }}
                    >
                      Add new article
                    </Button>
                  </div>
                  {loadingArticles ? (
                    <p className="p-4 text-muted-foreground">
                      Loading articles...
                    </p>
                  ) : (
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                            Title
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                            Category
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium uppercase text-muted-foreground">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-background">
                        {articles[website.website_id]?.map((article) => (
                          <tr key={article.content_id}>
                            <td className="whitespace-normal px-6 py-4 text-sm font-medium text-foreground">
                              {article.title}
                            </td>
                            <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                              {article.category}
                            </td>
                            <td>
                              <Button
                                onClick={() => setShowDialog(true)}
                                className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl hover:bg-primary/80 transition-colors"
                              >
                                Promote
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Dialog for article promotion budget */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote Article</DialogTitle>
          </DialogHeader>
          <p>Enter a budget value to promote your article.</p>
          <div className="mt-4">
            <Input
              placeholder="Enter budget value..."
              type="number"
              className="w-full"
              onChange={(e) => setBudgetValue(Number.parseInt(e.target.value))}
            />
          </div>
          <DialogFooter>
            <Button
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
              onClick={() => {
                addNewArticle(
                  sendData!.website_id,
                  sendData!.article_url,
                  budgetValue
                );
                setShowDialog(false);
              }}
            >
              Submit Budget
            </Button>
            <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
