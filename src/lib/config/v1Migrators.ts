import { SYNTH_ASSETS } from "./synths";

export const V1_MIGRATORS = {
  [SYNTH_ASSETS.ALETH]: "0xb4E7cc74e004F95AEe7565a97Dbfdea9c1761b24",
  [SYNTH_ASSETS.ALUSD]: "0x72A7cb4d5daB8E9Ba23f30DBE8E72Bc854a9945A",
} as const;

// ui

// <ContainerWithHeader canToggle="{true}" isVisible="{canMigrateAlETH || canMigrateAlUSD}">
//   <div class="text-sm flex flex-row justify-between" slot="header">
//     <p class="self-center">Legacy Migration</p>
//   </div>
//   <div slot="body" class="flex flex-col space-y-4 p-4">
//     <div
//       class="w-full rounded p-4 {$settings.invertColors ? 'bg-grey10inverse' : 'bg-grey10'}"
//       transition:slide|local
//     >
//       <p class="mb-4">
//         To make it as simple as possible to migrate your Legacy vault deposits into V2, Alchemix is providing a migration tool which enables you to transfer your position into V2 while staying as gas-cost efficient as possible.
//       </p>
//       <p class="mb-4">
//      The migration is done with a single call to the legacy Alchemist's "withdraw" function.
//       </p>
//       <div class="flex flex-row justify-between space-x-4 mb-4">
//         <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
//           <p class="text-lg">Alchemist: alUSD</p>
//           <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
//             Your Balance: <span class="{$settings.invertColors ? 'text-white2inverse' : 'text-white2'}"
//               >{alUSDAmount} DAI</span
//             >
//           </p>
//           <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
//          This will migrate your legacy DAI/alUSD position from the contract 0xc21D353FF4ee73C572425697f4F5aaD2109fe35b.
//           </p>
//           <div class="w-full">
//             <Button
//               label="{!canMigrateAlUSD ? Legacy position migrated : Migrate legacy position}"
//               borderColor="green4"
//               backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
//               hoverColor="green4"
//               height="h-12"
//               disabled="{!canMigrateAlUSD}"
//               on:clicked="{() => migration(0)}"
//             />
//           </div>
//         </div>
//         <div class="rounded w-full p-4 {$settings.invertColors ? 'bg-grey15inverse' : 'bg-grey15'}">
//           <p class="text-lg">Alchemist: alETH</p>
//           <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
//             Your Balance: <span class="{$settings.invertColors ? 'text-white2inverse' : 'text-white2'}"
//               >{alETHAmount} ETH</span
//             >
//           </p>
//           <p class="text-sm mb-4 {$settings.invertColors ? 'text-lightgrey10inverse' : 'text-lightgrey10'}">
//           This will migrate your legacy ETH/alETH position from the contract 0xf8317BD5F48B6fE608a52B48C856D3367540B73B.
//           </p>
//           <div class="w-full">
//             <Button
//               label="{!canMigrateAlETH ? Legacy position migrated : Migrate legacy position}"
//               borderColor="green4"
//               backgroundColor="{$settings.invertColors ? 'green7' : 'black2'}"
//               hoverColor="green4"
//               height="h-12"
//               disabled="{!canMigrateAlETH}"
//               on:clicked="{() => migration(1)}"
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   </div>
// </ContainerWithHeader>

// ui functions

// const migration = async (targetAlchemist) => {
//   alchemist = targetAlchemist;
//   processing = true;
//   try {
//     await sweepLegacy(targetAlchemist, [$signer]).then((response) => {
//       fetchBalanceByAddress(response.underlying, [$signer]);
//       getLegacyDeposit();
//     });
//   } catch (error) {
//     reset();
//     console.log(error);
//   }
// };

// const getLegacyDeposit = async () => {
//   alUSDAmount = "0";
//   alETHAmount = "0";
//   canMigrateAlUSD = !(await hasMigrated(0, [$addressStore, $signer]));
//   canMigrateAlETH = !(await hasMigrated(1, [$addressStore, $signer]));
//   if (canMigrateAlUSD)
//     alUSDAmount = utils.formatEther(
//       await legacyDeposit(0, [$addressStore, $signer]),
//     );
//   if (canMigrateAlETH)
//     alETHAmount = utils.formatEther(
//       await legacyDeposit(1, [$addressStore, $signer]),
//     );
// };

// funtctions to call

// export async function hasMigrated(
//   _vaultType: VaultTypes,
//   [_userAddress, _signer]: [string, Signer],
// ) {
//   try {
//     const { instance: _transferInstance } = await contractWrapper(
//       VaultConstants[_vaultType].transferAdapter,
//       _signer,
//       "ethereum",
//     );
//     return _transferInstance.hasMigrated(_userAddress);
//   } catch (error) {
//     setError(error.data ? await error.data.message : error.message, error);
//     console.error(`[flashloanActions/hasMigrated]: ${error}`);
//     throw Error(error);
//   }
// }

// export async function legacyDeposit(
//   _vaultType: VaultTypes,
//   [_userAddress, _signer]: [string, Signer],
// ) {
//   try {
//     const { instance: _legacyInstance } = await contractWrapper(
//       VaultConstants[_vaultType].legacy,
//       _signer,
//       "ethereum",
//     );
//     return _legacyInstance.getCdpTotalDeposited(_userAddress);
//   } catch (error) {
//     setError(error.data ? await error.data.message : error.message, error);
//     console.error(`[flashloanActions/legacyDeposit]: ${error}`);
//     throw Error(error);
//   }
// }
