// components/common/DataTable.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  Typography,
  InputBase,
  Avatar,
  Chip,
} from "@mui/material";
import { Search } from "@mui/icons-material";

const DataTable = ({
  columns,
  data,
  searchFields = [],
  searchPlaceholder = "Search...",
  rowsPerPageOptions = [5, 10, 25],
  initialRowsPerPage = 5,
  noDataMessage = "No data available",
  paperProps = {},
  tableProps = {},
  headerCellProps = {},
  bodyCellProps = {},
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [searchQuery, setSearchQuery] = useState("");

  // Reset page when data changes significantly
  useEffect(() => {
    setPage(0);
  }, [data?.length]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const filteredData = useMemo(() => {
    if (!searchQuery.trim() || searchFields.length === 0) return data || [];

    return (data || []).filter((row) =>
      searchFields.some((field) => {
        const value = row[field];
        return (
          value &&
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );
      })
    );
  }, [data, searchQuery, searchFields]);

  const displayData = useMemo(() => {
    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredData, page, rowsPerPage]);

  return (
    <div>
      {/* Search Box */}
      {searchFields.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          <Paper
            sx={{
              p: "0px 8px",
              display: "flex",
              alignItems: "center",
              width: 300,
              borderRadius: 1,
              bgcolor: "#f5f5f5",
              boxShadow: "none",
            }}
          >
            <Search
              sx={{
                color: "action.active",
                mr: 1,
                my: 0.5,
                fontSize: "1.2rem",
              }}
            />
            <InputBase
              sx={{ flex: 1, fontSize: "0.875rem" }}
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </Paper>
        </Box>
      )}

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          boxShadow: "none",
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
          ...paperProps,
        }}
      >
        <Table sx={{ minWidth: 650, ...tableProps }}>
          <TableHead sx={{ bgcolor: "#f5f5f5" }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || "left"}
                  sx={{ fontWeight: 600, ...headerCellProps }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {displayData.length > 0 ? (
              displayData.map((row, index) => (
                <TableRow
                  key={row.id || index}
                  sx={{
                    "&:hover": { bgcolor: "#f9f9f9" },
                    borderBottom: "1px solid #e0e0e0",
                  }}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${row.id || index}-${column.id}`}
                      align={column.align || "left"}
                      sx={{ ...bodyCellProps }}
                    >
                      {column.render ? column.render(row) : row[column.id]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  align="center"
                  sx={{ py: 3 }}
                >
                  {noDataMessage}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 1,
          }}
        >
          <TablePagination
            component="div"
            count={filteredData.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={rowsPerPageOptions}
            sx={{
              ".MuiTablePagination-toolbar": {
                paddingLeft: 1,
              },
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                {
                  fontSize: "0.875rem",
                },
              ".MuiTablePagination-select": {
                paddingTop: 0,
                paddingBottom: 0,
              },
            }}
          />
        </Box>
      )}
    </div>
  );
};

// Sub-components for rendering common items in tables
DataTable.Avatar = ({ src, name }) => (
  <Box sx={{ display: "flex", alignItems: "center" }}>
    <Avatar src={src} sx={{ width: 32, height: 32, mr: 2 }}>
      {name?.charAt(0)}
    </Avatar>
    <Typography variant="body2">{name}</Typography>
  </Box>
);

DataTable.StatusChip = ({ label, status }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "denied":
        return "error";
      default:
        return "warning";
    }
  };

  return <Chip label={label} color={getStatusColor(status)} size="small" />;
};

export default DataTable;
