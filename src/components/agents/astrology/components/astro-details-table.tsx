'use client';

import { BhavaDetail, GrahaDetail } from '@/types/astrology';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AstroDetailsTableProps {
  grahaDetails?: GrahaDetail[];
  bhavaDetails?: BhavaDetail[];
}

const AstroDetailsTable: React.FC<AstroDetailsTableProps> = ({
  grahaDetails = [],
  bhavaDetails = [],
}) => {
  return (
    <div className="w-full duration-700 animate-in fade-in slide-in-from-bottom-4">
      <Tabs defaultValue="graha" className="w-full">
        {/* Scrollable Tabs on Mobile */}
        <div className="scrollbar-hide overflow-x-auto pb-1">
          <TabsList className="h-auto w-full min-w-max justify-start gap-px border-none bg-transparent p-0">
            <TabsTrigger
              value="graha"
              className="rounded-t-2xl border-none px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary-500 data-[state=inactive]:bg-primary-500/10 data-[state=active]:text-primary-950 data-[state=inactive]:text-primary-500 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-primary-500/20 md:px-6 md:text-xs"
            >
              Graha Details
            </TabsTrigger>
            <TabsTrigger
              value="bhava"
              className="rounded-t-2xl border-none px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest data-[state=active]:bg-primary-500 data-[state=inactive]:bg-primary-500/10 data-[state=active]:text-primary-950 data-[state=inactive]:text-primary-500 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-primary-500/20 md:px-6 md:text-xs"
            >
              Bhava Details
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="overflow-hidden rounded-2xl border border-primary-500/20 bg-card shadow-2xl md:rounded-tl-none">
          <TabsContent value="graha" className="m-0 border-none outline-none">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <Table className="border-collapse">
                <TableHeader className="bg-primary-900/50 hover:bg-primary-900/50">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-auto border-r border-primary-500/20 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Graha
                    </TableHead>
                    <TableHead className="h-auto border-r border-primary-500/20 px-2 py-3 text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Longitude
                    </TableHead>
                    <TableHead className="h-auto border-r border-primary-500/20 px-2 py-3 text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Nakshatra
                    </TableHead>
                    <TableHead className="h-auto border-r border-primary-500/20 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Nak Lord/Sub
                    </TableHead>
                    <TableHead className="h-auto border-r border-primary-500/20 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Ruler (Bhavas)
                    </TableHead>
                    <TableHead className="h-auto border-r border-primary-500/20 px-2 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Is In (Bhava)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[11px] font-medium text-foreground">
                  {grahaDetails.map((row, idx) => (
                    <TableRow
                      key={idx}
                      className={cn(
                        'border-b border-primary-500/10 hover:bg-primary-500/10',
                        idx % 2 === 0 ? 'bg-transparent' : 'bg-primary-500/5'
                      )}
                    >
                      <TableCell className="border-r border-primary-500/10 px-2 py-2.5 font-bold">
                        {row.graha}
                      </TableCell>
                      <TableCell className="whitespace-nowrap border-r border-primary-500/10 px-2 py-2.5 font-bold text-primary-400">
                        {row.longitude_degree.toFixed(2)}° {row.longitude_rashi}
                      </TableCell>
                      <TableCell className="whitespace-nowrap border-r border-primary-500/10 px-2 py-2.5">
                        {row.nakshatra} (Pada {row.nakshatra_pada})
                      </TableCell>
                      <TableCell className="border-r border-primary-500/10 px-2 py-2.5 text-center text-primary-400">
                        {row.nakshatra_lord} / {row.nakshatra_sublord}
                      </TableCell>
                      <TableCell className="border-r border-primary-500/10 px-2 py-2.5 text-center">
                        {row.rules_bhavas.join(', ') || '-'}
                      </TableCell>
                      <TableCell className="border-r border-primary-500/10 px-2 py-2.5 text-center">
                        {row.current_bhava}
                      </TableCell>
                    </TableRow>
                  ))}
                  {grahaDetails.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-4 text-center">
                        No data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 p-4 md:hidden">
              {grahaDetails.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-primary-500/10 pb-2">
                    <span className="text-sm font-bold text-primary-400">
                      {row.graha}
                    </span>
                    <span className="rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-bold text-primary-300">
                      {row.longitude_degree.toFixed(2)}° {row.longitude_rashi}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                    <div className="col-span-2">
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-primary-500/60">
                        Nakshatra
                      </p>
                      <p className="font-medium text-foreground">
                        {row.nakshatra} (Pada {row.nakshatra_pada})
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-primary-500/60">
                        Lord/Sub
                      </p>
                      <p className="font-medium text-primary-300">
                        {row.nakshatra_lord} / {row.nakshatra_sublord}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-primary-500/60">
                        Ruler / In Bhava
                      </p>
                      <p className="font-medium text-foreground">
                        {row.rules_bhavas.join(', ') || '-'} /{' '}
                        {row.current_bhava}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="bhava" className="m-0 border-none outline-none">
            {/* Desktop Table */}
            <div className="hidden overflow-x-auto md:block">
              <Table className="border-collapse">
                <TableHeader className="bg-primary-900/50 hover:bg-primary-900/50">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-auto border-r border-primary-500/20 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Bhava
                    </TableHead>
                    <TableHead className="h-auto border-r border-primary-500/20 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Residents
                    </TableHead>
                    <TableHead className="h-auto border-r border-primary-500/20 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Owner
                    </TableHead>
                    <TableHead className="h-auto border-r border-primary-500/20 px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-primary-300">
                      Rashi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[11px] font-medium text-foreground">
                  {bhavaDetails.map((row, idx) => (
                    <TableRow
                      key={idx}
                      className={cn(
                        'border-b border-primary-500/10 hover:bg-primary-500/10',
                        idx % 2 === 0 ? 'bg-transparent' : 'bg-primary-500/5'
                      )}
                    >
                      <TableCell className="border-r border-primary-500/10 px-3 py-3 font-bold">
                        {row.bhava}
                      </TableCell>
                      <TableCell className="border-r border-primary-500/10 px-3 py-3 font-bold text-primary-400">
                        {row.residents.join(', ') || '-'}
                      </TableCell>
                      <TableCell className="border-r border-primary-500/10 px-3 py-3 font-bold">
                        {row.owner}
                      </TableCell>
                      <TableCell className="whitespace-nowrap border-r border-primary-500/10 px-3 py-3 font-bold text-primary-400">
                        {row.rashi}
                      </TableCell>
                    </TableRow>
                  ))}
                  {bhavaDetails.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-4 text-center">
                        No data available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 p-4 md:hidden">
              {bhavaDetails.map((row, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-4 shadow-sm"
                >
                  <div className="mb-3 flex items-center justify-between border-b border-primary-500/10 pb-2">
                    <span className="text-sm font-bold text-primary-400">
                      Bhava {row.bhava}
                    </span>
                    <span className="text-[10px] font-bold text-primary-300">
                      {row.rashi}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-[11px]">
                    <div className="col-span-2">
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-primary-500/60">
                        Residents
                      </p>
                      <p className="font-bold text-primary-300">
                        {row.residents.join(', ') || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-tighter text-primary-500/60">
                        Owner
                      </p>
                      <p className="font-bold text-foreground">{row.owner}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AstroDetailsTable;
