import offlineAssets from '#offline-assets'

/**
 * Asset URLs. In the downloadable single-file edition every image is embedded as a data URI
 * (scripts/build-offline.mjs fills '#offline-assets'); on the website the map is empty and
 * the regular /media and /clients files are used.
 */
const embedded = offlineAssets as { media?: Record<string, string>, files?: Record<string, string> }

export const embeddedMedia = (id: string) => embedded.media?.[id]
export const assetUrl = (path: string) => embedded.files?.[path] ?? path
