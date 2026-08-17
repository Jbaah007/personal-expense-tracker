async function getJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    const trimmed = req.body.trim();
    if (!trimmed) {
      return {};
    }

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return {};
    }
  }

  if (Buffer.isBuffer(req.body)) {
    const trimmed = req.body.toString('utf8').trim();
    if (!trimmed) {
      return {};
    }

    try {
      return JSON.parse(trimmed);
    } catch (error) {
      return {};
    }
  }

  if (req.method !== 'POST' && req.method !== 'PUT') {
    return {};
  }

  if (!req || typeof req !== 'object' || !(Symbol.asyncIterator in req)) {
    return {};
  }

  const chunks = [];

  try {
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
  } catch (error) {
    return {};
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
