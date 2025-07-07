export const BridgeClosed = () => {
  return (
    <div className="flex flex-col justify-center gap-4 xl:flex-row xl:gap-10">
      <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 relative space-y-2 rounded-md border p-5 xl:max-w-lg">
        <h1 className="text-lg">Bridge is closed</h1>
        <p className="text-sm">
          We&apos;re currently upgrading our bridging system and it will be back
          online shortly. For the latest updates, stay tuned to our social
          channels.
        </p>
      </div>
    </div>
  );
};
