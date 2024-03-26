import { useEffect, useMemo, useState } from "react";
import { Asset, Props_Component_Rendered } from "./Component_Generic";
import { Payload_Result } from "../handler/Handler_Function";
import {
  Data_Preferences_Column,
  Data_Preferences,
} from "./Component_Preferences";
import jsonEqual from "../helper/jsonEqual";

type Directions = "asc" | "desc" | "none";

export interface Payload_API_Dashboard {
  ClientName: string;
  ProductName: string;
  License: string;
  MaxDeployments: number;
  CurrentDeployments: number;
  Enabled: boolean;
  AgreementAccepted: boolean;
  Expired: boolean;
  InGracePeriod: boolean;
}

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
  row: Data_Row_Displayed;
  column: Data_Column;
}

type Data_Row_Displayed = {
  [key: string]: string | number;
};

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
  row: Data_Row_Displayed;
  handleLifecycle: (input: any) => void;
  panelData: any[];
  columnData: Data_Column[];
}

const Component_Dashboard_Row = ({
  row,
  handleLifecycle,
  panelData,
  columnData,
}: Component_Dashboard_Row_Props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentData, setContentData] = useState<any>();

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    handleLifecycle(row.license_key);
  };

  const panelToContentData = () => {
    setContentData(
      panelData.filter(
        (data_row) => data_row.license_key === row.license_key
      )[0]
    );
  };

  useEffect(() => {
    panelToContentData();
    console.log(panelData);
  }, [panelData]);

  return (
    <div data-component="Component_Dashboard_Row_Pseudo" key={row.license_key}>
      <div
        data-component="Component_Dashboard_Row"
        onClick={toggleExpansion}
        style={{ cursor: "pointer" }}
      >
        {columnData &&
          columnData.map((column) => (
            <Component_Dashboard_Row_Item
              key={row.license_key + column.key_column}
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
          {JSON.stringify(contentData)}
        </div>
      </div>
    </div>
  );
};

export const Component_Dashboard = ({
  data,
  results,
}: Props_Component_Rendered) => {
  const [tableData, setTableData] = useState<Data_Row_Displayed[]>([]);
  const [sortColumn, setSortColumn] = useState<string>("status");
  const [sortDirection, setSortDirection] = useState<Directions>("asc");
  const [preferences, setPreferences] = useState<Data_Preferences>();
  const [columnData, setColumnData] = useState<Data_Column[]>([]);
  const [panelData, setPanelData] = useState<any[]>([]);
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

  const parseLicenses = (data_result: Payload_API_Dashboard[]) => {
    let data_table: Data_Row_Displayed[] = [];

    data_result.forEach((data_row: Payload_API_Dashboard) => {
      let row_display: Data_Row_Displayed = {
        license_key: data_row.License,
        client_name: data_row.ClientName,
        product_name: data_row.ProductName,
        status: data_row.Enabled && !data_row.Expired ? "Good" : "Bad",
        action_required:
          data_row.AgreementAccepted &&
          !(data_row.InGracePeriod || data_row.Expired)
            ? "No"
            : "Yes",
      };

      data_table.push(row_display);
    });

    setTableData(data_table);
  };

  const parseProduct = (data_result: any) =>
    setPanelData((prevItems) => [...prevItems, data_result]);

  const parseAPIResults = (result_api: Payload_Result) => {
    switch (result_api.data.key_api) {
      case "dashboard_licenses":
        parseLicenses(result_api.data.data);
        break;
      case "dashboard_product":
        parseProduct(result_api.data.data);
        break;
      default:
        console.log(result_api);
        break;
    }
  };

  const parsePreferencesResult = (result_preferences: Payload_Result) => {
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
  };

  const parseAssetsResults = (result_assets: Payload_Result) =>
    setAssets(result_assets.data);

  const gatherData = () => {
    const result_api: Payload_Result =
      data.handler_function.extractDataFromResult(
        "api_answer",
        data.key_call,
        results
      );

    if (result_api) parseAPIResults(result_api);

    const result_preferences: Payload_Result =
      data.handler_function.extractDataFromResult(
        "retrieve_answer",
        data.key_call,
        results
      );

    if (result_preferences) parsePreferencesResult(result_preferences);

    const result_assets: Payload_Result =
      data.handler_function.extractDataFromResult(
        "environment_answer",
        data.key_call,
        results
      );

    if (result_assets) parseAssetsResults(result_assets);
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

  return (
    <div
      data-component="Component_Dashboard"
      data-css={data.json.content.css_key}
    >
      <Component_Dashboard_Header />
      <div data-component="Component_Dashboard_Row_Container">
        {sortedData.map((row) => (
          <Component_Dashboard_Row
            key={row.license_key}
            row={row}
            handleLifecycle={data.handleLifecycle}
            panelData={panelData}
            columnData={columnData}
          />
        ))}
      </div>
    </div>
  );
};
