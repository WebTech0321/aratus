import React, { useState, useEffect, FC } from "react";
import {
  Pagination as SHPagination,
  PaginationContent,
  PaginationLink,
  PaginationNext,
  PaginationItem,
  PaginationEllipsis,
  PaginationPrevious,
} from "./ui/pagination";

interface PaginationProps {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({
  page,
  rowsPerPage,
  totalCount,
  onChange,
}) => {
  const [arrPages, setArrPages] = useState<number[]>([]);

  const pages = Math.ceil(totalCount / rowsPerPage);

  const handleChangePage = (idx: number) => {
    idx = idx < 1 ? 1 : idx > pages ? pages : idx;
    if (idx === page) return;
    if (onChange) onChange(idx);
  };

  useEffect(() => {
    if (pages <= 7) {
      setArrPages(Array.from({ length: pages }, (_, i) => i + 1));
    } else {
      const arrNewPages = [];
      arrNewPages.push(1);

      if (page >= pages - 1) {
        arrNewPages.push(2);
        arrNewPages.push(3);
      } else if (page === pages - 2) {
        arrNewPages.push(2);
      }
      if (page > 3) arrNewPages.push(0);

      if (page === pages) {
        arrNewPages.push(pages - 2);
      }

      if (page > 2) arrNewPages.push(page - 1);

      if (page !== 1 && page !== pages) arrNewPages.push(page);

      if (page < pages - 1) arrNewPages.push(page + 1);

      if (page === 1) {
        arrNewPages.push(3);
      }

      if (page < pages - 2) arrNewPages.push(0);

      if (page <= 2) {
        arrNewPages.push(pages - 2);
        arrNewPages.push(pages - 1);
      } else if (page === 3) {
        arrNewPages.push(pages - 1);
      }

      arrNewPages.push(pages);

      setArrPages(arrNewPages);
    }
  }, [page, pages]);

  if (pages <= 1) return null;

  return (
    <SHPagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onClick={() => handleChangePage(page - 1)} />
        </PaginationItem>
        {arrPages.map((val, idx) => {
          if (val === 0) {
            return (
              <PaginationItem key={`pagination-sep-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          return (
            <PaginationItem
              key={`pagination-${val}`}
              onClick={() => handleChangePage(val)}
            >
              <PaginationLink href="#">{val}</PaginationLink>
            </PaginationItem>
          );
        })}
        <PaginationItem>
          <PaginationNext onClick={() => handleChangePage(page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </SHPagination>
  );
};

export default Pagination;
