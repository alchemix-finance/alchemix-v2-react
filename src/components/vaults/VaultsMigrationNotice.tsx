import { AlertTriangle, Lock, ExternalLink } from "lucide-react";

export const VaultsMigrationNotice = () => {
  return (
    <div className="border-grey10inverse bg-grey15inverse dark:border-grey10 dark:bg-grey15 rounded-sm border">
      <div className="bg-grey10inverse dark:bg-grey10 flex items-center gap-3 px-6 py-4">
        <AlertTriangle className="h-5 w-5 text-orange-500" />
        <p className="font-medium">V3 Migration In Progress</p>
      </div>

      <div className="flex flex-col items-center gap-6 px-6 py-12 text-center">
        <div className="bg-orange-500/10 flex h-20 w-20 items-center justify-center rounded-full">
          <Lock className="h-10 w-10 text-orange-500" />
        </div>

        <div className="max-w-md space-y-3">
          <h2 className="font-alcxTitles text-2xl font-bold">
            Vault Functions Temporarily Disabled
          </h2>
          <p className="text-lightgrey10inverse dark:text-lightgrey10 leading-relaxed">
            All V2 vault operations are paused while we migrate deposits to
            Alchemix V3. This includes deposits, withdrawals, borrows, repays,
            and liquidations.
          </p>
          <p className="text-lightgrey10inverse dark:text-lightgrey10 leading-relaxed">
            Your funds are safe. Once migration completes, you&apos;ll be able
            to access your positions in V3.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="https://snapshot.box/#/s:alchemixstakers.eth/proposal/0xa3228100b34d6063dc03d35132c044a93ea1fbcce10a960bd43fb5a8454ec4b9"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-grey10inverse hover:bg-grey5inverse dark:bg-grey10 dark:hover:bg-grey5 flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            Migration Details
          </a>
          <a
            href="https://alchemixfi.medium.com/introducing-alchemix-v3-d55f86d35b49"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-grey10inverse hover:bg-grey5inverse dark:bg-grey10 dark:hover:bg-grey5 flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            About V3
          </a>
        </div>
      </div>
    </div>
  );
};
