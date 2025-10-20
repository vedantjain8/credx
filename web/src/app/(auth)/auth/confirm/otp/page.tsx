"use client";
import { useSearchParams } from "next/navigation";

export default function ConfirmPage() {
  const error_description = useSearchParams().get("error_description");
  const error_code = useSearchParams().get("error_code");
  return (
    <div>
      {error_code} - {error_description}
    </div>
  );
}
