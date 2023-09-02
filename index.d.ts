import type { FastifyPluginCallback } from 'fastify'
import type { Document, Orama, ProvidedTypes, Results, SearchParams, create } from '@orama/orama'

interface OramaPersistence {
  restore: () => Promise<ReturnType<typeof create> | null>
  persist: (data: ReturnType<typeof create>) => Promise<any>
}

declare class PersistenceInMemory implements OramaPersistence {
  constructor(options?: {
    jsonIndex?: string,
  })
  restore: () => Promise<Promise<Orama<ProvidedTypes>> | null>
  persist: (data: Promise<Orama<ProvidedTypes>>) => Promise<string>
}

declare class PersistenceInFile implements OramaPersistence {
  constructor(options?: {
    filePath?: string,
    format?: string,
    mustExistOnStart?: boolean
  })
  restore: () => Promise<Promise<Orama<ProvidedTypes>> | null>
  persist: (data: Promise<Orama<ProvidedTypes>>) => Promise<string>
}

type OramaPluginOptions = {
  persistence?: OramaPersistence
} & Partial<Parameters<typeof create>[0]>

declare const fastifyOrama: FastifyPluginCallback<OramaPluginOptions>

declare module 'fastify' {
  interface FastifyInstance {
    orama: {
      insert: (document: Document) => Promise<string>,
      search: (params: SearchParams) => Promise<Results>,
      save?: () => Promise<any>,
    }
  }
}

export { fastifyOrama as default }
export {
  fastifyOrama,
  PersistenceInMemory,
  PersistenceInFile
}
