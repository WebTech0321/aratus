import { CSSProperties, memo, useCallback, useMemo, useState } from "react";
import {
  MarketDataOrderBy,
  useGlobalData,
  useMarketData,
} from "@/services/coingecko";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";
import {
  Cell,
  CellContext,
  ColumnDef,
  Header,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { CSS } from "@dnd-kit/utilities";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { CoinGeckoMarketData } from "@/lib/types";
import TrendValue from "./TrendValue";
import SparklineChart from "./SparklineChart";
import { formatCurrency } from "@/lib/utils";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "./ui/select";
import Pagination from "./Pagination";

const fallbackData: CoinGeckoMarketData[] = [];

const DraggableTableHeader = ({
  header,
}: {
  header: Header<CoinGeckoMarketData, unknown>;
}) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  const meta = header.column.columnDef.meta as any;

  return (
    <th
      className="p-2.5 space-x-1 text-left text-xs font-medium"
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={style}
    >
      <div
        className={`flex items-center ${
          meta.align === "left" ? "" : "justify-end"
        } gap-1`}
      >
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        {meta.draggable && (
          <button {...attributes} {...listeners}>
            🟰
          </button>
        )}
      </div>
    </th>
  );
};

const DragAlongCell = ({
  cell,
}: {
  cell: Cell<CoinGeckoMarketData, unknown>;
}) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const meta = cell.column.columnDef.meta as any;

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <td style={style} ref={setNodeRef} className="p-2.5 text-sm">
      <div
        className={`flex align-center ${
          meta.align === "left" ? "" : "justify-end"
        }`}
      >
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    </td>
  );
};

const TokenTable = ({ totalTokenCount }: { totalTokenCount: number }) => {
  const [activeTab, setActiveTab] =
    useState<MarketDataOrderBy>("market_cap_desc");
  const [tabs, setTabs] = useState<MarketDataOrderBy>("market_cap_desc");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);

  const {
    data: marketTableData,
    isLoading: isTableDataLoading,
    error: tableDataError,
  } = useMarketData(page, rowsPerPage);

  const renderCoinName = useCallback(
    (info: CellContext<CoinGeckoMarketData, unknown>) => {
      const data = info.row.original;

      return (
        <div className="flex items-center">
          <img src={data.image} alt={data.name} className="w-6 h-6 me-2" />
          <div className="font-semibold me-1">{data.name}</div>
          <div className="text-xs text-neutral-500">
            {data.symbol.toUpperCase()}
          </div>
        </div>
      );
    },
    []
  );

  const renderChart = useCallback(
    (info: CellContext<CoinGeckoMarketData, unknown>) => {
      const data = info.row.original;
      return <SparklineChart data={data.sparkline_in_7d.price} />;
    },
    []
  );

  const columns = useMemo<ColumnDef<CoinGeckoMarketData>[]>(
    () => [
      {
        accessorKey: "name",
        cell: renderCoinName,
        header: () => <span>Coin Name</span>,
        id: "name",
        meta: {
          sortable: true,
          draggable: true,
          align: "left",
        },
      },
      {
        accessorKey: "current_price",
        cell: (info) =>
          info.getValue() === null
            ? "-"
            : formatCurrency(info.getValue() as string, "auto", "$"),
        header: () => <div className="text-right">Price</div>,
        id: "price",
        meta: {
          sortable: true,
          draggable: true,
          align: "right",
        },
      },
      {
        accessorKey: "price_change_percentage_1h_in_currency",
        header: () => <span>1h</span>,
        id: "1h",
        cell: (info) =>
          info.getValue() === null ? (
            "-"
          ) : (
            <TrendValue
              value={info.getValue() as number}
              text={`${(info.getValue() as number).toFixed(1)}%`}
            />
          ),
        meta: {
          sortable: true,
          draggable: true,
          align: "right",
        },
        size: 60,
      },
      {
        accessorKey: "price_change_percentage_24h_in_currency",
        header: () => <span>24h</span>,
        id: "24h",
        cell: (info) =>
          info.getValue() === null ? (
            "-"
          ) : (
            <TrendValue
              value={info.getValue() as number}
              text={`${(info.getValue() as number).toFixed(1)}%`}
            />
          ),
        meta: {
          sortable: true,
          draggable: true,
          align: "right",
        },
        size: 60,
      },
      {
        accessorKey: "price_change_percentage_7d_in_currency",
        header: () => <span>7d</span>,
        id: "7d",
        cell: (info) =>
          info.getValue() === null ? (
            "-"
          ) : (
            <TrendValue
              value={info.getValue() as number}
              text={`${(info.getValue() as number).toFixed(1)}%`}
            />
          ),
        meta: {
          sortable: true,
          draggable: true,
          align: "right",
        },
        size: 60,
      },
      {
        accessorKey: "market_cap",
        header: () => <span>Market Cap</span>,
        id: "market_cap",
        cell: (info) =>
          info.getValue() === null
            ? "-"
            : formatCurrency(info.getValue() as string, "auto", "$"),
        meta: {
          sortable: true,
          draggable: true,
          align: "right",
        },
      },
      {
        cell: renderChart,
        header: () => "Last 7 days",
        id: "7d-chart",
        size: 135,
        meta: {
          sortable: false,
          draggable: false,
          align: "right",
        },
      },
    ],
    []
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  const table = useReactTable({
    data: marketTableData ?? fallbackData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder,
      columnVisibility: {},
    },
    onColumnOrderChange: setColumnOrder,
  });

  // reorder columns after drag & drop
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Tabs defaultValue="market_cap_desc">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
        </Tabs>
        <Button variant="secondary">
          <FontAwesomeIcon icon={faMagicWandSparkles} />
          Customize
        </Button>
      </div>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <table className="w-full border-y border-neutral-200">
          <thead className="border-b border-neutral-200">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {headerGroup.headers.map((header) => (
                    <DraggableTableHeader key={header.id} header={header} />
                  ))}
                </SortableContext>
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {isTableDataLoading && (
              <tr>
                <td colSpan={table.getHeaderGroups()[0].headers.length}>
                  <div className="text-center">Loading...</div>
                </td>
              </tr>
            )}
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-neutral-50">
                {row.getVisibleCells().map((cell) => (
                  <SortableContext
                    key={cell.id}
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    <DragAlongCell key={cell.id} cell={cell} />
                  </SortableContext>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </DndContext>

      <div className="flex justify-between">
        <div className="text-xs text-neutral-500">
          Showing {(page - 1) * rowsPerPage + 1} to{" "}
          {(page - 1) * rowsPerPage +
            Math.min(rowsPerPage, marketTableData?.length || 0)}{" "}
          of {totalTokenCount} results
        </div>
        <Pagination
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalTokenCount}
          onChange={(page) => setPage(page)}
        />
        <div className="flex items-center gap-1">
          <div className="text-xs text-neutral-500">Rows</div>
          <Select
            value={rowsPerPage.toString()}
            onValueChange={(value) => setRowsPerPage(parseInt(value))}
          >
            <SelectTrigger className="w-[80px]">
              <SelectValue placeholder="Select a rows" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
              <SelectItem value="300">300</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default memo(TokenTable);