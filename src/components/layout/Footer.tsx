import { Link } from "@tanstack/react-router";

import { dayjs } from "@/lib/dayjs";
import XPrevTwitterIcon from "@/assets/logos/x.svg?react";

const copyrightYear = () => {
  return `2020-${dayjs().format("YYYY")}`;
};

export const Footer = () => {
  return (
    <footer className="flex flex-col border-t border-grey5inverse py-12 pb-16 pl-8 lg:pb-12 dark:border-grey5">
      <div className="flex flex-col space-y-4 lg:flex-row lg:space-x-11">
        <div className="w-60">
          <img
            src="/alchemix-v2-react/images/icons/ALCX_Std_logo.svg"
            className="mb-5 h-9 saturate-0"
            alt="The Alchemix logo"
          />

          <p className="mb-3 text-sm opacity-50">
            &copy; {copyrightYear()} Alchemix Labs
          </p>
          <p className="mb-3 text-justify text-sm opacity-50">
            All rights reserved, no guarantees given. DeFi tools are not toys.
            Use at your own risk.
          </p>
        </div>

        <div>
          <p className="alcxTitle mb-5 text-sm uppercase">NAVIGATION</p>
          <ul className="space-y-3 text-sm">
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <Link to="/">Introduction</Link>
            </li>
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a
                href="https://github.com/orgs/alchemix-finance/"
                className="flex space-x-4"
                target="_blank"
                rel="noreferrer"
              >
                <span>Github</span>
              </a>
            </li>
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a
                href="https://alchemix-finance.gitbook.io/user-docs/"
                className="flex space-x-4"
                target="_blank"
                rel="noreferrer"
              >
                <span>Documentation</span>
              </a>
            </li>
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <Link className="flex space-x-4" to="/governance">
                <span>Snapshot</span>
              </Link>
            </li>
          </ul>
        </div>
        <div className="mr-11">
          <p className="alcxTitle mb-5 text-sm uppercase">SOCIAL</p>
          <ul className="space-y-3 text-sm">
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a
                href="https://alchemixfi.medium.com/"
                className="flex space-x-4"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Medium</title>
                  <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"></path>
                </svg>
                <span>Medium</span>
              </a>
            </li>
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a
                href="https://discord.com/invite/alchemix"
                className="flex space-x-4"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"></path>
                </svg>
                <span>Discord</span>
              </a>
            </li>
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a
                href="https://forum.alchemix.fi/public/"
                className="flex space-x-4"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M20 32C28.8366 32 36 26.6274 36 20C36 13.3726 28.8366 8 20 8C11.1634 8 4 13.3726 4 20C4 22.6842 5.17509 25.1626 7.16049 27.1616C6.35561 29.4537 5.31284 31.1723 4.6499 32.1319C4.4071 32.4834 4.65714 32.9802 5.08289 32.9453C6.78453 32.8058 10.1224 32.3105 12.3741 30.5519C14.6411 31.4754 17.2389 32 20 32Z"></path>
                  <path d="M22.7843 33.8337C31.4033 32.7928 38 26.9957 38 20.0002C38 19.4632 37.9611 18.9333 37.8855 18.4121C41.5534 20.1003 44 23.136 44 26.6002C44 28.7476 43.0599 30.7303 41.4716 32.3295C42.068 34.0278 42.8276 35.3325 43.3579 36.1259C43.5953 36.481 43.3423 36.9779 42.917 36.9372C41.5041 36.8021 39.0109 36.3773 37.3007 35.0418C35.4872 35.7806 33.4089 36.2002 31.2 36.2002C27.9781 36.2002 25.0343 35.3074 22.7843 33.8337Z"></path>
                </svg>

                <span>Forum</span>
              </a>
            </li>
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a
                href="https://twitter.com/AlchemixFi"
                className="flex space-x-4"
                target="_blank"
                rel="noreferrer"
              >
                <XPrevTwitterIcon className="h-5 w-5 dark:fill-white2" />
                <span>X (Prev. Twitter)</span>
              </a>
            </li>

            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a
                href="https://alchemixfi.substack.com/"
                className="flex space-x-4"
                target="_blank"
                rel="noreferrer"
              >
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  role="img"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>Substack</title>
                  <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"></path>
                </svg>
                <span>Newsletter</span>
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="alcxTitle mb-5 text-sm uppercase">PROUDLY USING</p>
          <ul className="space-y-3 text-sm">
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a href="https://defillama.com/" target="_blank" rel="noreferrer">
                <img
                  src="./alchemix-v2-react/images/integrations/defillama.svg"
                  className="w-32"
                  alt="The logo of DefiLlama"
                />
              </a>
            </li>
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a href="https://li.fi/" target="_blank" rel="noreferrer">
                <img
                  src="./alchemix-v2-react/images/integrations/lifi.svg"
                  className="w-32"
                  alt="The logo of Li.Fi"
                />
              </a>
            </li>
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a href="https://snapshot.org/" target="_blank" rel="noreferrer">
                <img
                  src="./alchemix-v2-react/images/integrations/snapshot.svg"
                  className="w-32"
                  alt="The logo of Snapshot"
                />
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="alcxTitle mb-5 text-sm uppercase">CARBON FOOTPRINT</p>
          <ul className="space-y-3 text-sm">
            <li className="opacity-50 transition-opacity hover:opacity-100">
              <a
                href="https://www.klimadao.finance/pledge/0xffaa3cda4f169d33291dd9ddbea8578d1398430e"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  src="./alchemix-v2-react/images/integrations/klima.svg"
                  className="w-32"
                  alt="Alchemix pledged to offset 4,390.96 Carbon Tonnes"
                />
              </a>
            </li>
          </ul>
          <p className="mt-3 w-60 text-justify text-sm opacity-50">
            Our historical carbon emissions have been offset using KlimaDAO
          </p>
        </div>
      </div>
    </footer>
  );
};
