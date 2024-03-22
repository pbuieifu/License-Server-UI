import { Asset, Data_Component_Generic } from "../components/Component_Generic";
import map_function, { Map_Function } from "../functions/Functions";
import { Payload_Error } from "./Handler_Error";
import Handler_Event, { Key_Events } from "./Handler_Event";

type Key_Function_Types = "mount" | "unmount" | "lifecycle";

export type Payload_Function = (payload?: Payload_Function_Data) => any;

export interface Payload_Result {
  key_event_subscription: [Key_Events, string];
  data: any;
}

export interface Payload_Function_Data {
  handler_event: Handler_Event;
  key_call: string;
  data?: any;
  setResults?: (data: any) => void;
}

export interface Payload_Answer {
  key_call: string;
  data: any;
}

export default class Handler_Function {
  private handler_event: Handler_Event;
  private component_data: Data_Component_Generic;

  public constructor(
    handler_event: Handler_Event,
    component_data: Data_Component_Generic
  ) {
    this.handler_event = handler_event;
    this.component_data = component_data;
  }

  private notifyError(error: Payload_Error) {
    this.handler_event.publish("error", error);
  }

  private getFunction(key: string): Payload_Function {
    const keys = key.split(".");
    let current: Map_Function = map_function;

    for (const key of keys) {
      if (current[key] === undefined) {
        this.notifyError({
          status_code: 404,
          description: `Requested Function ${key} in ${this.component_data.key_component} not found.`,
        });
        return () => {
          console.log(`Function: ${key} was not properly set up.`);
        };
      }
      current = current[key];
    }

    return current as Payload_Function;
  }

  private checkGeneralResult(data: Payload_Result) {
    return data.key_event_subscription[1] === undefined;
  }

  private checkSpecificResult(
    payload: Payload_Function_Data,
    data: Payload_Result
  ) {
    return payload.key_call === data.key_event_subscription[1];
  }

  private checkMatchedResult(
    payload: Payload_Function_Data,
    data: Payload_Result
  ) {
    return (
      this.checkGeneralResult(data) || this.checkSpecificResult(payload, data)
    );
  }

  private checkValidResult(
    payload: Payload_Function_Data,
    data: Payload_Result
  ) {
    return data.data !== undefined && this.checkMatchedResult(payload, data);
  }

  public cleanResults(payload: Payload_Function_Data, data: Payload_Result) {
    if (
      payload.setResults !== undefined &&
      this.checkValidResult(payload, data)
    ) {
      payload.setResults((results_prev: Payload_Result[]) => {
        // Find all items matching the first key of key_event_subscription
        const matchedItems = results_prev.filter(
          (result) =>
            result.key_event_subscription[0] === data.key_event_subscription[0]
        );

        // Find the specific item in the matchedItems array that also matches the second key
        const specificItemIndex = matchedItems.findIndex(
          (item) => item.key_event_subscription[1] === payload.key_call
        );

        // If an item with the specific key exists, update its data
        if (specificItemIndex !== -1) {
          matchedItems[specificItemIndex].data = data.data;
        } else {
          // If no specific item exists, add a new one with the data
          matchedItems.push({
            key_event_subscription: [
              data.key_event_subscription[0],
              payload.key_call,
            ],
            data: data.data,
          });
        }

        // Reconstruct the results_prev array to include the updated matchedItems
        // and items not affected by the current operation
        const updatedResults = results_prev
          .filter(
            (result) =>
              result.key_event_subscription[0] !==
              data.key_event_subscription[0]
          )
          .concat(matchedItems);

        return updatedResults;
      });
    }
  }

  public extractDataFromResult(
    key_event: string,
    key_call: string,
    results: Payload_Result[]
  ): any {
    if (results) {
      const filteredByKeyEvent = results.filter(
        (result) => result.key_event_subscription[0] === key_event
      );

      const resultWithKeyCall = filteredByKeyEvent.find(
        (result) => result.key_event_subscription[1] === key_call
      );

      return resultWithKeyCall;
    }
  }

  public extractAssetURLFromList(assets: Asset[], key_asset: string) {
    const found_asset = assets.find((asset) => asset.key_asset === key_asset);

    return found_asset ? found_asset.url : key_asset;
  }

  private generateMounts(
    keys_function: string[],
    payload: Payload_Function_Data
  ): Payload_Function[] {
    keys_function.map((key_function: string) => {
      const func = this.getFunction(key_function);

      let payload_function_data: Payload_Function_Data = {
        handler_event: payload.handler_event,
        key_call: payload.key_call,
      };

      if (payload.setResults)
        payload_function_data.setResults = (data: Payload_Result) => {
          this.cleanResults(payload, data);
        };

      func(payload_function_data);
    });

    return [];
  }

  private generateUnmounts(
    keys_function: string[],
    payload: Payload_Function_Data
  ): Payload_Function[] {
    let functions: Payload_Function[] = [];
    keys_function.map((key_function: string) => {
      const func = this.getFunction(key_function);
      let payload_function_data: Payload_Function_Data = {
        handler_event: payload.handler_event,
        key_call: payload.key_call,
      };

      if (payload.setResults)
        payload_function_data.setResults = (data: Payload_Result) => {
          this.cleanResults(payload, data);
        };

      functions.push(func);
    });

    return functions;
  }

  private generateLifecycles(keys_function: string[]): Payload_Function[] {
    let functions: Payload_Function[] = [];
    keys_function.map((key_function: string) => {
      const func = this.getFunction(key_function);
      functions.push(func);
    });

    return functions;
  }

  public generateFunctions(
    key: Key_Function_Types,
    payload?: Payload_Function_Data
  ): Payload_Function[] {
    if (this.component_data.content.functions)
      switch (key) {
        case "mount":
          if (this.component_data.content.functions.mount && payload)
            return this.generateMounts(
              this.component_data.content.functions.mount,
              payload
            );
          break;
        case "unmount":
          if (this.component_data.content.functions.unmount && payload)
            return this.generateUnmounts(
              this.component_data.content.functions.unmount,
              payload
            );

          break;
        case "lifecycle":
          if (this.component_data.content.functions.lifecycle)
            return this.generateLifecycles(
              this.component_data.content.functions.lifecycle
            );
          break;
        default:
          this.notifyError({
            status_code: 404,
            description: `Requested function ${this.component_data.key_component}, ${key} in ${this.component_data.key_component} not found.`,
          });
          break;
      }

    return [];
  }
}
