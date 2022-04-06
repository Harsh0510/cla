local rrandom = (require "resty.random").bytes
local encodeBase64 = ngx.encode_base64

return function()
	return encodeBase64(rrandom(16))
end
