import React, { FunctionComponent } from "react";
import Helmet from "react-helmet";
import { withPrefix } from "gatsby";
import { useSiteMetadata } from "../hooks/useSiteMetadata";
import { Header, MenuItem } from "./header";
import { Footer } from "./footer";
import icon from "../../../static/logo.png";

const logo = <img className="w-auto h-15" src={icon} alt="Workflow" />;
const menuItems: MenuItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "Personal Finance",
    href: "/tags/finance",
  },
  {
    label: "Blockchain",
    href: "/tags/blockchain",
  },
  {
    label: "Buy Cryptocurrency",
    href:
      "/blog/complete-guide-to-buying-bitcoin-ethereum-or-other-cryptocurrencies-in-singapore",
  },
  {
    label: "Tools",
    dropdownItems: [
      {
        label: "HDB Resale Price Calculator",
        href: "https://sgpropinsider.com/?r=geek",
        description: "Get valuation of your HDB resale flat instantly",
        icon: (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
          </svg>
        ),
      },
      {
        label: "CPF Forecast Calculator",
        href: "/tools/cpf-forecast",
        description: "Estimate your CPF balance when you turn 55",
        icon: (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="calculator w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 1a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm4-4a1 1 0 100 2h.01a1 1 0 100-2H13zM9 9a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zM7 8a1 1 0 000 2h.01a1 1 0 000-2H7z"
              clipRule="evenodd"
            ></path>
          </svg>
        ),
      },
      {
        label: "Quadratic Voting App",
        href: "https://qv.geek.sg",
        description: "Hosted open sourced QV platform",
        icon: (
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="chat-alt w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z"
              clipRule="evenodd"
            ></path>
          </svg>
        ),
      },
    ],
  },
  {
    label: "Contact",
    href: "/contact",
  },
];

const footer = {
  copyrightOwner: "GEEK SG",
  linkedin: "https://www.linkedin.com/in/raymondyeh/",
  github: "https://github.com/yehjxraymond",
  instagram: "https://www.instagram.com/geek.sg/",
};

export const Layout: FunctionComponent = ({ children }) => {
  const { title } = useSiteMetadata();
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={`${withPrefix("/")}img/apple-touch-icon.png`}
        />
        <link
          rel="icon"
          type="image/png"
          href={`${withPrefix("/")}img/favicon-32x32.png`}
          sizes="32x32"
        />
        <link
          rel="icon"
          type="image/png"
          href={`${withPrefix("/")}img/favicon-16x16.png`}
          sizes="16x16"
        />

        <link
          rel="mask-icon"
          href={`${withPrefix("/")}img/safari-pinned-tab.svg`}
          color="#ffffff"
        />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <meta name="theme-color" content="#fff" />
      </Helmet>
      <Header menuItems={menuItems} logo={logo} />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </div>
      <Footer {...footer} />
    </>
  );
};

export default Layout;
