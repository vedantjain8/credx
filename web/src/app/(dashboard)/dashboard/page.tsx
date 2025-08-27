import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Dashboard() {
  // add new website
  return (
    <div>
      <Button asChild>
        <Link href="/dashboard/websites" className="w-full h-full flex items-center justify-center">
          Websites
        </Link>
      </Button>
    </div>
  );
}
