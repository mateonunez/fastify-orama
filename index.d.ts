import { FastifyPluginCallback } from 'fastify'
import { LyraProperties } from './dist/cjs/lyra'

export type LyraProperties = LyraProperties

declare const fastifyLyra: FastifyPluginCallback<LyraOptions>

export default fastifyLyra
export { fastifyLyra }
