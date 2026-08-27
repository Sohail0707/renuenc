import {sanityClient} from 'sanity:client'
import {createImageUrlBuilder} from '@sanity/image-url'
import type {SanityImageSource} from '@sanity/image-url'

const builder = createImageUrlBuilder(sanityClient)

/**
 * A fixed-ratio, hotspot-aware crop of a Sanity image.
 *
 * Every image on a page-builder section is cropped to a set shape so that cards
 * and photo pairs line up regardless of what an editor uploads. Passing the
 * dimensions through the CDN also means the browser never downloads a 4000px
 * original to display it at 900. The crop respects the hotspot set with the crop
 * tool in the Studio, so that control does what the field description promises.
 */
export function croppedUrl(source: SanityImageSource, width: number, height: number) {
  return builder.image(source).width(width).height(height).fit('crop').auto('format').url()
}
