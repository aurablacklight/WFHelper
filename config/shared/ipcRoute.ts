/** Builders and derived types for the IPC route registry (ipcRoutes.ts).
 *  Runtime values here are plain data, so preloads, the renderer and the main
 *  process can all import them. */

/** Which windows a route accepts calls from; ipc/routeHandlers.ts maps each to its sender guard. */
export type SenderPolicy =
  /** The main window and its popouts. */
  | "main"
  /** Popout windows only, never the main window. */
  | "popout"
  /** Every overlay window except the trade toast. */
  | "scanOverlay"
  /** Every overlay window, the trade toast included. */
  | "anyOverlay"
  | "rivenOverlay"
  | "arbiSummary"
  | "tradeNotification";

type Pack = (...args: never[]) => unknown;

/** Handlers receive what the renderer sent, unchecked: same arity, every value unknown. */
export type Untrusted<A extends unknown[]> = { [K in keyof A]: unknown };

/** Renderer to main, answered. `A` is what the caller passes, `R` what it gets back,
 *  `W` the arguments the handler receives. */
export interface InvokeRoute<
  A extends unknown[] = unknown[],
  R = unknown,
  W extends unknown[] = unknown[],
> {
  readonly kind: "invoke";
  readonly channel: string;
  readonly sender: SenderPolicy;
  /** Folds the caller's arguments into the one payload the handler reads. */
  readonly pack?: Pack;
  readonly contract?: { args: A; return: R; wire: W };
}

/** Renderer to main, fire and forget. */
export interface SendRoute<
  C extends string = string,
  A extends unknown[] = unknown[],
  W extends unknown[] = unknown[],
> {
  readonly kind: "send";
  readonly channel: C;
  readonly sender: SenderPolicy;
  readonly pack?: Pack;
  readonly contract?: { args: A; wire: W };
}

/** Main to renderer push; `A` is what the listener receives. */
interface EventRoute<C extends string = string, A extends unknown[] = unknown[]> {
  readonly kind: "event";
  readonly channel: C;
  readonly contract?: { args: A };
}

export type Route = InvokeRoute | SendRoute | EventRoute;

/** One window global's routes, keyed by the method name the preload exposes. */
export type Surface = Record<string, Route>;

/** `invoke(CHANNEL, "main").of<[id: string], Result>()`. Pass `pack` when the wire
 *  payload is one object built from the arguments. */
export function invoke(channel: string, sender: SenderPolicy) {
  function of<A extends unknown[], R>(): InvokeRoute<A, R, A>;
  function of<A extends unknown[], R>(
    pack: (...args: A) => object,
  ): InvokeRoute<A, R, [payload: unknown]>;
  function of(pack?: Pack): InvokeRoute {
    return pack ? { kind: "invoke", channel, sender, pack } : { kind: "invoke", channel, sender };
  }
  return { of };
}

export function send<C extends string>(channel: C, sender: SenderPolicy) {
  function of<A extends unknown[]>(): SendRoute<C, A, A>;
  function of<A extends unknown[]>(
    pack: (...args: A) => object,
  ): SendRoute<C, A, [payload: unknown]>;
  function of(pack?: Pack): SendRoute<C> {
    return pack ? { kind: "send", channel, sender, pack } : { kind: "send", channel, sender };
  }
  return { of };
}

export function event<C extends string>(channel: C) {
  return {
    of: <A extends unknown[]>(): EventRoute<C, A> => ({ kind: "event", channel }),
  };
}

type InvokeArgs<R> = R extends InvokeRoute<infer A, unknown, unknown[]> ? A : never;
export type InvokeReturn<R> = R extends InvokeRoute<unknown[], infer T, unknown[]> ? T : never;
export type WireArgs<R> =
  R extends InvokeRoute<unknown[], unknown, infer W>
    ? W
    : R extends SendRoute<string, unknown[], infer W>
      ? W
      : never;
export type SendArgs<R> = R extends SendRoute<string, infer A, unknown[]> ? A : never;
export type EventArgs<R> = R extends EventRoute<string, infer A> ? A : never;

/** What the preload exposes for one route. */
type Bridged<R> = R extends InvokeRoute
  ? (...args: InvokeArgs<R>) => Promise<InvokeReturn<R>>
  : R extends SendRoute
    ? (...args: SendArgs<R>) => void
    : R extends EventRoute
      ? (listener: (...args: EventArgs<R>) => void) => () => void
      : never;

/** The window global a preload exposes for a surface. */
export type Bridge<S extends Surface> = { [K in keyof S]: Bridged<S[K]> };

type NamesOf<S extends Surface, Kind extends Route["kind"]> = {
  [K in keyof S]: S[K]["kind"] extends Kind ? K : never;
}[keyof S] &
  string;

export type InvokeNames<S extends Surface> = NamesOf<S, "invoke">;
export type SendNames<S extends Surface> = NamesOf<S, "send">;
export type EventNames<S extends Surface> = NamesOf<S, "event">;

/** `{ method: { args, return } }` for every invoke route of a surface. */
export type InvokeMap<S extends Surface> = {
  [K in InvokeNames<S>]: { args: InvokeArgs<S[K]>; return: InvokeReturn<S[K]> };
};
