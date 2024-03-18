import { useEffect, useMemo, useState } from "react";
import { Props_Component_Generic } from "./Component_Generic";
import Handler_Function, {
  Payload_Function,
  Payload_Result,
} from "../handler/Handler_Function";
import generateUniqueHash from "../helper/generateUniqueHash";

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
  handler_event,
}: Props_Component_Generic) => {
  const key_call = `${data.key_component}${generateUniqueHash()}`;
  const handler_function = new Handler_Function(handler_event, data);
  const [results, setResults] = useState<Payload_Result[]>([]);
  const [cleanUpFunctions, setCleanUpFunctions] = useState<Payload_Function[]>(
    []
  );
  const [onClick, setOnClick] = useState<Payload_Function[]>([]);
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

  const handleClick = () => {
    onClick.forEach((func) =>
      func({
        handler_event: handler_event,
        key_call: func({
          handler_event: handler_event,
          key_call: key_call,
        }),
      })
    );
  };

  const initializeComponent = async () => {
    handler_function.generateFunctions("mount", {
      handler_event: handler_event,
      key_call: key_call,
      setResults: setResults,
    });

    setCleanUpFunctions(
      handler_function.generateFunctions("unmount", {
        handler_event: handler_event,
        key_call: key_call,
        setResults: setResults,
      })
    );

    setOnClick(handler_function.generateFunctions("on_click"));
  };

  const cleanUp = () => {
    cleanUpFunctions.forEach((func: Payload_Function) => func());
  };

  useEffect(() => {
    initializeComponent();

    return () => {
      cleanUp();
    };
  }, []);

  const gatherData = () => {
    const result_api: Payload_Result = handler_function.extractDataFromResult(
      "api_answer",
      results
    );

    const result_preferences: Payload_Result =
      handler_function.extractDataFromResult("key", results);
  };

  useEffect(() => {
    gatherData();
    console.log(results as any);
  }, [results]);

  return (
    <table
      data-component="Component_Template"
      data-css={data.content.css_key}
      onClick={handleClick}
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
