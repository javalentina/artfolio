import { redirect } from "next/navigation";
import { DEFAULT_LANG } from "@/lib/i18n";

export default function RootPage() {
  redirect(`/${DEFAULT_LANG}`);
}
