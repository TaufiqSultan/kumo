"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationControlsProps {
  hasNextPage: boolean;
  hasPrevPage: boolean;
  totalPages?: number;
}

export function PaginationControls({ hasNextPage, hasPrevPage, totalPages }: PaginationControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get("page") ?? "1";
  const per_page = searchParams.get("per_page") ?? "30";

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <Button
        variant="outline"
        className="bg-black/40 border-white/10 hover:bg-white/10"
        size="sm"
        disabled={!hasPrevPage}
        onClick={() => {
          router.push(`?page=${Number(page) - 1}&per_page=${per_page}`);
        }}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Prev
      </Button>

      <div className="mx-2 text-sm text-white/70">
        Page {page} {totalPages ? `of ${totalPages}` : ""}
      </div>

      <Button
        variant="outline"
        className="bg-black/40 border-white/10 hover:bg-white/10"
        size="sm"
        disabled={!hasNextPage}
        onClick={() => {
          router.push(`?page=${Number(page) + 1}&per_page=${per_page}`);
        }}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
