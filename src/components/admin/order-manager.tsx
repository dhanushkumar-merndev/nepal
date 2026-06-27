"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { SearchIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import type { AdminOrder } from "@/lib/data/admin";
import { formatPrice } from "@/lib/utils/format";
import { CustomDropdown } from "@/components/admin/custom-dropdown";
import { DatePickerWithRange, type SimpleDateRange } from "@/components/admin/date-picker-range";
import { cn } from "@/lib/utils";

const orderStatuses = ["new", "processing", "completed", "cancelled"];
const ALL_PRODUCTS = "all-products";
const ITEMS_PER_PAGE = 9;

type OrderCartItem = {
  productName?: unknown;
  planName?: unknown;
  quantity?: unknown;
};

function getCartItems(order: AdminOrder): OrderCartItem[] {
  if (!Array.isArray(order.cart_items)) return [];
  return order.cart_items.filter((item): item is OrderCartItem => Boolean(item && typeof item === "object"));
}

function getProductNames(order: AdminOrder) {
  return Array.from(
    new Set(
      getCartItems(order)
        .map((item) => (typeof item.productName === "string" ? item.productName.trim() : ""))
        .filter(Boolean)
    )
  );
}

function getOrderItemsLabel(order: AdminOrder) {
  const productNames = getProductNames(order);
  if (productNames.length) return productNames.join(", ");
  const items = getCartItems(order);
  return items.length ? `${items.length} items` : "Items saved";
}

