import { FastifyPluginCallback } from 'fastify'

export type LyraOptions = {
  schema: object
  defaultLanguage: string
}

export const fastifyLyra: FastifyPluginCallback<LyraOptions>
