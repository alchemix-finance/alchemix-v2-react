import { ConnextBridge } from "./connext/ConnextBridge";
import { WormholeBridge } from "./wormhole/WormholeBridge";

export const Bridge = () => {
  return (
    <div className="space-y-5">
      <ConnextBridge />
      <WormholeBridge />
    </div>
  );
};
