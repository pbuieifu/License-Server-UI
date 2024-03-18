type Map_Event = {
  [key in Key_Events]: Function[];
};

export type Key_Events =
  | "error"
  | "store_short_term"
  | "store_long_term"
  | "retrieve"
  | "page_navigation"
  | "test_log"
  | "environment_call"
  | "environment_answer"
  | "api_call"
  | "api_answer";

export default class Handler_Event {
  private event_subscriptions: Map_Event;
  private handler_parent!: Handler_Event;
  private handler_children: Handler_Event[] = [];

  public constructor() {
    this.event_subscriptions = {} as Map_Event;
  }

  private propagateSubscription(event: Key_Events): void {
    if (this.handler_parent)
      this.handler_parent.subscribe(event, (data: any) => {
        this.publishDown(event, data);
      });
  }

  public subscribe(event: Key_Events, callback: Function): void {
    if (!this.event_subscriptions[event]) this.event_subscriptions[event] = [];

    this.event_subscriptions[event].push(callback);
    if (this.handler_parent) this.handler_parent.propagateSubscription(event);
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
      eventCallbacks.forEach((callback) => callback(data));
      return true;
    }

    return false;
  }

  public publishDown(event: Key_Events, data: any): void {
    this.handler_children.forEach((handler_event: Handler_Event) => {
      handler_event.publish(event, data);
      handler_event.publishDown(event, data);
    });
  }

  public publishUp(event: Key_Events, data: any): void {
    if (this.handler_parent) {
      if (this.handler_parent.publish(event, data)) return;
      else this.handler_parent.publishUp(event, data);
    }
  }

  public addParent(handler_parent: Handler_Event) {
    this.handler_parent = handler_parent;
  }

  public adoptChild(handler_child: Handler_Event): void {
    if (this.handler_children.includes(handler_child)) return;

    this.handler_children.push(handler_child);
    handler_child.addParent(this);

    (Object.keys(handler_child.event_subscriptions) as Key_Events[]).forEach(
      (event) => {
        const publishDownCallback = (data: any) =>
          this.publishDown(event, data);

        this.subscribe(event as Key_Events, publishDownCallback);
      }
    );
  }
}
