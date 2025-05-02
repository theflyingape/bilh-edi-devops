Our [EDI DevOps](https://www.intersystems.com/lp/healthcare-interoperability-solutions/ "InterSystems Health Connect") spans multiple analysts, developers, and consultants with support from their [Technical PM](https://robert.hurst-ri.us/rob/artifacts), me. I am thinking it better to consolidate our KB/HOWTO, dashboards, monitors, reporting and tools into one portal. And for the past 8 years, I have been advocating the use of `VS Code` as a replacement over the proprietary `Studio` IDE. It is apparent with the `2024` release that now is a good time to do that.

In steps [Code Server](https://code.visualstudio.com/docs/remote/vscode-server) to mitigate and provide a centralized solution to resolve its complexity for having to disparately install on a variety of remote endpoints. Also, there are numerous activities needed to work off the host CLI, so providing a number of self "helpers" to [Xterm.js](https://xtermjs.org/) consoles is beneficial toward the team's overall technical maturity.

As a final objective, I would like to promote the team's activities off the home page, suitable for guest browsing too, that can provide the latest news and events out of this space. Some may be generated programmatically while others could be a post by the team (moderated by its admins).

![screenshot](https://github.com/theflyingape/bilh-edi-devops/blob/16ea6c0e7baf8bbc1f4d53086e0e6fd82c6cda85/screenshot.png "DevOps portal")

## Linux host setup

### SystemD

Configure the portal service for automatic startup in production mode:
```bash
$ cp env-example .env
# edit .env to meet your needs
$ sudo cp devops.service /etc/systemd/system/
$ sudo systemctl daemon-reload
$ sudo systemctl enable devops
$ sudo systemctl start devops
```

### Apache

After your SSL directives within _your_ site httpd configuration, append:
```bash
    # set Proxy atttributes
    ProxyRequests Off
    ProxyBadHeader Ignore
    ProxyPreserveHost On
    # harden as needed
    <Proxy *>
        Order deny,allow
        Allow from all
    </Proxy>
    SSLProxyCheckPeerName Off
    SSLProxyVerify None

    # allow websocket connections into Nuxt app & Code Server session
    RewriteEngine On
    RewriteCond %{HTTP:Connection} Upgrade [NC]
    RewriteCond %{HTTP:Upgrade} WebSocket [NC]
    RewriteRule "^/devops/_nuxt/(.*)" "ws://localhost:3000/devops/_nuxt/$1" [P,L]
    # configure for a new VS Code Server instance -> user session
    RewriteCond %{HTTPS} On
    RewriteRule "^/devops/code/(0-9)+/([a-z0-9]+)$" "/devops/code-server/$1/?workspace=/home/$2/.local/share/code-server/User/Workspaces/$2-devops.code-workspace"

    # proxy Code Server endpoints -- as many concurrent sessions as needed
    <Location "/devops/code-server/6501/" >
        ProxyPass http://localhost:6501/
        ProxyPass "ws://localhost:6501/"
        ProxyPassReverse http://localhost:6501/
    </Location>

    # Nuxt portal endpoint
    <Location "/devops">
        RequestHeader set X-Forwarded-Proto "https"
        ProxyPass http://localhost:3000/devops
        ProxyPassReverse http://localhost:3000/devops
    </Location>
```

## Initial Setup

Make sure to install the dependencies:

```bash
$ npm install
```

## Development Server

Start the development server on `http://localhost:6500`:

```bash
# prefix HOST= and/or PORT= as overrides
$ npm run dev
```

## Production Mode

Build the application for production:

```bash
$ npm run build
```

Locally preview production build:

```bash
$ npm run preview
```

Check out the Nuxt [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
