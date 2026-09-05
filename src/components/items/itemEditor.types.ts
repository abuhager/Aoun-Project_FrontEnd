import type { ChangeEvent, FormEvent } from "react";
import type { ItemCondition } from "@/types/item.types";

export interface ItemEditorValues {
  title: string;
  description: string;
  category: string;
  location: string;
  condition: ItemCondition;
  hubId: string;
}

export interface ItemEditorMessage {
  type: "success" | "error" | "";
  text: string;
}

export type ItemFieldChangeHandler = (
  event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
) => void;

export type ItemImageChangeHandler = (event: ChangeEvent<HTMLInputElement>) => void;
export type ItemSubmitHandler = (event: FormEvent) => void;
