export default async function PlaceDetailsPage({ params }: { params: Promise<{ uuid: string }> }) {
  const { uuid } = await params;
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <header>
        <a href="/pisteur/places" className="mb-3 inline-flex items-center gap-1.5 text-sm text-granite-500 hover:text-granite-900">
          <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour aux bâtiments
        </a>
        <h1 className="font-display text-2xl font-semibold text-primary-900">Détail du bâtiment</h1>
        <p className="mt-1 font-mono text-xs text-granite-400">{uuid}</p>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-granite-400">La page de détail bâtiment arrive bientôt.</p>
      </div>
    </div>
  );
}
