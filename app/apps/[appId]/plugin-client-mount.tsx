"use client";
import dynamic from "next/dynamic";
import { PluginRegistry } from "@/packages/shared-plugins/registry";

export default function ClientMount({ appId }: { appId: string }) {
  const importer = PluginRegistry[appId];
  if (!importer) return <div className="text-red-600">Unknown appId: {appId}</div>;

  const Panel = dynamic(importer, { ssr: false, loading: () => <div>Loading plugin…</div> });
  return <Panel />;
}
