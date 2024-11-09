import {
  CSSProperties,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useMarketData } from "@/services/coingecko";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Cell,
  CellContext,
  ColumnDef,
  Header,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
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

import { CoinGeckoMarketData, SavedStatus } from "@/lib/types";
import TrendValue from "./TrendValue";
import SparklineChart from "./SparklineChart";
import { formatCurrency, loadFromLocalStorage } from "@/lib/utils";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "./ui/select";
import Pagination from "./Pagination";
import CustomizeButton from "./CustomizeButton";
import { SAVED_VIEWS_KEY } from "@/lib/constants";

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
        <div
          className={
            header.column.getCanSort()
              ? "flex items-center cursor-pointer select-none"
              : ""
          }
          onClick={header.column.getToggleSortingHandler()}
        >
          <span className="text-lg">
            {{
              asc: "▴ ",
              desc: "▾ ",
            }[header.column.getIsSorted() as string] ?? null}
          </span>
          {header.isPlaceholder
            ? null
            : flexRender(header.column.columnDef.header, header.getContext())}
        </div>
        {meta.draggable && (
          <button {...attributes} {...listeners}>
            <div className="flex flex-col gap-0.5">
              <div className="w-3 h-0.5 bg-neutral-500"></div>
              <div className="w-3 h-0.5 bg-neutral-500"></div>
              <div className="w-3 h-0.5 bg-neutral-500"></div>
            </div>
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

const CoinNameCell = memo(
  ({
    name,
    image,
    symbol,
  }: {
    name: string;
    image: string;
    symbol: string;
  }) => (
    <div className="flex items-center">
      <img src={image} alt={name} className="w-6 h-6 me-2" />
      <div className="font-semibold me-1">{name}</div>
      <div className="text-xs text-neutral-500">{symbol.toUpperCase()}</div>
    </div>
  )
);
CoinNameCell.displayName = "CoinNameCell";

const TokenTable = ({ totalTokenCount }: { totalTokenCount: number }) => {
  const [activeTab, setActiveTab] = useState<string>("Default");
  const [savedViews, setSavedViews] = useState<SavedStatus>({});
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(100);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<{
    [key: string]: boolean;
  }>({});

  const { data: marketTableData, isLoading: isTableDataLoading } =
    useMarketData(page, rowsPerPage);

  const renderCoinName = useCallback(
    (info: CellContext<CoinGeckoMarketData, unknown>) => {
      const data = info.row.original;

      return <CoinNameCell {...data} />;
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

  const renderPrice = useCallback(
    (info: CellContext<CoinGeckoMarketData, unknown>) => {
      return info.getValue() === null
        ? "-"
        : formatCurrency(info.getValue() as string, "auto", "$");
    },
    []
  );

  const renderTrendValue = useCallback(
    (info: CellContext<CoinGeckoMarketData, unknown>) => {
      return info.getValue() === null ? (
        "-"
      ) : (
        <TrendValue
          value={info.getValue() as number}
          text={`${(info.getValue() as number).toFixed(1)}%`}
        />
      );
    },
    []
  );

  const columns = useMemo<ColumnDef<CoinGeckoMarketData>[]>(
    () => [
      {
        accessorKey: "name",
        cell: renderCoinName,
        header: "Coin Name",
        id: "name",
        meta: {
          draggable: true,
          align: "left",
        },
        sortDescFirst: false,
        sortingFn: "alphanumeric",
      },
      {
        accessorKey: "current_price",
        cell: renderPrice,
        header: "Price",
        id: "price",
        meta: {
          draggable: true,
          align: "right",
        },
      },
      {
        accessorKey: "price_change_percentage_1h_in_currency",
        header: "1h",
        id: "1h",
        cell: renderTrendValue,
        meta: {
          draggable: true,
          align: "right",
        },
        size: 60,
      },
      {
        accessorKey: "price_change_percentage_24h_in_currency",
        header: "24h",
        id: "24h",
        cell: renderTrendValue,
        meta: {
          draggable: true,
          align: "right",
        },
        size: 60,
      },
      {
        accessorKey: "price_change_percentage_7d_in_currency",
        header: "7d",
        id: "7d",
        cell: renderTrendValue,
        meta: {
          draggable: true,
          align: "right",
        },
        size: 60,
      },
      {
        accessorKey: "market_cap",
        header: "Market Cap",
        id: "market_cap",
        cell: renderPrice,
        meta: {
          draggable: true,
          align: "right",
        },
      },
      {
        cell: renderChart,
        header: "Last 7 days",
        id: "7d-chart",
        size: 135,
        enableSorting: false,
        meta: {
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
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnOrder,
      sorting,
      columnVisibility: columnVisibility,
    },
    sortDescFirst: true,
    enableMultiSort: false,
    onColumnOrderChange: setColumnOrder,
    onSortingChange: setSorting,
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

  const handleUpdateTab = (newState: SavedStatus, name: string) => {
    setActiveTab(name);
    setSavedViews(newState);
  };

  useEffect(() => {
    const savedViews = loadFromLocalStorage<SavedStatus>(SAVED_VIEWS_KEY, {});
    setSavedViews(savedViews);
  }, []);

  useEffect(() => {
    if (activeTab === "Default") {
      setColumnOrder(columns.map((c) => c.id!));
      setColumnVisibility({});
    } else {
      setColumnOrder(savedViews[activeTab] || columns.map((c) => c.id!));
      const visibility: { [key: string]: boolean } = {};
      columns.forEach((column) => {
        if (column.id)
          visibility[column.id] = savedViews[activeTab].includes(column.id);
      });
      setColumnVisibility(visibility);
    }
  }, [activeTab, savedViews, columns]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="Default">Default</TabsTrigger>
            {Object.keys(savedViews).map((key) => (
              <TabsTrigger key={key} value={key}>
                {key}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <CustomizeButton
          activeTab={activeTab === "Default" ? "" : activeTab}
          columns={columns}
          order={columnOrder}
          onUpdate={handleUpdateTab}
        />
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
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {row.getVisibleCells().map((cell) => (
                    <DragAlongCell key={cell.id} cell={cell} />
                  ))}
                </SortableContext>
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
