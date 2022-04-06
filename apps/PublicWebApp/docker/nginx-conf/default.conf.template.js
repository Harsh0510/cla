const canonicalDomain = process.env.CLA_CANONICAL_DOMAIN ? process.env.CLA_CANONICAL_DOMAIN.trim() : null;
const nonCanonicalDomains = process.env.CLA_NON_CANONICAL_DOMAINS ? process.env.CLA_NON_CANONICAL_DOMAINS.trim().split(/\s+/) : [];

const allAppDomains = [];
if (canonicalDomain) {
	allAppDomains.push(canonicalDomain, '*.' + canonicalDomain);
}
for (const domain of nonCanonicalDomains) {
	allAppDomains.push(domain, '*.' + canonicalDomain);
}
if (!process.env.IS_AZURE) {
	allAppDomains.push("localhost:13000");
	allAppDomains.push("localhost:16000");
}
if (process.env.CLA_CONTROLLER_URL_ORIGIN) {
	const uri = new URL(process.env.CLA_CONTROLLER_URL_ORIGIN.trim());
	allAppDomains.push(uri.host);
}

const allowedImageDomains = [
	"www.google-analytics.com",
	"images.isbndb.com",
];
if (process.env.CLA_ALLOWED_IMAGE_DOMAINS) {
	const domains = process.env.CLA_ALLOWED_IMAGE_DOMAINS.trim().split(/\s+/);
	for (const domain of domains) {
		allowedImageDomains.push(domain);
	}
} else {
	allowedImageDomains.push(
		`occclastagestorage.blob.core.windows.net`,
		`occclaproductionstorage.blob.core.windows.net`,
		`occcladevstorage.blob.core.windows.net`,
	);
}
allowedImageDomains.push("occclaepblog.azurewebsites.net");
allowedImageDomains.push("blog.educationplatform.co.uk");
if (!process.env.IS_AZURE) {
	allowedImageDomains.push("dummyimage.com");
}

const allowedMediaDomains = [];
if (process.env.CLA_ALLOWED_MEDIA_DOMAINS) {
	const domains = process.env.CLA_ALLOWED_MEDIA_DOMAINS.trim().split(/\s+/);
	for (const domain of domains) {
		allowedMediaDomains.push(domain);
	}
} else {
	allowedMediaDomains.push(
		`occclastagestorage.blob.core.windows.net`,
		`occclaproductionstorage.blob.core.windows.net`,
		`occcladevstorage.blob.core.windows.net`,
	);
}

const indexLuaString = process.env.IS_AZURE ? `require("index-html")` : `require("load-index-html")()`;

let nginxConfigString = `
server {
	listen 80;
	server_name _;

	root /var/www;

	rewrite ^/(.*)/$ /$1 permanent;

	location ~ \.(png|gif|jpg|jpeg|css|js|svg|woff|ttf|otf|woff2|map)$ {
		sendfile on;
		try_files $uri $uri/ =404;
	}

	location / {
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		if ( $http_user_agent ~* '(twitterbot|facebookexternalhit)' ) {
			proxy_pass http://localhost:17500;
		}
		default_type 'text/html';
		content_by_lua_block {
			local nonce = require("rand-bytes")();
			local html = string.gsub(${indexLuaString}, ":::NONCE:::", nonce)
			ngx.header["Content-Security-Policy"] = (
				"default-src 'self' 'nonce-" .. nonce .. "' 'unsafe-inline'"
				.. ";img-src 'self' 'nonce-" .. nonce .. "' 'unsafe-inline' data: ${allowedImageDomains.join(" ")}"
				.. ";media-src 'self' 'nonce-" .. nonce .. "' 'unsafe-inline' blob: ${allowedMediaDomains.join(" ")} ${allAppDomains.join(" ")}"
				.. ";font-src 'self' 'nonce-" .. nonce .. "' 'unsafe-inline' fonts.gstatic.com cdnjs.cloudflare.com"
				.. ";script-src 'self' 'nonce-" .. nonce .. "' 'unsafe-inline' fonts.gstatic.com ${allowedMediaDomains.join(" ")} ${allAppDomains.join(" ")} 'strict-dynamic' blob:"
				.. ";style-src 'self' 'nonce-" .. nonce .. "' 'unsafe-inline' ${allowedMediaDomains.join(" ")} fonts.googleapis.com cdnjs.cloudflare.com"
				.. ";connect-src 'self' ${allowedMediaDomains.join(" ")} ${allAppDomains.join(" ")} blob:"
				.. ";base-uri 'self'"
				.. ";object-src 'none'"
				.. ";child-src youtube.com www.youtube.com blob:"
			);
			${(process.env.IS_AZURE && canonicalDomain) ? `
				ngx.header["Strict-Transport-Security"] = "max-age=31536000";
			` : ''}
			ngx.print(html);
		}
	}

	# Show the 'site down' page.
	# 
	# Instructions:
	# 1. Uncomment the block below.
	# 2. Comment the location / { ... } block immediately above.
	# 3. Run 'openresty -t' to check for syntax errors.
	# 4. Run 'openresty -s reload'.
	#
	# Make sure you're editing the default.conf file! NOT the default.conf.template.js file.
	# 
	# location / {
	# 	try_files /site-down.html =404;
	# }

	# redirect server error pages to the static page /50x.html
	#
	error_page   500 502 503 504  /50x.html;
	location = /50x.html {
		root   /usr/share/nginx/html;
	}
}
`;

if (nonCanonicalDomains.length) {
	nginxConfigString += `
server {
	listen 80;
	server_name ${nonCanonicalDomains.join(" ")};

	return 301 https://${canonicalDomain}$request_uri;
}
	`;
}

process.stdout.write(nginxConfigString.trim() + '\n');
