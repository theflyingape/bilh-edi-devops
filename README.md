Our [EDI DevOps](https://www.intersystems.com/lp/healthcare-interoperability-solutions/ "InterSystems Health Connect") spans multiple analysts, developers, and consultants with support from their [Technical PM](https://robert.hurst-ri.us/rob/artifacts), me. I am thinking it better to consolidate our KB/HOWTO, dashboards, monitors, reporting and tools into one portal. And for the past 8 years, I have been advocating the use of `VS Code` as a replacement over the proprietary `Studio` IDE. It is apparent with the `2024` release that now is a good time to do that.

In steps [Code Server](https://code.visualstudio.com/docs/remote/vscode-server) to mitigate and provide a centralized solution to resolve its complexity for having to disparately install on a variety of remote endpoints. Also, there are numerous activities needed to work off the host CLI, so providing a number of self "helpers" to [Xterm.js](https://xtermjs.org/) consoles is beneficial toward the team's overall technical maturity.

As a final objective, I would like to promote the team's activities off the home page, suitable for guest browsing too, that can provide the latest news and events out of this space. Some may be generated programmatically while others could be a posted by the team (moderated by its admins).

![screenshot](https://github.com/theflyingape/bilh-edi-devops/blob/16ea6c0e7baf8bbc1f4d53086e0e6fd82c6cda85/screenshot.png "DevOps portal")

## Setup

Make sure to install the dependencies:

```bash
# choose your method
$ npm install
$ pnpm install
$ yarn install
$ bun install
```

## Development Server

Start the development server on `http://localhost:6500`:

```bash
# choose your method, prefix HOST= and/or PORT= as overrides
$ npm run dev
$ pnpm run dev
$ yarn dev
$ bun run dev
```

## Production

Build the application for production:

```bash
# choose your method
$ npm run build
$ pnpm run build
$ yarn build
$ bun run build
```

Locally preview production build:

```bash
# choose your method
$ npm run preview
$ pnpm run preview
$ yarn preview
$ bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
