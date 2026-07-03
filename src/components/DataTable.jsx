/**
 * DataTable.jsx — main feed table with shadcn Table primitives
 */
import { memo } from 'react';
import { Table, TableHeader, TableBody, TableHead } from '@/components/ui/table';
import DataRow from '@/components/DataRow';
import { SearchX, BarChart3 } from 'lucide-react';

const COLUMNS = [
  { key: 'idx',     label: '#' },
  { key: 'source',  label: 'Source' },
  { key: 'cat',     label: 'Category' },
  { key: 'value',   label: 'Raw Value' },
  { key: 'numeric', label: 'Numeric' },
  { key: 'date',    label: 'Timestamp' },
  { key: 'delta',   label: 'Δ Change' },
  { key: 'signal',  label: 'Signal' },
];

function DataTable({ filteredData, inflationAlertOn }) {
  return (
    <div className="bg-white rounded-xl border border-border shadow-sm overflow-hidden">

      {/* Table title bar */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-slate-50">
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-sm font-semibold text-slate-800">
            Federal Reserve Economic Feed
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          <BarChart3 className="inline w-3.5 h-3.5 mr-1 opacity-60" />
          {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Scrollable table area */}
      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 420px)', minHeight: '300px' }}>
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <SearchX className="w-10 h-10 opacity-30" />
            <span className="text-base font-medium text-slate-500">No entries match your filter</span>
            <span className="text-sm">Try adjusting the source search or category</span>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <tr>
                {COLUMNS.map(({ key, label }) => (
                  <TableHead key={key}>{label}</TableHead>
                ))}
              </tr>
            </TableHeader>
            <TableBody>
              {filteredData.map((entry, index) => (
                <DataRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  inflationAlertOn={inflationAlertOn}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}

export default memo(DataTable);
