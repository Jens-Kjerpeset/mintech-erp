import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLock, faDownload, faFileAlt, faCubes } from '@fortawesome/free-solid-svg-icons';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormLabel } from '@/components/ui/form';


export function DataExportSettings({ 
  exportFormat, 
  setExportFormat, 
  generateSAFT, 
  generateZIP, 
  generateCSV 
}: {
  exportFormat: string;
  setExportFormat: (f: string) => void;
  generateSAFT: () => void;
  generateZIP: () => void;
  generateCSV: () => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="border-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.1)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FontAwesomeIcon icon={faLock} className="w-5 h-5 text-primary" />
            Lovpålagt Revisjonsfil (SAF-T)
          </CardTitle>
          <CardDescription>Påkrevd filformat ved bokettersyn fra Skatteetaten. Eksporterer hele hovedboken formatert til SAF-T Financial standarden.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <FormLabel>Regnskapsår</FormLabel>
              <Select defaultValue="2026">
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="2026">2026</SelectItem><SelectItem value="2025">2025</SelectItem></SelectContent>
              </Select>
            </div>
            <Button type="button" onClick={generateSAFT} className="shrink-0 gap-2">
              <FontAwesomeIcon icon={faDownload} className="w-4 h-4" /> Generer SAF-T XML
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sikkerhetskopi & Nedlasting</CardTitle>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 border rounded-none flex flex-col justify-between gap-4">
            <div className="flex flex-col items-center justify-center text-center gap-3">
              <FontAwesomeIcon icon={faFileAlt} className="w-8 h-8 text-muted-foreground" />
              <div>
                <h4 className="font-medium tracking-tight">Bilagsarkiv (Z-rapporter & Fakturaer)</h4>
                <p className="text-xs text-muted-foreground mt-1">Last ned kopi av alle PDF-bilag i en ZIP-fil.</p>
              </div>
            </div>
            <Button variant="outline" size="sm" type="button" className="w-full mt-auto" onClick={generateZIP}>Eksporter ZIP</Button>
          </div>
          
          <div className="p-4 border rounded-none flex flex-col justify-between gap-4">
            <div className="flex flex-col items-center justify-center text-center gap-3">
              <FontAwesomeIcon icon={faCubes} className="w-8 h-8 text-muted-foreground" />
              <div>
                <h4 className="font-medium tracking-tight">Rådata (Transaksjoner & Salg)</h4>
                <p className="text-xs text-muted-foreground mt-1">Eksporter detaljerte transaksjoner med avanserte parametre.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 w-full">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium tracking-tight text-muted-foreground">Fra dato</label>
                <Input type="date" className="h-8 text-xs" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-medium tracking-tight text-muted-foreground">Til dato</label>
                <Input type="date" className="h-8 text-xs" />
              </div>
              <div className="col-span-2 flex flex-col gap-1 mt-1">
                <label className="text-[10px] font-medium tracking-tight text-muted-foreground">Format</label>
                <Select value={exportFormat} onValueChange={(val) => setExportFormat(val || "csv")}>
                  <SelectTrigger className="h-8 text-xs w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV (Kommaseparert)</SelectItem>
                    <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="outline" size="sm" type="button" className="w-full mt-auto" onClick={generateCSV}>
              Eksportér Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
