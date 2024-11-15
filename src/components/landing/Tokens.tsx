const assets = [
  { name: "ETH", color: "#627EEA" },
  { name: "WSTETH", color: "#00A3FF" },
  { name: "RETH", color: "#ff0000" },
  { name: "DAI", color: "#f7b32b" },
  { name: "USDC", color: "#2775ca" },
  { name: "USDT", color: "#50af95" },
];

export const Tokens = () => {
  const duplicatedAssets = [...assets, ...assets];

  return (
    <div className="flex flex-col space-y-8">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="to-[rgba(11, 13, 18, 0)] absolute left-0 top-0 h-full w-40 bg-gradient-to-r from-[#11141B]"></div>
          <div className="to-[rgba(11, 13, 18, 0)] absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-[#11141B]"></div>
        </div>

        <div className="z-0 flex w-[200%] animate-scroll space-x-8">
          {duplicatedAssets.map(({ name }, index) => (
            <div key={`${name}-${index}`} className="relative flex-shrink-0">
              <img
                alt={name}
                src={`./images/landing-page/${name.toLowerCase()}.png`}
                className="h-32 w-32 flex-shrink-0 object-contain"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 z-10">
          <div className="to-[rgba(11, 13, 18, 0)] absolute left-0 top-0 h-full w-40 bg-gradient-to-r from-[#11141B]"></div>
          <div className="to-[rgba(11, 13, 18, 0)] absolute right-0 top-0 h-full w-40 bg-gradient-to-l from-[#11141B]"></div>
        </div>

        <div className="animate-scroll-reverse z-0 flex w-[200%] space-x-8">
          {duplicatedAssets.map(({ name }, index) => (
            <div key={`${name}-${index}`} className="relative flex-shrink-0">
              <img
                alt={name}
                src={`./images/landing-page/${name.toLowerCase()}.png`}
                className="h-32 w-32 flex-shrink-0 object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
