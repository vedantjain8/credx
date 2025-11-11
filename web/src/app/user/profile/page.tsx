"use client";
import { useAuth } from "@/app/context/auth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

const availableTags = [
  "Autos and vehicles",
  "Comedy",
  "Education",
  "Entertainment",
  "Film and animation",
  "Gaming",
  "How-to and style",
  "Music",
  "News and politics",
  "Nonprofits and activism",
  "People and blogs",
  "Pets and animals",
  "Science and technology",
  "Sports",
  "Travel and events",
];

export default function UserProfilePage() {
  const { user, loading, signOut, session } = useAuth();

  const router = useRouter();
  const [userPreferences, setUserPreferences] = useState<string[]>([]);

  async function set_preferences_cookie(preferences: string[]) {
    Cookies.set("user_preferences", JSON.stringify(preferences), {
      expires: 30,
    });
  }

  async function get_preferences_cookie() {
    const cookie_preferences = Cookies.get("user_preferences");
    if (cookie_preferences) {
      return JSON.parse(cookie_preferences);
    }
    return null;
  }

  useEffect(() => {
    async function fetchUserPreferences() {
      // fetch from cookies
      try {
        const prefs = await get_preferences_cookie();
        if (prefs) {
          setUserPreferences(prefs);
          return;
        }
      } catch (err) {
        console.error(`error at fetching preferences from cookies: ${err}`);
      }

      // fetch from api when cookies not available
      try {
        await fetch("/api/user/profile/preferences", {
          method: "GET",
          headers: {
            Authorization: session!.access_token,
          },
        }).then((res) => {
          if (res.status === 200) {
            return res.json().then((data) => {
              setUserPreferences(data.preferences);
              set_preferences_cookie(data.preferences);
            });
          }
        });
      } catch (err) {
        console.error(`error at fetching preferences from api: ${err}`);
      }
    }

    fetchUserPreferences();
  }, [user, session]);

  async function handle_save_preferences() {
    try {
      // return boolean
      return await fetch("/api/user/profile/preferences", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences: userPreferences }),
      }).then((res) => {
        if (!res.ok || res.status !== 200) {
          throw new Error("Failed to update preferences");
        }
        set_preferences_cookie(userPreferences);
        return true;
      });
    } catch (err) {
      console.error(`error at saving preferences: ${err}`);
    }
  }

  const toggleTag = (tag: string) => {
    setUserPreferences((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p>User not logged in.</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      <div className="w-full max-w-md p-6 bg-card rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4 text-card-foreground">
          User Profile
        </h1>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">ID:</p>
            <p className="text-lg font-medium text-foreground">{user.id}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Email:</p>
            <p className="text-lg font-medium text-foreground">{user.email}</p>
          </div>
        </div>
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2 text-card-foreground">
            Select Your Interests
          </h2>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                  userPreferences.includes(tag)
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                } hover:opacity-90 transition`}
              >
                {tag}
              </button>
            ))}
          </div>
          <Button
            className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={async () => {
              if (await handle_save_preferences()) {
                alert("Preferences saved successfully!");
              } else {
                alert("Failed to save preferences. Please try again.");
              }
            }}
          >
            Save Preferences
          </Button>
        </div>
        <Button
          className="w-full mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
          onClick={() => router.push("/auth/update-password")}
        >
          Change Password
        </Button>
        <Button
          className="w-full mt-4 bg-destructive text-destructive-foreground hover:bg-destructive/90"
          onClick={signOut}
        >
          Logout
        </Button>
      </div>
    </div>
  );
}
