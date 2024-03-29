import {
  Payload_Function_Data,
  Payload_Answer,
} from "../handler/Handler_Function";

export type Map_Function = {
  [key: string]: any;
};

const map_function: Map_Function = {
  function: {
    testing: {
      log: {
        subscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.subscribe("test_log", (data: string) => {
              if (payload.updateResults)
                payload.updateResults({
                  key_event_subscription: ["test_log"],
                  data: data,
                });
            });
        },
        unsubscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.unsubscribe("test_log", (data: string) => {
              if (payload.updateResults)
                payload.updateResults({
                  key_event_subscription: ["test_log"],
                  data: data,
                });
            });
        },
        publish: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("test_log", payload.data);
        },
      },
      api: {
        publish: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("api_call", {
              key_api: "test",
              key_call: payload.key_call,
            });
        },
      },
    },
    environment: {
      subscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.subscribe(
            "environment_answer",
            (data: string) => {
              if (payload.updateResults)
                payload.updateResults({
                  key_event_subscription: [payload.key_call],
                  data: data,
                });
            }
          );
      },
      unsubscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.unsubscribe(
            "environment_answer",
            (data: string) => {
              if (payload.updateResults)
                payload.updateResults({
                  key_event_subscription: [payload.key_call],
                  data: data,
                });
            }
          );
      },
    },
    preferences: {
      subscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event) {
          payload.handler_event.subscribe(
            "api_answer",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["api_answer", data.key_call],
                  data: data.data,
                });
            }
          );

          payload.handler_event.subscribe(
            "preferences_update",
            (data: Payload_Answer) => {
              if (payload.updateResults)
                payload.updateResults({
                  key_event_subscription: ["preferences_update"],
                  data: data.data,
                });
            }
          );
        }
      },
      unsubscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event) {
          payload.handler_event.unsubscribe(
            "api_answer",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["api_answer", data.key_call],
                  data: data.data,
                });
            }
          );

          payload.handler_event.unsubscribe(
            "preferences_update",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["preferences_update", data.key_call],
                  data: data.data,
                });
            }
          );
        }
      },
      publish_api: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.publish("api_call", {
            key_api: "preferences",
            key_call: payload.key_call,
          });
      },
      publish_store: (payload: Payload_Function_Data) => {
        if (payload.handler_event && payload.data)
          payload.handler_event.publish("store_short_term", payload.data);
      },
    },
    navigation: {
      page: {
        subscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.subscribe(
              "page_navigation",
              (data: string) => {
                if (payload.updateResults)
                  payload.updateResults({
                    key_event_subscription: ["page_navigation"],
                    data: data,
                  });
              }
            );
        },
        unsubscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.unsubscribe(
              "page_navigation",
              (data: string) => {
                if (payload.updateResults)
                  payload.updateResults({
                    key_event_subscription: ["page_navigation"],
                    data: data,
                  });
              }
            );
        },
        publish_home: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("page_navigation", "Home");
        },
        publish_dashboard: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("page_navigation", "Dashboard");
        },
      },
    },
    dashboard: {
      subscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event) {
          payload.handler_event.subscribe(
            "api_answer",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["api_answer", data.key_call],
                  data: data.data,
                });
            }
          );

          payload.handler_event.subscribe(
            "retrieve_answer",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["retrieve_answer", data.key_call],
                  data: data.data,
                });
            }
          );

          payload.handler_event.subscribe(
            "environment_answer",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["environment_answer", data.key_call],
                  data: data.data,
                });
            }
          );
        }
      },
      unsubscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event) {
          payload.handler_event.unsubscribe(
            "api_answer",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["api_answer", data.key_call],
                  data: data.data,
                });
            }
          );
          payload.handler_event.unsubscribe(
            "retrieve_answer",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["retrieve_answer", data.key_call],
                  data: data.data,
                });
            }
          );
          payload.handler_event.unsubscribe(
            "environment_answer",
            (data: Payload_Answer) => {
              if (payload.updateResults && payload.key_call === data.key_call)
                payload.updateResults({
                  key_event_subscription: ["environment_answer", data.key_call],
                  data: data.data,
                });
            }
          );
        }
      },
      publish_api_licenses: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.publish("api_call", {
            key_api: "dashboard_licenses",
            key_call: payload.key_call,
          });
      },
      publish_api_product: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.publish("api_call", {
            key_api: "dashboard_product",
            key_call: payload.key_call,
            data: payload.data,
          });
      },
      publish_preferences_retrieve: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.publish("retrieve_call", {
            key_retrieve: "preferences",
            key_call: payload.key_call,
          });
      },
      publish_preferences_update: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.publish("preferences_update", {
            key_call: payload.key_call,
            data: payload.data,
          });
      },
    },
  },
};

export default map_function;
