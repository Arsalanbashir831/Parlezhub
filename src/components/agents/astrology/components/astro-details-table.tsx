'use client';

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

const GRAHA_DATA = [
  {
    graha: 'Lagna (Q) 🌸',
    longitude: '26° Mesh 48\' 49"',
    nakshatra: 'Krittika 1',
    lord: 'Surya, Surya',
    ruler: '',
    isIn: '1 Bhava',
    owner: 'Mangal',
    relationship: '',
    dignities: '-',
  },
  {
    graha: 'Surya 🌸',
    longitude: '17° Kumb 22\' 58"',
    nakshatra: 'Shatabhisha 4 🔥',
    lord: 'Rahu, Shukra',
    ruler: '5 Bhava',
    isIn: '11 Bhava',
    owner: 'Shani',
    relationship: "Enemy's House",
    dignities: '-',
  },
  {
    graha: 'Chandra (T)',
    longitude: '01° Simh 24\' 33"',
    nakshatra: 'Magha 1 👑',
    lord: 'Ketu, Shukra',
    ruler: '4 Bhava',
    isIn: '5 Bhava',
    owner: 'Surya',
    relationship: "Friend's House",
    dignities: '-',
  },
  {
    graha: 'Mangal 🔥',
    longitude: '05° Kumb 27\' 42"',
    nakshatra: 'Dhanishtha 4 🥁',
    lord: 'Mangal, Surya',
    ruler: '1, 8 Bhava',
    isIn: '11 Bhava',
    owner: 'Shani',
    relationship: 'Neutral',
    dignities: '-',
  },
  {
    graha: 'Budha 🔄 🔥',
    longitude: '27° Kumb 07\' 36"',
    nakshatra: 'P Bhadrapada 3 ☸️',
    lord: 'Guru, Shukra',
    ruler: '3, 6 Bhava',
    isIn: '11 Bhava',
    owner: 'Shani',
    relationship: 'Neutral',
    dignities: '-',
  },
  {
    graha: 'Guru 🔄',
    longitude: '20° Mitu 59\' 19"',
    nakshatra: 'Punarvasu 1 🏹',
    lord: 'Guru, Guru',
    ruler: '9, 12 Bhava',
    isIn: '3 Bhava',
    owner: 'Budha',
    relationship: "Enemy's House",
    dignities: '-',
  },
  {
    graha: 'Shukra 🌸',
    longitude: '00° Meen 29\' 00"',
    nakshatra: 'P Bhadrapada 4 ☸️',
    lord: 'Guru, Chandra',
    ruler: '2, 7 Bhava',
    isIn: '12 Bhava',
    owner: 'Guru',
    relationship: 'Neutral',
    dignities: 'Exalted',
  },
  {
    graha: 'Shani 🌸',
    longitude: '07° Meen 38\' 18"',
    nakshatra: 'U Bhadrapada 2 🕯️',
    lord: 'Shani, Ketu',
    ruler: '10, 11 Bhava',
    isIn: '12 Bhava',
    owner: 'Guru',
    relationship: 'Neutral',
    dignities: '-',
  },
  {
    graha: 'Rahu 🔄',
    longitude: '14° Kumb 45\' 06"',
    nakshatra: 'Shatabhisha 3 🔥',
    lord: 'Rahu, Ketu',
    ruler: '11 Bhava',
    isIn: '11 Bhava',
    owner: 'Shani',
    relationship: "Friend's House",
    dignities: '-',
  },
  {
    graha: 'Ketu (T) 🔄',
    longitude: '14° Simh 45\' 06"',
    nakshatra: 'P Phalguni 1 🎭',
    lord: 'Shukra, Shukra',
    ruler: '8 Bhava',
    isIn: '5 Bhava',
    owner: 'Surya',
    relationship: "Enemy's House",
    dignities: '-',
  },
];