export function OrderManager({ initialOrders, initialTotalCount }: { initialOrders: AdminOrder[]; initialTotalCount: number }) {
  const [orders, setOrders] = useState(initialOrders);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [productFilter, setProductFilter] = useState(ALL_PRODUCTS);
  const [dateRange, setDateRange] = useState<SimpleDateRange | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
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
    if (dateRange?.from) params.set("from", dateRange.from);
    if (dateRange?.to) params.set("to", dateRange.to);
    params.set("page", String(currentPage));
    params.set("pageSize", String(ITEMS_PER_PAGE));

    let cancelled = false;
    fetch(`/api/admin/orders?${params.toString()}`)
      .then((response) => response.json().then((payload) => ({ ok: response.ok, payload })))
      .then(({ ok, payload }) => {
        if (!cancelled && ok) {
          setOrders(payload.data);
          setTotalCount(payload.totalCount ?? payload.data.length);
        }
      })
      .catch(() => {
        if (!cancelled) toast.error("Unable to load orders.");
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, productFilter, dateRange, currentPage]);

  const productOptions = useMemo(() => {
    const names = Array.from(new Set(initialOrders.flatMap(getProductNames))).sort((a, b) => a.localeCompare(b));
    return [
      { value: ALL_PRODUCTS, label: "All products" },
      ...names.map((name) => ({ value: name, label: name })),
    ];
  }, [initialOrders]);

  const totals = useMemo(
    () => ({
      count: totalCount,
      revenue: orders.reduce((sum, order) => sum + Number(order.total_amount ?? 0), 0),
    }),
    [orders, totalCount]
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const clampedPage = Math.max(1, Math.min(currentPage, totalPages || 1));
  const paginatedOrders = orders;

  function updateStatus(id: string, status: string) {
    const order = orders.find((item) => item.id === id);
    setPendingStatus({ id, status, customerName: order?.customer_name });
  }

  function confirmStatusUpdate() {
    if (!pendingStatus) return;
    const { id, status } = pendingStatus;

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/orders", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id, status }),
        });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.error || "Unable to update order.");
        setOrders((current) => current.map((order) => (order.id === id ? payload.data : order)));
        setPendingStatus(null);
        toast.success("Order updated");
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Unable to update order.");
      }
    });
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Filtered orders</CardDescription>
            <CardTitle className="text-2xl font-semibold">{totals.count}</CardTitle>
          </CardHeader>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Filtered revenue</CardDescription>
            <CardTitle className="text-2xl font-semibold">{formatPrice(totals.revenue)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>Search by customer or status. Filter by product and created date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 overflow-visible">
          <div className="relative z-20 grid items-center gap-3 rounded-xl border border-white/40 bg-white/15 p-3 shadow-sm backdrop-blur-md md:grid-cols-[minmax(260px,1fr)_220px_280px_auto]">
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#159FD3]" />
              <Input
                className="h-9 rounded-lg border-white/40 bg-white/20 pl-9 shadow-sm backdrop-blur-md transition-all placeholder:text-muted-foreground/70 focus:border-[#159FD3]/50 focus:bg-white/30 focus:ring-2 focus:ring-[#159FD3]/20"
                placeholder="Search orders..."
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
            <DatePickerWithRange
              value={dateRange}
              onChange={(value) => {
                setDateRange(value);
                setCurrentPage(1);
              }}
              className="w-full"
              compactLabel
            />
            <Button type="button" variant="outline" className="h-9" onClick={() => { setQuery(""); setProductFilter(ALL_PRODUCTS); setDateRange(undefined); setCurrentPage(1); }}>
              Clear
            </Button>
          </div>

          <div className="relative z-0 overflow-x-auto rounded-xl border border-white/40 bg-white/10 shadow-sm backdrop-blur-md">
            <Table>
              <TableHeader className="border-b border-white/30 bg-white/20">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Customer</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Created</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Items</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Total</TableHead>
                  <TableHead className="px-4 py-3 font-semibold text-foreground/80">Status</TableHead>
                  <TableHead className="px-4 py-3 text-right font-semibold text-foreground/80">Update status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="border-b border-white/10 transition-colors duration-200 hover:bg-white/20">
                    <TableCell className="px-4 py-3">
                      <div className="font-semibold text-foreground/90">{order.customer_name}</div>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-foreground/80">{new Date(order.created_at).toLocaleString()}</TableCell>
                    <TableCell className="max-w-72 truncate px-4 py-3 text-xs text-muted-foreground">
                      {getOrderItemsLabel(order)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-foreground/80">{formatPrice(Number(order.total_amount ?? 0))}</TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize backdrop-blur-sm",
                          order.status === "new" && "border-sky-500/30 bg-sky-500/10 text-sky-700",
                          order.status === "processing" && "border-amber-500/30 bg-amber-500/10 text-amber-700",
                          order.status === "completed" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-700",
                          order.status === "cancelled" && "border-rose-500/30 bg-rose-500/10 text-rose-700"
                        )}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-right">
                      <div className="inline-block w-32 text-left">
                        <CustomDropdown
                          value={order.status}
                          disabled={isPending}
                          onChange={(value) => updateStatus(order.id, value)}
                          options={orderStatuses}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!orders.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      No orders match these filters.
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
              <span className="font-medium text-foreground">{(clampedPage - 1) * ITEMS_PER_PAGE + 1}</span>{" "}
              to{" "}
              <span className="font-medium text-foreground">{Math.min(clampedPage * ITEMS_PER_PAGE, totals.count)}</span>{" "}
              of <span className="font-medium text-foreground">{totals.count}</span> orders
            </div>
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <Button
                variant="outline"
                size="sm"
                disabled={clampedPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/20 disabled:opacity-50"
              >
                Previous
              </Button>
              {Array.from({ length: totalPages }).map((_, index) => {
                const pageNumber = index + 1;
                const isCurrent = pageNumber === clampedPage;
                return (
                  <Button
                    key={pageNumber}
                    variant={isCurrent ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(pageNumber)}
                    className={cn(
                      isCurrent
                        ? "border-[#159FD3] bg-[#159FD3] text-white hover:bg-[#0B7FAE]"
                        : "border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/20"
                    )}
                  >
                    {pageNumber}
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                disabled={clampedPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/20 disabled:opacity-50"
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
        title="Change order status?"
        description={`Change order status${pendingStatus?.customerName ? ` for ${pendingStatus.customerName}` : ""} to "${pendingStatus?.status ?? ""}"?`}
        confirmLabel="Update order"
        disabled={isPending}
        onConfirm={confirmStatusUpdate}
      />
    </div>
  );
}
