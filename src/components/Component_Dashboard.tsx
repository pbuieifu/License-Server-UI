import { useEffect, useMemo, useState } from "react";
import {
  Asset,
  Payload_Lifecycle_Function_Input,
  Props_Component_Rendered,
} from "./Component_Generic";
import { Payload_Result } from "../handler/Handler_Function";
import {
  Data_Preferences_Column,
  Data_Preferences,
} from "./Component_Preferences";
import jsonEqual from "../helper/jsonEqual";

export type Directions = "asc" | "desc" | "none";

export interface Payload_API_Dashboard {
  ClientName: string;
  ProductName: string;
  ProductVersion: string;
  LicenseID: string;
  Enabled: boolean;
  AgreementAccepted: boolean;
  ExpirationDate: number;
  GracePeriod: number;
}

interface Data_Column extends Data_Preferences_Column {
  size: string;
}

interface Props_Component_Dashboard_Header_Item {
  column: Data_Column;
}

const Component_Dashboard_Header_Item = ({
  column,
}: Props_Component_Dashboard_Header_Item) => {
  return (
    <>
      {column.key_column.charAt(0).toUpperCase() + column.key_column.slice(1)}
    </>
  );
};

interface Props_Component_Dashboard_Header {
  columnData: Data_Column[];
  onColumnOrderChange: (newColumnData: Data_Column[]) => void;
}

