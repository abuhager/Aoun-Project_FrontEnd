"use client";

import { useToast } from "@/hooks/useToast";
import AdminHubsOverview from "./components/AdminHubsOverview";
import HubFormDialog from "./components/HubFormDialog";
import HubList from "./components/HubList";
import { useAdminHubs } from "./hooks/useAdminHubs";

export default function AdminHubsPage() {
  const { show: showToast, ToastComponent } = useToast();
  const hubs = useAdminHubs(showToast);

  return (
    <div className="space-y-6" dir="rtl">
      {ToastComponent}

      <AdminHubsOverview
        counts={hubs.counts}
        filter={hubs.filter}
        search={hubs.search}
        onFilterChange={hubs.setFilter}
        onSearchChange={hubs.setSearch}
        onAdd={hubs.openAdd}
      />

      <HubList
        hubs={hubs.visibleHubs}
        loading={hubs.loading}
        loadError={hubs.loadError}
        busy={hubs.busy}
        onRetry={() => void hubs.loadHubs()}
        onEdit={hubs.openEdit}
        onToggleActive={(hub) => void hubs.toggleActive(hub)}
      />

      <HubFormDialog
        modal={hubs.modal}
        form={hubs.form}
        formBusy={hubs.formBusy}
        formErrors={hubs.formErrors}
        availableCities={hubs.availableCities}
        setForm={hubs.setForm}
        onSave={() => void hubs.saveForm()}
        onClose={hubs.closeModal}
      />
    </div>
  );
}
