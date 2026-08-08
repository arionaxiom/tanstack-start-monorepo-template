import { useLingui } from "@lingui/react/macro";
import { useState } from "react";

import {
  dynamicActivate,
  isLocaleValid,
  locales as localeLabels,
} from "@__APP_NAME__/locale/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@__APP_NAME__/ui/elements/select";
import { Spinner } from "@__APP_NAME__/ui/elements/spinner";

import { updateLocale } from "@/i18n/update-locale";

type LocaleCode = keyof typeof localeLabels;

const AVAILABLE_LOCALES: LocaleCode[] = ["en", "th"];

export function LocaleSwitcher() {
  const { i18n, t } = useLingui();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = async (nextLocale: string | null) => {
    if (
      !nextLocale ||
      !isLocaleValid(nextLocale) ||
      nextLocale === i18n.locale
    ) {
      return;
    }

    setIsUpdating(true);
    setError(null);

    try {
      await updateLocale({ data: nextLocale });
      await dynamicActivate(i18n, nextLocale);
      document.documentElement.lang = nextLocale;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t`Unable to change language.`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={i18n.locale} onValueChange={handleChange}>
        <SelectTrigger
          className="w-[160px]"
          aria-label={t`Language`}
          disabled={isUpdating}
          data-testid="locale-switcher-trigger"
        >
          <SelectValue placeholder={t`Language`} />
        </SelectTrigger>
        <SelectContent>
          {AVAILABLE_LOCALES.map((code) => (
            <SelectItem key={code} value={code}>
              {localeLabels[code] ?? code}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {isUpdating ? <Spinner className="size-4" /> : null}
      {error ? (
        <span className="text-xs text-destructive-emphasis" role="alert">
          {i18n._(error)}
        </span>
      ) : null}
    </div>
  );
}
