export default function AddressBookPlacesPage() {
  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <header>
        <h1 className="font-display text-2xl font-semibold text-primary-900">Carnet — Bâtiments</h1>
        <p className="mt-1 text-sm text-granite-400">Vos bâtiments sauvegardés</p>
      </header>
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <p className="text-sm text-granite-400">Le carnet de bâtiments arrive bientôt.</p>
      </div>
    </div>
  );
}
