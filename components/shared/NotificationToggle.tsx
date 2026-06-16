"use client";

import { useState, useEffect } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

async function registerServiceWorker(): Promise<ServiceWorkerRegistration> {
  const reg = await navigator.serviceWorker.register("/sw.js");
  // Wait for the service worker to be fully active
  if (reg.installing) {
    await new Promise<void>((resolve) => {
      reg.installing!.addEventListener("statechange", function handler() {
        if (this.state === "activated") {
          this.removeEventListener("statechange", handler);
          resolve();
        }
      });
    });
  } else if (reg.waiting) {
    reg.waiting.postMessage({ type: "SKIP_WAITING" });
    await new Promise<void>((resolve) => setTimeout(resolve, 500));
  }
  // Final safety — wait for navigator.serviceWorker.ready
  return navigator.serviceWorker.ready;
}

async function subscribeToPush(): Promise<PushSubscription> {
  // Always wait for the SW to be fully ready before subscribing
  await registerServiceWorker();
  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) return existing;

  return reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
    ),
  });
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray.buffer;
}

export function NotificationToggle() {
  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    setSupported(true);

    // Pre-register SW on mount so it's ready when user clicks
    navigator.serviceWorker.register("/sw.js").then((reg) => {
      navigator.serviceWorker.ready.then(() => {
        reg.pushManager.getSubscription().then((sub) => {
          setSubscribed(!!sub);
        });
      });
    });
  }, []);

  if (!supported) return null;

  const handleToggle = async () => {
    setLoading(true);
    try {
      if (subscribed) {
        // Unsubscribe
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch("/api/push/subscribe", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ endpoint: sub.endpoint }),
          });
          await sub.unsubscribe();
        }
        setSubscribed(false);
        toast.success("Daily reminders disabled");
      } else {
        // Request permission + subscribe
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          toast.error("Notification permission denied");
          return;
        }

        const sub = await subscribeToPush();
        const subJson = sub.toJSON() as {
          endpoint: string;
          keys?: { p256dh?: string; auth?: string };
        };

        await fetch("/api/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: subJson.endpoint,
            keys: {
              p256dh: subJson.keys?.p256dh ?? "",
              auth: subJson.keys?.auth ?? "",
            },
          }),
        });

        setSubscribed(true);
        toast.success("Daily reminders enabled! You'll be notified at 8:30 AM 🔔");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={subscribed ? "Disable daily reminders" : "Enable daily reminders"}
      className={`flex items-center gap-2 h-9 px-3 rounded-xl text-sm font-medium border transition-colors disabled:opacity-50 ${
        subscribed
          ? "bg-[#3B82F6]/10 border-[#3B82F6]/30 text-[#3B82F6]"
          : "bg-transparent border-[#262626] text-[#A1A1AA] hover:text-[#FAFAFA] hover:bg-[#171717]"
      }`}
    >
      {loading ? (
        <span className="w-4 h-4 border border-current border-t-transparent rounded-full animate-spin" />
      ) : subscribed ? (
        <Bell className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
      <span className="hidden sm:block">
        {subscribed ? "Reminders on" : "Enable reminders"}
      </span>
    </button>
  );
}
