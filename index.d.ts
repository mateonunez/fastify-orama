import type { FastifyPluginCallback } from 'fastify'
import type { TypedDocument, insert, Orama, Results, SearchParams, create, AnyOrama, PartialSchemaDeep, Schema } from '@orama/orama'

interface FastifyOramaPersistence<T = any, O = any> {
  restore: () => Promise<Orama<T> | null>
  persist: (data: Orama<T>) => Promise<O>
}


declare class PersistenceInMemory<T = any, O = string | Buffer> implements FastifyOramaPersistence<T, O> {
  constructor(options?: {
    jsonIndex?: string,
  })
  restore: () => Promise<Orama<T> | null>
  persist: (data: Orama<T>) => Promise<O>
}

declare class PersistenceInFile<T = any, O = string> implements FastifyOramaPersistence<T, O> {
  constructor(options?: {
    filePath?: string,
    format?: string,
    mustExistOnStart?: boolean
  })
  restore: () => Promise<Orama<T> | null>
  persist: (data: Orama<T>) => Promise<O>
}

type FastifyOramaPluginOptions = {
  persistence?: FastifyOramaPersistence
} & Partial<Parameters<typeof create>[0]>

declare const fastifyOrama: FastifyPluginCallback<FastifyOramaPluginOptions>

declare module 'fastify' {
  interface FastifyInstance {
    getOrama<T>(): {
      insert: (document: PartialSchemaDeep<TypedDocument<Orama<T>>>) => Promise<string>,
      search: (params: SearchParams<Orama<Schema<T>>, T>) => Promise<Results<Schema<T>>>,
      persist?: () => Promise<any>,
    }
  }
}

export { fastifyOrama as default }
export {
  fastifyOrama,
  PersistenceInMemory,
  PersistenceInFile
}
