"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Download,
  FileText,
  Package,
  CreditCard,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface OrderDetailProps {
  order: any;
}

const statusColors = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  FAILED: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

const statusLabels = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  REFUNDED: "Refunded",
  CANCELLED: "Cancelled",
};

export default function OrderDetail({ order }: OrderDetailProps) {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [refreshingLink, setRefreshingLink] = useState<string | null>(null);

  const formatPrice = (amount: any, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(parseFloat(amount.toString()) / 100);
  };

  const handleDownload = async (linkId: string, fileName: string) => {
    setDownloadingFile(linkId);
    try {
      const response = await fetch(`/api/downloads/${linkId}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Download failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download started");
    } catch (error: any) {
      toast.error(error.message || "Failed to download file");
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleRefreshLink = async (linkId: string) => {
    setRefreshingLink(linkId);
    try {
      const response = await fetch(`/api/customer/downloads/${linkId}/refresh`, {
        method: "POST",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to refresh link");
      }
      toast.success("Download link refreshed");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Failed to refresh download link");
    } finally {
      setRefreshingLink(null);
    }
  };

  const isDownloadExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/customer/orders"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-2"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to orders
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Order #{order.orderNumber}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <Badge
              variant="secondary"
              className={statusColors[order.status as keyof typeof statusColors]}
            >
              {statusLabels[order.status as keyof typeof statusLabels]}
            </Badge>
            <span className="text-sm text-gray-600">
              Placed {formatDistanceToNow(new Date(order.createdAt))} ago
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled>
            <FileText className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.items.map((item: any) => (
                <div key={item.id} className="flex gap-4">
                  {item.product.coverImage && (
                    <img
                      src={item.product.coverImage}
                      alt={item.product.name}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      by {item.product.creator.username || item.product.creator.user.name}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">
                        Qty: {item.quantity}
                      </span>
                      <span className="font-medium">
                        {formatPrice(item.price, order.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal || order.totalAmount, order.currency)}</span>
              </div>
              {order.discountAmount && order.discountAmount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discountAmount, order.currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium text-lg">
                <span>Total</span>
                <span>{formatPrice(order.totalAmount, order.currency)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Payment Method</p>
                <p className="font-medium">
                  {order.payment?.method === "stripe" ? "Credit Card" : order.payment?.method}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transaction ID</p>
                <p className="font-mono text-sm">
                  {order.payment?.stripePaymentIntentId || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Payment Date</p>
                <p className="font-medium">
                  {order.payment?.createdAt
                    ? format(new Date(order.payment.createdAt), "PPP")
                    : "N/A"}
                </p>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {order.status === "COMPLETED" && order.downloadLinks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Downloads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {order.downloadLinks.map((link: any) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Download Files
                    </h4>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>
                        Downloads: {link.downloads} / {link.maxDownloads || 5}
                      </span>
                      <span>
                        Expires: {format(new Date(link.expiresAt), "PPP")}
                      </span>
                    </div>
                    {isDownloadExpired(link.expiresAt) && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-amber-600">
                        <AlertCircle className="h-4 w-4" />
                        This download link has expired
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {isDownloadExpired(link.expiresAt) ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRefreshLink(link.id)}
                        disabled={refreshingLink === link.id}
                      >
                        <RefreshCw
                          className={`h-4 w-4 mr-2 ${
                            refreshingLink === link.id ? "animate-spin" : ""
                          }`}
                        />
                        Refresh Link
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleDownload(link.token, "Download")}
                        disabled={downloadingFile === link.id || link.downloads >= (link.maxDownloads || 5)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        {downloadingFile === link.id
                          ? "Downloading..."
                          : "Download"}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {order.status === "FAILED" && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-900">Payment Failed</p>
                <p className="text-sm text-red-700 mt-1">
                  Your payment could not be processed. Please try again or contact support.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}