const Component_Dashboard_Header = ({
  columnData,
  onColumnOrderChange,
}: Props_Component_Dashboard_Header) => {
  const handleDragStart =
    (startIndex: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("startIndex", startIndex.toString());
    };

  const handleDrop =
    (dropIndex: number) => (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const startIndex = parseInt(event.dataTransfer.getData("startIndex"), 10);

      if (startIndex === dropIndex || isNaN(startIndex)) return;

      let newColumnData = JSON.parse(JSON.stringify(sortedColumnData));

      const temp = newColumnData[startIndex].row_order;
      newColumnData[startIndex].row_order = newColumnData[dropIndex].row_order;
      newColumnData[dropIndex].row_order = temp;

      let rowOrderMap = newColumnData.reduce(
        (acc: { [x: string]: any }, current: Data_Column) => {
          acc[current.key_column] = current.row_order;
          return acc;
        },
        {}
      );

      let updatedSortedColumnData = columnData.map((column) => {
        if (rowOrderMap[column.key_column] !== undefined) {
          return { ...column, row_order: rowOrderMap[column.key_column] };
        }
        return column;
      });

      onColumnOrderChange(updatedSortedColumnData);
    };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const sortedColumnData = useMemo(() => {
    return [...columnData].sort((a, b) => a.row_order - b.row_order);
  }, [columnData]);

  return (
    <div data-component="Component_Dashboard_Header">
      {sortedColumnData.map((column, index) => (
        <div
          key={column.key_column}
          draggable
          onDragStart={handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={handleDrop(index)}
          style={{ cursor: "grab", width: `${column.size}` }}
          data-component="Component_Dashboard_Header_Item"
        >
          <Component_Dashboard_Header_Item column={column} />
        </div>
      ))}
    </div>
  );
};

interface Props_Component_Dashboard_Row_Item {
  row: Data_Row_Displayed;
  column: Data_Column;
}

type Data_Row_Displayed = {
  [key: string]: string | number;
};

const Component_Dashboard_Row_Item = ({
  row,
  column,
}: Props_Component_Dashboard_Row_Item) => {
  return (
    <div
      style={{ width: `${column.size}` }}
      data-component="Component_Dashboard_Row_Item"
    >
      {row[column.key_column]}
    </div>
  );
};

interface Props_Component_Dashboard_Row {
  row: Data_Row_Displayed;
  handleLifecycle: (data: Payload_Lifecycle_Function_Input) => void;
  panelData: any[];
  columnData: Data_Column[];
}

const Component_Dashboard_Row = ({
  row,
  handleLifecycle,
  panelData,
  columnData,
}: Props_Component_Dashboard_Row) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentData, setContentData] = useState<any>();

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
    handleLifecycle({
      key_function: "function.dashboard.publish_api_product",
      input: row.license_id,
    });
  };

  const panelToContentData = () => {
    setContentData(
      panelData.filter((data_row) => data_row.license_id === row.license_id)[0]
    );
  };

  useEffect(() => {
    panelToContentData();
  }, [panelData]);

  const sortedColumnData = useMemo(
    () => [...columnData].sort((a, b) => a.row_order - b.row_order),
    [columnData]
  );

  return (
    <div
      data-component="Component_Dashboard_Row_Pseudo"
      data-level={row.status}
      key={row.license_id}
    >
      <div data-component="Component_Dashboard_Row" onClick={toggleExpansion}>
        {sortedColumnData.map((column) => (
          <Component_Dashboard_Row_Item
            key={row.license_id + column.key_column}
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

interface Props_Component_Sort_Modal {
  columnData: Data_Column[];
  preferences: Data_Preferences | undefined;
  onSave: (criteria: Data_Preferences_Column[]) => void;
}

const Component_Sort_Modal = ({
  columnData,
  preferences,
  onSave,
}: Props_Component_Sort_Modal) => {
  const [localSortCriteria, setLocalSortCriteria] = useState<
    Data_Preferences_Column[]
  >([]);

  const handleDragStart = (
    e: { dataTransfer: { setData: (arg0: string, arg1: any) => void } },
    index: any
  ) => {
    e.dataTransfer.setData("text/plain", index);
  };

  const handleDrop = (
    e: {
      preventDefault: () => void;
      dataTransfer: { getData: (arg0: string) => string };
    },
    targetIndex: number
  ) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"), 10);
    setLocalSortCriteria((current) => {
      const item = current[sourceIndex];
      const updatedList = [...current];
      updatedList.splice(sourceIndex, 1);
      updatedList.splice(targetIndex, 0, item);
      return updatedList;
    });
  };

  const handleDragOver = (e: { preventDefault: () => void }) => {
    e.preventDefault();
  };

  const updateSortCriterionDirection = (
    index: number,
    direction: Directions
  ) => {
    setLocalSortCriteria((current) =>
      current.map((criterion, i) =>
        i === index ? { ...criterion, direction } : criterion
      )
    );
  };

  const updateSortCriterionState = (index: number) =>
    setLocalSortCriteria((current) =>
      current.map((item, i) =>
        i === index ? { ...item, sorted: !item.sorted } : item
      )
    );

  const parseColumns = () => {
    if (preferences?.dashboard.columns)
      setLocalSortCriteria(preferences?.dashboard.columns);
  };

  useEffect(() => {
    parseColumns();
  }, [columnData, preferences]);

  return (
    <div data-component="Component_Dashboard_Sort_Modal">
      {localSortCriteria.map((criterion, index) => (
        <div
          key={criterion.key_column}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDrop={(e) => handleDrop(e, index)}
          onDragOver={handleDragOver}
          style={{
            cursor: "grab",
            padding: "10px",
            border: "1px solid #ccc",
            marginBottom: "5px",
          }} // Basic styling for visibility
        >
          <input
            type="checkbox"
            checked={criterion.sorted}
            onChange={() => updateSortCriterionState(index)}
          />
          <span>{criterion.key_column}</span>
          <button
            onClick={() => updateSortCriterionDirection(index, "asc")}
            disabled={!criterion.sorted}
            style={{
              background: criterion.direction === "asc" ? "#4CAF50" : "#f1f1f1",
              color: criterion.direction === "asc" ? "white" : "black",
            }}
          >
            Asc
          </button>
          <button
            onClick={() => updateSortCriterionDirection(index, "desc")}
            disabled={!criterion.sorted}
            style={{
              background:
                criterion.direction === "desc" ? "#f44336" : "#f1f1f1",
              color: criterion.direction === "desc" ? "white" : "black",
            }}
          >
            Desc
          </button>
        </div>
      ))}
      <button onClick={() => onSave(localSortCriteria)}>Save</button>
    </div>
  );
};

export const Component_Dashboard = ({
  data,
  results,
}: Props_Component_Rendered) => {
  const [tableData, setTableData] = useState<Data_Row_Displayed[]>([]);
  const [preferences, setPreferences] = useState<Data_Preferences>();
  const [showSortModal, setShowSortModal] = useState<boolean>(false);
  const [columnData, setColumnData] = useState<Data_Column[]>([]);
  const [panelData, setPanelData] = useState<any[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sortCriteria, setSortCriteria] = useState<Data_Preferences_Column[]>(
    []
  );

  const updatePrefereces = (criteria_new: Data_Preferences_Column[]) => {
    const preferences_new = JSON.parse(JSON.stringify(preferences));

    preferences_new.dashboard.columns = criteria_new;

    setPreferences(preferences_new);
    setSortCriteria(criteria_new);

    data.handleLifecycle({
      key_function: "function.dashboard.publish_preferences_update",
      input: preferences_new,
    });
  };

  const handleSaveSortCriteria = (criteria_new: Data_Preferences_Column[]) => {
    setSortCriteria(criteria_new);
    updatePrefereces(criteria_new);
  };

  const onColumnOrderChange = (criteria_new: Data_Column[]) => {
    setColumnData(criteria_new);
    updatePrefereces(criteria_new);
  };

  const handleShowSortModal = () => {
    setShowSortModal((prev) => !prev);
  };

  const sortedData = useMemo(() => {
    let activeCriteria = preferences?.dashboard.columns.filter(
      (criterion) => criterion.sorted
    );

    if (sortCriteria.length > 0)
      activeCriteria = sortCriteria.filter((criterion) => criterion.sorted);

    return [...tableData].sort((a, b) => {
      if (activeCriteria)
        for (let criterion of activeCriteria) {
          if (a[criterion.key_column] < b[criterion.key_column]) {
            return criterion.direction === "asc" ? -1 : 1;
          } else if (a[criterion.key_column] > b[criterion.key_column]) {
            return criterion.direction === "asc" ? 1 : -1;
          }
        }
      return 0;
    });
  }, [tableData, sortCriteria]);

  const checkUpdatedPreferences = (result_preferences: Payload_Result) => {
    return (
      result_preferences && !jsonEqual(result_preferences.data, preferences)
    );
  };

  const determineStatus = (data_row: Payload_API_Dashboard) => {
    const now = Math.floor(Date.now() / 1000);

    const isExpired = now > data_row.ExpirationDate;

    const inGracePeriod =
      now < data_row.ExpirationDate + data_row.GracePeriod * 24 * 60 * 60;

    if (data_row.Enabled && isExpired && !inGracePeriod) return "0Red";

    if (data_row.Enabled && isExpired && inGracePeriod) return "1Orange";

    return "3Green";
  };

  const determineActions = (data_row: Payload_API_Dashboard) => {
    const now = Math.floor(Date.now() / 1000);

    const isExpired = now > data_row.ExpirationDate;

    if (data_row.AgreementAccepted || !isExpired) return "No";

    return "Yes";
  };

  const parseLicenses = (data_result: Payload_API_Dashboard[]) => {
    let data_table: Data_Row_Displayed[] = [];

    data_result.forEach((data_row: Payload_API_Dashboard) => {
      let row_display: Data_Row_Displayed = {
        license_id: data_row.LicenseID,
        client_name: data_row.ClientName,
        product_name: data_row.ProductName,
        status: determineStatus(data_row),
        action_required: determineActions(data_row),
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
          if (column.shown) columns.push({ ...column, size: "" });
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

  const parseResults = () => {
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
    parseResults();
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
  }, [preferences?.theme]);

  return (
    <>
      {showSortModal && (
        <Component_Sort_Modal
          columnData={columnData}
          preferences={preferences}
          onSave={handleSaveSortCriteria}
        />
      )}
      <div
        data-component="Component_Dashboard"
        data-css={data.json.content.css_key}
      >
        <button
          data-component="Component_Dashboard_Show_Sort_Modal_Button"
          onClick={handleShowSortModal}
        >
          sort
        </button>
        <Component_Dashboard_Header
          columnData={columnData}
          onColumnOrderChange={onColumnOrderChange}
        />
        <div data-component="Component_Dashboard_Row_Container">
          {sortedData.map((row) => (
            <Component_Dashboard_Row
              key={row.license_id}
              row={row}
              handleLifecycle={data.handleLifecycle}
              panelData={panelData}
              columnData={columnData}
            />
          ))}
        </div>
      </div>
    </>
  );
};
