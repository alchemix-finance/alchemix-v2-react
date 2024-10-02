const assets = [
  {
    name: "ETH",
    color: "#627EEA",
  },
  {
    name: "WSTETH",
    color: "#00A3FF",
  },
  {
    name: "RETH",
    color: "#ff0000",
  },
  {
    name: "DAI",
    color: "#f7b32b",
  },
  {
    name: "USDC",
    color: "#2775ca",
  },
  {
    name: "USDT",
    color: "#50af95",
  },
];

export const Tokens = () => {
  return (
    <div className="flex items-center overflow-x-clip">
      <div className="flex min-w-full items-center justify-between lg:animate-scroll lg:pl-20">
        {assets.map(({ name, color }) => (
          <div key={name} className="relative">
            <img
              alt={name}
              src={`./images/icons/${name.toLowerCase()}.svg`}
              className="h-20 w-20 min-w-full rounded-full border border-lightgrey10inverse dark:border-lightgrey10"
            />
            <div
              style={{
                background: color,
              }}
              className="absolute inset-0 -z-10 size-full rounded-full blur-xl"
            />
          </div>
        ))}
      </div>
      <div className="hidden min-w-full animate-scroll items-center justify-between lg:flex lg:pl-20">
        {assets.map(({ name, color }) => (
          <div key={name} className="relative">
            <img
              alt={name}
              src={`./images/icons/${name.toLowerCase()}.svg`}
              className="h-20 w-20 min-w-full rounded-full border border-lightgrey10inverse dark:border-lightgrey10"
            />
            <div
              style={{
                background: color,
              }}
              className="absolute inset-0 -z-10 size-full rounded-full blur-xl"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
