import ClientMount from "./plugin-client-mount";

export default async function AppPanelPage({ params }: { params: Promise<{ appId: string }>}) {
  const { appId } = await params;
  return (
    <main className="space-y-6">
      <h1 className="text-2xl font-semibold">App: {appId}</h1>
      <ClientMount appId={appId} />
    </main>
  );
}
