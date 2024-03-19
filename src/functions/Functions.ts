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
              if (payload.setResults)
                payload.setResults({
                  key_event_subscription: ["test_log"],
                  data: data,
                });
            });
        },
        unsubscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.unsubscribe("test_log", (data: string) => {
              if (payload.setResults)
                payload.setResults({
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
          console.log("puhlibhsing");
          if (payload.handler_event)
            payload.handler_event.publish("api_call", {
              key_api: "test",
              key_call: payload.key_call,
            });
        },
      },
    },
    navigation: {
      page: {
        subscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.subscribe(
              "page_navigation",
              (data: string) => {
                if (payload.setResults)
                  payload.setResults({
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
                if (payload.setResults)
                  payload.setResults({
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
    environment: {
      subscribe: (payload: Payload_Function_Data) => {
        if (payload.handler_event)
          payload.handler_event.subscribe(
            "environment_answer",
            (data: string) => {
              if (payload.setResults)
                payload.setResults({
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
              if (payload.setResults)
                payload.setResults({
                  key_event_subscription: [payload.key_call],
                  data: data,
                });
            }
          );
      },
    },
    dashboard: {
      api: {
        subscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.subscribe(
              "api_answer",
              (data: Payload_Answer) => {
                if (payload.setResults)
                  payload.setResults({
                    key_event_subscription: ["api_answer", data.key_call],
                    data: data.data,
                  });
              }
            );
        },
        unsubscribe: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.unsubscribe(
              "api_answer",
              (data: Payload_Answer) => {
                if (payload.setResults)
                  payload.setResults({
                    key_event_subscription: ["api_answer", data.key_call],
                    data: data.data,
                  });
              }
            );
        },
        publish: (payload: Payload_Function_Data) => {
          if (payload.handler_event)
            payload.handler_event.publish("api_call", {
              key_api: "dashboard",
              key_call: payload.key_call,
            });
        },
      },
      preferences: {},
    },
  },
};

export default map_function;
