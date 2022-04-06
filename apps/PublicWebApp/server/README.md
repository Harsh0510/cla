# What is this?

The platform allows users to share certain pages on Facebook and Twitter. When a page is shared on Facebook, a Facebook web crawler spiders the shared page and collects information such as the page title, description, primary image, which is then displayed in the shared message. Likewise with Twitter. Unfortunately these web crawlers don't support javascript - the page title, description, image, and other meta-data have to be in the HTML of the page and must not be injected by javascript.

The PublicWebApp is ReactJS based - i.e. entirely driven by javascript. If Facebook or Twitter web crawlers attempted to spider the same web pages that ordinary users see, they wouldn't see anything. They'd basically just see the actual HTML content of the page, which is basically an empty <body> tag with no title, description or image. This means that, if Facebook or Twitter crawlers spidered the main application, the sharing messages would contain no title, description or image. This isn't ideal - we want shared pages to include this metadata.

We address this problem by detecting whether the user agent string of any web request matches Facebook or Twitter web crawlers. If it does, then a static HTML page is served with no javascript and which contains the necessary meta tags these sharing platforms need to display full-featured share messages. If it doesn't, then the regular ReactJS page is served.

The `apps/PublicWebApp/server` directory contains the controllers executed only for Facebook or Twitter web crawlers (i.e. those web requests with a matching user-agent string). Ordinary human users never see the content returned by the files in this directory.

## How can we identify requests from Facebook and Twitter?

Via the user-agent string. See `apps/PublicWebApp/docker/nginx-conf/default.conf.template.js`. We check whether the user-agent string contains either `twitterbot` or `facebookexternalhit`.