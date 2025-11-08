import React, { useEffect, useRef, useState } from "react";
import { Button } from "../components/ui/button";
import {
  Check,
  Crown,
  Star,
  Eye,
  Clock,
  ArrowRight,
  Package as PackageIcon,
} from "lucide-react";
import type { AdPackage } from "@shared/types";
import { useNavigate } from "react-router-dom";

export default function PackagesPage() {
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchingRef = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPackages = async () => {
    if (fetchingRef.current) return;
    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);

      let data: any;
      try {
        if (typeof (window as any).api === "function") {
          const resp = await (window as any).api("/plans?isActive=true");
          data = resp?.ok ? resp.json : resp?.data;
        }
      } catch (e) {
        // fallback
      }

      if (!data) {
        const res = await fetch("/api/plans?isActive=true", {
          credentials: "include",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        data = await res.json();
      }

      if (data && data.success && Array.isArray(data.data)) {
        const fetched = data.data as AdPackage[];
        const personalConsultation: AdPackage = {
          _id: "personal-consultation",
          name: "Personal Consultation",
          description:
            "One-on-one personal consultation for listing strategy, pricing and visibility. Contact 9896095599 (10:00 AM - 6:00 PM).",
          price: 0,
          duration: 1,
          features: [
            "Direct phone consultation",
            "Listing review and optimization",
            "Pricing strategy",
            "Priority support (10:00 AM - 6:00 PM)",
          ],
          featuresHtml: [],
          premium: false,
          type: "custom",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // price 0 indicates free selection - user will be advised to call
        } as any;
        setPackages([...fetched, personalConsultation]);
      } else {
        setError("Invalid data format received");
        setPackages([]);
      }
    } catch (e) {
      setError("Failed to load packages");
      setPackages([]);
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  const goCheckout = (id?: string) => {
    if (!id) return;
    navigate(`/checkout/${id}`);
  };

  if (loading) {
    return (
      <main className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-6">
        <PackageIcon className="h-8 w-8 text-[#C70000]" />
        <h1 className="text-2xl font-bold">Advertisement Packages</h1>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg._id}
            className={`rounded-xl border p-5 ${pkg.type === "premium" ? "border-yellow-300" : "border-gray-200"}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold">{pkg.name}</h3>
                <div className="text-sm text-gray-600">
                  {pkg.duration} days •{" "}
                  {pkg.price === 0 ? "Free" : `₹${pkg.price}`}
                </div>
              </div>
              {pkg.premium && (
                <div className="bg-yellow-400 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Premium
                </div>
              )}
            </div>

            <p className="text-gray-700 mb-4">{pkg.description}</p>

            <div className="mb-4">
              <div className="font-semibold mb-2">Features</div>
              <ul className="space-y-2">
                {pkg.features.map((f, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                    <span className="text-sm text-gray-700">{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            <Button
              onClick={() => goCheckout(pkg._id)}
              className="w-full bg-[#C70000] text-white"
            >
              {pkg.price === 0 ? "Choose (Free)" : `Choose for ₹${pkg.price}`}{" "}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        ))}
      </div>
    </main>
  );
}
