import type { FastifyPluginCallback } from 'fastify'
import type { Document, Orama, Results, SearchParams } from '@orama/orama'

type OramaInstance = {
  schema: Orama['schema'],
}

declare const FastifyOrama: FastifyPluginCallback<OramaInstance>

declare module 'fastify' {
  interface FastifyInstance {
    orama: OramaInstance & {
      insert: (document: Document) => Promise<string>,
      search: (params: SearchParams) => Promise<Results>
    }
  }
}

export default FastifyOrama
export { FastifyOrama }
