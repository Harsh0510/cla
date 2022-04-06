const env = Object.create(null);
env.stateSecret = process.env.OAUTH_HWB_STATE_SECRET;
env.clientId = process.env.OAUTH_HWB_CLIENT_ID;
env.clientSecret = process.env.OAUTH_HWB_CLIENT_SECRET;
env.redirectUri = process.env.OAUTH_HWB_REDIRECT_URI;
env.scope = process.env.OAUTH_HWB_SCOPE;
env.authorizeEndpoint = process.env.OAUTH_HWB_AUTHORIZE_ENDPOINT;
env.logoutEndpoint = process.env.OAUTH_HWB_LOGOUT_ENDPOINT;
env.tokenEndpoint = process.env.OAUTH_HWB_TOKEN_ENDPOINT;
env.idTokenSymmetricKey = process.env.OAUTH_HWB_ID_TOKEN_SYMMETRIC_KEY;

Object.freeze(env);

module.exports = env;
