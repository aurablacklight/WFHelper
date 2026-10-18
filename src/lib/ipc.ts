import {
  mainWindowRoutes,
  type ApiRoutes,
  type IpcInvokeMap,
  type TradeApiRoutes,
} from "../../config/shared/ipcRoutes.js";
import type {
  EventArgs,
  EventNames,
  InvokeNames,
  SendArgs,
  SendNames,
} from "../../config/shared/ipcRoute.js";
import type { Translator } from "./i18n.js";

type ReadOnlyInvokeKey = InvokeNames<ApiRoutes>;
type TradeInvokeKey = InvokeNames<TradeApiRoutes>;

type ChannelOf<K extends keyof ApiRoutes> = ApiRoutes[K]["channel"];
type EventChannel = ChannelOf<EventNames<ApiRoutes>>;
type SendChannel = ChannelOf<SendNames<ApiRoutes>>;
type RouteOn<C, Names extends keyof ApiRoutes> = Extract<ApiRoutes[Names], { channel: C }>;

function assertApi(): void {
  if (!window.api) {
    throw new Error(
      "window.api is undefined - preload bridge failed to initialize. " +
        "Check the DevTools console for '[Preload] FATAL' errors.",
    );
  }
}

function assertTradeApi(): void {
  if (!window.tradeApi) {
    throw new Error(
      "window.tradeApi is undefined - trade preload bridge failed to initialize. " +
        "Check the DevTools console for '[Preload] FATAL' errors.",
    );
  }
}

/** Host OS as reported by the main process (static, exposed on the preload bridge). */
export function getPlatform(): string {
  return window.api?.platform ?? "";
}

export function invoke<K extends ReadOnlyInvokeKey>(
  channel: K,
  ...args: IpcInvokeMap[K]["args"]
): Promise<IpcInvokeMap[K]["return"]> {
  assertApi();
  const fn = window.api[channel] as (
    ...a: IpcInvokeMap[K]["args"]
  ) => Promise<IpcInvokeMap[K]["return"]>;
  return fn(...args);
}

/** Native main-process confirm; no call site may use window.confirm directly.
 *  Reason in the SYSTEM_CONFIRM handler (ipc/systemIpc.ts). */
export function confirmWithDialog(message: string, t: Translator): Promise<boolean> {
  return invoke("confirmDialog", {
    message,
    okLabel: t("common.confirm"),
    cancelLabel: t("common.cancel"),
  });
}

export function tradeInvoke<K extends TradeInvokeKey>(
  channel: K,
  ...args: IpcInvokeMap[K]["args"]
): Promise<IpcInvokeMap[K]["return"]> {
  assertTradeApi();
  const fn = window.tradeApi[channel] as (
    ...a: IpcInvokeMap[K]["args"]
  ) => Promise<IpcInvokeMap[K]["return"]>;
  return fn(...args);
}

// on() and send() take the channel name; the preload exposes each under its method name.
// One map per kind, so an event and a send on the same channel cannot shadow each other.
function methodsByChannel(kind: "event" | "send"): Map<string, keyof ApiRoutes> {
  const names = Object.keys(mainWindowRoutes.api) as (keyof ApiRoutes)[];
  return new Map(
    names
      .filter((name) => mainWindowRoutes.api[name].kind === kind)
      .map((name) => [mainWindowRoutes.api[name].channel, name]),
  );
}
const eventMethods = methodsByChannel("event");
const sendMethods = methodsByChannel("send");

function bridgedByChannel(
  methods: Map<string, keyof ApiRoutes>,
  channel: string,
): (...args: unknown[]) => unknown {
  const name = methods.get(channel);
  if (!name) throw new Error(`No preload method for IPC channel "${channel}"`);
  return window.api[name] as (...args: unknown[]) => unknown;
}

export function on<C extends EventChannel>(
  channel: C,
  callback: (...payload: EventArgs<RouteOn<C, EventNames<ApiRoutes>>>) => void,
): () => void {
  return bridgedByChannel(eventMethods, channel)(callback) as () => void;
}

export function send<C extends SendChannel>(
  channel: C,
  ...args: SendArgs<RouteOn<C, SendNames<ApiRoutes>>>
): void {
  bridgedByChannel(sendMethods, channel)(...args);
}
