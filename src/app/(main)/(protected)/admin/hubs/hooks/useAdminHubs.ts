"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createHub,
  deactivateHub,
  getAllHubsAdmin,
  reactivateHub,
  updateHub,
} from "@/lib/api/hubApi";
import { extractErrorMsg } from "@/lib/api/apiError";
import {
  buildHubPayload,
  DEFAULT_HUB_WORKING_HOURS,
} from "@/lib/validation/hub";
import type {
  CreateHubPayload,
  SafeHub,
  UpdateHubPayload,
} from "@/types/hub.types";

export type HubFilter = "all" | "active" | "inactive";
export type HubModalState = "closed" | "add" | "edit";
export type HubFormState = {
  name: string;
  address: string;
  city: string;
  workingHours: string;
  lat: string;
  lng: string;
};

const EMPTY_FORM: HubFormState = {
  name: "",
  address: "",
  city: "",
  workingHours: DEFAULT_HUB_WORKING_HOURS,
  lat: "",
  lng: "",
};

type ShowToast = (message: string, ok: boolean) => void;

export function useAdminHubs(showToast: ShowToast) {
  const [hubs, setHubs] = useState<SafeHub[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [busy, setBusy] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<HubFilter>("all");
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<HubModalState>("closed");
  const [editTarget, setEditTarget] = useState<SafeHub | null>(null);
  const [form, setForm] = useState<HubFormState>(EMPTY_FORM);
  const [formBusy, setFormBusy] = useState(false);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const loadControllerRef = useRef<AbortController | null>(null);

  const loadHubs = useCallback(async () => {
    loadControllerRef.current?.abort();
    const controller = new AbortController();
    loadControllerRef.current = controller;
    setLoading(true);
    setLoadError("");

    try {
      const data = await getAllHubsAdmin(controller.signal);
      if (!controller.signal.aborted) setHubs(data);
    } catch {
      if (!controller.signal.aborted) {
        setLoadError("تعذر تحميل مراكز التسليم");
        showToast("تعذر تحميل مراكز التسليم", false);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadHubs();
    return () => loadControllerRef.current?.abort();
  }, [loadHubs]);

  const availableCities = useMemo(
    () => [...new Set(hubs.map((hub) => hub.city))].sort(),
    [hubs]
  );

  const visibleHubs = useMemo(() => hubs.filter((hub) => {
    const matchesFilter =
      filter === "all" || (filter === "active" ? hub.isActive : !hub.isActive);
    const normalizedSearch = search.trim();
    const matchesSearch =
      !normalizedSearch ||
      hub.name.includes(normalizedSearch) ||
      hub.city.includes(normalizedSearch) ||
      hub.address.includes(normalizedSearch);
    return matchesFilter && matchesSearch;
  }), [filter, hubs, search]);

  const counts = useMemo(() => ({
    total: hubs.length,
    active: hubs.filter((hub) => hub.isActive).length,
    inactive: hubs.filter((hub) => !hub.isActive).length,
    cities: availableCities.length,
  }), [availableCities.length, hubs]);

  const closeModal = () => {
    if (formBusy) return;
    setModal("closed");
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setFormErrors([]);
    setEditTarget(null);
    setModal("add");
  };

  const openEdit = (hub: SafeHub) => {
    setForm({
      name: hub.name,
      address: hub.address,
      city: hub.city,
      workingHours: hub.workingHours,
      lat: hub.coordinates?.lat?.toString() ?? "",
      lng: hub.coordinates?.lng?.toString() ?? "",
    });
    setFormErrors([]);
    setEditTarget(hub);
    setModal("edit");
  };

  const saveForm = async () => {
    const { errors, payload } = buildHubPayload(form, {
      clearExistingCoordinates:
        modal === "edit" && Boolean(editTarget?.coordinates),
    });
    if (errors.length || !payload) {
      setFormErrors(errors);
      return;
    }

    setFormBusy(true);
    setFormErrors([]);

    try {
      if (modal === "add") {
        const created = await createHub(payload as CreateHubPayload);
        setHubs((current) => [created, ...current]);
        showToast("✅ تم إضافة المركز بنجاح", true);
      } else if (editTarget) {
        const updated = await updateHub(
          editTarget._id,
          payload as UpdateHubPayload
        );
        setHubs((current) =>
          current.map((hub) => (hub._id === updated._id ? updated : hub))
        );
        showToast("✅ تم تحديث المركز بنجاح", true);
      }
      setModal("closed");
    } catch (error) {
      showToast(extractErrorMsg(error, "حدث خطأ أثناء حفظ البيانات"), false);
    } finally {
      setFormBusy(false);
    }
  };

  const toggleActive = async (hub: SafeHub) => {
    if (busy[hub._id]) return;
    setBusy((current) => ({ ...current, [hub._id]: true }));

    try {
      const updated = hub.isActive
        ? await deactivateHub(hub._id)
        : await reactivateHub(hub._id);
      setHubs((current) =>
        current.map((item) => (item._id === updated._id ? updated : item))
      );
      showToast(
        hub.isActive ? "⏸ تم تعطيل المركز بنجاح" : "✅ تم تفعيل المركز بنجاح",
        true
      );
    } catch (error) {
      showToast(extractErrorMsg(error, "حدث خطأ أثناء تحديث حالة المركز"), false);
    } finally {
      setBusy((current) => ({ ...current, [hub._id]: false }));
    }
  };

  return {
    availableCities,
    busy,
    closeModal,
    counts,
    filter,
    form,
    formBusy,
    formErrors,
    loadError,
    loading,
    loadHubs,
    modal,
    openAdd,
    openEdit,
    saveForm,
    search,
    setFilter,
    setForm,
    setSearch,
    toggleActive,
    visibleHubs,
  };
}
