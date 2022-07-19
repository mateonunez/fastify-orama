import { FastifyPluginCallback } from 'fastify'
import { Lyra, LyraProperties } from '@nearform/lyra'

export type { LyraProperties }

declare const FastifyLyra: FastifyPluginCallback<LyraProperties>

declare module 'fastify' {
  interface FastifyInstance {
    lyra: Lyra
  }
}

export default FastifyLyra
export { FastifyLyra }
