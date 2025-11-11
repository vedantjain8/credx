"use client";
import { useSearchParams } from "next/navigation";

export default function ConfirmPage() {
  const error_description = useSearchParams().get("error_description");
  const error_code = useSearchParams().get("error_code");
  return (
    <div className="flex items-center justify-center h-screen bg-background text-foreground">
      {!error_code && !error_description ? (
        <div className="text-center">
          <h1 className="text-2xl font-bold">OTP Verified Successfully!</h1>
          <p className="text-sm text-gray-500">
            You can now close this window and return to the application.
          </p>
        </div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold">Error Code: {error_code}</h1>
          <p className="text-sm text-gray-500">
            Error Description: {error_description}
          </p>
        </div>
      )}
    </div>
  );
}
