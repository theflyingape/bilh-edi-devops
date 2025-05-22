---
seo:
  title: EDI DevOps - Mission
  description: The landing page for a variety of topics detailed here.
---

::u-page-hero
---
orientation: horizontal
---
  :::prose-pre
  ---
  code: ssh hciedev.laheyhealth.org
  filename: HCIEDEV terminal session
  ---
  ```bash
  $ cd /opt/devops
  $ git pull
  $ source nvm && npm install
  $ sudo systemctl restart devops
  $ journalctl -fxeu devops
  ```
  :::tip
  ---
  target: _blank
  to: https://openexchange.intersystems.com/?categories=Developer-Environment,Frameworks,Integration,Solutions,Technology-Example&work-with=Ensemble&industries=Healthcare&sort=d.desc
  ---
  Explore rapid innovation enabled by open-source development: enhances the scope of our team development service catalog and aligns with the business motivators to solve data orchestrations critical for success.
  :::
  :::

#title
About

#description
The [topics below](#topics) describe what you can do on & off this main portal. Much more systems, development, and operational details follow in the EDI DevOps content.

#links
  :::u-button
  ---
  size: xl
  icon: i-vscode-icons-file-type-docz
  to: /bilh-interface-engine
  trailing-icon: i-lucide-arrow-right
  ---
  EDI DevOps content
  :::

  :::u-button
  ---
  color: info
  icon: i-lucide-message-circle-question
  size: xl
  to: /faq
  trailing-icon: i-lucide-arrow-right
  ---
  FAQ
  :::

  :::u-button
  ---
  color: neutral
  icon: i-heroicons-academic-cap
  size: xl
  to: https://learning.intersystems.com
  target: blank
  variant: subtle
  ---
  Visit InterSystems Learning services
  :::
::

::u-page-section
#title
# Topics

#description
Learn what each menu topic represents and how each item allows for quick access to the resource you need.

#features
  :::u-page-feature
  ---
  icon: i-lucide-book-open
  to: https://hciedev.laheyhealth.org/csp/docbook/DocBook.UI.Page.cls
  ---
  #title
  Guides
  
  #description
  External access to the complete Documentation portal, but with a list of handy links to the most relevant sections that are often visited.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-chart-bar-stacked
  to: /home
  ---
  #title
  Dashboards
  
  #description
  Powered by Zen, these native dashboards provide critical insights and support for proactive, real-time Operations; but also, retrospective analysis for troubleshooting and planning.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-database
  to: /home
  ---
  #title
  Productions
  
  #description
  Powered by Health Connect using IRIS for HealthShare, these are your primary DevOps portals that run the integration engines for clinical and fiscal need.
  :::

  :::u-page-feature
  ---
  icon: i-lucide-box
  to: /home
  ---
  #title
  Tools
  
  #description
  Essential applications to work within the IRIS database environments.
  :::
::

::u-page-section
#title
Topology

#description
For ease of reference, a simpler formatted table for select & copy/paste needs.
:::prose-code
|⠀Boston DC⠀|⠀VIP address / NAT⠀|⠀Hostname⠀|⠀IP address⠀|
| ---------- |:----------------- |:--------- |:---------- |
|⠀hcieprd⠀|⠀172.21.129.130⠀|⠀lvhshcadp01ss⠀|⠀172.21.129.131⠀|
||⠀208.64.113.143⠀|⠀lvhshcadp02ss⠀|⠀172.21.129.132⠀|
|⠀|⠀|⠀|⠀|
|⠀hcietst⠀|⠀172.21.26.240⠀|⠀lvhshcadt01ss⠀|⠀172.21.26.241⠀|
||⠀208.64.113.141⠀|⠀lvhshcadt02ss⠀|⠀172.21.26.242⠀|
|⠀|⠀|⠀|⠀|
|⠀|⠀|⠀|⠀|
|⠀|⠀|⠀|⠀|
:::
:::prose-code
|⠀Gordon DC⠀|⠀VIP address / NAT⠀|⠀Hostname⠀|⠀IP address⠀|
| --------- |:------------------ |:--------- |:---------- |
|⠀hcieprd⠀|⠀172.27.129.130⠀|⠀lvhshcadp01g1⠀|⠀172.27.129.131⠀|
||⠀208.64.113.142⠀|⠀lvhshcadp02g1⠀|⠀172.27.129.132⠀|
|⠀|⠀|⠀|⠀|
|⠀hcietst⠀|⠀172.26.5.249⠀|⠀lvhshcadt01g1⠀|⠀172.26.5.254⠀|
||⠀208.64.113.140⠀|⠀lvhshcadt02g1⠀|⠀172.21.26.251⠀|
|⠀|⠀|⠀|⠀|
|⠀hciedev⠀|⠀172.26.5.112⠀|⠀lvhshcadd01g1⠀|⠀172.21.26.253⠀|
|||⠀lvhshcadd02g1⠀|⠀172.26.5.252⠀|
:::
::
