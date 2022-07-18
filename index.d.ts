import { FastifyPluginCallback } from 'fastify'
import { Lyra, LyraProperties } from './dist/cjs/lyra'

export type { LyraProperties }

declare const fastifyLyra: FastifyPluginCallback<LyraProperties>

declare module 'fastify' {
  interface FastifyInstance {
    lyra: Lyra
  }
}

export default fastifyLyra
export { fastifyLyra }
