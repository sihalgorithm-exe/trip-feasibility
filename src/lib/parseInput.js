/**
 * parseInput.js
 * Normalizes trip+destination data coming in from either:
 *  - a base64-encoded JSON blob in a URL query param (?data=...)
 *  - a raw JSON object (e.g. posted from the main Wayfare app via
 *    window.postMessage, or fetched from the Spring Boot backend)
 */

/**
 * encodeTripPayload - helper the MAIN Wayfare app can use to build the URL
 * @param {object} payload - { trip, destinations }
 * @returns {string} URL-safe base64 string
 */
export function encodeTripPayload(payload) {
  const json = JSON.stringify(payload);
  const encoded = btoa(
    encodeURIComponent(json).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(parseInt(p1, 16))
    )
  );

  return encoded
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * decodeTripPayload
 * @param {string} encoded
 * @returns {object} parsed { trip, destinations }
 */
export function decodeTripPayload(encoded) {
  const normalized = encoded
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);

  const binary = atob(padded);

  const percentEncoded = Array.from(binary)
    .map((char) => {
      const code = char.charCodeAt(0).toString(16).padStart(2, '0');
      return `%${code}`;
    })
    .join('');

  const json = decodeURIComponent(percentEncoded);

  return JSON.parse(json);
}

/**
 * getTripPayloadFromUrl
 * Reads ?data=<base64> from the current URL.
 * @returns {object|null}
 */
export function getTripPayloadFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const data = params.get('data');
  if (!data) return null;
  try {
    return decodeTripPayload(data);
  } catch (err) {
    console.error('Failed to parse trip payload from URL', err);
    return null;
  }
}

/**
 * validateTripPayload
 * Basic shape validation before handing off to the feasibility engine.
 * @param {object} payload
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateTripPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      error: 'Payload missing or malformed.',
    };
  }

  const { trip, destinations } = payload;

  if (!trip || typeof trip !== 'object') {
    return {
      valid: false,
      error: 'Trip information is missing.',
    };
  }

  if (
    typeof trip.numberOfDays !== 'number' ||
    !Number.isFinite(trip.numberOfDays) ||
    trip.numberOfDays <= 0
  ) {
    return {
      valid: false,
      error: 'trip.numberOfDays must be a positive number.',
    };
  }

  if (
    typeof trip.hoursPerDay !== 'number' ||
    !Number.isFinite(trip.hoursPerDay) ||
    trip.hoursPerDay <= 0
  ) {
    return {
      valid: false,
      error: 'trip.hoursPerDay must be a positive number.',
    };
  }

  // totalBudget is entirely optional - only validated if present.
  if (
    trip.totalBudget !== undefined &&
    trip.totalBudget !== null &&
    (typeof trip.totalBudget !== 'number' || !Number.isFinite(trip.totalBudget) || trip.totalBudget < 0)
  ) {
    return {
      valid: false,
      error: 'trip.totalBudget must be a non-negative number if provided.',
    };
  }

  if (!Array.isArray(destinations) || destinations.length === 0) {
    return {
      valid: false,
      error: 'At least one destination is required.',
    };
  }

  for (const d of destinations) {
    if (!d || typeof d !== 'object') {
      return {
        valid: false,
        error: 'A destination in the payload is malformed.',
      };
    }

    if (!d.name || typeof d.name !== 'string') {
      return {
        valid: false,
        error: 'Every destination must have a name.',
      };
    }

    if (
      typeof d.latitude !== 'number' ||
      !Number.isFinite(d.latitude) ||
      d.latitude < -90 ||
      d.latitude > 90
    ) {
      return {
        valid: false,
        error: `Destination "${d.name}" has an invalid latitude.`,
      };
    }

    if (
      typeof d.longitude !== 'number' ||
      !Number.isFinite(d.longitude) ||
      d.longitude < -180 ||
      d.longitude > 180
    ) {
      return {
        valid: false,
        error: `Destination "${d.name}" has an invalid longitude.`,
      };
    }

    if (
      typeof d.visitDurationHours !== 'number' ||
      !Number.isFinite(d.visitDurationHours) ||
      d.visitDurationHours <= 0
    ) {
      return {
        valid: false,
        error: `Destination "${d.name}" has an invalid visit duration.`,
      };
    }
  }

  return { valid: true };
}