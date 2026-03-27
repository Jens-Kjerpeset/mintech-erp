import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

import { useTheme, type Theme } from '@/providers/ThemeProvider';

export function ThemeSettings() {
  const { theme: selectedTheme, setTheme } = useTheme();

  const themes: { id: Theme; color: string; shape: string; icon?: React.ReactNode }[] = [
    { id: 'default', color: 'bg-white border-2 border-slate-200 dark:border-slate-800', shape: 'rounded-full', icon: <FontAwesomeIcon icon={faSun} className="size-4 text-black shrink-0" /> },
    { id: 'theme-1', color: 'bg-zinc-950 border-2 border-zinc-800', shape: 'rounded-full', icon: <FontAwesomeIcon icon={faMoon} className="size-4 text-white shrink-0" /> }, 
    { id: 'theme-2', color: 'bg-emerald-800', shape: 'rounded-full' }, 
    { id: 'theme-4', color: 'bg-pink-400', shape: 'rounded-full' }, 
  ];

  return (
    <div className="space-y-4 m-0">
      <Card>
        <CardHeader>
          <CardTitle>Utseende & Profil</CardTitle>
          <CardDescription>Skreddersy farger og applikasjonens formverk.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="size-12 rounded-full bg-foreground flex items-center justify-center text-background font-medium tracking-tight text-lg shrink-0">
                JK
              </div>
              <div className="flex flex-col min-w-0">
                <p className="font-medium tracking-tight text-base leading-tight truncate">Jens Kjerpeset</p>
                <p className="text-sm text-muted-foreground truncate">jens@kjerpeset.no</p>
              </div>
            </div>
            <Button variant="outline" size="sm" type="button" className="gap-2 shrink-0" onClick={() => alert("Logg inn / ut funksjonalitet kommer senere.")}>
              <FontAwesomeIcon icon={faSignOutAlt} className="size-4" /> <span className="hidden sm:inline">Logg ut</span>
            </Button>
          </div>
          
          <div className="pt-4 border-t flex flex-col gap-3">
            <p className="text-sm font-medium">Tema-akselerator</p>
            <div className="flex items-center gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={(e) => { e.preventDefault(); setTheme(t.id); }}
                  className={[
                    "size-8 border shadow-sm focus:outline-none focus-visible:ring-2 ring-primary ring-offset-background",
                    t.color,
                    t.shape,
                    selectedTheme === t.id ? "ring-2 ring-offset-2 border-primary/20 scale-110" : ""
                  ].filter(Boolean).join(' ')}
                  title={`Velg ${t.id} tema`}
                  aria-label={`Velg ${t.id} tema`}
                >
                  {t.icon && (
                    <span className="flex items-center justify-center w-full h-full">
                      {t.icon}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
