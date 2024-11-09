import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "./ui/dialog";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagicWandSparkles } from "@fortawesome/free-solid-svg-icons";
import { Checkbox } from "./ui/checkbox";
import { ColumnDef } from "@tanstack/react-table";
import { CoinGeckoMarketData, SavedStatus } from "@/lib/types";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "./ui/input";
import { loadFromLocalStorage, saveToLocalStorage } from "@/lib/utils";
import { SAVED_VIEWS_KEY } from "@/lib/constants";

const CustomizeButton = ({
  activeTab,
  columns,
  order,
  onUpdate,
}: {
  activeTab: string;
  columns: ColumnDef<CoinGeckoMarketData>[];
  order: string[];
  onUpdate: (v: SavedStatus, name: string) => void;
}) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [columnVisibility, setColumnVisibility] = useState<{
    [key: string]: boolean;
  }>({});

  const [name, setName] = useState(activeTab);

  useEffect(() => {
    const visibility: { [key: string]: boolean } = {};
    columns.forEach((column) => {
      if (column.id) visibility[column.id] = order.includes(column.id);
    });
    setColumnVisibility(visibility);
  }, [columns, order]);

  useEffect(() => {
    setName(activeTab);
  }, [activeTab]);

  const sortedColumns = useMemo(
    () =>
      [...columns].sort((a, b) => {
        if (a.id && b.id) {
          const aIndex = order.indexOf(a.id);
          const bIndex = order.indexOf(b.id);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        }
        return 0;
      }),
    [columns, order]
  );

  const handleSave = () => {
    const newOrder = sortedColumns
      .filter((column) => column.id && columnVisibility[column.id])
      .map((column) => column.id!);
    const savedViews = loadFromLocalStorage<SavedStatus>(SAVED_VIEWS_KEY, {});

    savedViews[name] = newOrder;
    saveToLocalStorage(SAVED_VIEWS_KEY, savedViews);
    onUpdate(savedViews, name);
    if (closeRef.current) {
      closeRef.current.click();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">
          <FontAwesomeIcon icon={faMagicWandSparkles} />
          Customize
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Customize Columns</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <div className="flex flex-col gap-2 mb-4">
            <div className="text-md font-semibold">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-4">
            <div className="text-md font-semibold">Columns</div>
            {sortedColumns.map(
              (column) =>
                column.id && (
                  <div className="flex items-center gap-2" key={column.id}>
                    <Checkbox
                      checked={columnVisibility[column.id]}
                      onCheckedChange={(v) => {
                        setColumnVisibility({
                          ...columnVisibility,
                          [column.id as string]: v as boolean,
                        });
                      }}
                    />
                    <div className="text-sm font-semibold">
                      {(column as any).header}
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={name.length === 0}
          >
            Save changes
          </Button>
          <DialogClose ref={closeRef} className="hidden" />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CustomizeButton;