const BHAVA_DATA = [
  {
    bhava: '1 (Q)',
    residents: '',
    owner: 'Mangal',
    rashi: '♈︎ Mesha',
    qualities: 'Mas, Movable',
    aspected: '',
  },
  {
    bhava: '2',
    residents: '',
    owner: 'Shukra',
    rashi: '♉︎ Vrishabha',
    qualities: 'Fem, Fixed',
    aspected: 'Mangal, Shani',
  },
  {
    bhava: '3',
    residents: 'Guru',
    owner: 'Budha',
    rashi: '♊︎ Mithuna 🔥',
    qualities: 'Mas, Common',
    aspected: '',
  },
  {
    bhava: '4 (Q)',
    residents: '',
    owner: 'Chandra',
    rashi: '♋︎ Karka',
    qualities: 'Fem, Movable',
    aspected: '',
  },
  {
    bhava: '5 (T)',
    residents: 'Chandra, Ketu',
    owner: 'Surya',
    rashi: '♌︎ Simha',
    qualities: 'Mas, Fixed',
    aspected: 'Surya, Mangal, Budha',
  },
  {
    bhava: '6',
    residents: '',
    owner: 'Budha',
    rashi: '♍︎ Kanya 🔥',
    qualities: 'Fem, Common',
    aspected: 'Mangal, Shukra, Shani',
  },
  {
    bhava: '7 (Q)',
    residents: '',
    owner: 'Shukra',
    rashi: '♎︎ Tula',
    qualities: 'Mas, Movable',
    aspected: 'Guru',
  },
  {
    bhava: '8',
    residents: '',
    owner: 'Mangal',
    rashi: '♏︎ Vrishchika',
    qualities: 'Fem, Fixed',
    aspected: '',
  },
  {
    bhava: '9 (T)',
    residents: '',
    owner: 'Guru',
    rashi: '♐︎ Dhanu 🔥',
    qualities: 'Mas, Common',
    aspected: 'Guru, Shani',
  },
  {
    bhava: '10 (Q)',
    residents: '',
    owner: 'Shani',
    rashi: '♑︎ Makara',
    qualities: 'Fem, Movable',
    aspected: '',
  },
  {
    bhava: '11',
    residents: 'Surya, Mangal, Budha, Rahu',
    owner: 'Shani',
    rashi: '♒︎ Kumbha',
    qualities: 'Mas, Fixed',
    aspected: 'Chandra, Guru',
  },
  {
    bhava: '12',
    residents: 'Shukra, Shani',
    owner: 'Guru',
    rashi: '♓︎ Meena 🔥',
    qualities: 'Fem, Common',
    aspected: '',
  },
];

