import { DebugTenderly } from "./DebugTenderly";
import { DebugTokens } from "./DebugTokens";

export const Debug = () => {
  return (
    <div className="grid grid-cols-1 gap-5 whitespace-nowrap md:grid-cols-2">
      <DebugTenderly />
      <DebugTokens />
    </div>
  );
};
