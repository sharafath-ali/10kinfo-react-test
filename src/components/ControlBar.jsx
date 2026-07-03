/**
 * ControlBar.jsx — Search, Category filter, Inflation Alert toggle
 */
import { memo } from 'react';
import { Search, SlidersHorizontal, Zap } from 'lucide-react';
import { Input }  from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge }  from '@/components/ui/badge';

const CATEGORIES = ['All', 'Inflation', 'Employment', 'GDP', 'Rates'];

function ControlBar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  inflationAlertOn,
  onInflationAlertToggle,
  resultCount,
  totalCount,
}) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm px-5 py-4 mb-5 flex items-center flex-wrap gap-4">

      {/* Search by Source */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          id="source-search"
          placeholder="Search source… FED, BLS, BEA"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
          aria-label="Search by source (case-insensitive partial match)"
          autoComplete="off"
        />
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-border" />

      {/* Category Filter */}
      <div className="flex items-center gap-2 min-w-[180px]">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
        <label htmlFor="category-filter" className="text-xs font-semibold text-muted-foreground whitespace-nowrap shrink-0">
          Category
        </label>
        <Select
          value={categoryFilter}
          onChange={onCategoryChange}
          className="w-full"
          id="category-filter"
          aria-label="Filter by category"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </Select>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-8 bg-border" />

      {/* Inflation Alert Toggle */}
      <div className="flex items-center gap-3">
        <Zap className={`w-4 h-4 ${inflationAlertOn ? 'text-red-500' : 'text-muted-foreground'}`} />
        <label
          htmlFor="inflation-switch"
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <Switch
            id="inflation-switch"
            checked={inflationAlertOn}
            onCheckedChange={onInflationAlertToggle}
            aria-label="Highlight inflation entries with more than 5% change"
          />
          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
            Inflation &gt; 5%
          </span>
        </label>
        {inflationAlertOn && (
          <Badge variant="destructive" className="animate-fade-in text-[10px] font-bold px-2">
            ACTIVE
          </Badge>
        )}
      </div>

      {/* Result count — pushed to right */}
      <div className="ml-auto text-xs text-muted-foreground whitespace-nowrap">
        Showing <span className="font-semibold text-blue-600">{resultCount}</span> of {totalCount}
      </div>
    </div>
  );
}

export default memo(ControlBar);
