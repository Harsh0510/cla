local function readAll(file)
	local f = assert(io.open(file, "rb"))
	local content = f:read("*a")
	f:close()
	return content
end

return function()
	return readAll("/var/www/index.html"):gsub(
		"<link([%s>])",
		"<link nonce=':::NONCE:::'%1"
	):gsub("<script([%s>])", "<script nonce=':::NONCE:::'%1")
end
