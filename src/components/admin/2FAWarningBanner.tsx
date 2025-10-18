"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, AlertTriangle, ExternalLink } from "lucide-react";

interface TwoFactorAuthStatus {
  enabled: boolean;
  methods: string[];
}

export function TwoFactorAuthWarningBanner() {
  const [twoFAStatus, setTwoFAStatus] = useState<TwoFactorAuthStatus | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchTwoFAStatus();

    // Check if banner was previously dismissed (stored in sessionStorage)
    const wasDismissed = sessionStorage.getItem("2fa-warning-dismissed");
    if (wasDismissed === "true") {
      setDismissed(true);
    }
  }, []);

  const fetchTwoFAStatus = async () => {
    try {
      const response = await fetch("/api/admin/2fa-status");
      const data = await response.json();

      if (data.success) {
        setTwoFAStatus(data.twoFactorAuth);
      }
    } catch (error) {
      console.error("Error fetching 2FA status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("2fa-warning-dismissed", "true");
  };

  const handleEnable2FA = () => {
    // Redirect to Clerk user profile page to enable 2FA
    window.location.href = "/user-profile#security";
  };

  // Don't show if loading, dismissed, or 2FA is already enabled
  if (loading || dismissed || twoFAStatus?.enabled) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="flex items-center justify-between">
        <span>Two-Factor Authentication Required</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 px-2"
        >
          Dismiss
        </Button>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <p className="mb-3">
          As an admin user, you must enable two-factor authentication (2FA) to
          enhance account security and protect sensitive data.
        </p>
        <div className="flex gap-2">
          <Button onClick={handleEnable2FA} size="sm" variant="default">
            <Shield className="h-4 w-4 mr-2" />
            Enable 2FA Now
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
          <Button
            onClick={handleDismiss}
            size="sm"
            variant="outline"
            className="text-white border-white/20 hover:bg-white/10"
          >
            Remind Me Later
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
