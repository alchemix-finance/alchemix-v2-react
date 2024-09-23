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
    <div className="flex items-center justify-between">
      {assets.map(({ name, color }) => (
        <div key={name} className="relative">
          <img
            alt={name}
            src={`/images/icons/${name.toLowerCase()}.svg`}
            className="h-20 w-20 rounded-full border border-lightgrey10inverse dark:border-lightgrey10"
          />

          <div
            style={{
              background: color,
            }}
            className="absolute inset-0 left-0 top-0 -z-10 rounded-full blur-xl"
          />
        </div>
      ))}
    </div>
  );
};
