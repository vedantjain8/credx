"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useAuth } from "@/app/context/auth";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { validateDomain } from "@/lib/validation/validate_website";

export default function AddNewWebsitePage() {
  const { user, session } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [verificationToken, setVerificationToken] = useState<string | null>(
    null,
  );
  const [domain, setDomain] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  type FormValues = {
    domain_name: string;
  };

  const form = useForm<FormValues>({
    defaultValues: {
      domain_name: "",
    },
  });

  const step1 = () => {
    return (
      <div className="w-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(async (data) => {
              if (!user) redirect("/login");
              if (!data.domain_name) {
                setError("Invalid data");
                return;
              }

              if (data.domain_name.endsWith("/")) {
                data.domain_name = data.domain_name.slice(0, -1);
              }

              // validation
              if (!validateDomain(data.domain_name)) {
                setError("Invalid domain name");
                return;
              }

              const verificationToken = await fetch(
                "/api/dashboard/website/new",
                {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${session?.access_token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    domain_name: data.domain_name,
                    owner_id: user.id,
                  }),
                },
              )
                .then(async (res) => {
                  if (res.status !== 200) {
                    const errorMsg =
                      (await res.json()).message || res.statusText;

                    setError(errorMsg || "Error adding website");
                    return null;
                  }
                  return res.json();
                })
                .then((data) => data.verification_token);

              if (!verificationToken) {
                setError("Error adding website");
                return;
              }

              setVerificationToken(verificationToken);
              setDomain(data.domain_name);
              setStep(2);
              setError(null);
            })}
            className="space-y-6 p-8 rounded-xl shadow-lg max-w-xl w-full mx-auto bg-card text-card-foreground"
          >
            <FormField
              control={form.control}
              name="domain_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domain Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="e.g. example.com" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full mt-4">
              Next
            </Button>
          </form>
        </Form>
      </div>
    );
  };

  const step2 = () => {
    return (
      <div className="space-y-6 p-8 rounded-xl shadow-lg max-w-xl mx-auto bg-card text-card-foreground">
        Add this code to your website&apos;s layout file to verify ownership:
        <pre className="p-4 rounded-2xl bg-muted text-muted-foreground overflow-auto">
          {`<meta name="credx-verification" content="${verificationToken}" />`}
        </pre>
        <Card className="p-4 bg-card text-card-foreground">
          <p className="text-sm text-muted-foreground">
            After adding the meta tag, click the &quot;Verify&quot; button
            below. It may take a few minutes for the changes to propagate.
          </p>
        </Card>
        <Button
          type="button"
          className="w-full"
          onClick={async () => {
            if (!user) redirect("/login");
            if (!verificationToken) setStep(1);
            setStep(3);
          }}
        >
          Verify
        </Button>
      </div>
    );
  };

  const step3 = () => {
    // verifying...
    return (
      <div className="space-y-6 p-8 rounded-xl shadow-lg max-w-xl mx-auto bg-card text-card-foreground">
        Verifying...
      </div>
    );
  };

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (step === 3) {
      timer = setTimeout(async () => {
        const response = await fetch("/api/dashboard/website/verify", {
          method: "POST",
          body: JSON.stringify({
            domain: domain,
          }),
        });

        if (response.status !== 200) {
          setError(
            (await response.json()).message || "Error verifying website",
          );
        }

        if (response.status === 200) {
          redirect("/dashboard/websites");
        }
      }, 5000);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [step, domain, user]);

  return (
    <div className="h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      {step > 1 && (
        <Button
          onClick={() => {
            setStep(step - 1);
          }}
          className="mb-4"
        >
          Back
        </Button>
      )}
      {error && <p className="text-destructive mt-2">{error}</p>}
      {step === 1 ? step1() : null}
      {step === 2 ? step2() : null}
      {step === 3 ? step3() : null}
    </div>
  );
}
