import type { IpcMainEvent, IpcMainInvokeEvent } from "electron";
import type {
  InvokeReturn,
  InvokeRoute,
  SendRoute,
  SenderPolicy,
  Untrusted,
  WireArgs,
} from "../config/shared/ipcRoute";
import type { IpcInvokeMap } from "../config/shared/ipcRoutes";
import * as security from "./ipcSecurity";

/** What a main-window invoke answers. Handlers whose services keep their own copy
 *  of a payload type cast to this; each such cast marks two types to unify. */
export type Answer<K extends keyof IpcInvokeMap> = IpcInvokeMap[K]["return"];

type AssertSenderFn = Parameters<typeof security.handleAuthorized>[1];

// Read on registration, not import: unit tests mock ipcSecurity with only the guards they use.
function guardFor(policy: SenderPolicy): AssertSenderFn {
  switch (policy) {
    case "main":
      return security.assertMainRendererSender;
    case "popout":
      return security.assertPopoutSender;
    case "scanOverlay":
      return security.assertOverlayRendererSender;
    case "anyOverlay":
      return security.assertLocalizedOverlaySender;
    case "rivenOverlay":
      return security.assertRivenOverlayRendererSender;
    case "arbiSummary":
      return security.assertArbiSummarySender;
    case "tradeNotification":
      return security.assertTradeNotificationSender;
  }
}

/** Answers an invoke route. The handler gets the renderer's arguments unchecked and
 *  must validate them; what it returns has to match the route's declared answer. */
export function handle<R extends InvokeRoute>(
  route: R,
  handler: (
    event: IpcMainInvokeEvent,
    ...args: Untrusted<WireArgs<R>>
  ) => InvokeReturn<R> | Promise<InvokeReturn<R>>,
): void {
  security.handleAuthorized(route.channel, guardFor(route.sender), handler as never);
}

/** Listens on a send route; unauthorized senders are dropped after a warning. */
export function listen<R extends SendRoute>(
  route: R,
  handler: (event: IpcMainEvent, ...args: Untrusted<WireArgs<R>>) => void,
): void {
  security.onAuthorized(route.channel, guardFor(route.sender), handler as never);
}
