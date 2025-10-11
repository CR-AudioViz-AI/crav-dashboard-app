export const PluginRegistry: Record<string, () => Promise<any>> = {
  "geo-quick": () => import("@/apps/plugins/geo-quick/clientPanel"),
  "fast-math": () => import("@/apps/plugins/fast-math/clientPanel"),
};
