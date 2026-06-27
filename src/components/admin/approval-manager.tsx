"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { Review } from "@/lib/types";
import { type SimpleDateRange } from "@/components/admin/date-picker-range";
import { DatePickerWithRange } from "@/components/admin/date-picker-range";
import { CustomDropdown } from "@/components/admin/custom-dropdown";
import { cn } from "@/lib/utils";

const ALL_PRODUCTS = "all-products";
const ALL_STATUSES = "all-statuses";
const ITEMS_PER_PAGE = 9;

export function ApprovalManager({
  initialItems,
  initialTotalCount,
}: {
  initialItems: Review[];
  initialTotalCount: number;
}) {
  const router = useRouter();
  const [items, setItems] = useState<Review[]>(initialItems);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [productFilter, setProductFilter] = useState(ALL_PRODUCTS);
  const [statusFilter, setStatusFilter] = useState(ALL_STATUSES);
  const [dateRange, setDateRange] = useState<SimpleDateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [pendingStatus, setPendingStatus] = useState<{ id: string; status: string; customerName?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query), 500);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("q", debouncedQuery);
    if (productFilter !== ALL_PRODUCTS) params.set("product", productFilter);
    if (statusFilter !== ALL_STATUSES) params.set("status", statusFilter);
    if (dateRange?.from) params.set("from", dateRange.from);
    if (dateRange?.to) params.set("to", dateRange.to);
    params.set("page", String(currentPage));
    params.set("pageSize", String(ITEMS_PER_PAGE));

    let cancelled = false;
    fetch(`/api/admin/reviews?${params.toString()}`)
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (!cancelled && ok) {
          setItems(payload.data);
          setTotalCount(payload.totalCount ?? payload.data.length);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Unable to load reviews.");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, productFilter, statusFilter, dateRange, currentPage]);

  const productOptions = useMemo(() => {
    const names = Array.from(new Set(initialItems.map((item) => item.product_name).filter((name): name is string => Boolean(name)))).sort((a, b) =>
      a.localeCompare(b)
    );
    return [
      { value: ALL_PRODUCTS, label: "All products" },
      ...names.map((name) => ({ value: name, label: name })),
    ];
  }, [initialItems]);

  const totals = useMemo(
    () => ({
      count: totalCount,
      pending: items.filter((item) => item.status === "pending").length,
    }),
    [items, totalCount]
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const clampedPage = Math.max(1, Math.min(currentPage, totalPages || 1));

  const paginatedItems = items;

  function update(id: string, status: string) {
    const review = items.find((item) => item.id === id);
    setPendingStatus({ id, status, customerName: review?.customer_name });
  }

  function confirmStatusUpdate() {
    if (!pendingStatus) return;
    const { id, status } = pendingStatus;
    const previous = items;
    setUpdatingId(id);
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status: status as Review["status"] } : item)));

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/reviews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to update.");
        setItems((current) => current.map((item) => (item.id === id ? (payload.data as Review) : item)));
        setPendingStatus(null);
        router.refresh();
        toast.success("Status updated");
      } catch (error) {
        setItems(previous);
        toast.error(error instanceof Error ? error.message : "Unable to update.");
      } finally {
        setUpdatingId(null);
      }
    });
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Filtered reviews</CardDescription>
            <CardTitle className="text-2xl font-semibold">{totals.count}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Pending reviews</CardDescription>
            <CardTitle className="text-2xl font-semibold">{totals.pending}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
          <CardDescription>
            Approve reviews to show them publicly. Pending and rejected reviews stay hidden.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-visible">
          <div className="relative z-20 grid items-center gap-3 rounded-xl border border-white/40 bg-white/15 p-3 shadow-sm backdrop-blur-md md:grid-cols-[minmax(260px,1fr)_220px_180px_280px_auto]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#159FD3]" />
              <Input
                className="h-9 rounded-lg border-white/40 bg-white/20 pl-9 shadow-sm backdrop-blur-md transition-all placeholder:text-muted-foreground/70 focus:border-[#159FD3]/50 focus:bg-white/30 focus:ring-2 focus:ring-[#159FD3]/20"
                placeholder="Search reviews..."
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <CustomDropdown
              value={productFilter}
              onChange={(value) => {
                setProductFilter(value);
                setCurrentPage(1);
              }}
              options={productOptions}
            />
            <CustomDropdown
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
              options={[
                { value: ALL_STATUSES, label: "All status" },
                { value: "pending", label: "Pending" },
                { value: "approved", label: "Approved" },
                { value: "rejected", label: "Rejected" },
              ]}
            />
            <DatePickerWithRange
              value={dateRange}
              onChange={(val) => {
                setDateRange(val);
                setCurrentPage(1);
              }}
              className="w-full"
              compactLabel
            />
            <Button
              type="button"
              variant="outline"
              className="h-9"
              onClick={() => {
                setQuery("");
                setProductFilter(ALL_PRODUCTS);
                setStatusFilter(ALL_STATUSES);
                setDateRange(undefined);
                setCurrentPage(1);
              }}
            >
              Clear
            </Button>
          </div>

          <div className="relative z-0 overflow-x-auto rounded-xl border border-white/40 bg-white/10 shadow-sm backdrop-blur-md">
            <Table>
              <TableHeader className="border-b border-white/30 bg-white/20">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Customer</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Message</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Created</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Status</TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold text-foreground/80">Update status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedItems.map((item) => {
                  const options = item.status === "pending"
                    ? [
                        { value: "pending", label: "Pending" },
                        { value: "approved", label: "Approved" },
                        { value: "rejected", label: "Rejected" },
                      ]
                    : [
                        { value: "approved", label: "Approved" },
                        { value: "rejected", label: "Rejected" },
                      ];

                  return (
                    <TableRow key={item.id} className="border-b border-white/10 transition-colors duration-200 hover:bg-white/20">
                      <TableCell className="px-4 py-3">
                        <div className="font-semibold text-foreground/90">{item.customer_name}</div>
                        <div className="text-xs text-muted-foreground">{item.product_name}</div>
                      </TableCell>
                      <TableCell className="max-w-xl whitespace-normal px-4 py-3 text-sm text-foreground/80">{item.comment}</TableCell>
                      <TableCell className="px-4 py-3 text-foreground/80">{new Date(item.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "px-2.5 py-0.5 text-xs font-semibold rounded-full border backdrop-blur-sm",
                            item.status === "approved" && "bg-emerald-500/10 text-emerald-700 border-emerald-500/30",
                            item.status === "pending" && "bg-amber-500/10 text-amber-700 border-amber-500/30",
                            item.status === "rejected" && "bg-rose-500/10 text-rose-700 border-rose-500/30"
                          )}
                        >
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-3 text-right">
                        <div className="inline-block w-32 text-left">
                          <CustomDropdown
                            value={item.status}
                            disabled={isPending || updatingId === item.id}
                            onChange={(value) => update(item.id, value)}
                            options={options}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!items.length ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>

        </CardContent>
      </Card>

      {totalPages > 1 && (
        <Card size="sm">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(clampedPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-foreground">
                {Math.min(clampedPage * ITEMS_PER_PAGE, totals.count)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{totals.count}</span>{" "}
              reviews
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={clampedPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 disabled:opacity-50"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                const isCurrent = pageNum === clampedPage;
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className={cn(
                      isCurrent
                        ? "bg-[#159FD3] hover:bg-[#0B7FAE] text-white border-[#159FD3]"
                        : "bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30"
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={clampedPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="bg-white/10 border-white/20 hover:bg-white/20 hover:border-white/30 disabled:opacity-50"
              >
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <ConfirmDialog
        open={Boolean(pendingStatus)}
        onOpenChange={(open) => {
          if (!open) setPendingStatus(null);
        }}
        title="Change review status?"
        description={`Change review status${pendingStatus?.customerName ? ` for ${pendingStatus.customerName}` : ""} to "${pendingStatus?.status ?? ""}"?`}
        confirmLabel="Update review"
        disabled={isPending || Boolean(updatingId)}
        onConfirm={confirmStatusUpdate}
      />
    </div>
  );
}
