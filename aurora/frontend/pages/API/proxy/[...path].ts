import { NextApiRequest, NextApiResponse } from 'next';

export default async function proxy(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  
  // Convert the path array to a URL path string
  const pathString = Array.isArray(path) ? path.join('/') : (path as string);
  
  // Construct the backend URL
  const backendUrl = `https://aurora-backend-imys.onrender.com/${pathString}`;
  
  try {
    // Log the proxy request for debugging
    console.log(`Proxying ${req.method} request to: ${backendUrl}`);
    
    // Forward the request to the backend
    const response = await fetch(backendUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward any other headers from the original request
        ...(req.headers.authorization && { 'Authorization': req.headers.authorization }),
        ...(req.headers['x-api-key'] && { 'X-API-Key': req.headers['x-api-key'] }),
      },
      // Only include body for methods that typically have a body
      body: ['POST', 'PUT', 'PATCH'].includes(req.method) ? JSON.stringify(req.body) : undefined,
    });
    
    // Get the response data
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Forward the response with the same status code
    res.status(response.status).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Failed to proxy request to backend',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}
