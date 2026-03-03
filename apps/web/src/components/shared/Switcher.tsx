"use client"
import * as React from "react"

import { Globe } from "lucide-react"
import { usePathname, useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Button } from "../ui/button";
const locales = [
  { code: 'en', label: 'English', flag: 'EN' },
  { code: 'fr', label: 'Français', flag: 'FR' },
  { code: 'ar', label: 'العربية', flag: 'AR' },
];


export function Switcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('CommonComponents');

  const handleChange = (newLocale: string) => {
    if (newLocale === locale) return;
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    // Force a hard reload after changing the locale:
    router.replace(newPath); // ensures new page fetches fresh data instantly
    router.refresh(); // forces a refresh for server-side data
  };


  return (
    <DropdownMenu key={locale}> {/* <--- key forces remount on locale change */}
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" >
          <Globe className="h-[1.2rem] w-[1.2rem] text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent  align={locale === "ar" ? "start" :"end"}>
        <DropdownMenuLabel>{t('language')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map(l => (
          <DropdownMenuItem
            key={l.code}
            onClick={() => handleChange(l.code)}
            className={l.code === locale ? "font-bold bg-slate-200 dark:bg-slate-600/50 text-primary " : "cursor-pointer"}
          >
            {l.label}
            {l.code === locale && <span className="ml-auto text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
