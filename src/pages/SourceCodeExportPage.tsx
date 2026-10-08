import React, { useState } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import {
  Download,
  FileArchive,
  CheckCircle2,
  FolderTree,
  FileCode,
  ShieldCheck,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const SourceCodeExportPage: React.FC = () => {
  const { role } = useSalon();
  const [isDownloading, setIsDownloading] = useState(false);

  const includedFolders = [
    { name: 'src', desc: 'All TypeScript/React pages, components, contexts, and hooks' },
    { name: 'public', desc: 'Logos, favicon, fonts, and static web assets' },
    { name: 'docs', desc: 'Product Requirements (PRD), Design system, and Architecture docs' },
    { name: 'supabase', desc: 'Database migrations, schema DDL, and triggers' },
    { name: 'tasks', desc: 'Project tasks and automation specifications' },
  ];

  const includedConfigs = [
    'biome.json',
    'components.json',
    'index.html',
    'package.json',
    'pnpm-workspace.yaml',
    'postcss.config.js',
    'README.md',
    'sgconfig.yml',
    'tailwind.config.js',
    'tsconfig.app.json',
    'tsconfig.check.json',
    'tsconfig.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'vitest.browser.config.ts',
    'vitest.config.ts',
  ];

  const handleDownload = () => {
    setIsDownloading(true);
    toast.info('Preparing complete source code package...');

    try {
      const link = document.createElement('a');
      link.href = '/tgs_salon_source_code_v15.zip';
      link.download = `TGS_Salon_CRM_SourceCode_v15_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => {
        setIsDownloading(false);
        toast.success('Source code ZIP v15 downloaded successfully!');
      }, 800);
    } catch (e) {
      setIsDownloading(false);
      toast.error('Failed to trigger download');
    }
  };

  if (role !== 'owner') {
    return (
      <div className="p-8 text-center space-y-3">
        <h2 className="text-xl font-bold text-destructive">Owner Access Required</h2>
        <p className="text-sm text-muted-foreground">
          The application source code export module is restricted strictly to the Salon Owner.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Source Code Export</h1>
            <Badge variant="outline" className="border-primary/40 text-primary gap-1">
              👑 Owner Exclusive
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Download the production repository ZIP containing all source files, configurations, and documentation.
          </p>
        </div>

        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          className="gap-2 h-10 px-5 font-bold shadow-sm"
        >
          {isDownloading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Packing ZIP...
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              Download Source Code ZIP
            </>
          )}
        </Button>
      </div>

      {/* Overview Card */}
      <Card className="border shadow-none bg-gradient-to-r from-card to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <FileArchive className="w-7 h-7 text-primary" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-foreground">
                  The Grooming Studio (TGS) - Full Application Bundle
                </h3>
                <p className="text-xs text-muted-foreground">
                  Includes complete React + Vite + TypeScript frontend, Tailwind CSS token themes, Supabase PostgreSQL DDL, and configuration files.
                </p>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <Badge variant="secondary" className="font-mono text-[10px]">
                    ZIP Package v15 (Production Release)
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Clean, Verified &amp; Production-Ready
                  </span>
                </div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2 font-bold px-6 shrink-0"
            >
              <Download className="w-4 h-4" />
              Download .ZIP Archive
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Included Directories and Files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Directories */}
        <Card className="border shadow-none">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-primary" />
              Included Source Folders ({includedFolders.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Primary code modules, UI assets, and database schemas.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2.5 text-xs">
            {includedFolders.map((f) => (
              <div
                key={f.name}
                className="flex items-start justify-between p-2.5 rounded border bg-card hover:bg-muted/20"
              >
                <div>
                  <div className="font-mono font-bold text-foreground flex items-center gap-1.5">
                    <span className="text-primary">/</span>
                    {f.name}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{f.desc}</div>
                </div>
                <Badge variant="outline" className="text-[10px] font-mono">
                  Full Tree
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Configuration Files */}
        <Card className="border shadow-none">
          <CardHeader className="p-4 pb-2 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileCode className="w-4 h-4 text-emerald-600" />
              Root Configuration & Tooling Files ({includedConfigs.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Project configs, dependencies, package managers, and TypeScript settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-2 text-xs">
              {includedConfigs.map((cfg) => (
                <div
                  key={cfg}
                  className="p-2 rounded border bg-muted/20 font-mono text-[11px] text-foreground flex items-center justify-between"
                >
                  <span className="truncate">{cfg}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 ml-1" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deployment & Setup Instructions */}
      <Card className="border shadow-none bg-muted/10">
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Terminal className="w-4 h-4 text-foreground" />
            Quick Setup & Deployment Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3 text-xs">
          <p className="text-muted-foreground">
            Follow these standard steps to run or deploy the application locally or on any cloud server:
          </p>

          <div className="space-y-2 font-mono text-[11px] bg-muted/40 p-3 rounded border">
            <div>
              <span className="text-muted-foreground"># 1. Unzip the downloaded file:</span>
              <div className="text-foreground">unzip TGS_Salon_CRM_SourceCode_*.zip -d tgs-salon</div>
            </div>
            <div>
              <span className="text-muted-foreground"># 2. Enter project folder:</span>
              <div className="text-foreground">cd tgs-salon</div>
            </div>
            <div>
              <span className="text-muted-foreground"># 3. Install packages:</span>
              <div className="text-foreground">pnpm install</div>
            </div>
            <div>
              <span className="text-muted-foreground"># 4. Run local development server:</span>
              <div className="text-foreground">pnpm dev</div>
            </div>
            <div>
              <span className="text-muted-foreground"># 5. Build for production:</span>
              <div className="text-foreground">pnpm build</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
