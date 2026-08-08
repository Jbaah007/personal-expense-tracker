async function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return {};
  }

  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) {
    return {};
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim();

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

module.exports = getJsonBody;