const AstroDetailsTable = () => {
  return (
    <div className="w-full duration-700 animate-in fade-in slide-in-from-bottom-4">
      <Tabs defaultValue="graha" className="w-full">
        {/* Simplified TabsList to match the reference look while being shadcn structure */}
        <TabsList className="h-auto justify-start gap-px border-none bg-transparent p-0">
          <TabsTrigger
            value="graha"
            className="rounded-t-2xl border-none px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-[#8b4513] data-[state=inactive]:bg-[#d2691e]/80 data-[state=active]:text-[#f4e4bc] data-[state=inactive]:text-[#f4e4bc]/80 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-[#8b4513]/90"
          >
            Graha Details
          </TabsTrigger>
          <TabsTrigger
            value="bhava"
            className="rounded-t-2xl border-none px-6 py-2.5 text-xs font-bold uppercase tracking-widest data-[state=active]:bg-[#8b4513] data-[state=inactive]:bg-[#d2691e]/80 data-[state=active]:text-[#f4e4bc] data-[state=inactive]:text-[#f4e4bc]/80 data-[state=active]:shadow-lg data-[state=inactive]:hover:bg-[#8b4513]/90"
          >
            Bhava Details
          </TabsTrigger>
        </TabsList>

        <div className="overflow-hidden rounded-2xl rounded-tl-none border border-[#8b4513]/30 bg-[#f4e4bc] shadow-2xl">
          <TabsContent value="graha" className="m-0 border-none outline-none">
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader className="bg-[#6b3e2e] hover:bg-[#6b3e2e]">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Graha
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Longitude
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-4 py-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Nakshatra
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Nakshatra Lord/Sub Lord
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Ruler of
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Is In
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      B. Owner
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Relationship
                    </TableHead>
                    <TableHead className="h-auto px-4 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Dignities
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[11px] font-medium text-[#5d2e17]">
                  {GRAHA_DATA.map((row, idx) => (
                    <TableRow
                      key={idx}
                      className={cn(
                        'border-b border-[#8b4513]/10 hover:bg-[#e6cc8a]/40',
                        idx % 2 === 0 ? 'bg-[#f4e4bc]' : 'bg-[#f1dab0]'
                      )}
                    >
                      <TableCell className="border-r border-[#8b4513]/10 px-4 py-2.5 font-bold">
                        {row.graha}
                      </TableCell>
                      <TableCell className="whitespace-nowrap border-r border-[#8b4513]/10 px-4 py-2.5 font-bold text-[#d2691e]">
                        {row.longitude}
                      </TableCell>
                      <TableCell className="whitespace-nowrap border-r border-[#8b4513]/10 px-4 py-2.5">
                        {row.nakshatra}
                      </TableCell>
                      <TableCell className="border-r border-[#8b4513]/10 px-4 py-2.5 text-center text-[#d2691e]">
                        {row.lord}
                      </TableCell>
                      <TableCell className="border-r border-[#8b4513]/10 px-4 py-2.5 text-center">
                        {row.ruler}
                      </TableCell>
                      <TableCell className="border-r border-[#8b4513]/10 px-4 py-2.5 text-center">
                        {row.isIn}
                      </TableCell>
                      <TableCell className="border-r border-[#8b4513]/10 px-4 py-2.5 text-center font-bold">
                        {row.owner}
                      </TableCell>
                      <TableCell className="border-r border-[#8b4513]/10 px-4 py-2.5 text-center">
                        {row.relationship}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-center">
                        {row.dignities}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="bhava" className="m-0 border-none outline-none">
            <div className="overflow-x-auto">
              <Table className="border-collapse">
                <TableHeader className="bg-[#6b3e2e] hover:bg-[#6b3e2e]">
                  <TableRow className="border-none hover:bg-transparent">
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Bhava
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Residents
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Owner
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Rashi
                    </TableHead>
                    <TableHead className="h-auto border-r border-[#8b4513]/20 px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Qualities
                    </TableHead>
                    <TableHead className="h-auto px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-[#f4e4bc]">
                      Aspected By
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="text-[11px] font-medium text-[#5d2e17]">
                  {BHAVA_DATA.map((row, idx) => (
                    <TableRow
                      key={idx}
                      className={cn(
                        'border-b border-[#8b4513]/10 hover:bg-[#e6cc8a]/40',
                        idx % 2 === 0 ? 'bg-[#f4e4bc]' : 'bg-[#f1dab0]'
                      )}
                    >
                      <TableCell className="border-r border-[#8b4513]/10 px-6 py-3 font-bold">
                        {row.bhava}
                      </TableCell>
                      <TableCell className="border-r border-[#8b4513]/10 px-6 py-3 font-bold text-[#d2691e]">
                        {row.residents}
                      </TableCell>
                      <TableCell className="border-r border-[#8b4513]/10 px-6 py-3 font-bold">
                        {row.owner}
                      </TableCell>
                      <TableCell className="whitespace-nowrap border-r border-[#8b4513]/10 px-6 py-3 font-bold text-[#d2691e]">
                        {row.rashi}
                      </TableCell>
                      <TableCell className="border-r border-[#8b4513]/10 px-6 py-3">
                        {row.qualities}
                      </TableCell>
                      <TableCell className="px-6 py-3 font-bold text-[#d2691e]">
                        {row.aspected}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AstroDetailsTable;
