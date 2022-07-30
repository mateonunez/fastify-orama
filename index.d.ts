import { FastifyPluginCallback } from 'fastify'
import { Lyra, LyraProperties, PropertiesSchema } from '@nearform/lyra'
import { SearchParams } from '@nearform/lyra'

export type Language = typeof SUPPORTED_LANGUAGES

declare enum SUPPORTED_LANGUAGES {
  dutch = 'dutch',
  english = 'english',
  french = 'french',
  italian = 'italian',
  norwegian = 'norwegian',
  portugese = 'portuguese',
  russian = 'russian',
  spanish = 'spanish',
  swedish = 'swedish'
}

export type Nullable<T> = T | null

export type InsertConfig = {
  language: Language
}

export type ResolveTypes<TType> = TType extends 'string'
  ? string
  : TType extends 'boolean'
  ? boolean
  : TType extends 'number'
  ? number
  : TType extends PropertiesSchema
  ? { [P in keyof TType]: ResolveTypes<TType[P]> }
  : never

export type ResolveSchema<T extends PropertiesSchema> = {
  [P in keyof T]: ResolveTypes<T[P]>
}

export type SearchProperties<
  TSchema extends PropertiesSchema,
  TKey extends keyof TSchema = keyof TSchema
> = TKey extends string
  ? TSchema[TKey] extends PropertiesSchema
    ? `${TKey}.${SearchProperties<TSchema[TKey]>}`
    : TKey
  : never

export type SearchResult = {
  count: number
  hits: any[]
  elapsed: bigint
}

export type LyraInstance<T extends PropertiesSchema> = {
  lyra: Lyra<T>
  insert: (
    // lyra: Lyra<T>,
    doc: ResolveSchema<T>,
    config?: InsertConfig
  ) => {
    id: string
  }
  search(
    // lyra: Lyra<T>,
    params: SearchParams<T>,
    config?: InsertConfig
  ): SearchResult
}

declare const FastifyLyra: FastifyPluginCallback<LyraProperties<any>>

declare module 'fastify' {
  interface FastifyInstance {
    lyra: LyraInstance<PropertiesSchema>
  }
}

export default FastifyLyra
export { FastifyLyra }
