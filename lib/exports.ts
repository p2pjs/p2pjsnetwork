import Network from "./network";
import { LogLevel } from "./logger";
import DiscoveryClient from "./discoveryClient";

export const p2pjsnetwork = {
  DiscoveryClient,
  Network,
  LogLevel
};

export { LogLevel } from "./logger";
export default DiscoveryClient;

(<any>window).p2pjsnetwork = p2pjsnetwork;