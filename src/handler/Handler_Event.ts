type Map_Event = {
  [key in Key_Events]: Function[];
};

export type Key_Events =
  | "error"
  | "store_short_term"
  | "store_long_term"
  | "retrieve_call"
  | "retrieve_answer"
  | "page_navigation"
  | "test_log"
  | "environment_call"
  | "environment_answer"
  | "api_call"
  | "api_answer";

export default class Handler_Event {
  private event_subscriptions: Map_Event;
  private static instance: Handler_Event;

  private constructor() {
    this.event_subscriptions = {} as Map_Event;
  }

  public static getInstance(): Handler_Event {
    if (!Handler_Event.instance) {
      Handler_Event.instance = new Handler_Event();
    }

    return Handler_Event.instance;
  }

  public subscribe(event: Key_Events, callback: Function): void {
    if (!this.event_subscriptions[event]) this.event_subscriptions[event] = [];

    this.event_subscriptions[event].push(callback);
  }

  public unsubscribe(event: Key_Events, callback: Function): void {
    if (!this.event_subscriptions[event]) return;

    this.event_subscriptions[event] = this.event_subscriptions[event].filter(
      (subscriber) => subscriber !== callback
    );
  }

  public publish(event: Key_Events, data: any): boolean {
    const eventCallbacks = this.event_subscriptions[event];

    if (eventCallbacks) {
      eventCallbacks.forEach((callback) => {
        callback(data);
      });
      return true;
    }

    return false;
  }
}
