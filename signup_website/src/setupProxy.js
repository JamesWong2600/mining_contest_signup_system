const { createProxyMiddleware } = require('http-proxy-middleware');
//const config = require('./config.json');


module.exports = function (app) {
 const apiBaseUrl = process.env.REACT_APP_API_BASE_URL;
 console.log('API Base URL:', apiBaseUrl);
  app.use(
    '/api',
    createProxyMiddleware({
      target: apiBaseUrl,
      changeOrigin: true,
      secure: false,
      onProxyReq: (proxyReq, req, res) => {
        // Log all headers for debugging
        console.log('Request Headers:', req.headers);

        // Extract the client's IP address
        let clientIp =
          req.headers['x-forwarded-for'] || // Check if already forwarded by another proxy
          req.connection.remoteAddress || // Fallback to remoteAddress
          req.socket.remoteAddress;

        // Normalize IPv6 addresses (e.g., ::ffff:192.168.1.1 -> 192.168.1.1)
        if (clientIp && clientIp.startsWith('::ffff:')) {
          clientIp = clientIp.split(':').pop();
        }

        // Log the extracted client IP
        console.log('Extracted Client IP:', clientIp);

        // Set or append the X-Forwarded-For header
        if (clientIp) {
          const existingHeader = proxyReq.getHeader('X-Forwarded-For');
          proxyReq.setHeader(
            'X-Forwarded-For',
            existingHeader ? `${existingHeader}, ${clientIp}` : clientIp
          );
        }
      },
      onError: (err, req, res) => {
        console.error('Proxy error:', err);
      },
    })
  );
};