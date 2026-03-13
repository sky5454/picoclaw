import { atom, getDefaultStore } from "jotai"

import { type GatewayStatusResponse, getGatewayStatus } from "@/api/gateway"

export type GatewayState =
  | "running"
  | "starting"
  | "stopped"
  | "error"
  | "unknown"

export interface GatewayStoreState {
  status: GatewayState
  canStart: boolean
  startReason: string
  passphraseState: "" | "pending" | "failed"
}

// Global atom for gateway state
export const gatewayAtom = atom<GatewayStoreState>({
  status: "unknown",
  canStart: true,
  startReason: "",
  passphraseState: "",
})

function applyGatewayStatusToStore(data: GatewayStatusResponse) {
  getDefaultStore().set(gatewayAtom, (prev) => ({
    ...prev,
    status: data.gateway_status ?? "unknown",
    canStart: data.gateway_start_allowed ?? true,
    startReason: data.gateway_start_reason ?? "",
    passphraseState: data.passphrase_state ?? "",
  }))
}

export async function refreshGatewayState() {
  try {
    const status = await getGatewayStatus()
    applyGatewayStatusToStore(status)
  } catch {
    // Best-effort refresh only; keep current state on error.
  }
}
