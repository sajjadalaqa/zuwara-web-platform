"use client";
import { useLocale } from "next-intl";
import Form from "@/app/[locale]/dashboard/_patient/Form";
export default function SaveProvider({
  id,
  source,
}: {
  id: number | string;
  source: "zuwara" | "d4h";
}) {
  const ar = useLocale() === "ar";
  return (
    <Form
      op="favorite-add"
      source={source}
      id={id}
      label={
        ar
          ? "\u062d\u0641\u0638 \u0645\u0632\u0648\u062f \u0627\u0644\u062e\u062f\u0645\u0629"
          : "Save provider"
      }
    />
  );
}
