import { useEffect, useMemo, useState } from "react";
import { Props_Component_Rendered } from "./Component_Generic";
import { Payload_Result } from "../handler/Handler_Function";
import {
  Data_Preferences_Column,
  Data_Preferences,
} from "./Component_Preferences";

type Directions = "asc" | "desc" | "none";

export type Payload_API_Dashboard = {
  [key: string]: any;
};

interface Data_Column {
  size: string;
  key_column: string;
}

interface Component_Dashboard_Header_Button_Props {
  column: Data_Column;
  sort: (column_key: string) => void;
  isSortedColumn: boolean;
  sortDirection: Directions;
}

const Component_Dashboard_Header_Button = ({
  column,
  sort,
  isSortedColumn,
  sortDirection,
}: Component_Dashboard_Header_Button_Props) => {
  return (
    <div
      key={column.key_column}
      style={{ width: `${column.size}` }}
      data-component="Component_Dashboard_Header_Button"
    >
      {column.key_column.charAt(0).toUpperCase() + column.key_column.slice(1)}
      <button onClick={() => sort(column.key_column)}>
        {isSortedColumn ? sortDirection : "none"}
      </button>
    </div>
  );
};

interface Component_Dashboard_Header_Props {
  columns?: Data_Column[];
  sort: (column_key: string) => void;
  sortedColumn: string | null;
  sortDirection: Directions;
}

const Component_Dashboard_Header = ({
  columns,
  sort,
  sortedColumn,
  sortDirection,
}: Component_Dashboard_Header_Props) => {
  return (
    <div data-component="Component_Dashboard_Header">
      {columns &&
        columns.map((column) => (
          <Component_Dashboard_Header_Button
            key={column.key_column}
            column={column}
            sort={sort}
            isSortedColumn={sortedColumn === column.key_column}
            sortDirection={sortDirection}
          />
        ))}
    </div>
  );
};

interface Component_Dashboard_Row_Button_Props {
  row: Payload_API_Dashboard;
  column: Data_Column;
}

const Component_Dashboard_Row_Button = ({
  row,
  column,
}: Component_Dashboard_Row_Button_Props) => {
  return (
    <div
      style={{ width: `${column.size}` }}
      data-component="Component_Dashboard_Row_Button"
    >
      {row[column.key_column]}
    </div>
  );
};

interface Component_Dashboard_Row_Props {
  row: Payload_API_Dashboard;
  columns?: Data_Column[];
}

const Component_Dashboard_Row = ({
  row,
  columns,
}: Component_Dashboard_Row_Props) => {
  return (
    <div key={row.id} data-component="Component_Dashboard_Row">
      {columns &&
        columns.map((column) => (
          <Component_Dashboard_Row_Button
            key={row.id + column.key_column}
            row={row}
            column={column}
          />
        ))}
    </div>
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
  const [preferences, setPreferences] = useState<Data_Preferences>();
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<Directions>("none");
  const [columnData, setColumnData] = useState<Data_Column[]>([]);

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
        "retrieve_answer",
        data.key_call,
        results
      );

    if (result_preferences) {
      setPreferences(result_preferences.data);

      let columns: Data_Column[] = [];

      result_preferences.data.dashboard.columns.map(
        (column: Data_Preferences_Column) => {
          if (column.enabled)
            columns.push({ size: "", key_column: column.key_column });
        }
      );

      setColumnData(
        columns.map((column) => ({
          ...column,
          size: `${100 / columns.length}%`,
        }))
      );
    }
  };

  useEffect(() => {
    gatherData();
  }, [results]);

  return (
    <div
      data-component="Component_Dashboard"
      data-css={data.json.content.css_key}
      onClick={data.handleLifecycle}
    >
      <Component_Dashboard_Header
        columns={columnData}
        sort={handleSortChange}
        sortedColumn={sortColumn}
        sortDirection={sortDirection}
      />
      <div data-component="Component_Dashboard_Row_Container">
        {sortedData.map((row, index) => (
          <Component_Dashboard_Row
            key={row.id + index}
            row={row}
            columns={columnData}
          />
        ))}
      </div>
    </div>
  );
};
