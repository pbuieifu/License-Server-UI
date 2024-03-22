import { useEffect, useMemo, useState } from "react";
import { Asset, Props_Component_Rendered } from "./Component_Generic";
import { Payload_Result } from "../handler/Handler_Function";
import {
  Data_Preferences_Column,
  Data_Preferences,
} from "./Component_Preferences";
import jsonEqual from "../helper/jsonEqual";

type Directions = "asc" | "desc" | "none";

export type Payload_API_Dashboard = {
  [key: string]: any;
};

interface Data_Column {
  size: string;
  key_column: string;
}

interface Component_Dashboard_Header_Item_Props {
  column: Data_Column;
}

interface Component_Dashboard_Header_Props {
  columns?: Data_Column[];
}

interface Component_Dashboard_Row_Item_Props {
  row: Payload_API_Dashboard;
  column: Data_Column;
}

const Component_Dashboard_Row_Item = ({
  row,
  column,
}: Component_Dashboard_Row_Item_Props) => {
  return (
    <div
      style={{ width: `${column.size}` }}
      data-component="Component_Dashboard_Row_Item"
    >
      {row[column.key_column]}
    </div>
  );
};

interface Component_Dashboard_Row_Props {
  row: Payload_API_Dashboard;
}

export const Component_Dashboard = ({
  data,
  results,
}: Props_Component_Rendered) => {
  const [tableData, setTableData] = useState<Payload_API_Dashboard[]>([]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<Directions>("none");
  const [preferences, setPreferences] = useState<Data_Preferences>();
  const [columnData, setColumnData] = useState<Data_Column[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);

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

  const checkUpdatedPreferences = (result_preferences: Payload_Result) => {
    return (
      result_preferences && !jsonEqual(result_preferences.data, preferences)
    );
  };

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

    let columns: Data_Column[] = [];

    if (checkUpdatedPreferences(result_preferences)) {
      result_preferences.data.dashboard.columns.map(
        (column: Data_Preferences_Column) => {
          if (column.enabled)
            columns.push({ size: "", key_column: column.key_column });
        }
      );

      setPreferences(result_preferences.data);

      setColumnData(
        columns.map((column) => ({
          ...column,
          size: `${100 / columns.length}%`,
        }))
      );
    }

    const result_assets: Payload_Result =
      data.handler_function.extractDataFromResult(
        "environment_answer",
        data.key_call,
        results
      );

    if (result_assets) setAssets(result_assets.data);
  };

  useEffect(() => {
    gatherData();
  }, [results]);

  const gatherAssets = () => {
    if (preferences) {
      let key_array: string[] = [];

      data.json.content.assets.forEach((asset: Asset) =>
        key_array.push(asset.key_asset)
      );

      data.handler_event.publish("environment_call", {
        key_call: data.key_call,
        fallback: [],
        path: ["subscriber_content", "assets", preferences.theme],
        key_environment: key_array,
      });
    }
  };

  useEffect(() => {
    gatherAssets();
  }, [preferences]);

  const Component_Dashboard_Header = ({}: Component_Dashboard_Header_Props) => {
    return (
      <div data-component="Component_Dashboard_Header">
        {columnData &&
          columnData.map((column) => (
            <Component_Dashboard_Header_Item
              key={column.key_column}
              column={column}
            />
          ))}
      </div>
    );
  };

  const Component_Dashboard_Header_Item = ({
    column,
  }: Component_Dashboard_Header_Item_Props) => {
    const sortDirectionImageUrl = useMemo(() => {
      if (sortColumn === column.key_column) {
        switch (sortDirection) {
          case "asc":
            return data.handler_function.extractAssetURLFromList(
              assets,
              "filter_asc"
            );
          case "desc":
            return data.handler_function.extractAssetURLFromList(
              assets,
              "filter_desc"
            );
          default:
            return "";
        }
      }
      return data.handler_function.extractAssetURLFromList(assets, "filter");
    }, [sortColumn, sortDirection, column.key_column, assets]);

    return (
      <div
        style={{ width: `${column.size}` }}
        data-component="Component_Dashboard_Header_Item"
      >
        {column.key_column.charAt(0).toUpperCase() + column.key_column.slice(1)}
        <button
          data-component="Component_Dashboard_Header_Button"
          onClick={() => handleSortChange(column.key_column)}
        >
          {sortDirectionImageUrl && (
            <img src={sortDirectionImageUrl} alt="Sorting Icon" />
          )}
        </button>
      </div>
    );
  };

  const Component_Dashboard_Row = ({ row }: Component_Dashboard_Row_Props) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const toggleExpansion = () => {
      setIsExpanded(!isExpanded);
    };

    return (
      <div data-component="Component_Dashboard_Row_Pseudo" key={row.id}>
        <div
          data-component="Component_Dashboard_Row"
          onClick={toggleExpansion}
          style={{ cursor: "pointer" }}
        >
          {columnData &&
            columnData.map((column) => (
              <Component_Dashboard_Row_Item
                key={row.id + column.key_column}
                row={row}
                column={column}
              />
            ))}
        </div>
        <div
          className={isExpanded ? "expanded" : ""}
          data-component="Component_Dashboard_Row_Panel"
        >
          <div data-component="Component_Dashboard_Row_Panel_Content">
            {columnData &&
              columnData.map((column) => (
                <Component_Dashboard_Row_Item
                  key={row.id + column.key_column}
                  row={row}
                  column={column}
                />
              ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      data-component="Component_Dashboard"
      data-css={data.json.content.css_key}
      onClick={data.handleLifecycle}
    >
      <Component_Dashboard_Header />
      <div data-component="Component_Dashboard_Row_Container">
        {sortedData.map((row) => (
          <Component_Dashboard_Row key={row.id} row={row} />
        ))}
      </div>
    </div>
  );
};
