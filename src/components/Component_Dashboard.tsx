import { useEffect, useMemo, useState } from "react";
import { Props_Component_Rendered } from "./Component_Generic";
import { Payload_Result } from "../handler/Handler_Function";

type Directions = "asc" | "desc" | "none";

type Preferences_Column = {
  key_column: string;
  enabled: boolean;
};

const user_preferences = {
  columns: [
    { key_column: "client", enabled: true },
    { key_column: "product", enabled: true },
    { key_column: "product_version", enabled: true },
    { key_column: "module", enabled: true },
    { key_column: "component", enabled: true },
    { key_column: "status", enabled: true },
    { key_column: "time_left", enabled: true },
    { key_column: "action_required", enabled: true },
  ],
};

export type Payload_API_Dashboard = {
  [key: string]: string;
};

interface Component_Header_Button_Props {
  column: Preferences_Column;
  sort: (column_key: string) => void;
  isSortedColumn: boolean;
  sortDirection: Directions;
}

const Component_Header_Button = ({
  column,
  sort,
  isSortedColumn,
  sortDirection,
}: Component_Header_Button_Props) => {
  return (
    <th key={column.key_column}>
      {column.key_column.charAt(0).toUpperCase() + column.key_column.slice(1)}
      <button onClick={() => sort(column.key_column)}>
        {isSortedColumn ? sortDirection : "none"}
      </button>
    </th>
  );
};

interface Component_Header_Props {
  columns: Preferences_Column[];
  sort: (column_key: string) => void;
  sortedColumn: string | null;
  sortDirection: Directions;
}

const Component_Header = ({
  columns,
  sort,
  sortedColumn,
  sortDirection,
}: Component_Header_Props) => {
  return (
    <thead>
      <tr>
        {columns.map((column) => (
          <Component_Header_Button
            key={column.key_column}
            column={column}
            sort={sort}
            isSortedColumn={sortedColumn === column.key_column}
            sortDirection={sortDirection}
          />
        ))}
      </tr>
    </thead>
  );
};

interface Component_Row_Button_Props {
  row: Payload_API_Dashboard;
  column: Preferences_Column;
}

const Component_Row_Button = ({ row, column }: Component_Row_Button_Props) => {
  return <td key={`${row.id}-${column}`}>{row[column.key_column]}</td>;
};

interface Component_Row_Props {
  row: Payload_API_Dashboard;
  columns: Preferences_Column[];
}

const Component_Row = ({ row, columns }: Component_Row_Props) => {
  return (
    <tr key={row.id}>
      {columns.map((column) => (
        <Component_Row_Button
          key={row.id + column.key_column}
          row={row}
          column={column}
        />
      ))}
    </tr>
  );
};

//on load get data from api
//generate column buttons based on preference data
//generate rows based on preference + api data

export const Component_Dashboard = ({
  data,
  results,
}: Props_Component_Rendered) => {
  const [tableData, setTableData] = useState<Payload_API_Dashboard[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<Directions>("none");

  const handleSortChange = (key_column: string) => {
    let newDirection: Directions = "none";
    if (sortColumn === key_column) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      newDirection = "asc";
    }

    setSortColumn(key_column);
    setSortDirection(newDirection);
  };

  const sortedData = useMemo(() => {
    if (!sortColumn) return tableData;
    return [...tableData].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn])
        return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn])
        return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [tableData, sortColumn, sortDirection]);

  const gatherData = () => {
    const result_api: Payload_Result =
      data.handler_function.extractDataFromResult(
        "api_answer",
        data.key_call,
        results
      );

    if (result_api) setTableData(result_api.data);

    const result_preferences: Payload_Result =
      data.handler_function.extractDataFromResult(
        "key",
        data.key_call,
        results
      );
  };

  useEffect(() => {
    gatherData();
  }, [results]);

  return (
    <table
      data-component="Component_Template"
      data-css={data.json.content.css_key}
      onClick={data.handleClick}
    >
      <Component_Header
        columns={user_preferences.columns}
        sort={handleSortChange}
        sortedColumn={sortColumn}
        sortDirection={sortDirection}
      />
      <tbody>
        {sortedData.map((row, index) => (
          <Component_Row
            key={row.id + index}
            row={row}
            columns={user_preferences.columns}
          />
        ))}
      </tbody>
    </table>
  );
};
