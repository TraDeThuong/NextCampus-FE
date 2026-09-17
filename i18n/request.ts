import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { loadLocaleMessages } from "./load-messages";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const rawLocale =
    cookieStore.get("NEXT_LOCALE")?.value ||
    cookieStore.get("locale")?.value ||
    "vi";
  const locale = rawLocale === "en" ? "en" : "vi";

  return {
    locale,
    messages: await loadLocaleMessages(locale),
  };
});