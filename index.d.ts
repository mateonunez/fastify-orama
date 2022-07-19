import { FastifyPluginCallback } from 'fastify'
import { Lyra, LyraProperties } from '@nearform/lyra'

export type { LyraProperties }

declare const fastifyLyra: FastifyPluginCallback<LyraProperties>

declare module 'fastify' {
  interface FastifyInstance {
    lyra: Lyra
  }
}

export default fastifyLyra
export { fastifyLyra }
