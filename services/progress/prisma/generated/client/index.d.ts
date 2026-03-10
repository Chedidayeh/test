
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model ChildProfile
 * 
 */
export type ChildProfile = $Result.DefaultSelection<Prisma.$ChildProfilePayload>
/**
 * Model Progress
 * 
 */
export type Progress = $Result.DefaultSelection<Prisma.$ProgressPayload>
/**
 * Model GameSession
 * 
 */
export type GameSession = $Result.DefaultSelection<Prisma.$GameSessionPayload>
/**
 * Model SessionCheckpoint
 * 
 */
export type SessionCheckpoint = $Result.DefaultSelection<Prisma.$SessionCheckpointPayload>
/**
 * Model ChallengeAttempt
 * 
 */
export type ChallengeAttempt = $Result.DefaultSelection<Prisma.$ChallengeAttemptPayload>
/**
 * Model AttemptAction
 * 
 */
export type AttemptAction = $Result.DefaultSelection<Prisma.$AttemptActionPayload>
/**
 * Model StarEvent
 * 
 */
export type StarEvent = $Result.DefaultSelection<Prisma.$StarEventPayload>
/**
 * Model ChildBadge
 * 
 */
export type ChildBadge = $Result.DefaultSelection<Prisma.$ChildBadgePayload>

/**
 * Enums
 */
export namespace $Enums {
  export const ProgressStatus: {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED'
};

export type ProgressStatus = (typeof ProgressStatus)[keyof typeof ProgressStatus]


export const ChallengeStatus: {
  SOLVED: 'SOLVED',
  SKIPPED: 'SKIPPED',
  INCORRECT: 'INCORRECT',
  NOT_ATTEMPTED: 'NOT_ATTEMPTED'
};

export type ChallengeStatus = (typeof ChallengeStatus)[keyof typeof ChallengeStatus]

}

export type ProgressStatus = $Enums.ProgressStatus

export const ProgressStatus: typeof $Enums.ProgressStatus

export type ChallengeStatus = $Enums.ChallengeStatus

export const ChallengeStatus: typeof $Enums.ChallengeStatus

/**
 * ##  Prisma Client ʲˢ
 * 
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more ChildProfiles
 * const childProfiles = await prisma.childProfile.findMany()
 * ```
 *
 * 
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   * 
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more ChildProfiles
   * const childProfiles = await prisma.childProfile.findMany()
   * ```
   *
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): void;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb, ExtArgs>

      /**
   * `prisma.childProfile`: Exposes CRUD operations for the **ChildProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChildProfiles
    * const childProfiles = await prisma.childProfile.findMany()
    * ```
    */
  get childProfile(): Prisma.ChildProfileDelegate<ExtArgs>;

  /**
   * `prisma.progress`: Exposes CRUD operations for the **Progress** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Progresses
    * const progresses = await prisma.progress.findMany()
    * ```
    */
  get progress(): Prisma.ProgressDelegate<ExtArgs>;

  /**
   * `prisma.gameSession`: Exposes CRUD operations for the **GameSession** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more GameSessions
    * const gameSessions = await prisma.gameSession.findMany()
    * ```
    */
  get gameSession(): Prisma.GameSessionDelegate<ExtArgs>;

  /**
   * `prisma.sessionCheckpoint`: Exposes CRUD operations for the **SessionCheckpoint** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SessionCheckpoints
    * const sessionCheckpoints = await prisma.sessionCheckpoint.findMany()
    * ```
    */
  get sessionCheckpoint(): Prisma.SessionCheckpointDelegate<ExtArgs>;

  /**
   * `prisma.challengeAttempt`: Exposes CRUD operations for the **ChallengeAttempt** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChallengeAttempts
    * const challengeAttempts = await prisma.challengeAttempt.findMany()
    * ```
    */
  get challengeAttempt(): Prisma.ChallengeAttemptDelegate<ExtArgs>;

  /**
   * `prisma.attemptAction`: Exposes CRUD operations for the **AttemptAction** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more AttemptActions
    * const attemptActions = await prisma.attemptAction.findMany()
    * ```
    */
  get attemptAction(): Prisma.AttemptActionDelegate<ExtArgs>;

  /**
   * `prisma.starEvent`: Exposes CRUD operations for the **StarEvent** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StarEvents
    * const starEvents = await prisma.starEvent.findMany()
    * ```
    */
  get starEvent(): Prisma.StarEventDelegate<ExtArgs>;

  /**
   * `prisma.childBadge`: Exposes CRUD operations for the **ChildBadge** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more ChildBadges
    * const childBadges = await prisma.childBadge.findMany()
    * ```
    */
  get childBadge(): Prisma.ChildBadgeDelegate<ExtArgs>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError
  export import NotFoundError = runtime.NotFoundError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics 
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 5.22.0
   * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion 

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    * 
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    * 
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   * 
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? K : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    ChildProfile: 'ChildProfile',
    Progress: 'Progress',
    GameSession: 'GameSession',
    SessionCheckpoint: 'SessionCheckpoint',
    ChallengeAttempt: 'ChallengeAttempt',
    AttemptAction: 'AttemptAction',
    StarEvent: 'StarEvent',
    ChildBadge: 'ChildBadge'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb extends $Utils.Fn<{extArgs: $Extensions.InternalArgs, clientOptions: PrismaClientOptions }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], this['params']['clientOptions']>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, ClientOptions = {}> = {
    meta: {
      modelProps: "childProfile" | "progress" | "gameSession" | "sessionCheckpoint" | "challengeAttempt" | "attemptAction" | "starEvent" | "childBadge"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      ChildProfile: {
        payload: Prisma.$ChildProfilePayload<ExtArgs>
        fields: Prisma.ChildProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChildProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChildProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload>
          }
          findFirst: {
            args: Prisma.ChildProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChildProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload>
          }
          findMany: {
            args: Prisma.ChildProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload>[]
          }
          create: {
            args: Prisma.ChildProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload>
          }
          createMany: {
            args: Prisma.ChildProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChildProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload>[]
          }
          delete: {
            args: Prisma.ChildProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload>
          }
          update: {
            args: Prisma.ChildProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload>
          }
          deleteMany: {
            args: Prisma.ChildProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChildProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChildProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildProfilePayload>
          }
          aggregate: {
            args: Prisma.ChildProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChildProfile>
          }
          groupBy: {
            args: Prisma.ChildProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChildProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChildProfileCountArgs<ExtArgs>
            result: $Utils.Optional<ChildProfileCountAggregateOutputType> | number
          }
        }
      }
      Progress: {
        payload: Prisma.$ProgressPayload<ExtArgs>
        fields: Prisma.ProgressFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ProgressFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ProgressFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload>
          }
          findFirst: {
            args: Prisma.ProgressFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ProgressFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload>
          }
          findMany: {
            args: Prisma.ProgressFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload>[]
          }
          create: {
            args: Prisma.ProgressCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload>
          }
          createMany: {
            args: Prisma.ProgressCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ProgressCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload>[]
          }
          delete: {
            args: Prisma.ProgressDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload>
          }
          update: {
            args: Prisma.ProgressUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload>
          }
          deleteMany: {
            args: Prisma.ProgressDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ProgressUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ProgressUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ProgressPayload>
          }
          aggregate: {
            args: Prisma.ProgressAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateProgress>
          }
          groupBy: {
            args: Prisma.ProgressGroupByArgs<ExtArgs>
            result: $Utils.Optional<ProgressGroupByOutputType>[]
          }
          count: {
            args: Prisma.ProgressCountArgs<ExtArgs>
            result: $Utils.Optional<ProgressCountAggregateOutputType> | number
          }
        }
      }
      GameSession: {
        payload: Prisma.$GameSessionPayload<ExtArgs>
        fields: Prisma.GameSessionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.GameSessionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.GameSessionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          findFirst: {
            args: Prisma.GameSessionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.GameSessionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          findMany: {
            args: Prisma.GameSessionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>[]
          }
          create: {
            args: Prisma.GameSessionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          createMany: {
            args: Prisma.GameSessionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.GameSessionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>[]
          }
          delete: {
            args: Prisma.GameSessionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          update: {
            args: Prisma.GameSessionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          deleteMany: {
            args: Prisma.GameSessionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.GameSessionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.GameSessionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$GameSessionPayload>
          }
          aggregate: {
            args: Prisma.GameSessionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateGameSession>
          }
          groupBy: {
            args: Prisma.GameSessionGroupByArgs<ExtArgs>
            result: $Utils.Optional<GameSessionGroupByOutputType>[]
          }
          count: {
            args: Prisma.GameSessionCountArgs<ExtArgs>
            result: $Utils.Optional<GameSessionCountAggregateOutputType> | number
          }
        }
      }
      SessionCheckpoint: {
        payload: Prisma.$SessionCheckpointPayload<ExtArgs>
        fields: Prisma.SessionCheckpointFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SessionCheckpointFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SessionCheckpointFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload>
          }
          findFirst: {
            args: Prisma.SessionCheckpointFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SessionCheckpointFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload>
          }
          findMany: {
            args: Prisma.SessionCheckpointFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload>[]
          }
          create: {
            args: Prisma.SessionCheckpointCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload>
          }
          createMany: {
            args: Prisma.SessionCheckpointCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SessionCheckpointCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload>[]
          }
          delete: {
            args: Prisma.SessionCheckpointDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload>
          }
          update: {
            args: Prisma.SessionCheckpointUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload>
          }
          deleteMany: {
            args: Prisma.SessionCheckpointDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SessionCheckpointUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.SessionCheckpointUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SessionCheckpointPayload>
          }
          aggregate: {
            args: Prisma.SessionCheckpointAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSessionCheckpoint>
          }
          groupBy: {
            args: Prisma.SessionCheckpointGroupByArgs<ExtArgs>
            result: $Utils.Optional<SessionCheckpointGroupByOutputType>[]
          }
          count: {
            args: Prisma.SessionCheckpointCountArgs<ExtArgs>
            result: $Utils.Optional<SessionCheckpointCountAggregateOutputType> | number
          }
        }
      }
      ChallengeAttempt: {
        payload: Prisma.$ChallengeAttemptPayload<ExtArgs>
        fields: Prisma.ChallengeAttemptFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChallengeAttemptFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChallengeAttemptFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload>
          }
          findFirst: {
            args: Prisma.ChallengeAttemptFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChallengeAttemptFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload>
          }
          findMany: {
            args: Prisma.ChallengeAttemptFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload>[]
          }
          create: {
            args: Prisma.ChallengeAttemptCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload>
          }
          createMany: {
            args: Prisma.ChallengeAttemptCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChallengeAttemptCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload>[]
          }
          delete: {
            args: Prisma.ChallengeAttemptDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload>
          }
          update: {
            args: Prisma.ChallengeAttemptUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload>
          }
          deleteMany: {
            args: Prisma.ChallengeAttemptDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChallengeAttemptUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChallengeAttemptUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChallengeAttemptPayload>
          }
          aggregate: {
            args: Prisma.ChallengeAttemptAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChallengeAttempt>
          }
          groupBy: {
            args: Prisma.ChallengeAttemptGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChallengeAttemptGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChallengeAttemptCountArgs<ExtArgs>
            result: $Utils.Optional<ChallengeAttemptCountAggregateOutputType> | number
          }
        }
      }
      AttemptAction: {
        payload: Prisma.$AttemptActionPayload<ExtArgs>
        fields: Prisma.AttemptActionFieldRefs
        operations: {
          findUnique: {
            args: Prisma.AttemptActionFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.AttemptActionFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload>
          }
          findFirst: {
            args: Prisma.AttemptActionFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.AttemptActionFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload>
          }
          findMany: {
            args: Prisma.AttemptActionFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload>[]
          }
          create: {
            args: Prisma.AttemptActionCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload>
          }
          createMany: {
            args: Prisma.AttemptActionCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.AttemptActionCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload>[]
          }
          delete: {
            args: Prisma.AttemptActionDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload>
          }
          update: {
            args: Prisma.AttemptActionUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload>
          }
          deleteMany: {
            args: Prisma.AttemptActionDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.AttemptActionUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.AttemptActionUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$AttemptActionPayload>
          }
          aggregate: {
            args: Prisma.AttemptActionAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateAttemptAction>
          }
          groupBy: {
            args: Prisma.AttemptActionGroupByArgs<ExtArgs>
            result: $Utils.Optional<AttemptActionGroupByOutputType>[]
          }
          count: {
            args: Prisma.AttemptActionCountArgs<ExtArgs>
            result: $Utils.Optional<AttemptActionCountAggregateOutputType> | number
          }
        }
      }
      StarEvent: {
        payload: Prisma.$StarEventPayload<ExtArgs>
        fields: Prisma.StarEventFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StarEventFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StarEventFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload>
          }
          findFirst: {
            args: Prisma.StarEventFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StarEventFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload>
          }
          findMany: {
            args: Prisma.StarEventFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload>[]
          }
          create: {
            args: Prisma.StarEventCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload>
          }
          createMany: {
            args: Prisma.StarEventCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StarEventCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload>[]
          }
          delete: {
            args: Prisma.StarEventDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload>
          }
          update: {
            args: Prisma.StarEventUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload>
          }
          deleteMany: {
            args: Prisma.StarEventDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StarEventUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.StarEventUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StarEventPayload>
          }
          aggregate: {
            args: Prisma.StarEventAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStarEvent>
          }
          groupBy: {
            args: Prisma.StarEventGroupByArgs<ExtArgs>
            result: $Utils.Optional<StarEventGroupByOutputType>[]
          }
          count: {
            args: Prisma.StarEventCountArgs<ExtArgs>
            result: $Utils.Optional<StarEventCountAggregateOutputType> | number
          }
        }
      }
      ChildBadge: {
        payload: Prisma.$ChildBadgePayload<ExtArgs>
        fields: Prisma.ChildBadgeFieldRefs
        operations: {
          findUnique: {
            args: Prisma.ChildBadgeFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.ChildBadgeFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload>
          }
          findFirst: {
            args: Prisma.ChildBadgeFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.ChildBadgeFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload>
          }
          findMany: {
            args: Prisma.ChildBadgeFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload>[]
          }
          create: {
            args: Prisma.ChildBadgeCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload>
          }
          createMany: {
            args: Prisma.ChildBadgeCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.ChildBadgeCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload>[]
          }
          delete: {
            args: Prisma.ChildBadgeDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload>
          }
          update: {
            args: Prisma.ChildBadgeUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload>
          }
          deleteMany: {
            args: Prisma.ChildBadgeDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.ChildBadgeUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          upsert: {
            args: Prisma.ChildBadgeUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$ChildBadgePayload>
          }
          aggregate: {
            args: Prisma.ChildBadgeAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateChildBadge>
          }
          groupBy: {
            args: Prisma.ChildBadgeGroupByArgs<ExtArgs>
            result: $Utils.Optional<ChildBadgeGroupByOutputType>[]
          }
          count: {
            args: Prisma.ChildBadgeCountArgs<ExtArgs>
            result: $Utils.Optional<ChildBadgeCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
  }


  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type ChildProfileCountOutputType
   */

  export type ChildProfileCountOutputType = {
    progress: number
    badges: number
  }

  export type ChildProfileCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | ChildProfileCountOutputTypeCountProgressArgs
    badges?: boolean | ChildProfileCountOutputTypeCountBadgesArgs
  }

  // Custom InputTypes
  /**
   * ChildProfileCountOutputType without action
   */
  export type ChildProfileCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfileCountOutputType
     */
    select?: ChildProfileCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ChildProfileCountOutputType without action
   */
  export type ChildProfileCountOutputTypeCountProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProgressWhereInput
  }

  /**
   * ChildProfileCountOutputType without action
   */
  export type ChildProfileCountOutputTypeCountBadgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChildBadgeWhereInput
  }


  /**
   * Count Type GameSessionCountOutputType
   */

  export type GameSessionCountOutputType = {
    challengeAttempts: number
    checkpoints: number
  }

  export type GameSessionCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    challengeAttempts?: boolean | GameSessionCountOutputTypeCountChallengeAttemptsArgs
    checkpoints?: boolean | GameSessionCountOutputTypeCountCheckpointsArgs
  }

  // Custom InputTypes
  /**
   * GameSessionCountOutputType without action
   */
  export type GameSessionCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSessionCountOutputType
     */
    select?: GameSessionCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * GameSessionCountOutputType without action
   */
  export type GameSessionCountOutputTypeCountChallengeAttemptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChallengeAttemptWhereInput
  }

  /**
   * GameSessionCountOutputType without action
   */
  export type GameSessionCountOutputTypeCountCheckpointsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionCheckpointWhereInput
  }


  /**
   * Count Type ChallengeAttemptCountOutputType
   */

  export type ChallengeAttemptCountOutputType = {
    actions: number
  }

  export type ChallengeAttemptCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    actions?: boolean | ChallengeAttemptCountOutputTypeCountActionsArgs
  }

  // Custom InputTypes
  /**
   * ChallengeAttemptCountOutputType without action
   */
  export type ChallengeAttemptCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttemptCountOutputType
     */
    select?: ChallengeAttemptCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * ChallengeAttemptCountOutputType without action
   */
  export type ChallengeAttemptCountOutputTypeCountActionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttemptActionWhereInput
  }


  /**
   * Models
   */

  /**
   * Model ChildProfile
   */

  export type AggregateChildProfile = {
    _count: ChildProfileCountAggregateOutputType | null
    _avg: ChildProfileAvgAggregateOutputType | null
    _sum: ChildProfileSumAggregateOutputType | null
    _min: ChildProfileMinAggregateOutputType | null
    _max: ChildProfileMaxAggregateOutputType | null
  }

  export type ChildProfileAvgAggregateOutputType = {
    currentLevel: number | null
    totalStars: number | null
  }

  export type ChildProfileSumAggregateOutputType = {
    currentLevel: number | null
    totalStars: number | null
  }

  export type ChildProfileMinAggregateOutputType = {
    id: string | null
    name: string | null
    parentId: string | null
    childId: string | null
    ageGroupId: string | null
    ageGroupName: string | null
    currentLevel: number | null
    totalStars: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChildProfileMaxAggregateOutputType = {
    id: string | null
    name: string | null
    parentId: string | null
    childId: string | null
    ageGroupId: string | null
    ageGroupName: string | null
    currentLevel: number | null
    totalStars: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChildProfileCountAggregateOutputType = {
    id: number
    name: number
    parentId: number
    childId: number
    ageGroupId: number
    ageGroupName: number
    favoriteThemes: number
    allocatedRoadmaps: number
    currentLevel: number
    totalStars: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChildProfileAvgAggregateInputType = {
    currentLevel?: true
    totalStars?: true
  }

  export type ChildProfileSumAggregateInputType = {
    currentLevel?: true
    totalStars?: true
  }

  export type ChildProfileMinAggregateInputType = {
    id?: true
    name?: true
    parentId?: true
    childId?: true
    ageGroupId?: true
    ageGroupName?: true
    currentLevel?: true
    totalStars?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChildProfileMaxAggregateInputType = {
    id?: true
    name?: true
    parentId?: true
    childId?: true
    ageGroupId?: true
    ageGroupName?: true
    currentLevel?: true
    totalStars?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChildProfileCountAggregateInputType = {
    id?: true
    name?: true
    parentId?: true
    childId?: true
    ageGroupId?: true
    ageGroupName?: true
    favoriteThemes?: true
    allocatedRoadmaps?: true
    currentLevel?: true
    totalStars?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChildProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChildProfile to aggregate.
     */
    where?: ChildProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChildProfiles to fetch.
     */
    orderBy?: ChildProfileOrderByWithRelationInput | ChildProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChildProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChildProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChildProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChildProfiles
    **/
    _count?: true | ChildProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChildProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChildProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChildProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChildProfileMaxAggregateInputType
  }

  export type GetChildProfileAggregateType<T extends ChildProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateChildProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChildProfile[P]>
      : GetScalarType<T[P], AggregateChildProfile[P]>
  }




  export type ChildProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChildProfileWhereInput
    orderBy?: ChildProfileOrderByWithAggregationInput | ChildProfileOrderByWithAggregationInput[]
    by: ChildProfileScalarFieldEnum[] | ChildProfileScalarFieldEnum
    having?: ChildProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChildProfileCountAggregateInputType | true
    _avg?: ChildProfileAvgAggregateInputType
    _sum?: ChildProfileSumAggregateInputType
    _min?: ChildProfileMinAggregateInputType
    _max?: ChildProfileMaxAggregateInputType
  }

  export type ChildProfileGroupByOutputType = {
    id: string
    name: string
    parentId: string
    childId: string
    ageGroupId: string
    ageGroupName: string | null
    favoriteThemes: string[]
    allocatedRoadmaps: string[]
    currentLevel: number
    totalStars: number
    createdAt: Date
    updatedAt: Date
    _count: ChildProfileCountAggregateOutputType | null
    _avg: ChildProfileAvgAggregateOutputType | null
    _sum: ChildProfileSumAggregateOutputType | null
    _min: ChildProfileMinAggregateOutputType | null
    _max: ChildProfileMaxAggregateOutputType | null
  }

  type GetChildProfileGroupByPayload<T extends ChildProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChildProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChildProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChildProfileGroupByOutputType[P]>
            : GetScalarType<T[P], ChildProfileGroupByOutputType[P]>
        }
      >
    >


  export type ChildProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    parentId?: boolean
    childId?: boolean
    ageGroupId?: boolean
    ageGroupName?: boolean
    favoriteThemes?: boolean
    allocatedRoadmaps?: boolean
    currentLevel?: boolean
    totalStars?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    progress?: boolean | ChildProfile$progressArgs<ExtArgs>
    badges?: boolean | ChildProfile$badgesArgs<ExtArgs>
    _count?: boolean | ChildProfileCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["childProfile"]>

  export type ChildProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    parentId?: boolean
    childId?: boolean
    ageGroupId?: boolean
    ageGroupName?: boolean
    favoriteThemes?: boolean
    allocatedRoadmaps?: boolean
    currentLevel?: boolean
    totalStars?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["childProfile"]>

  export type ChildProfileSelectScalar = {
    id?: boolean
    name?: boolean
    parentId?: boolean
    childId?: boolean
    ageGroupId?: boolean
    ageGroupName?: boolean
    favoriteThemes?: boolean
    allocatedRoadmaps?: boolean
    currentLevel?: boolean
    totalStars?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ChildProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | ChildProfile$progressArgs<ExtArgs>
    badges?: boolean | ChildProfile$badgesArgs<ExtArgs>
    _count?: boolean | ChildProfileCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ChildProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $ChildProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChildProfile"
    objects: {
      progress: Prisma.$ProgressPayload<ExtArgs>[]
      badges: Prisma.$ChildBadgePayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      parentId: string
      childId: string
      ageGroupId: string
      ageGroupName: string | null
      favoriteThemes: string[]
      allocatedRoadmaps: string[]
      currentLevel: number
      totalStars: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["childProfile"]>
    composites: {}
  }

  type ChildProfileGetPayload<S extends boolean | null | undefined | ChildProfileDefaultArgs> = $Result.GetResult<Prisma.$ChildProfilePayload, S>

  type ChildProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ChildProfileFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ChildProfileCountAggregateInputType | true
    }

  export interface ChildProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChildProfile'], meta: { name: 'ChildProfile' } }
    /**
     * Find zero or one ChildProfile that matches the filter.
     * @param {ChildProfileFindUniqueArgs} args - Arguments to find a ChildProfile
     * @example
     * // Get one ChildProfile
     * const childProfile = await prisma.childProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChildProfileFindUniqueArgs>(args: SelectSubset<T, ChildProfileFindUniqueArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ChildProfile that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ChildProfileFindUniqueOrThrowArgs} args - Arguments to find a ChildProfile
     * @example
     * // Get one ChildProfile
     * const childProfile = await prisma.childProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChildProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, ChildProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ChildProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildProfileFindFirstArgs} args - Arguments to find a ChildProfile
     * @example
     * // Get one ChildProfile
     * const childProfile = await prisma.childProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChildProfileFindFirstArgs>(args?: SelectSubset<T, ChildProfileFindFirstArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ChildProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildProfileFindFirstOrThrowArgs} args - Arguments to find a ChildProfile
     * @example
     * // Get one ChildProfile
     * const childProfile = await prisma.childProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChildProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, ChildProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ChildProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChildProfiles
     * const childProfiles = await prisma.childProfile.findMany()
     * 
     * // Get first 10 ChildProfiles
     * const childProfiles = await prisma.childProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const childProfileWithIdOnly = await prisma.childProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChildProfileFindManyArgs>(args?: SelectSubset<T, ChildProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ChildProfile.
     * @param {ChildProfileCreateArgs} args - Arguments to create a ChildProfile.
     * @example
     * // Create one ChildProfile
     * const ChildProfile = await prisma.childProfile.create({
     *   data: {
     *     // ... data to create a ChildProfile
     *   }
     * })
     * 
     */
    create<T extends ChildProfileCreateArgs>(args: SelectSubset<T, ChildProfileCreateArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ChildProfiles.
     * @param {ChildProfileCreateManyArgs} args - Arguments to create many ChildProfiles.
     * @example
     * // Create many ChildProfiles
     * const childProfile = await prisma.childProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChildProfileCreateManyArgs>(args?: SelectSubset<T, ChildProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChildProfiles and returns the data saved in the database.
     * @param {ChildProfileCreateManyAndReturnArgs} args - Arguments to create many ChildProfiles.
     * @example
     * // Create many ChildProfiles
     * const childProfile = await prisma.childProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChildProfiles and only return the `id`
     * const childProfileWithIdOnly = await prisma.childProfile.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChildProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, ChildProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ChildProfile.
     * @param {ChildProfileDeleteArgs} args - Arguments to delete one ChildProfile.
     * @example
     * // Delete one ChildProfile
     * const ChildProfile = await prisma.childProfile.delete({
     *   where: {
     *     // ... filter to delete one ChildProfile
     *   }
     * })
     * 
     */
    delete<T extends ChildProfileDeleteArgs>(args: SelectSubset<T, ChildProfileDeleteArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ChildProfile.
     * @param {ChildProfileUpdateArgs} args - Arguments to update one ChildProfile.
     * @example
     * // Update one ChildProfile
     * const childProfile = await prisma.childProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChildProfileUpdateArgs>(args: SelectSubset<T, ChildProfileUpdateArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ChildProfiles.
     * @param {ChildProfileDeleteManyArgs} args - Arguments to filter ChildProfiles to delete.
     * @example
     * // Delete a few ChildProfiles
     * const { count } = await prisma.childProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChildProfileDeleteManyArgs>(args?: SelectSubset<T, ChildProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChildProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChildProfiles
     * const childProfile = await prisma.childProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChildProfileUpdateManyArgs>(args: SelectSubset<T, ChildProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChildProfile.
     * @param {ChildProfileUpsertArgs} args - Arguments to update or create a ChildProfile.
     * @example
     * // Update or create a ChildProfile
     * const childProfile = await prisma.childProfile.upsert({
     *   create: {
     *     // ... data to create a ChildProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChildProfile we want to update
     *   }
     * })
     */
    upsert<T extends ChildProfileUpsertArgs>(args: SelectSubset<T, ChildProfileUpsertArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ChildProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildProfileCountArgs} args - Arguments to filter ChildProfiles to count.
     * @example
     * // Count the number of ChildProfiles
     * const count = await prisma.childProfile.count({
     *   where: {
     *     // ... the filter for the ChildProfiles we want to count
     *   }
     * })
    **/
    count<T extends ChildProfileCountArgs>(
      args?: Subset<T, ChildProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChildProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChildProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChildProfileAggregateArgs>(args: Subset<T, ChildProfileAggregateArgs>): Prisma.PrismaPromise<GetChildProfileAggregateType<T>>

    /**
     * Group by ChildProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChildProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChildProfileGroupByArgs['orderBy'] }
        : { orderBy?: ChildProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChildProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChildProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChildProfile model
   */
  readonly fields: ChildProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChildProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChildProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    progress<T extends ChildProfile$progressArgs<ExtArgs> = {}>(args?: Subset<T, ChildProfile$progressArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "findMany"> | Null>
    badges<T extends ChildProfile$badgesArgs<ExtArgs> = {}>(args?: Subset<T, ChildProfile$badgesArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChildProfile model
   */ 
  interface ChildProfileFieldRefs {
    readonly id: FieldRef<"ChildProfile", 'String'>
    readonly name: FieldRef<"ChildProfile", 'String'>
    readonly parentId: FieldRef<"ChildProfile", 'String'>
    readonly childId: FieldRef<"ChildProfile", 'String'>
    readonly ageGroupId: FieldRef<"ChildProfile", 'String'>
    readonly ageGroupName: FieldRef<"ChildProfile", 'String'>
    readonly favoriteThemes: FieldRef<"ChildProfile", 'String[]'>
    readonly allocatedRoadmaps: FieldRef<"ChildProfile", 'String[]'>
    readonly currentLevel: FieldRef<"ChildProfile", 'Int'>
    readonly totalStars: FieldRef<"ChildProfile", 'Int'>
    readonly createdAt: FieldRef<"ChildProfile", 'DateTime'>
    readonly updatedAt: FieldRef<"ChildProfile", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChildProfile findUnique
   */
  export type ChildProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * Filter, which ChildProfile to fetch.
     */
    where: ChildProfileWhereUniqueInput
  }

  /**
   * ChildProfile findUniqueOrThrow
   */
  export type ChildProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * Filter, which ChildProfile to fetch.
     */
    where: ChildProfileWhereUniqueInput
  }

  /**
   * ChildProfile findFirst
   */
  export type ChildProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * Filter, which ChildProfile to fetch.
     */
    where?: ChildProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChildProfiles to fetch.
     */
    orderBy?: ChildProfileOrderByWithRelationInput | ChildProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChildProfiles.
     */
    cursor?: ChildProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChildProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChildProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChildProfiles.
     */
    distinct?: ChildProfileScalarFieldEnum | ChildProfileScalarFieldEnum[]
  }

  /**
   * ChildProfile findFirstOrThrow
   */
  export type ChildProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * Filter, which ChildProfile to fetch.
     */
    where?: ChildProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChildProfiles to fetch.
     */
    orderBy?: ChildProfileOrderByWithRelationInput | ChildProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChildProfiles.
     */
    cursor?: ChildProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChildProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChildProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChildProfiles.
     */
    distinct?: ChildProfileScalarFieldEnum | ChildProfileScalarFieldEnum[]
  }

  /**
   * ChildProfile findMany
   */
  export type ChildProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * Filter, which ChildProfiles to fetch.
     */
    where?: ChildProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChildProfiles to fetch.
     */
    orderBy?: ChildProfileOrderByWithRelationInput | ChildProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChildProfiles.
     */
    cursor?: ChildProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChildProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChildProfiles.
     */
    skip?: number
    distinct?: ChildProfileScalarFieldEnum | ChildProfileScalarFieldEnum[]
  }

  /**
   * ChildProfile create
   */
  export type ChildProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a ChildProfile.
     */
    data: XOR<ChildProfileCreateInput, ChildProfileUncheckedCreateInput>
  }

  /**
   * ChildProfile createMany
   */
  export type ChildProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChildProfiles.
     */
    data: ChildProfileCreateManyInput | ChildProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChildProfile createManyAndReturn
   */
  export type ChildProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ChildProfiles.
     */
    data: ChildProfileCreateManyInput | ChildProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChildProfile update
   */
  export type ChildProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a ChildProfile.
     */
    data: XOR<ChildProfileUpdateInput, ChildProfileUncheckedUpdateInput>
    /**
     * Choose, which ChildProfile to update.
     */
    where: ChildProfileWhereUniqueInput
  }

  /**
   * ChildProfile updateMany
   */
  export type ChildProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChildProfiles.
     */
    data: XOR<ChildProfileUpdateManyMutationInput, ChildProfileUncheckedUpdateManyInput>
    /**
     * Filter which ChildProfiles to update
     */
    where?: ChildProfileWhereInput
  }

  /**
   * ChildProfile upsert
   */
  export type ChildProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the ChildProfile to update in case it exists.
     */
    where: ChildProfileWhereUniqueInput
    /**
     * In case the ChildProfile found by the `where` argument doesn't exist, create a new ChildProfile with this data.
     */
    create: XOR<ChildProfileCreateInput, ChildProfileUncheckedCreateInput>
    /**
     * In case the ChildProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChildProfileUpdateInput, ChildProfileUncheckedUpdateInput>
  }

  /**
   * ChildProfile delete
   */
  export type ChildProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
    /**
     * Filter which ChildProfile to delete.
     */
    where: ChildProfileWhereUniqueInput
  }

  /**
   * ChildProfile deleteMany
   */
  export type ChildProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChildProfiles to delete
     */
    where?: ChildProfileWhereInput
  }

  /**
   * ChildProfile.progress
   */
  export type ChildProfile$progressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    where?: ProgressWhereInput
    orderBy?: ProgressOrderByWithRelationInput | ProgressOrderByWithRelationInput[]
    cursor?: ProgressWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ProgressScalarFieldEnum | ProgressScalarFieldEnum[]
  }

  /**
   * ChildProfile.badges
   */
  export type ChildProfile$badgesArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    where?: ChildBadgeWhereInput
    orderBy?: ChildBadgeOrderByWithRelationInput | ChildBadgeOrderByWithRelationInput[]
    cursor?: ChildBadgeWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChildBadgeScalarFieldEnum | ChildBadgeScalarFieldEnum[]
  }

  /**
   * ChildProfile without action
   */
  export type ChildProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildProfile
     */
    select?: ChildProfileSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildProfileInclude<ExtArgs> | null
  }


  /**
   * Model Progress
   */

  export type AggregateProgress = {
    _count: ProgressCountAggregateOutputType | null
    _avg: ProgressAvgAggregateOutputType | null
    _sum: ProgressSumAggregateOutputType | null
    _min: ProgressMinAggregateOutputType | null
    _max: ProgressMaxAggregateOutputType | null
  }

  export type ProgressAvgAggregateOutputType = {
    totalTimeSpent: number | null
  }

  export type ProgressSumAggregateOutputType = {
    totalTimeSpent: number | null
  }

  export type ProgressMinAggregateOutputType = {
    id: string | null
    childProfileId: string | null
    roadmapId: string | null
    worldId: string | null
    storyId: string | null
    status: $Enums.ProgressStatus | null
    totalTimeSpent: number | null
    completedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProgressMaxAggregateOutputType = {
    id: string | null
    childProfileId: string | null
    roadmapId: string | null
    worldId: string | null
    storyId: string | null
    status: $Enums.ProgressStatus | null
    totalTimeSpent: number | null
    completedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ProgressCountAggregateOutputType = {
    id: number
    childProfileId: number
    roadmapId: number
    worldId: number
    storyId: number
    status: number
    totalTimeSpent: number
    completedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ProgressAvgAggregateInputType = {
    totalTimeSpent?: true
  }

  export type ProgressSumAggregateInputType = {
    totalTimeSpent?: true
  }

  export type ProgressMinAggregateInputType = {
    id?: true
    childProfileId?: true
    roadmapId?: true
    worldId?: true
    storyId?: true
    status?: true
    totalTimeSpent?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProgressMaxAggregateInputType = {
    id?: true
    childProfileId?: true
    roadmapId?: true
    worldId?: true
    storyId?: true
    status?: true
    totalTimeSpent?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ProgressCountAggregateInputType = {
    id?: true
    childProfileId?: true
    roadmapId?: true
    worldId?: true
    storyId?: true
    status?: true
    totalTimeSpent?: true
    completedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ProgressAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Progress to aggregate.
     */
    where?: ProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Progresses to fetch.
     */
    orderBy?: ProgressOrderByWithRelationInput | ProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Progresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Progresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Progresses
    **/
    _count?: true | ProgressCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ProgressAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ProgressSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ProgressMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ProgressMaxAggregateInputType
  }

  export type GetProgressAggregateType<T extends ProgressAggregateArgs> = {
        [P in keyof T & keyof AggregateProgress]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateProgress[P]>
      : GetScalarType<T[P], AggregateProgress[P]>
  }




  export type ProgressGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ProgressWhereInput
    orderBy?: ProgressOrderByWithAggregationInput | ProgressOrderByWithAggregationInput[]
    by: ProgressScalarFieldEnum[] | ProgressScalarFieldEnum
    having?: ProgressScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ProgressCountAggregateInputType | true
    _avg?: ProgressAvgAggregateInputType
    _sum?: ProgressSumAggregateInputType
    _min?: ProgressMinAggregateInputType
    _max?: ProgressMaxAggregateInputType
  }

  export type ProgressGroupByOutputType = {
    id: string
    childProfileId: string
    roadmapId: string
    worldId: string
    storyId: string
    status: $Enums.ProgressStatus
    totalTimeSpent: number
    completedAt: Date | null
    createdAt: Date
    updatedAt: Date
    _count: ProgressCountAggregateOutputType | null
    _avg: ProgressAvgAggregateOutputType | null
    _sum: ProgressSumAggregateOutputType | null
    _min: ProgressMinAggregateOutputType | null
    _max: ProgressMaxAggregateOutputType | null
  }

  type GetProgressGroupByPayload<T extends ProgressGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ProgressGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ProgressGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ProgressGroupByOutputType[P]>
            : GetScalarType<T[P], ProgressGroupByOutputType[P]>
        }
      >
    >


  export type ProgressSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    childProfileId?: boolean
    roadmapId?: boolean
    worldId?: boolean
    storyId?: boolean
    status?: boolean
    totalTimeSpent?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    childProfile?: boolean | ChildProfileDefaultArgs<ExtArgs>
    gameSession?: boolean | Progress$gameSessionArgs<ExtArgs>
  }, ExtArgs["result"]["progress"]>

  export type ProgressSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    childProfileId?: boolean
    roadmapId?: boolean
    worldId?: boolean
    storyId?: boolean
    status?: boolean
    totalTimeSpent?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    childProfile?: boolean | ChildProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["progress"]>

  export type ProgressSelectScalar = {
    id?: boolean
    childProfileId?: boolean
    roadmapId?: boolean
    worldId?: boolean
    storyId?: boolean
    status?: boolean
    totalTimeSpent?: boolean
    completedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ProgressInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    childProfile?: boolean | ChildProfileDefaultArgs<ExtArgs>
    gameSession?: boolean | Progress$gameSessionArgs<ExtArgs>
  }
  export type ProgressIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    childProfile?: boolean | ChildProfileDefaultArgs<ExtArgs>
  }

  export type $ProgressPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Progress"
    objects: {
      childProfile: Prisma.$ChildProfilePayload<ExtArgs>
      gameSession: Prisma.$GameSessionPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      childProfileId: string
      roadmapId: string
      worldId: string
      storyId: string
      status: $Enums.ProgressStatus
      totalTimeSpent: number
      completedAt: Date | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["progress"]>
    composites: {}
  }

  type ProgressGetPayload<S extends boolean | null | undefined | ProgressDefaultArgs> = $Result.GetResult<Prisma.$ProgressPayload, S>

  type ProgressCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ProgressFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ProgressCountAggregateInputType | true
    }

  export interface ProgressDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Progress'], meta: { name: 'Progress' } }
    /**
     * Find zero or one Progress that matches the filter.
     * @param {ProgressFindUniqueArgs} args - Arguments to find a Progress
     * @example
     * // Get one Progress
     * const progress = await prisma.progress.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ProgressFindUniqueArgs>(args: SelectSubset<T, ProgressFindUniqueArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one Progress that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ProgressFindUniqueOrThrowArgs} args - Arguments to find a Progress
     * @example
     * // Get one Progress
     * const progress = await prisma.progress.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ProgressFindUniqueOrThrowArgs>(args: SelectSubset<T, ProgressFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first Progress that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgressFindFirstArgs} args - Arguments to find a Progress
     * @example
     * // Get one Progress
     * const progress = await prisma.progress.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ProgressFindFirstArgs>(args?: SelectSubset<T, ProgressFindFirstArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first Progress that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgressFindFirstOrThrowArgs} args - Arguments to find a Progress
     * @example
     * // Get one Progress
     * const progress = await prisma.progress.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ProgressFindFirstOrThrowArgs>(args?: SelectSubset<T, ProgressFindFirstOrThrowArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more Progresses that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgressFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Progresses
     * const progresses = await prisma.progress.findMany()
     * 
     * // Get first 10 Progresses
     * const progresses = await prisma.progress.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const progressWithIdOnly = await prisma.progress.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ProgressFindManyArgs>(args?: SelectSubset<T, ProgressFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a Progress.
     * @param {ProgressCreateArgs} args - Arguments to create a Progress.
     * @example
     * // Create one Progress
     * const Progress = await prisma.progress.create({
     *   data: {
     *     // ... data to create a Progress
     *   }
     * })
     * 
     */
    create<T extends ProgressCreateArgs>(args: SelectSubset<T, ProgressCreateArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many Progresses.
     * @param {ProgressCreateManyArgs} args - Arguments to create many Progresses.
     * @example
     * // Create many Progresses
     * const progress = await prisma.progress.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ProgressCreateManyArgs>(args?: SelectSubset<T, ProgressCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Progresses and returns the data saved in the database.
     * @param {ProgressCreateManyAndReturnArgs} args - Arguments to create many Progresses.
     * @example
     * // Create many Progresses
     * const progress = await prisma.progress.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Progresses and only return the `id`
     * const progressWithIdOnly = await prisma.progress.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ProgressCreateManyAndReturnArgs>(args?: SelectSubset<T, ProgressCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a Progress.
     * @param {ProgressDeleteArgs} args - Arguments to delete one Progress.
     * @example
     * // Delete one Progress
     * const Progress = await prisma.progress.delete({
     *   where: {
     *     // ... filter to delete one Progress
     *   }
     * })
     * 
     */
    delete<T extends ProgressDeleteArgs>(args: SelectSubset<T, ProgressDeleteArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one Progress.
     * @param {ProgressUpdateArgs} args - Arguments to update one Progress.
     * @example
     * // Update one Progress
     * const progress = await prisma.progress.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ProgressUpdateArgs>(args: SelectSubset<T, ProgressUpdateArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more Progresses.
     * @param {ProgressDeleteManyArgs} args - Arguments to filter Progresses to delete.
     * @example
     * // Delete a few Progresses
     * const { count } = await prisma.progress.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ProgressDeleteManyArgs>(args?: SelectSubset<T, ProgressDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Progresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgressUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Progresses
     * const progress = await prisma.progress.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ProgressUpdateManyArgs>(args: SelectSubset<T, ProgressUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one Progress.
     * @param {ProgressUpsertArgs} args - Arguments to update or create a Progress.
     * @example
     * // Update or create a Progress
     * const progress = await prisma.progress.upsert({
     *   create: {
     *     // ... data to create a Progress
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Progress we want to update
     *   }
     * })
     */
    upsert<T extends ProgressUpsertArgs>(args: SelectSubset<T, ProgressUpsertArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of Progresses.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgressCountArgs} args - Arguments to filter Progresses to count.
     * @example
     * // Count the number of Progresses
     * const count = await prisma.progress.count({
     *   where: {
     *     // ... the filter for the Progresses we want to count
     *   }
     * })
    **/
    count<T extends ProgressCountArgs>(
      args?: Subset<T, ProgressCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ProgressCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Progress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgressAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ProgressAggregateArgs>(args: Subset<T, ProgressAggregateArgs>): Prisma.PrismaPromise<GetProgressAggregateType<T>>

    /**
     * Group by Progress.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ProgressGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ProgressGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ProgressGroupByArgs['orderBy'] }
        : { orderBy?: ProgressGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ProgressGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProgressGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Progress model
   */
  readonly fields: ProgressFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Progress.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ProgressClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    childProfile<T extends ChildProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChildProfileDefaultArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    gameSession<T extends Progress$gameSessionArgs<ExtArgs> = {}>(args?: Subset<T, Progress$gameSessionArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Progress model
   */ 
  interface ProgressFieldRefs {
    readonly id: FieldRef<"Progress", 'String'>
    readonly childProfileId: FieldRef<"Progress", 'String'>
    readonly roadmapId: FieldRef<"Progress", 'String'>
    readonly worldId: FieldRef<"Progress", 'String'>
    readonly storyId: FieldRef<"Progress", 'String'>
    readonly status: FieldRef<"Progress", 'ProgressStatus'>
    readonly totalTimeSpent: FieldRef<"Progress", 'Int'>
    readonly completedAt: FieldRef<"Progress", 'DateTime'>
    readonly createdAt: FieldRef<"Progress", 'DateTime'>
    readonly updatedAt: FieldRef<"Progress", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Progress findUnique
   */
  export type ProgressFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * Filter, which Progress to fetch.
     */
    where: ProgressWhereUniqueInput
  }

  /**
   * Progress findUniqueOrThrow
   */
  export type ProgressFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * Filter, which Progress to fetch.
     */
    where: ProgressWhereUniqueInput
  }

  /**
   * Progress findFirst
   */
  export type ProgressFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * Filter, which Progress to fetch.
     */
    where?: ProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Progresses to fetch.
     */
    orderBy?: ProgressOrderByWithRelationInput | ProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Progresses.
     */
    cursor?: ProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Progresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Progresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Progresses.
     */
    distinct?: ProgressScalarFieldEnum | ProgressScalarFieldEnum[]
  }

  /**
   * Progress findFirstOrThrow
   */
  export type ProgressFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * Filter, which Progress to fetch.
     */
    where?: ProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Progresses to fetch.
     */
    orderBy?: ProgressOrderByWithRelationInput | ProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Progresses.
     */
    cursor?: ProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Progresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Progresses.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Progresses.
     */
    distinct?: ProgressScalarFieldEnum | ProgressScalarFieldEnum[]
  }

  /**
   * Progress findMany
   */
  export type ProgressFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * Filter, which Progresses to fetch.
     */
    where?: ProgressWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Progresses to fetch.
     */
    orderBy?: ProgressOrderByWithRelationInput | ProgressOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Progresses.
     */
    cursor?: ProgressWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Progresses from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Progresses.
     */
    skip?: number
    distinct?: ProgressScalarFieldEnum | ProgressScalarFieldEnum[]
  }

  /**
   * Progress create
   */
  export type ProgressCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * The data needed to create a Progress.
     */
    data: XOR<ProgressCreateInput, ProgressUncheckedCreateInput>
  }

  /**
   * Progress createMany
   */
  export type ProgressCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Progresses.
     */
    data: ProgressCreateManyInput | ProgressCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Progress createManyAndReturn
   */
  export type ProgressCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many Progresses.
     */
    data: ProgressCreateManyInput | ProgressCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Progress update
   */
  export type ProgressUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * The data needed to update a Progress.
     */
    data: XOR<ProgressUpdateInput, ProgressUncheckedUpdateInput>
    /**
     * Choose, which Progress to update.
     */
    where: ProgressWhereUniqueInput
  }

  /**
   * Progress updateMany
   */
  export type ProgressUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Progresses.
     */
    data: XOR<ProgressUpdateManyMutationInput, ProgressUncheckedUpdateManyInput>
    /**
     * Filter which Progresses to update
     */
    where?: ProgressWhereInput
  }

  /**
   * Progress upsert
   */
  export type ProgressUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * The filter to search for the Progress to update in case it exists.
     */
    where: ProgressWhereUniqueInput
    /**
     * In case the Progress found by the `where` argument doesn't exist, create a new Progress with this data.
     */
    create: XOR<ProgressCreateInput, ProgressUncheckedCreateInput>
    /**
     * In case the Progress was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ProgressUpdateInput, ProgressUncheckedUpdateInput>
  }

  /**
   * Progress delete
   */
  export type ProgressDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
    /**
     * Filter which Progress to delete.
     */
    where: ProgressWhereUniqueInput
  }

  /**
   * Progress deleteMany
   */
  export type ProgressDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Progresses to delete
     */
    where?: ProgressWhereInput
  }

  /**
   * Progress.gameSession
   */
  export type Progress$gameSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    where?: GameSessionWhereInput
  }

  /**
   * Progress without action
   */
  export type ProgressDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Progress
     */
    select?: ProgressSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ProgressInclude<ExtArgs> | null
  }


  /**
   * Model GameSession
   */

  export type AggregateGameSession = {
    _count: GameSessionCountAggregateOutputType | null
    _avg: GameSessionAvgAggregateOutputType | null
    _sum: GameSessionSumAggregateOutputType | null
    _min: GameSessionMinAggregateOutputType | null
    _max: GameSessionMaxAggregateOutputType | null
  }

  export type GameSessionAvgAggregateOutputType = {
    totalTimeSpent: number | null
    sessionCount: number | null
    totalIdleTime: number | null
    starsEarned: number | null
  }

  export type GameSessionSumAggregateOutputType = {
    totalTimeSpent: number | null
    sessionCount: number | null
    totalIdleTime: number | null
    starsEarned: number | null
  }

  export type GameSessionMinAggregateOutputType = {
    id: string | null
    progressId: string | null
    storyId: string | null
    chapterId: string | null
    startedAt: Date | null
    checkpointAt: Date | null
    endedAt: Date | null
    totalTimeSpent: number | null
    sessionCount: number | null
    totalIdleTime: number | null
    starsEarned: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GameSessionMaxAggregateOutputType = {
    id: string | null
    progressId: string | null
    storyId: string | null
    chapterId: string | null
    startedAt: Date | null
    checkpointAt: Date | null
    endedAt: Date | null
    totalTimeSpent: number | null
    sessionCount: number | null
    totalIdleTime: number | null
    starsEarned: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type GameSessionCountAggregateOutputType = {
    id: number
    progressId: number
    storyId: number
    chapterId: number
    startedAt: number
    checkpointAt: number
    endedAt: number
    totalTimeSpent: number
    sessionCount: number
    totalIdleTime: number
    starsEarned: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type GameSessionAvgAggregateInputType = {
    totalTimeSpent?: true
    sessionCount?: true
    totalIdleTime?: true
    starsEarned?: true
  }

  export type GameSessionSumAggregateInputType = {
    totalTimeSpent?: true
    sessionCount?: true
    totalIdleTime?: true
    starsEarned?: true
  }

  export type GameSessionMinAggregateInputType = {
    id?: true
    progressId?: true
    storyId?: true
    chapterId?: true
    startedAt?: true
    checkpointAt?: true
    endedAt?: true
    totalTimeSpent?: true
    sessionCount?: true
    totalIdleTime?: true
    starsEarned?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GameSessionMaxAggregateInputType = {
    id?: true
    progressId?: true
    storyId?: true
    chapterId?: true
    startedAt?: true
    checkpointAt?: true
    endedAt?: true
    totalTimeSpent?: true
    sessionCount?: true
    totalIdleTime?: true
    starsEarned?: true
    createdAt?: true
    updatedAt?: true
  }

  export type GameSessionCountAggregateInputType = {
    id?: true
    progressId?: true
    storyId?: true
    chapterId?: true
    startedAt?: true
    checkpointAt?: true
    endedAt?: true
    totalTimeSpent?: true
    sessionCount?: true
    totalIdleTime?: true
    starsEarned?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type GameSessionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameSession to aggregate.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned GameSessions
    **/
    _count?: true | GameSessionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: GameSessionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: GameSessionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: GameSessionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: GameSessionMaxAggregateInputType
  }

  export type GetGameSessionAggregateType<T extends GameSessionAggregateArgs> = {
        [P in keyof T & keyof AggregateGameSession]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateGameSession[P]>
      : GetScalarType<T[P], AggregateGameSession[P]>
  }




  export type GameSessionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: GameSessionWhereInput
    orderBy?: GameSessionOrderByWithAggregationInput | GameSessionOrderByWithAggregationInput[]
    by: GameSessionScalarFieldEnum[] | GameSessionScalarFieldEnum
    having?: GameSessionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: GameSessionCountAggregateInputType | true
    _avg?: GameSessionAvgAggregateInputType
    _sum?: GameSessionSumAggregateInputType
    _min?: GameSessionMinAggregateInputType
    _max?: GameSessionMaxAggregateInputType
  }

  export type GameSessionGroupByOutputType = {
    id: string
    progressId: string
    storyId: string
    chapterId: string | null
    startedAt: Date
    checkpointAt: Date | null
    endedAt: Date | null
    totalTimeSpent: number
    sessionCount: number
    totalIdleTime: number
    starsEarned: number
    createdAt: Date
    updatedAt: Date
    _count: GameSessionCountAggregateOutputType | null
    _avg: GameSessionAvgAggregateOutputType | null
    _sum: GameSessionSumAggregateOutputType | null
    _min: GameSessionMinAggregateOutputType | null
    _max: GameSessionMaxAggregateOutputType | null
  }

  type GetGameSessionGroupByPayload<T extends GameSessionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<GameSessionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof GameSessionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], GameSessionGroupByOutputType[P]>
            : GetScalarType<T[P], GameSessionGroupByOutputType[P]>
        }
      >
    >


  export type GameSessionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    progressId?: boolean
    storyId?: boolean
    chapterId?: boolean
    startedAt?: boolean
    checkpointAt?: boolean
    endedAt?: boolean
    totalTimeSpent?: boolean
    sessionCount?: boolean
    totalIdleTime?: boolean
    starsEarned?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    progress?: boolean | ProgressDefaultArgs<ExtArgs>
    challengeAttempts?: boolean | GameSession$challengeAttemptsArgs<ExtArgs>
    checkpoints?: boolean | GameSession$checkpointsArgs<ExtArgs>
    _count?: boolean | GameSessionCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameSession"]>

  export type GameSessionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    progressId?: boolean
    storyId?: boolean
    chapterId?: boolean
    startedAt?: boolean
    checkpointAt?: boolean
    endedAt?: boolean
    totalTimeSpent?: boolean
    sessionCount?: boolean
    totalIdleTime?: boolean
    starsEarned?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    progress?: boolean | ProgressDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["gameSession"]>

  export type GameSessionSelectScalar = {
    id?: boolean
    progressId?: boolean
    storyId?: boolean
    chapterId?: boolean
    startedAt?: boolean
    checkpointAt?: boolean
    endedAt?: boolean
    totalTimeSpent?: boolean
    sessionCount?: boolean
    totalIdleTime?: boolean
    starsEarned?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type GameSessionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | ProgressDefaultArgs<ExtArgs>
    challengeAttempts?: boolean | GameSession$challengeAttemptsArgs<ExtArgs>
    checkpoints?: boolean | GameSession$checkpointsArgs<ExtArgs>
    _count?: boolean | GameSessionCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type GameSessionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    progress?: boolean | ProgressDefaultArgs<ExtArgs>
  }

  export type $GameSessionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "GameSession"
    objects: {
      progress: Prisma.$ProgressPayload<ExtArgs>
      challengeAttempts: Prisma.$ChallengeAttemptPayload<ExtArgs>[]
      checkpoints: Prisma.$SessionCheckpointPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      progressId: string
      storyId: string
      chapterId: string | null
      startedAt: Date
      checkpointAt: Date | null
      endedAt: Date | null
      totalTimeSpent: number
      sessionCount: number
      totalIdleTime: number
      starsEarned: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["gameSession"]>
    composites: {}
  }

  type GameSessionGetPayload<S extends boolean | null | undefined | GameSessionDefaultArgs> = $Result.GetResult<Prisma.$GameSessionPayload, S>

  type GameSessionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<GameSessionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: GameSessionCountAggregateInputType | true
    }

  export interface GameSessionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['GameSession'], meta: { name: 'GameSession' } }
    /**
     * Find zero or one GameSession that matches the filter.
     * @param {GameSessionFindUniqueArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends GameSessionFindUniqueArgs>(args: SelectSubset<T, GameSessionFindUniqueArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one GameSession that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {GameSessionFindUniqueOrThrowArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends GameSessionFindUniqueOrThrowArgs>(args: SelectSubset<T, GameSessionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first GameSession that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindFirstArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends GameSessionFindFirstArgs>(args?: SelectSubset<T, GameSessionFindFirstArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first GameSession that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindFirstOrThrowArgs} args - Arguments to find a GameSession
     * @example
     * // Get one GameSession
     * const gameSession = await prisma.gameSession.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends GameSessionFindFirstOrThrowArgs>(args?: SelectSubset<T, GameSessionFindFirstOrThrowArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more GameSessions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all GameSessions
     * const gameSessions = await prisma.gameSession.findMany()
     * 
     * // Get first 10 GameSessions
     * const gameSessions = await prisma.gameSession.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const gameSessionWithIdOnly = await prisma.gameSession.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends GameSessionFindManyArgs>(args?: SelectSubset<T, GameSessionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a GameSession.
     * @param {GameSessionCreateArgs} args - Arguments to create a GameSession.
     * @example
     * // Create one GameSession
     * const GameSession = await prisma.gameSession.create({
     *   data: {
     *     // ... data to create a GameSession
     *   }
     * })
     * 
     */
    create<T extends GameSessionCreateArgs>(args: SelectSubset<T, GameSessionCreateArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many GameSessions.
     * @param {GameSessionCreateManyArgs} args - Arguments to create many GameSessions.
     * @example
     * // Create many GameSessions
     * const gameSession = await prisma.gameSession.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends GameSessionCreateManyArgs>(args?: SelectSubset<T, GameSessionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many GameSessions and returns the data saved in the database.
     * @param {GameSessionCreateManyAndReturnArgs} args - Arguments to create many GameSessions.
     * @example
     * // Create many GameSessions
     * const gameSession = await prisma.gameSession.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many GameSessions and only return the `id`
     * const gameSessionWithIdOnly = await prisma.gameSession.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends GameSessionCreateManyAndReturnArgs>(args?: SelectSubset<T, GameSessionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a GameSession.
     * @param {GameSessionDeleteArgs} args - Arguments to delete one GameSession.
     * @example
     * // Delete one GameSession
     * const GameSession = await prisma.gameSession.delete({
     *   where: {
     *     // ... filter to delete one GameSession
     *   }
     * })
     * 
     */
    delete<T extends GameSessionDeleteArgs>(args: SelectSubset<T, GameSessionDeleteArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one GameSession.
     * @param {GameSessionUpdateArgs} args - Arguments to update one GameSession.
     * @example
     * // Update one GameSession
     * const gameSession = await prisma.gameSession.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends GameSessionUpdateArgs>(args: SelectSubset<T, GameSessionUpdateArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more GameSessions.
     * @param {GameSessionDeleteManyArgs} args - Arguments to filter GameSessions to delete.
     * @example
     * // Delete a few GameSessions
     * const { count } = await prisma.gameSession.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends GameSessionDeleteManyArgs>(args?: SelectSubset<T, GameSessionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more GameSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many GameSessions
     * const gameSession = await prisma.gameSession.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends GameSessionUpdateManyArgs>(args: SelectSubset<T, GameSessionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one GameSession.
     * @param {GameSessionUpsertArgs} args - Arguments to update or create a GameSession.
     * @example
     * // Update or create a GameSession
     * const gameSession = await prisma.gameSession.upsert({
     *   create: {
     *     // ... data to create a GameSession
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the GameSession we want to update
     *   }
     * })
     */
    upsert<T extends GameSessionUpsertArgs>(args: SelectSubset<T, GameSessionUpsertArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of GameSessions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionCountArgs} args - Arguments to filter GameSessions to count.
     * @example
     * // Count the number of GameSessions
     * const count = await prisma.gameSession.count({
     *   where: {
     *     // ... the filter for the GameSessions we want to count
     *   }
     * })
    **/
    count<T extends GameSessionCountArgs>(
      args?: Subset<T, GameSessionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], GameSessionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a GameSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends GameSessionAggregateArgs>(args: Subset<T, GameSessionAggregateArgs>): Prisma.PrismaPromise<GetGameSessionAggregateType<T>>

    /**
     * Group by GameSession.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {GameSessionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends GameSessionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: GameSessionGroupByArgs['orderBy'] }
        : { orderBy?: GameSessionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, GameSessionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetGameSessionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the GameSession model
   */
  readonly fields: GameSessionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for GameSession.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__GameSessionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    progress<T extends ProgressDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ProgressDefaultArgs<ExtArgs>>): Prisma__ProgressClient<$Result.GetResult<Prisma.$ProgressPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    challengeAttempts<T extends GameSession$challengeAttemptsArgs<ExtArgs> = {}>(args?: Subset<T, GameSession$challengeAttemptsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "findMany"> | Null>
    checkpoints<T extends GameSession$checkpointsArgs<ExtArgs> = {}>(args?: Subset<T, GameSession$checkpointsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "findMany"> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the GameSession model
   */ 
  interface GameSessionFieldRefs {
    readonly id: FieldRef<"GameSession", 'String'>
    readonly progressId: FieldRef<"GameSession", 'String'>
    readonly storyId: FieldRef<"GameSession", 'String'>
    readonly chapterId: FieldRef<"GameSession", 'String'>
    readonly startedAt: FieldRef<"GameSession", 'DateTime'>
    readonly checkpointAt: FieldRef<"GameSession", 'DateTime'>
    readonly endedAt: FieldRef<"GameSession", 'DateTime'>
    readonly totalTimeSpent: FieldRef<"GameSession", 'Int'>
    readonly sessionCount: FieldRef<"GameSession", 'Int'>
    readonly totalIdleTime: FieldRef<"GameSession", 'Int'>
    readonly starsEarned: FieldRef<"GameSession", 'Int'>
    readonly createdAt: FieldRef<"GameSession", 'DateTime'>
    readonly updatedAt: FieldRef<"GameSession", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * GameSession findUnique
   */
  export type GameSessionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession findUniqueOrThrow
   */
  export type GameSessionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession findFirst
   */
  export type GameSessionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameSessions.
     */
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession findFirstOrThrow
   */
  export type GameSessionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSession to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of GameSessions.
     */
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession findMany
   */
  export type GameSessionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter, which GameSessions to fetch.
     */
    where?: GameSessionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of GameSessions to fetch.
     */
    orderBy?: GameSessionOrderByWithRelationInput | GameSessionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing GameSessions.
     */
    cursor?: GameSessionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` GameSessions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` GameSessions.
     */
    skip?: number
    distinct?: GameSessionScalarFieldEnum | GameSessionScalarFieldEnum[]
  }

  /**
   * GameSession create
   */
  export type GameSessionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The data needed to create a GameSession.
     */
    data: XOR<GameSessionCreateInput, GameSessionUncheckedCreateInput>
  }

  /**
   * GameSession createMany
   */
  export type GameSessionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many GameSessions.
     */
    data: GameSessionCreateManyInput | GameSessionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * GameSession createManyAndReturn
   */
  export type GameSessionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many GameSessions.
     */
    data: GameSessionCreateManyInput | GameSessionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * GameSession update
   */
  export type GameSessionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The data needed to update a GameSession.
     */
    data: XOR<GameSessionUpdateInput, GameSessionUncheckedUpdateInput>
    /**
     * Choose, which GameSession to update.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession updateMany
   */
  export type GameSessionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update GameSessions.
     */
    data: XOR<GameSessionUpdateManyMutationInput, GameSessionUncheckedUpdateManyInput>
    /**
     * Filter which GameSessions to update
     */
    where?: GameSessionWhereInput
  }

  /**
   * GameSession upsert
   */
  export type GameSessionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * The filter to search for the GameSession to update in case it exists.
     */
    where: GameSessionWhereUniqueInput
    /**
     * In case the GameSession found by the `where` argument doesn't exist, create a new GameSession with this data.
     */
    create: XOR<GameSessionCreateInput, GameSessionUncheckedCreateInput>
    /**
     * In case the GameSession was found with the provided `where` argument, update it with this data.
     */
    update: XOR<GameSessionUpdateInput, GameSessionUncheckedUpdateInput>
  }

  /**
   * GameSession delete
   */
  export type GameSessionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
    /**
     * Filter which GameSession to delete.
     */
    where: GameSessionWhereUniqueInput
  }

  /**
   * GameSession deleteMany
   */
  export type GameSessionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which GameSessions to delete
     */
    where?: GameSessionWhereInput
  }

  /**
   * GameSession.challengeAttempts
   */
  export type GameSession$challengeAttemptsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    where?: ChallengeAttemptWhereInput
    orderBy?: ChallengeAttemptOrderByWithRelationInput | ChallengeAttemptOrderByWithRelationInput[]
    cursor?: ChallengeAttemptWhereUniqueInput
    take?: number
    skip?: number
    distinct?: ChallengeAttemptScalarFieldEnum | ChallengeAttemptScalarFieldEnum[]
  }

  /**
   * GameSession.checkpoints
   */
  export type GameSession$checkpointsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    where?: SessionCheckpointWhereInput
    orderBy?: SessionCheckpointOrderByWithRelationInput | SessionCheckpointOrderByWithRelationInput[]
    cursor?: SessionCheckpointWhereUniqueInput
    take?: number
    skip?: number
    distinct?: SessionCheckpointScalarFieldEnum | SessionCheckpointScalarFieldEnum[]
  }

  /**
   * GameSession without action
   */
  export type GameSessionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the GameSession
     */
    select?: GameSessionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: GameSessionInclude<ExtArgs> | null
  }


  /**
   * Model SessionCheckpoint
   */

  export type AggregateSessionCheckpoint = {
    _count: SessionCheckpointCountAggregateOutputType | null
    _avg: SessionCheckpointAvgAggregateOutputType | null
    _sum: SessionCheckpointSumAggregateOutputType | null
    _min: SessionCheckpointMinAggregateOutputType | null
    _max: SessionCheckpointMaxAggregateOutputType | null
  }

  export type SessionCheckpointAvgAggregateOutputType = {
    sessionDurationSeconds: number | null
  }

  export type SessionCheckpointSumAggregateOutputType = {
    sessionDurationSeconds: number | null
  }

  export type SessionCheckpointMinAggregateOutputType = {
    id: string | null
    gameSessionId: string | null
    firstChapterId: string | null
    lastChapterId: string | null
    startedAt: Date | null
    pausedAt: Date | null
    sessionDurationSeconds: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SessionCheckpointMaxAggregateOutputType = {
    id: string | null
    gameSessionId: string | null
    firstChapterId: string | null
    lastChapterId: string | null
    startedAt: Date | null
    pausedAt: Date | null
    sessionDurationSeconds: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SessionCheckpointCountAggregateOutputType = {
    id: number
    gameSessionId: number
    firstChapterId: number
    lastChapterId: number
    startedAt: number
    pausedAt: number
    sessionDurationSeconds: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SessionCheckpointAvgAggregateInputType = {
    sessionDurationSeconds?: true
  }

  export type SessionCheckpointSumAggregateInputType = {
    sessionDurationSeconds?: true
  }

  export type SessionCheckpointMinAggregateInputType = {
    id?: true
    gameSessionId?: true
    firstChapterId?: true
    lastChapterId?: true
    startedAt?: true
    pausedAt?: true
    sessionDurationSeconds?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SessionCheckpointMaxAggregateInputType = {
    id?: true
    gameSessionId?: true
    firstChapterId?: true
    lastChapterId?: true
    startedAt?: true
    pausedAt?: true
    sessionDurationSeconds?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SessionCheckpointCountAggregateInputType = {
    id?: true
    gameSessionId?: true
    firstChapterId?: true
    lastChapterId?: true
    startedAt?: true
    pausedAt?: true
    sessionDurationSeconds?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SessionCheckpointAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SessionCheckpoint to aggregate.
     */
    where?: SessionCheckpointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SessionCheckpoints to fetch.
     */
    orderBy?: SessionCheckpointOrderByWithRelationInput | SessionCheckpointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SessionCheckpointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SessionCheckpoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SessionCheckpoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SessionCheckpoints
    **/
    _count?: true | SessionCheckpointCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SessionCheckpointAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SessionCheckpointSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SessionCheckpointMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SessionCheckpointMaxAggregateInputType
  }

  export type GetSessionCheckpointAggregateType<T extends SessionCheckpointAggregateArgs> = {
        [P in keyof T & keyof AggregateSessionCheckpoint]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSessionCheckpoint[P]>
      : GetScalarType<T[P], AggregateSessionCheckpoint[P]>
  }




  export type SessionCheckpointGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SessionCheckpointWhereInput
    orderBy?: SessionCheckpointOrderByWithAggregationInput | SessionCheckpointOrderByWithAggregationInput[]
    by: SessionCheckpointScalarFieldEnum[] | SessionCheckpointScalarFieldEnum
    having?: SessionCheckpointScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SessionCheckpointCountAggregateInputType | true
    _avg?: SessionCheckpointAvgAggregateInputType
    _sum?: SessionCheckpointSumAggregateInputType
    _min?: SessionCheckpointMinAggregateInputType
    _max?: SessionCheckpointMaxAggregateInputType
  }

  export type SessionCheckpointGroupByOutputType = {
    id: string
    gameSessionId: string
    firstChapterId: string
    lastChapterId: string | null
    startedAt: Date
    pausedAt: Date | null
    sessionDurationSeconds: number | null
    createdAt: Date
    updatedAt: Date
    _count: SessionCheckpointCountAggregateOutputType | null
    _avg: SessionCheckpointAvgAggregateOutputType | null
    _sum: SessionCheckpointSumAggregateOutputType | null
    _min: SessionCheckpointMinAggregateOutputType | null
    _max: SessionCheckpointMaxAggregateOutputType | null
  }

  type GetSessionCheckpointGroupByPayload<T extends SessionCheckpointGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SessionCheckpointGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SessionCheckpointGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SessionCheckpointGroupByOutputType[P]>
            : GetScalarType<T[P], SessionCheckpointGroupByOutputType[P]>
        }
      >
    >


  export type SessionCheckpointSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gameSessionId?: boolean
    firstChapterId?: boolean
    lastChapterId?: boolean
    startedAt?: boolean
    pausedAt?: boolean
    sessionDurationSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    gameSession?: boolean | GameSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sessionCheckpoint"]>

  export type SessionCheckpointSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    gameSessionId?: boolean
    firstChapterId?: boolean
    lastChapterId?: boolean
    startedAt?: boolean
    pausedAt?: boolean
    sessionDurationSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    gameSession?: boolean | GameSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["sessionCheckpoint"]>

  export type SessionCheckpointSelectScalar = {
    id?: boolean
    gameSessionId?: boolean
    firstChapterId?: boolean
    lastChapterId?: boolean
    startedAt?: boolean
    pausedAt?: boolean
    sessionDurationSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SessionCheckpointInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gameSession?: boolean | GameSessionDefaultArgs<ExtArgs>
  }
  export type SessionCheckpointIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    gameSession?: boolean | GameSessionDefaultArgs<ExtArgs>
  }

  export type $SessionCheckpointPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SessionCheckpoint"
    objects: {
      gameSession: Prisma.$GameSessionPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      gameSessionId: string
      firstChapterId: string
      lastChapterId: string | null
      startedAt: Date
      pausedAt: Date | null
      sessionDurationSeconds: number | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["sessionCheckpoint"]>
    composites: {}
  }

  type SessionCheckpointGetPayload<S extends boolean | null | undefined | SessionCheckpointDefaultArgs> = $Result.GetResult<Prisma.$SessionCheckpointPayload, S>

  type SessionCheckpointCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<SessionCheckpointFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: SessionCheckpointCountAggregateInputType | true
    }

  export interface SessionCheckpointDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SessionCheckpoint'], meta: { name: 'SessionCheckpoint' } }
    /**
     * Find zero or one SessionCheckpoint that matches the filter.
     * @param {SessionCheckpointFindUniqueArgs} args - Arguments to find a SessionCheckpoint
     * @example
     * // Get one SessionCheckpoint
     * const sessionCheckpoint = await prisma.sessionCheckpoint.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SessionCheckpointFindUniqueArgs>(args: SelectSubset<T, SessionCheckpointFindUniqueArgs<ExtArgs>>): Prisma__SessionCheckpointClient<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one SessionCheckpoint that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {SessionCheckpointFindUniqueOrThrowArgs} args - Arguments to find a SessionCheckpoint
     * @example
     * // Get one SessionCheckpoint
     * const sessionCheckpoint = await prisma.sessionCheckpoint.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SessionCheckpointFindUniqueOrThrowArgs>(args: SelectSubset<T, SessionCheckpointFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SessionCheckpointClient<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first SessionCheckpoint that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCheckpointFindFirstArgs} args - Arguments to find a SessionCheckpoint
     * @example
     * // Get one SessionCheckpoint
     * const sessionCheckpoint = await prisma.sessionCheckpoint.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SessionCheckpointFindFirstArgs>(args?: SelectSubset<T, SessionCheckpointFindFirstArgs<ExtArgs>>): Prisma__SessionCheckpointClient<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first SessionCheckpoint that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCheckpointFindFirstOrThrowArgs} args - Arguments to find a SessionCheckpoint
     * @example
     * // Get one SessionCheckpoint
     * const sessionCheckpoint = await prisma.sessionCheckpoint.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SessionCheckpointFindFirstOrThrowArgs>(args?: SelectSubset<T, SessionCheckpointFindFirstOrThrowArgs<ExtArgs>>): Prisma__SessionCheckpointClient<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more SessionCheckpoints that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCheckpointFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SessionCheckpoints
     * const sessionCheckpoints = await prisma.sessionCheckpoint.findMany()
     * 
     * // Get first 10 SessionCheckpoints
     * const sessionCheckpoints = await prisma.sessionCheckpoint.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const sessionCheckpointWithIdOnly = await prisma.sessionCheckpoint.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SessionCheckpointFindManyArgs>(args?: SelectSubset<T, SessionCheckpointFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a SessionCheckpoint.
     * @param {SessionCheckpointCreateArgs} args - Arguments to create a SessionCheckpoint.
     * @example
     * // Create one SessionCheckpoint
     * const SessionCheckpoint = await prisma.sessionCheckpoint.create({
     *   data: {
     *     // ... data to create a SessionCheckpoint
     *   }
     * })
     * 
     */
    create<T extends SessionCheckpointCreateArgs>(args: SelectSubset<T, SessionCheckpointCreateArgs<ExtArgs>>): Prisma__SessionCheckpointClient<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many SessionCheckpoints.
     * @param {SessionCheckpointCreateManyArgs} args - Arguments to create many SessionCheckpoints.
     * @example
     * // Create many SessionCheckpoints
     * const sessionCheckpoint = await prisma.sessionCheckpoint.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SessionCheckpointCreateManyArgs>(args?: SelectSubset<T, SessionCheckpointCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SessionCheckpoints and returns the data saved in the database.
     * @param {SessionCheckpointCreateManyAndReturnArgs} args - Arguments to create many SessionCheckpoints.
     * @example
     * // Create many SessionCheckpoints
     * const sessionCheckpoint = await prisma.sessionCheckpoint.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SessionCheckpoints and only return the `id`
     * const sessionCheckpointWithIdOnly = await prisma.sessionCheckpoint.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SessionCheckpointCreateManyAndReturnArgs>(args?: SelectSubset<T, SessionCheckpointCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a SessionCheckpoint.
     * @param {SessionCheckpointDeleteArgs} args - Arguments to delete one SessionCheckpoint.
     * @example
     * // Delete one SessionCheckpoint
     * const SessionCheckpoint = await prisma.sessionCheckpoint.delete({
     *   where: {
     *     // ... filter to delete one SessionCheckpoint
     *   }
     * })
     * 
     */
    delete<T extends SessionCheckpointDeleteArgs>(args: SelectSubset<T, SessionCheckpointDeleteArgs<ExtArgs>>): Prisma__SessionCheckpointClient<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one SessionCheckpoint.
     * @param {SessionCheckpointUpdateArgs} args - Arguments to update one SessionCheckpoint.
     * @example
     * // Update one SessionCheckpoint
     * const sessionCheckpoint = await prisma.sessionCheckpoint.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SessionCheckpointUpdateArgs>(args: SelectSubset<T, SessionCheckpointUpdateArgs<ExtArgs>>): Prisma__SessionCheckpointClient<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more SessionCheckpoints.
     * @param {SessionCheckpointDeleteManyArgs} args - Arguments to filter SessionCheckpoints to delete.
     * @example
     * // Delete a few SessionCheckpoints
     * const { count } = await prisma.sessionCheckpoint.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SessionCheckpointDeleteManyArgs>(args?: SelectSubset<T, SessionCheckpointDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SessionCheckpoints.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCheckpointUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SessionCheckpoints
     * const sessionCheckpoint = await prisma.sessionCheckpoint.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SessionCheckpointUpdateManyArgs>(args: SelectSubset<T, SessionCheckpointUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one SessionCheckpoint.
     * @param {SessionCheckpointUpsertArgs} args - Arguments to update or create a SessionCheckpoint.
     * @example
     * // Update or create a SessionCheckpoint
     * const sessionCheckpoint = await prisma.sessionCheckpoint.upsert({
     *   create: {
     *     // ... data to create a SessionCheckpoint
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SessionCheckpoint we want to update
     *   }
     * })
     */
    upsert<T extends SessionCheckpointUpsertArgs>(args: SelectSubset<T, SessionCheckpointUpsertArgs<ExtArgs>>): Prisma__SessionCheckpointClient<$Result.GetResult<Prisma.$SessionCheckpointPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of SessionCheckpoints.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCheckpointCountArgs} args - Arguments to filter SessionCheckpoints to count.
     * @example
     * // Count the number of SessionCheckpoints
     * const count = await prisma.sessionCheckpoint.count({
     *   where: {
     *     // ... the filter for the SessionCheckpoints we want to count
     *   }
     * })
    **/
    count<T extends SessionCheckpointCountArgs>(
      args?: Subset<T, SessionCheckpointCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SessionCheckpointCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SessionCheckpoint.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCheckpointAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SessionCheckpointAggregateArgs>(args: Subset<T, SessionCheckpointAggregateArgs>): Prisma.PrismaPromise<GetSessionCheckpointAggregateType<T>>

    /**
     * Group by SessionCheckpoint.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SessionCheckpointGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SessionCheckpointGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SessionCheckpointGroupByArgs['orderBy'] }
        : { orderBy?: SessionCheckpointGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SessionCheckpointGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSessionCheckpointGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SessionCheckpoint model
   */
  readonly fields: SessionCheckpointFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SessionCheckpoint.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SessionCheckpointClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    gameSession<T extends GameSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GameSessionDefaultArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SessionCheckpoint model
   */ 
  interface SessionCheckpointFieldRefs {
    readonly id: FieldRef<"SessionCheckpoint", 'String'>
    readonly gameSessionId: FieldRef<"SessionCheckpoint", 'String'>
    readonly firstChapterId: FieldRef<"SessionCheckpoint", 'String'>
    readonly lastChapterId: FieldRef<"SessionCheckpoint", 'String'>
    readonly startedAt: FieldRef<"SessionCheckpoint", 'DateTime'>
    readonly pausedAt: FieldRef<"SessionCheckpoint", 'DateTime'>
    readonly sessionDurationSeconds: FieldRef<"SessionCheckpoint", 'Int'>
    readonly createdAt: FieldRef<"SessionCheckpoint", 'DateTime'>
    readonly updatedAt: FieldRef<"SessionCheckpoint", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SessionCheckpoint findUnique
   */
  export type SessionCheckpointFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * Filter, which SessionCheckpoint to fetch.
     */
    where: SessionCheckpointWhereUniqueInput
  }

  /**
   * SessionCheckpoint findUniqueOrThrow
   */
  export type SessionCheckpointFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * Filter, which SessionCheckpoint to fetch.
     */
    where: SessionCheckpointWhereUniqueInput
  }

  /**
   * SessionCheckpoint findFirst
   */
  export type SessionCheckpointFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * Filter, which SessionCheckpoint to fetch.
     */
    where?: SessionCheckpointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SessionCheckpoints to fetch.
     */
    orderBy?: SessionCheckpointOrderByWithRelationInput | SessionCheckpointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SessionCheckpoints.
     */
    cursor?: SessionCheckpointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SessionCheckpoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SessionCheckpoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SessionCheckpoints.
     */
    distinct?: SessionCheckpointScalarFieldEnum | SessionCheckpointScalarFieldEnum[]
  }

  /**
   * SessionCheckpoint findFirstOrThrow
   */
  export type SessionCheckpointFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * Filter, which SessionCheckpoint to fetch.
     */
    where?: SessionCheckpointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SessionCheckpoints to fetch.
     */
    orderBy?: SessionCheckpointOrderByWithRelationInput | SessionCheckpointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SessionCheckpoints.
     */
    cursor?: SessionCheckpointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SessionCheckpoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SessionCheckpoints.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SessionCheckpoints.
     */
    distinct?: SessionCheckpointScalarFieldEnum | SessionCheckpointScalarFieldEnum[]
  }

  /**
   * SessionCheckpoint findMany
   */
  export type SessionCheckpointFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * Filter, which SessionCheckpoints to fetch.
     */
    where?: SessionCheckpointWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SessionCheckpoints to fetch.
     */
    orderBy?: SessionCheckpointOrderByWithRelationInput | SessionCheckpointOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SessionCheckpoints.
     */
    cursor?: SessionCheckpointWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SessionCheckpoints from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SessionCheckpoints.
     */
    skip?: number
    distinct?: SessionCheckpointScalarFieldEnum | SessionCheckpointScalarFieldEnum[]
  }

  /**
   * SessionCheckpoint create
   */
  export type SessionCheckpointCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * The data needed to create a SessionCheckpoint.
     */
    data: XOR<SessionCheckpointCreateInput, SessionCheckpointUncheckedCreateInput>
  }

  /**
   * SessionCheckpoint createMany
   */
  export type SessionCheckpointCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SessionCheckpoints.
     */
    data: SessionCheckpointCreateManyInput | SessionCheckpointCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SessionCheckpoint createManyAndReturn
   */
  export type SessionCheckpointCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many SessionCheckpoints.
     */
    data: SessionCheckpointCreateManyInput | SessionCheckpointCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * SessionCheckpoint update
   */
  export type SessionCheckpointUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * The data needed to update a SessionCheckpoint.
     */
    data: XOR<SessionCheckpointUpdateInput, SessionCheckpointUncheckedUpdateInput>
    /**
     * Choose, which SessionCheckpoint to update.
     */
    where: SessionCheckpointWhereUniqueInput
  }

  /**
   * SessionCheckpoint updateMany
   */
  export type SessionCheckpointUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SessionCheckpoints.
     */
    data: XOR<SessionCheckpointUpdateManyMutationInput, SessionCheckpointUncheckedUpdateManyInput>
    /**
     * Filter which SessionCheckpoints to update
     */
    where?: SessionCheckpointWhereInput
  }

  /**
   * SessionCheckpoint upsert
   */
  export type SessionCheckpointUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * The filter to search for the SessionCheckpoint to update in case it exists.
     */
    where: SessionCheckpointWhereUniqueInput
    /**
     * In case the SessionCheckpoint found by the `where` argument doesn't exist, create a new SessionCheckpoint with this data.
     */
    create: XOR<SessionCheckpointCreateInput, SessionCheckpointUncheckedCreateInput>
    /**
     * In case the SessionCheckpoint was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SessionCheckpointUpdateInput, SessionCheckpointUncheckedUpdateInput>
  }

  /**
   * SessionCheckpoint delete
   */
  export type SessionCheckpointDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
    /**
     * Filter which SessionCheckpoint to delete.
     */
    where: SessionCheckpointWhereUniqueInput
  }

  /**
   * SessionCheckpoint deleteMany
   */
  export type SessionCheckpointDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SessionCheckpoints to delete
     */
    where?: SessionCheckpointWhereInput
  }

  /**
   * SessionCheckpoint without action
   */
  export type SessionCheckpointDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SessionCheckpoint
     */
    select?: SessionCheckpointSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: SessionCheckpointInclude<ExtArgs> | null
  }


  /**
   * Model ChallengeAttempt
   */

  export type AggregateChallengeAttempt = {
    _count: ChallengeAttemptCountAggregateOutputType | null
    _avg: ChallengeAttemptAvgAggregateOutputType | null
    _sum: ChallengeAttemptSumAggregateOutputType | null
    _min: ChallengeAttemptMinAggregateOutputType | null
    _max: ChallengeAttemptMaxAggregateOutputType | null
  }

  export type ChallengeAttemptAvgAggregateOutputType = {
    attemptNumber: number | null
    usedHints: number | null
    timeSpentSeconds: number | null
  }

  export type ChallengeAttemptSumAggregateOutputType = {
    attemptNumber: number | null
    usedHints: number | null
    timeSpentSeconds: number | null
  }

  export type ChallengeAttemptMinAggregateOutputType = {
    id: string | null
    sessionId: string | null
    challengeId: string | null
    answerId: string | null
    textAnswer: string | null
    isCorrect: boolean | null
    status: $Enums.ChallengeStatus | null
    attemptNumber: number | null
    usedHints: number | null
    timeSpentSeconds: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChallengeAttemptMaxAggregateOutputType = {
    id: string | null
    sessionId: string | null
    challengeId: string | null
    answerId: string | null
    textAnswer: string | null
    isCorrect: boolean | null
    status: $Enums.ChallengeStatus | null
    attemptNumber: number | null
    usedHints: number | null
    timeSpentSeconds: number | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChallengeAttemptCountAggregateOutputType = {
    id: number
    sessionId: number
    challengeId: number
    answerId: number
    textAnswer: number
    isCorrect: number
    status: number
    attemptNumber: number
    usedHints: number
    timeSpentSeconds: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChallengeAttemptAvgAggregateInputType = {
    attemptNumber?: true
    usedHints?: true
    timeSpentSeconds?: true
  }

  export type ChallengeAttemptSumAggregateInputType = {
    attemptNumber?: true
    usedHints?: true
    timeSpentSeconds?: true
  }

  export type ChallengeAttemptMinAggregateInputType = {
    id?: true
    sessionId?: true
    challengeId?: true
    answerId?: true
    textAnswer?: true
    isCorrect?: true
    status?: true
    attemptNumber?: true
    usedHints?: true
    timeSpentSeconds?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChallengeAttemptMaxAggregateInputType = {
    id?: true
    sessionId?: true
    challengeId?: true
    answerId?: true
    textAnswer?: true
    isCorrect?: true
    status?: true
    attemptNumber?: true
    usedHints?: true
    timeSpentSeconds?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChallengeAttemptCountAggregateInputType = {
    id?: true
    sessionId?: true
    challengeId?: true
    answerId?: true
    textAnswer?: true
    isCorrect?: true
    status?: true
    attemptNumber?: true
    usedHints?: true
    timeSpentSeconds?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChallengeAttemptAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChallengeAttempt to aggregate.
     */
    where?: ChallengeAttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChallengeAttempts to fetch.
     */
    orderBy?: ChallengeAttemptOrderByWithRelationInput | ChallengeAttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChallengeAttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChallengeAttempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChallengeAttempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChallengeAttempts
    **/
    _count?: true | ChallengeAttemptCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: ChallengeAttemptAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: ChallengeAttemptSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChallengeAttemptMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChallengeAttemptMaxAggregateInputType
  }

  export type GetChallengeAttemptAggregateType<T extends ChallengeAttemptAggregateArgs> = {
        [P in keyof T & keyof AggregateChallengeAttempt]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChallengeAttempt[P]>
      : GetScalarType<T[P], AggregateChallengeAttempt[P]>
  }




  export type ChallengeAttemptGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChallengeAttemptWhereInput
    orderBy?: ChallengeAttemptOrderByWithAggregationInput | ChallengeAttemptOrderByWithAggregationInput[]
    by: ChallengeAttemptScalarFieldEnum[] | ChallengeAttemptScalarFieldEnum
    having?: ChallengeAttemptScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChallengeAttemptCountAggregateInputType | true
    _avg?: ChallengeAttemptAvgAggregateInputType
    _sum?: ChallengeAttemptSumAggregateInputType
    _min?: ChallengeAttemptMinAggregateInputType
    _max?: ChallengeAttemptMaxAggregateInputType
  }

  export type ChallengeAttemptGroupByOutputType = {
    id: string
    sessionId: string
    challengeId: string
    answerId: string | null
    textAnswer: string | null
    isCorrect: boolean | null
    status: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds: number
    createdAt: Date
    updatedAt: Date
    _count: ChallengeAttemptCountAggregateOutputType | null
    _avg: ChallengeAttemptAvgAggregateOutputType | null
    _sum: ChallengeAttemptSumAggregateOutputType | null
    _min: ChallengeAttemptMinAggregateOutputType | null
    _max: ChallengeAttemptMaxAggregateOutputType | null
  }

  type GetChallengeAttemptGroupByPayload<T extends ChallengeAttemptGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChallengeAttemptGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChallengeAttemptGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChallengeAttemptGroupByOutputType[P]>
            : GetScalarType<T[P], ChallengeAttemptGroupByOutputType[P]>
        }
      >
    >


  export type ChallengeAttemptSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    challengeId?: boolean
    answerId?: boolean
    textAnswer?: boolean
    isCorrect?: boolean
    status?: boolean
    attemptNumber?: boolean
    usedHints?: boolean
    timeSpentSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | GameSessionDefaultArgs<ExtArgs>
    actions?: boolean | ChallengeAttempt$actionsArgs<ExtArgs>
    starEvent?: boolean | ChallengeAttempt$starEventArgs<ExtArgs>
    _count?: boolean | ChallengeAttemptCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["challengeAttempt"]>

  export type ChallengeAttemptSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    sessionId?: boolean
    challengeId?: boolean
    answerId?: boolean
    textAnswer?: boolean
    isCorrect?: boolean
    status?: boolean
    attemptNumber?: boolean
    usedHints?: boolean
    timeSpentSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    session?: boolean | GameSessionDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["challengeAttempt"]>

  export type ChallengeAttemptSelectScalar = {
    id?: boolean
    sessionId?: boolean
    challengeId?: boolean
    answerId?: boolean
    textAnswer?: boolean
    isCorrect?: boolean
    status?: boolean
    attemptNumber?: boolean
    usedHints?: boolean
    timeSpentSeconds?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ChallengeAttemptInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | GameSessionDefaultArgs<ExtArgs>
    actions?: boolean | ChallengeAttempt$actionsArgs<ExtArgs>
    starEvent?: boolean | ChallengeAttempt$starEventArgs<ExtArgs>
    _count?: boolean | ChallengeAttemptCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type ChallengeAttemptIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    session?: boolean | GameSessionDefaultArgs<ExtArgs>
  }

  export type $ChallengeAttemptPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChallengeAttempt"
    objects: {
      session: Prisma.$GameSessionPayload<ExtArgs>
      actions: Prisma.$AttemptActionPayload<ExtArgs>[]
      starEvent: Prisma.$StarEventPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      sessionId: string
      challengeId: string
      answerId: string | null
      textAnswer: string | null
      isCorrect: boolean | null
      status: $Enums.ChallengeStatus
      attemptNumber: number
      usedHints: number
      timeSpentSeconds: number
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["challengeAttempt"]>
    composites: {}
  }

  type ChallengeAttemptGetPayload<S extends boolean | null | undefined | ChallengeAttemptDefaultArgs> = $Result.GetResult<Prisma.$ChallengeAttemptPayload, S>

  type ChallengeAttemptCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ChallengeAttemptFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ChallengeAttemptCountAggregateInputType | true
    }

  export interface ChallengeAttemptDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChallengeAttempt'], meta: { name: 'ChallengeAttempt' } }
    /**
     * Find zero or one ChallengeAttempt that matches the filter.
     * @param {ChallengeAttemptFindUniqueArgs} args - Arguments to find a ChallengeAttempt
     * @example
     * // Get one ChallengeAttempt
     * const challengeAttempt = await prisma.challengeAttempt.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChallengeAttemptFindUniqueArgs>(args: SelectSubset<T, ChallengeAttemptFindUniqueArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ChallengeAttempt that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ChallengeAttemptFindUniqueOrThrowArgs} args - Arguments to find a ChallengeAttempt
     * @example
     * // Get one ChallengeAttempt
     * const challengeAttempt = await prisma.challengeAttempt.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChallengeAttemptFindUniqueOrThrowArgs>(args: SelectSubset<T, ChallengeAttemptFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ChallengeAttempt that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChallengeAttemptFindFirstArgs} args - Arguments to find a ChallengeAttempt
     * @example
     * // Get one ChallengeAttempt
     * const challengeAttempt = await prisma.challengeAttempt.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChallengeAttemptFindFirstArgs>(args?: SelectSubset<T, ChallengeAttemptFindFirstArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ChallengeAttempt that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChallengeAttemptFindFirstOrThrowArgs} args - Arguments to find a ChallengeAttempt
     * @example
     * // Get one ChallengeAttempt
     * const challengeAttempt = await prisma.challengeAttempt.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChallengeAttemptFindFirstOrThrowArgs>(args?: SelectSubset<T, ChallengeAttemptFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ChallengeAttempts that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChallengeAttemptFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChallengeAttempts
     * const challengeAttempts = await prisma.challengeAttempt.findMany()
     * 
     * // Get first 10 ChallengeAttempts
     * const challengeAttempts = await prisma.challengeAttempt.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const challengeAttemptWithIdOnly = await prisma.challengeAttempt.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChallengeAttemptFindManyArgs>(args?: SelectSubset<T, ChallengeAttemptFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ChallengeAttempt.
     * @param {ChallengeAttemptCreateArgs} args - Arguments to create a ChallengeAttempt.
     * @example
     * // Create one ChallengeAttempt
     * const ChallengeAttempt = await prisma.challengeAttempt.create({
     *   data: {
     *     // ... data to create a ChallengeAttempt
     *   }
     * })
     * 
     */
    create<T extends ChallengeAttemptCreateArgs>(args: SelectSubset<T, ChallengeAttemptCreateArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ChallengeAttempts.
     * @param {ChallengeAttemptCreateManyArgs} args - Arguments to create many ChallengeAttempts.
     * @example
     * // Create many ChallengeAttempts
     * const challengeAttempt = await prisma.challengeAttempt.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChallengeAttemptCreateManyArgs>(args?: SelectSubset<T, ChallengeAttemptCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChallengeAttempts and returns the data saved in the database.
     * @param {ChallengeAttemptCreateManyAndReturnArgs} args - Arguments to create many ChallengeAttempts.
     * @example
     * // Create many ChallengeAttempts
     * const challengeAttempt = await prisma.challengeAttempt.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChallengeAttempts and only return the `id`
     * const challengeAttemptWithIdOnly = await prisma.challengeAttempt.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChallengeAttemptCreateManyAndReturnArgs>(args?: SelectSubset<T, ChallengeAttemptCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ChallengeAttempt.
     * @param {ChallengeAttemptDeleteArgs} args - Arguments to delete one ChallengeAttempt.
     * @example
     * // Delete one ChallengeAttempt
     * const ChallengeAttempt = await prisma.challengeAttempt.delete({
     *   where: {
     *     // ... filter to delete one ChallengeAttempt
     *   }
     * })
     * 
     */
    delete<T extends ChallengeAttemptDeleteArgs>(args: SelectSubset<T, ChallengeAttemptDeleteArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ChallengeAttempt.
     * @param {ChallengeAttemptUpdateArgs} args - Arguments to update one ChallengeAttempt.
     * @example
     * // Update one ChallengeAttempt
     * const challengeAttempt = await prisma.challengeAttempt.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChallengeAttemptUpdateArgs>(args: SelectSubset<T, ChallengeAttemptUpdateArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ChallengeAttempts.
     * @param {ChallengeAttemptDeleteManyArgs} args - Arguments to filter ChallengeAttempts to delete.
     * @example
     * // Delete a few ChallengeAttempts
     * const { count } = await prisma.challengeAttempt.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChallengeAttemptDeleteManyArgs>(args?: SelectSubset<T, ChallengeAttemptDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChallengeAttempts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChallengeAttemptUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChallengeAttempts
     * const challengeAttempt = await prisma.challengeAttempt.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChallengeAttemptUpdateManyArgs>(args: SelectSubset<T, ChallengeAttemptUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChallengeAttempt.
     * @param {ChallengeAttemptUpsertArgs} args - Arguments to update or create a ChallengeAttempt.
     * @example
     * // Update or create a ChallengeAttempt
     * const challengeAttempt = await prisma.challengeAttempt.upsert({
     *   create: {
     *     // ... data to create a ChallengeAttempt
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChallengeAttempt we want to update
     *   }
     * })
     */
    upsert<T extends ChallengeAttemptUpsertArgs>(args: SelectSubset<T, ChallengeAttemptUpsertArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ChallengeAttempts.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChallengeAttemptCountArgs} args - Arguments to filter ChallengeAttempts to count.
     * @example
     * // Count the number of ChallengeAttempts
     * const count = await prisma.challengeAttempt.count({
     *   where: {
     *     // ... the filter for the ChallengeAttempts we want to count
     *   }
     * })
    **/
    count<T extends ChallengeAttemptCountArgs>(
      args?: Subset<T, ChallengeAttemptCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChallengeAttemptCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChallengeAttempt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChallengeAttemptAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChallengeAttemptAggregateArgs>(args: Subset<T, ChallengeAttemptAggregateArgs>): Prisma.PrismaPromise<GetChallengeAttemptAggregateType<T>>

    /**
     * Group by ChallengeAttempt.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChallengeAttemptGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChallengeAttemptGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChallengeAttemptGroupByArgs['orderBy'] }
        : { orderBy?: ChallengeAttemptGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChallengeAttemptGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChallengeAttemptGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChallengeAttempt model
   */
  readonly fields: ChallengeAttemptFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChallengeAttempt.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChallengeAttemptClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    session<T extends GameSessionDefaultArgs<ExtArgs> = {}>(args?: Subset<T, GameSessionDefaultArgs<ExtArgs>>): Prisma__GameSessionClient<$Result.GetResult<Prisma.$GameSessionPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    actions<T extends ChallengeAttempt$actionsArgs<ExtArgs> = {}>(args?: Subset<T, ChallengeAttempt$actionsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "findMany"> | Null>
    starEvent<T extends ChallengeAttempt$starEventArgs<ExtArgs> = {}>(args?: Subset<T, ChallengeAttempt$starEventArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "findUniqueOrThrow"> | null, null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChallengeAttempt model
   */ 
  interface ChallengeAttemptFieldRefs {
    readonly id: FieldRef<"ChallengeAttempt", 'String'>
    readonly sessionId: FieldRef<"ChallengeAttempt", 'String'>
    readonly challengeId: FieldRef<"ChallengeAttempt", 'String'>
    readonly answerId: FieldRef<"ChallengeAttempt", 'String'>
    readonly textAnswer: FieldRef<"ChallengeAttempt", 'String'>
    readonly isCorrect: FieldRef<"ChallengeAttempt", 'Boolean'>
    readonly status: FieldRef<"ChallengeAttempt", 'ChallengeStatus'>
    readonly attemptNumber: FieldRef<"ChallengeAttempt", 'Int'>
    readonly usedHints: FieldRef<"ChallengeAttempt", 'Int'>
    readonly timeSpentSeconds: FieldRef<"ChallengeAttempt", 'Int'>
    readonly createdAt: FieldRef<"ChallengeAttempt", 'DateTime'>
    readonly updatedAt: FieldRef<"ChallengeAttempt", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChallengeAttempt findUnique
   */
  export type ChallengeAttemptFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * Filter, which ChallengeAttempt to fetch.
     */
    where: ChallengeAttemptWhereUniqueInput
  }

  /**
   * ChallengeAttempt findUniqueOrThrow
   */
  export type ChallengeAttemptFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * Filter, which ChallengeAttempt to fetch.
     */
    where: ChallengeAttemptWhereUniqueInput
  }

  /**
   * ChallengeAttempt findFirst
   */
  export type ChallengeAttemptFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * Filter, which ChallengeAttempt to fetch.
     */
    where?: ChallengeAttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChallengeAttempts to fetch.
     */
    orderBy?: ChallengeAttemptOrderByWithRelationInput | ChallengeAttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChallengeAttempts.
     */
    cursor?: ChallengeAttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChallengeAttempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChallengeAttempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChallengeAttempts.
     */
    distinct?: ChallengeAttemptScalarFieldEnum | ChallengeAttemptScalarFieldEnum[]
  }

  /**
   * ChallengeAttempt findFirstOrThrow
   */
  export type ChallengeAttemptFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * Filter, which ChallengeAttempt to fetch.
     */
    where?: ChallengeAttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChallengeAttempts to fetch.
     */
    orderBy?: ChallengeAttemptOrderByWithRelationInput | ChallengeAttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChallengeAttempts.
     */
    cursor?: ChallengeAttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChallengeAttempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChallengeAttempts.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChallengeAttempts.
     */
    distinct?: ChallengeAttemptScalarFieldEnum | ChallengeAttemptScalarFieldEnum[]
  }

  /**
   * ChallengeAttempt findMany
   */
  export type ChallengeAttemptFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * Filter, which ChallengeAttempts to fetch.
     */
    where?: ChallengeAttemptWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChallengeAttempts to fetch.
     */
    orderBy?: ChallengeAttemptOrderByWithRelationInput | ChallengeAttemptOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChallengeAttempts.
     */
    cursor?: ChallengeAttemptWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChallengeAttempts from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChallengeAttempts.
     */
    skip?: number
    distinct?: ChallengeAttemptScalarFieldEnum | ChallengeAttemptScalarFieldEnum[]
  }

  /**
   * ChallengeAttempt create
   */
  export type ChallengeAttemptCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * The data needed to create a ChallengeAttempt.
     */
    data: XOR<ChallengeAttemptCreateInput, ChallengeAttemptUncheckedCreateInput>
  }

  /**
   * ChallengeAttempt createMany
   */
  export type ChallengeAttemptCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChallengeAttempts.
     */
    data: ChallengeAttemptCreateManyInput | ChallengeAttemptCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChallengeAttempt createManyAndReturn
   */
  export type ChallengeAttemptCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ChallengeAttempts.
     */
    data: ChallengeAttemptCreateManyInput | ChallengeAttemptCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ChallengeAttempt update
   */
  export type ChallengeAttemptUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * The data needed to update a ChallengeAttempt.
     */
    data: XOR<ChallengeAttemptUpdateInput, ChallengeAttemptUncheckedUpdateInput>
    /**
     * Choose, which ChallengeAttempt to update.
     */
    where: ChallengeAttemptWhereUniqueInput
  }

  /**
   * ChallengeAttempt updateMany
   */
  export type ChallengeAttemptUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChallengeAttempts.
     */
    data: XOR<ChallengeAttemptUpdateManyMutationInput, ChallengeAttemptUncheckedUpdateManyInput>
    /**
     * Filter which ChallengeAttempts to update
     */
    where?: ChallengeAttemptWhereInput
  }

  /**
   * ChallengeAttempt upsert
   */
  export type ChallengeAttemptUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * The filter to search for the ChallengeAttempt to update in case it exists.
     */
    where: ChallengeAttemptWhereUniqueInput
    /**
     * In case the ChallengeAttempt found by the `where` argument doesn't exist, create a new ChallengeAttempt with this data.
     */
    create: XOR<ChallengeAttemptCreateInput, ChallengeAttemptUncheckedCreateInput>
    /**
     * In case the ChallengeAttempt was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChallengeAttemptUpdateInput, ChallengeAttemptUncheckedUpdateInput>
  }

  /**
   * ChallengeAttempt delete
   */
  export type ChallengeAttemptDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
    /**
     * Filter which ChallengeAttempt to delete.
     */
    where: ChallengeAttemptWhereUniqueInput
  }

  /**
   * ChallengeAttempt deleteMany
   */
  export type ChallengeAttemptDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChallengeAttempts to delete
     */
    where?: ChallengeAttemptWhereInput
  }

  /**
   * ChallengeAttempt.actions
   */
  export type ChallengeAttempt$actionsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    where?: AttemptActionWhereInput
    orderBy?: AttemptActionOrderByWithRelationInput | AttemptActionOrderByWithRelationInput[]
    cursor?: AttemptActionWhereUniqueInput
    take?: number
    skip?: number
    distinct?: AttemptActionScalarFieldEnum | AttemptActionScalarFieldEnum[]
  }

  /**
   * ChallengeAttempt.starEvent
   */
  export type ChallengeAttempt$starEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    where?: StarEventWhereInput
  }

  /**
   * ChallengeAttempt without action
   */
  export type ChallengeAttemptDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChallengeAttempt
     */
    select?: ChallengeAttemptSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChallengeAttemptInclude<ExtArgs> | null
  }


  /**
   * Model AttemptAction
   */

  export type AggregateAttemptAction = {
    _count: AttemptActionCountAggregateOutputType | null
    _avg: AttemptActionAvgAggregateOutputType | null
    _sum: AttemptActionSumAggregateOutputType | null
    _min: AttemptActionMinAggregateOutputType | null
    _max: AttemptActionMaxAggregateOutputType | null
  }

  export type AttemptActionAvgAggregateOutputType = {
    attemptNumberAtAction: number | null
  }

  export type AttemptActionSumAggregateOutputType = {
    attemptNumberAtAction: number | null
  }

  export type AttemptActionMinAggregateOutputType = {
    id: string | null
    attemptId: string | null
    selectedAnswerId: string | null
    selectedAnswerText: string | null
    answerText: string | null
    isCorrect: boolean | null
    attemptNumberAtAction: number | null
    createdAt: Date | null
  }

  export type AttemptActionMaxAggregateOutputType = {
    id: string | null
    attemptId: string | null
    selectedAnswerId: string | null
    selectedAnswerText: string | null
    answerText: string | null
    isCorrect: boolean | null
    attemptNumberAtAction: number | null
    createdAt: Date | null
  }

  export type AttemptActionCountAggregateOutputType = {
    id: number
    attemptId: number
    selectedAnswerId: number
    selectedAnswerText: number
    answerText: number
    isCorrect: number
    attemptNumberAtAction: number
    createdAt: number
    _all: number
  }


  export type AttemptActionAvgAggregateInputType = {
    attemptNumberAtAction?: true
  }

  export type AttemptActionSumAggregateInputType = {
    attemptNumberAtAction?: true
  }

  export type AttemptActionMinAggregateInputType = {
    id?: true
    attemptId?: true
    selectedAnswerId?: true
    selectedAnswerText?: true
    answerText?: true
    isCorrect?: true
    attemptNumberAtAction?: true
    createdAt?: true
  }

  export type AttemptActionMaxAggregateInputType = {
    id?: true
    attemptId?: true
    selectedAnswerId?: true
    selectedAnswerText?: true
    answerText?: true
    isCorrect?: true
    attemptNumberAtAction?: true
    createdAt?: true
  }

  export type AttemptActionCountAggregateInputType = {
    id?: true
    attemptId?: true
    selectedAnswerId?: true
    selectedAnswerText?: true
    answerText?: true
    isCorrect?: true
    attemptNumberAtAction?: true
    createdAt?: true
    _all?: true
  }

  export type AttemptActionAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AttemptAction to aggregate.
     */
    where?: AttemptActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AttemptActions to fetch.
     */
    orderBy?: AttemptActionOrderByWithRelationInput | AttemptActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: AttemptActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AttemptActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AttemptActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned AttemptActions
    **/
    _count?: true | AttemptActionCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: AttemptActionAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: AttemptActionSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: AttemptActionMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: AttemptActionMaxAggregateInputType
  }

  export type GetAttemptActionAggregateType<T extends AttemptActionAggregateArgs> = {
        [P in keyof T & keyof AggregateAttemptAction]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateAttemptAction[P]>
      : GetScalarType<T[P], AggregateAttemptAction[P]>
  }




  export type AttemptActionGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: AttemptActionWhereInput
    orderBy?: AttemptActionOrderByWithAggregationInput | AttemptActionOrderByWithAggregationInput[]
    by: AttemptActionScalarFieldEnum[] | AttemptActionScalarFieldEnum
    having?: AttemptActionScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: AttemptActionCountAggregateInputType | true
    _avg?: AttemptActionAvgAggregateInputType
    _sum?: AttemptActionSumAggregateInputType
    _min?: AttemptActionMinAggregateInputType
    _max?: AttemptActionMaxAggregateInputType
  }

  export type AttemptActionGroupByOutputType = {
    id: string
    attemptId: string
    selectedAnswerId: string | null
    selectedAnswerText: string | null
    answerText: string | null
    isCorrect: boolean | null
    attemptNumberAtAction: number
    createdAt: Date
    _count: AttemptActionCountAggregateOutputType | null
    _avg: AttemptActionAvgAggregateOutputType | null
    _sum: AttemptActionSumAggregateOutputType | null
    _min: AttemptActionMinAggregateOutputType | null
    _max: AttemptActionMaxAggregateOutputType | null
  }

  type GetAttemptActionGroupByPayload<T extends AttemptActionGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<AttemptActionGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof AttemptActionGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], AttemptActionGroupByOutputType[P]>
            : GetScalarType<T[P], AttemptActionGroupByOutputType[P]>
        }
      >
    >


  export type AttemptActionSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    attemptId?: boolean
    selectedAnswerId?: boolean
    selectedAnswerText?: boolean
    answerText?: boolean
    isCorrect?: boolean
    attemptNumberAtAction?: boolean
    createdAt?: boolean
    attempt?: boolean | ChallengeAttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attemptAction"]>

  export type AttemptActionSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    attemptId?: boolean
    selectedAnswerId?: boolean
    selectedAnswerText?: boolean
    answerText?: boolean
    isCorrect?: boolean
    attemptNumberAtAction?: boolean
    createdAt?: boolean
    attempt?: boolean | ChallengeAttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["attemptAction"]>

  export type AttemptActionSelectScalar = {
    id?: boolean
    attemptId?: boolean
    selectedAnswerId?: boolean
    selectedAnswerText?: boolean
    answerText?: boolean
    isCorrect?: boolean
    attemptNumberAtAction?: boolean
    createdAt?: boolean
  }

  export type AttemptActionInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | ChallengeAttemptDefaultArgs<ExtArgs>
  }
  export type AttemptActionIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | ChallengeAttemptDefaultArgs<ExtArgs>
  }

  export type $AttemptActionPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "AttemptAction"
    objects: {
      attempt: Prisma.$ChallengeAttemptPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      attemptId: string
      selectedAnswerId: string | null
      selectedAnswerText: string | null
      answerText: string | null
      isCorrect: boolean | null
      attemptNumberAtAction: number
      createdAt: Date
    }, ExtArgs["result"]["attemptAction"]>
    composites: {}
  }

  type AttemptActionGetPayload<S extends boolean | null | undefined | AttemptActionDefaultArgs> = $Result.GetResult<Prisma.$AttemptActionPayload, S>

  type AttemptActionCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<AttemptActionFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: AttemptActionCountAggregateInputType | true
    }

  export interface AttemptActionDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['AttemptAction'], meta: { name: 'AttemptAction' } }
    /**
     * Find zero or one AttemptAction that matches the filter.
     * @param {AttemptActionFindUniqueArgs} args - Arguments to find a AttemptAction
     * @example
     * // Get one AttemptAction
     * const attemptAction = await prisma.attemptAction.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends AttemptActionFindUniqueArgs>(args: SelectSubset<T, AttemptActionFindUniqueArgs<ExtArgs>>): Prisma__AttemptActionClient<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one AttemptAction that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {AttemptActionFindUniqueOrThrowArgs} args - Arguments to find a AttemptAction
     * @example
     * // Get one AttemptAction
     * const attemptAction = await prisma.attemptAction.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends AttemptActionFindUniqueOrThrowArgs>(args: SelectSubset<T, AttemptActionFindUniqueOrThrowArgs<ExtArgs>>): Prisma__AttemptActionClient<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first AttemptAction that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptActionFindFirstArgs} args - Arguments to find a AttemptAction
     * @example
     * // Get one AttemptAction
     * const attemptAction = await prisma.attemptAction.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends AttemptActionFindFirstArgs>(args?: SelectSubset<T, AttemptActionFindFirstArgs<ExtArgs>>): Prisma__AttemptActionClient<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first AttemptAction that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptActionFindFirstOrThrowArgs} args - Arguments to find a AttemptAction
     * @example
     * // Get one AttemptAction
     * const attemptAction = await prisma.attemptAction.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends AttemptActionFindFirstOrThrowArgs>(args?: SelectSubset<T, AttemptActionFindFirstOrThrowArgs<ExtArgs>>): Prisma__AttemptActionClient<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more AttemptActions that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptActionFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all AttemptActions
     * const attemptActions = await prisma.attemptAction.findMany()
     * 
     * // Get first 10 AttemptActions
     * const attemptActions = await prisma.attemptAction.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const attemptActionWithIdOnly = await prisma.attemptAction.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends AttemptActionFindManyArgs>(args?: SelectSubset<T, AttemptActionFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a AttemptAction.
     * @param {AttemptActionCreateArgs} args - Arguments to create a AttemptAction.
     * @example
     * // Create one AttemptAction
     * const AttemptAction = await prisma.attemptAction.create({
     *   data: {
     *     // ... data to create a AttemptAction
     *   }
     * })
     * 
     */
    create<T extends AttemptActionCreateArgs>(args: SelectSubset<T, AttemptActionCreateArgs<ExtArgs>>): Prisma__AttemptActionClient<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many AttemptActions.
     * @param {AttemptActionCreateManyArgs} args - Arguments to create many AttemptActions.
     * @example
     * // Create many AttemptActions
     * const attemptAction = await prisma.attemptAction.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends AttemptActionCreateManyArgs>(args?: SelectSubset<T, AttemptActionCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many AttemptActions and returns the data saved in the database.
     * @param {AttemptActionCreateManyAndReturnArgs} args - Arguments to create many AttemptActions.
     * @example
     * // Create many AttemptActions
     * const attemptAction = await prisma.attemptAction.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many AttemptActions and only return the `id`
     * const attemptActionWithIdOnly = await prisma.attemptAction.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends AttemptActionCreateManyAndReturnArgs>(args?: SelectSubset<T, AttemptActionCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a AttemptAction.
     * @param {AttemptActionDeleteArgs} args - Arguments to delete one AttemptAction.
     * @example
     * // Delete one AttemptAction
     * const AttemptAction = await prisma.attemptAction.delete({
     *   where: {
     *     // ... filter to delete one AttemptAction
     *   }
     * })
     * 
     */
    delete<T extends AttemptActionDeleteArgs>(args: SelectSubset<T, AttemptActionDeleteArgs<ExtArgs>>): Prisma__AttemptActionClient<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one AttemptAction.
     * @param {AttemptActionUpdateArgs} args - Arguments to update one AttemptAction.
     * @example
     * // Update one AttemptAction
     * const attemptAction = await prisma.attemptAction.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends AttemptActionUpdateArgs>(args: SelectSubset<T, AttemptActionUpdateArgs<ExtArgs>>): Prisma__AttemptActionClient<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more AttemptActions.
     * @param {AttemptActionDeleteManyArgs} args - Arguments to filter AttemptActions to delete.
     * @example
     * // Delete a few AttemptActions
     * const { count } = await prisma.attemptAction.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends AttemptActionDeleteManyArgs>(args?: SelectSubset<T, AttemptActionDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more AttemptActions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptActionUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many AttemptActions
     * const attemptAction = await prisma.attemptAction.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends AttemptActionUpdateManyArgs>(args: SelectSubset<T, AttemptActionUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one AttemptAction.
     * @param {AttemptActionUpsertArgs} args - Arguments to update or create a AttemptAction.
     * @example
     * // Update or create a AttemptAction
     * const attemptAction = await prisma.attemptAction.upsert({
     *   create: {
     *     // ... data to create a AttemptAction
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the AttemptAction we want to update
     *   }
     * })
     */
    upsert<T extends AttemptActionUpsertArgs>(args: SelectSubset<T, AttemptActionUpsertArgs<ExtArgs>>): Prisma__AttemptActionClient<$Result.GetResult<Prisma.$AttemptActionPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of AttemptActions.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptActionCountArgs} args - Arguments to filter AttemptActions to count.
     * @example
     * // Count the number of AttemptActions
     * const count = await prisma.attemptAction.count({
     *   where: {
     *     // ... the filter for the AttemptActions we want to count
     *   }
     * })
    **/
    count<T extends AttemptActionCountArgs>(
      args?: Subset<T, AttemptActionCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], AttemptActionCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a AttemptAction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptActionAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends AttemptActionAggregateArgs>(args: Subset<T, AttemptActionAggregateArgs>): Prisma.PrismaPromise<GetAttemptActionAggregateType<T>>

    /**
     * Group by AttemptAction.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {AttemptActionGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends AttemptActionGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: AttemptActionGroupByArgs['orderBy'] }
        : { orderBy?: AttemptActionGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, AttemptActionGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetAttemptActionGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the AttemptAction model
   */
  readonly fields: AttemptActionFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for AttemptAction.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__AttemptActionClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    attempt<T extends ChallengeAttemptDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChallengeAttemptDefaultArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the AttemptAction model
   */ 
  interface AttemptActionFieldRefs {
    readonly id: FieldRef<"AttemptAction", 'String'>
    readonly attemptId: FieldRef<"AttemptAction", 'String'>
    readonly selectedAnswerId: FieldRef<"AttemptAction", 'String'>
    readonly selectedAnswerText: FieldRef<"AttemptAction", 'String'>
    readonly answerText: FieldRef<"AttemptAction", 'String'>
    readonly isCorrect: FieldRef<"AttemptAction", 'Boolean'>
    readonly attemptNumberAtAction: FieldRef<"AttemptAction", 'Int'>
    readonly createdAt: FieldRef<"AttemptAction", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * AttemptAction findUnique
   */
  export type AttemptActionFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * Filter, which AttemptAction to fetch.
     */
    where: AttemptActionWhereUniqueInput
  }

  /**
   * AttemptAction findUniqueOrThrow
   */
  export type AttemptActionFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * Filter, which AttemptAction to fetch.
     */
    where: AttemptActionWhereUniqueInput
  }

  /**
   * AttemptAction findFirst
   */
  export type AttemptActionFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * Filter, which AttemptAction to fetch.
     */
    where?: AttemptActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AttemptActions to fetch.
     */
    orderBy?: AttemptActionOrderByWithRelationInput | AttemptActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AttemptActions.
     */
    cursor?: AttemptActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AttemptActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AttemptActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AttemptActions.
     */
    distinct?: AttemptActionScalarFieldEnum | AttemptActionScalarFieldEnum[]
  }

  /**
   * AttemptAction findFirstOrThrow
   */
  export type AttemptActionFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * Filter, which AttemptAction to fetch.
     */
    where?: AttemptActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AttemptActions to fetch.
     */
    orderBy?: AttemptActionOrderByWithRelationInput | AttemptActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for AttemptActions.
     */
    cursor?: AttemptActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AttemptActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AttemptActions.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of AttemptActions.
     */
    distinct?: AttemptActionScalarFieldEnum | AttemptActionScalarFieldEnum[]
  }

  /**
   * AttemptAction findMany
   */
  export type AttemptActionFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * Filter, which AttemptActions to fetch.
     */
    where?: AttemptActionWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of AttemptActions to fetch.
     */
    orderBy?: AttemptActionOrderByWithRelationInput | AttemptActionOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing AttemptActions.
     */
    cursor?: AttemptActionWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` AttemptActions from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` AttemptActions.
     */
    skip?: number
    distinct?: AttemptActionScalarFieldEnum | AttemptActionScalarFieldEnum[]
  }

  /**
   * AttemptAction create
   */
  export type AttemptActionCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * The data needed to create a AttemptAction.
     */
    data: XOR<AttemptActionCreateInput, AttemptActionUncheckedCreateInput>
  }

  /**
   * AttemptAction createMany
   */
  export type AttemptActionCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many AttemptActions.
     */
    data: AttemptActionCreateManyInput | AttemptActionCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * AttemptAction createManyAndReturn
   */
  export type AttemptActionCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many AttemptActions.
     */
    data: AttemptActionCreateManyInput | AttemptActionCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * AttemptAction update
   */
  export type AttemptActionUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * The data needed to update a AttemptAction.
     */
    data: XOR<AttemptActionUpdateInput, AttemptActionUncheckedUpdateInput>
    /**
     * Choose, which AttemptAction to update.
     */
    where: AttemptActionWhereUniqueInput
  }

  /**
   * AttemptAction updateMany
   */
  export type AttemptActionUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update AttemptActions.
     */
    data: XOR<AttemptActionUpdateManyMutationInput, AttemptActionUncheckedUpdateManyInput>
    /**
     * Filter which AttemptActions to update
     */
    where?: AttemptActionWhereInput
  }

  /**
   * AttemptAction upsert
   */
  export type AttemptActionUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * The filter to search for the AttemptAction to update in case it exists.
     */
    where: AttemptActionWhereUniqueInput
    /**
     * In case the AttemptAction found by the `where` argument doesn't exist, create a new AttemptAction with this data.
     */
    create: XOR<AttemptActionCreateInput, AttemptActionUncheckedCreateInput>
    /**
     * In case the AttemptAction was found with the provided `where` argument, update it with this data.
     */
    update: XOR<AttemptActionUpdateInput, AttemptActionUncheckedUpdateInput>
  }

  /**
   * AttemptAction delete
   */
  export type AttemptActionDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
    /**
     * Filter which AttemptAction to delete.
     */
    where: AttemptActionWhereUniqueInput
  }

  /**
   * AttemptAction deleteMany
   */
  export type AttemptActionDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which AttemptActions to delete
     */
    where?: AttemptActionWhereInput
  }

  /**
   * AttemptAction without action
   */
  export type AttemptActionDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the AttemptAction
     */
    select?: AttemptActionSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: AttemptActionInclude<ExtArgs> | null
  }


  /**
   * Model StarEvent
   */

  export type AggregateStarEvent = {
    _count: StarEventCountAggregateOutputType | null
    _avg: StarEventAvgAggregateOutputType | null
    _sum: StarEventSumAggregateOutputType | null
    _min: StarEventMinAggregateOutputType | null
    _max: StarEventMaxAggregateOutputType | null
  }

  export type StarEventAvgAggregateOutputType = {
    baseStars: number | null
    noHintBonus: number | null
    firstTryBonus: number | null
    totalStars: number | null
    attemptNumber: number | null
  }

  export type StarEventSumAggregateOutputType = {
    baseStars: number | null
    noHintBonus: number | null
    firstTryBonus: number | null
    totalStars: number | null
    attemptNumber: number | null
  }

  export type StarEventMinAggregateOutputType = {
    id: string | null
    attemptId: string | null
    challengeId: string | null
    baseStars: number | null
    noHintBonus: number | null
    firstTryBonus: number | null
    totalStars: number | null
    attemptNumber: number | null
    usedHints: boolean | null
    wasCorrect: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StarEventMaxAggregateOutputType = {
    id: string | null
    attemptId: string | null
    challengeId: string | null
    baseStars: number | null
    noHintBonus: number | null
    firstTryBonus: number | null
    totalStars: number | null
    attemptNumber: number | null
    usedHints: boolean | null
    wasCorrect: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StarEventCountAggregateOutputType = {
    id: number
    attemptId: number
    challengeId: number
    baseStars: number
    noHintBonus: number
    firstTryBonus: number
    totalStars: number
    attemptNumber: number
    usedHints: number
    wasCorrect: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StarEventAvgAggregateInputType = {
    baseStars?: true
    noHintBonus?: true
    firstTryBonus?: true
    totalStars?: true
    attemptNumber?: true
  }

  export type StarEventSumAggregateInputType = {
    baseStars?: true
    noHintBonus?: true
    firstTryBonus?: true
    totalStars?: true
    attemptNumber?: true
  }

  export type StarEventMinAggregateInputType = {
    id?: true
    attemptId?: true
    challengeId?: true
    baseStars?: true
    noHintBonus?: true
    firstTryBonus?: true
    totalStars?: true
    attemptNumber?: true
    usedHints?: true
    wasCorrect?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StarEventMaxAggregateInputType = {
    id?: true
    attemptId?: true
    challengeId?: true
    baseStars?: true
    noHintBonus?: true
    firstTryBonus?: true
    totalStars?: true
    attemptNumber?: true
    usedHints?: true
    wasCorrect?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StarEventCountAggregateInputType = {
    id?: true
    attemptId?: true
    challengeId?: true
    baseStars?: true
    noHintBonus?: true
    firstTryBonus?: true
    totalStars?: true
    attemptNumber?: true
    usedHints?: true
    wasCorrect?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StarEventAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StarEvent to aggregate.
     */
    where?: StarEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StarEvents to fetch.
     */
    orderBy?: StarEventOrderByWithRelationInput | StarEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StarEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StarEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StarEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StarEvents
    **/
    _count?: true | StarEventCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: StarEventAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: StarEventSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StarEventMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StarEventMaxAggregateInputType
  }

  export type GetStarEventAggregateType<T extends StarEventAggregateArgs> = {
        [P in keyof T & keyof AggregateStarEvent]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStarEvent[P]>
      : GetScalarType<T[P], AggregateStarEvent[P]>
  }




  export type StarEventGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StarEventWhereInput
    orderBy?: StarEventOrderByWithAggregationInput | StarEventOrderByWithAggregationInput[]
    by: StarEventScalarFieldEnum[] | StarEventScalarFieldEnum
    having?: StarEventScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StarEventCountAggregateInputType | true
    _avg?: StarEventAvgAggregateInputType
    _sum?: StarEventSumAggregateInputType
    _min?: StarEventMinAggregateInputType
    _max?: StarEventMaxAggregateInputType
  }

  export type StarEventGroupByOutputType = {
    id: string
    attemptId: string
    challengeId: string
    baseStars: number
    noHintBonus: number
    firstTryBonus: number
    totalStars: number
    attemptNumber: number
    usedHints: boolean
    wasCorrect: boolean | null
    createdAt: Date
    updatedAt: Date
    _count: StarEventCountAggregateOutputType | null
    _avg: StarEventAvgAggregateOutputType | null
    _sum: StarEventSumAggregateOutputType | null
    _min: StarEventMinAggregateOutputType | null
    _max: StarEventMaxAggregateOutputType | null
  }

  type GetStarEventGroupByPayload<T extends StarEventGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StarEventGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StarEventGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StarEventGroupByOutputType[P]>
            : GetScalarType<T[P], StarEventGroupByOutputType[P]>
        }
      >
    >


  export type StarEventSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    attemptId?: boolean
    challengeId?: boolean
    baseStars?: boolean
    noHintBonus?: boolean
    firstTryBonus?: boolean
    totalStars?: boolean
    attemptNumber?: boolean
    usedHints?: boolean
    wasCorrect?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    attempt?: boolean | ChallengeAttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["starEvent"]>

  export type StarEventSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    attemptId?: boolean
    challengeId?: boolean
    baseStars?: boolean
    noHintBonus?: boolean
    firstTryBonus?: boolean
    totalStars?: boolean
    attemptNumber?: boolean
    usedHints?: boolean
    wasCorrect?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    attempt?: boolean | ChallengeAttemptDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["starEvent"]>

  export type StarEventSelectScalar = {
    id?: boolean
    attemptId?: boolean
    challengeId?: boolean
    baseStars?: boolean
    noHintBonus?: boolean
    firstTryBonus?: boolean
    totalStars?: boolean
    attemptNumber?: boolean
    usedHints?: boolean
    wasCorrect?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StarEventInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | ChallengeAttemptDefaultArgs<ExtArgs>
  }
  export type StarEventIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    attempt?: boolean | ChallengeAttemptDefaultArgs<ExtArgs>
  }

  export type $StarEventPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StarEvent"
    objects: {
      attempt: Prisma.$ChallengeAttemptPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      attemptId: string
      challengeId: string
      baseStars: number
      noHintBonus: number
      firstTryBonus: number
      totalStars: number
      attemptNumber: number
      usedHints: boolean
      wasCorrect: boolean | null
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["starEvent"]>
    composites: {}
  }

  type StarEventGetPayload<S extends boolean | null | undefined | StarEventDefaultArgs> = $Result.GetResult<Prisma.$StarEventPayload, S>

  type StarEventCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<StarEventFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: StarEventCountAggregateInputType | true
    }

  export interface StarEventDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StarEvent'], meta: { name: 'StarEvent' } }
    /**
     * Find zero or one StarEvent that matches the filter.
     * @param {StarEventFindUniqueArgs} args - Arguments to find a StarEvent
     * @example
     * // Get one StarEvent
     * const starEvent = await prisma.starEvent.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StarEventFindUniqueArgs>(args: SelectSubset<T, StarEventFindUniqueArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one StarEvent that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {StarEventFindUniqueOrThrowArgs} args - Arguments to find a StarEvent
     * @example
     * // Get one StarEvent
     * const starEvent = await prisma.starEvent.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StarEventFindUniqueOrThrowArgs>(args: SelectSubset<T, StarEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first StarEvent that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarEventFindFirstArgs} args - Arguments to find a StarEvent
     * @example
     * // Get one StarEvent
     * const starEvent = await prisma.starEvent.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StarEventFindFirstArgs>(args?: SelectSubset<T, StarEventFindFirstArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first StarEvent that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarEventFindFirstOrThrowArgs} args - Arguments to find a StarEvent
     * @example
     * // Get one StarEvent
     * const starEvent = await prisma.starEvent.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StarEventFindFirstOrThrowArgs>(args?: SelectSubset<T, StarEventFindFirstOrThrowArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more StarEvents that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarEventFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StarEvents
     * const starEvents = await prisma.starEvent.findMany()
     * 
     * // Get first 10 StarEvents
     * const starEvents = await prisma.starEvent.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const starEventWithIdOnly = await prisma.starEvent.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StarEventFindManyArgs>(args?: SelectSubset<T, StarEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "findMany">>

    /**
     * Create a StarEvent.
     * @param {StarEventCreateArgs} args - Arguments to create a StarEvent.
     * @example
     * // Create one StarEvent
     * const StarEvent = await prisma.starEvent.create({
     *   data: {
     *     // ... data to create a StarEvent
     *   }
     * })
     * 
     */
    create<T extends StarEventCreateArgs>(args: SelectSubset<T, StarEventCreateArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many StarEvents.
     * @param {StarEventCreateManyArgs} args - Arguments to create many StarEvents.
     * @example
     * // Create many StarEvents
     * const starEvent = await prisma.starEvent.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StarEventCreateManyArgs>(args?: SelectSubset<T, StarEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StarEvents and returns the data saved in the database.
     * @param {StarEventCreateManyAndReturnArgs} args - Arguments to create many StarEvents.
     * @example
     * // Create many StarEvents
     * const starEvent = await prisma.starEvent.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StarEvents and only return the `id`
     * const starEventWithIdOnly = await prisma.starEvent.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StarEventCreateManyAndReturnArgs>(args?: SelectSubset<T, StarEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a StarEvent.
     * @param {StarEventDeleteArgs} args - Arguments to delete one StarEvent.
     * @example
     * // Delete one StarEvent
     * const StarEvent = await prisma.starEvent.delete({
     *   where: {
     *     // ... filter to delete one StarEvent
     *   }
     * })
     * 
     */
    delete<T extends StarEventDeleteArgs>(args: SelectSubset<T, StarEventDeleteArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one StarEvent.
     * @param {StarEventUpdateArgs} args - Arguments to update one StarEvent.
     * @example
     * // Update one StarEvent
     * const starEvent = await prisma.starEvent.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StarEventUpdateArgs>(args: SelectSubset<T, StarEventUpdateArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more StarEvents.
     * @param {StarEventDeleteManyArgs} args - Arguments to filter StarEvents to delete.
     * @example
     * // Delete a few StarEvents
     * const { count } = await prisma.starEvent.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StarEventDeleteManyArgs>(args?: SelectSubset<T, StarEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StarEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarEventUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StarEvents
     * const starEvent = await prisma.starEvent.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StarEventUpdateManyArgs>(args: SelectSubset<T, StarEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one StarEvent.
     * @param {StarEventUpsertArgs} args - Arguments to update or create a StarEvent.
     * @example
     * // Update or create a StarEvent
     * const starEvent = await prisma.starEvent.upsert({
     *   create: {
     *     // ... data to create a StarEvent
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StarEvent we want to update
     *   }
     * })
     */
    upsert<T extends StarEventUpsertArgs>(args: SelectSubset<T, StarEventUpsertArgs<ExtArgs>>): Prisma__StarEventClient<$Result.GetResult<Prisma.$StarEventPayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of StarEvents.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarEventCountArgs} args - Arguments to filter StarEvents to count.
     * @example
     * // Count the number of StarEvents
     * const count = await prisma.starEvent.count({
     *   where: {
     *     // ... the filter for the StarEvents we want to count
     *   }
     * })
    **/
    count<T extends StarEventCountArgs>(
      args?: Subset<T, StarEventCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StarEventCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StarEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarEventAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StarEventAggregateArgs>(args: Subset<T, StarEventAggregateArgs>): Prisma.PrismaPromise<GetStarEventAggregateType<T>>

    /**
     * Group by StarEvent.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StarEventGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StarEventGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StarEventGroupByArgs['orderBy'] }
        : { orderBy?: StarEventGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StarEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStarEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StarEvent model
   */
  readonly fields: StarEventFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StarEvent.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StarEventClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    attempt<T extends ChallengeAttemptDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChallengeAttemptDefaultArgs<ExtArgs>>): Prisma__ChallengeAttemptClient<$Result.GetResult<Prisma.$ChallengeAttemptPayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the StarEvent model
   */ 
  interface StarEventFieldRefs {
    readonly id: FieldRef<"StarEvent", 'String'>
    readonly attemptId: FieldRef<"StarEvent", 'String'>
    readonly challengeId: FieldRef<"StarEvent", 'String'>
    readonly baseStars: FieldRef<"StarEvent", 'Int'>
    readonly noHintBonus: FieldRef<"StarEvent", 'Int'>
    readonly firstTryBonus: FieldRef<"StarEvent", 'Int'>
    readonly totalStars: FieldRef<"StarEvent", 'Int'>
    readonly attemptNumber: FieldRef<"StarEvent", 'Int'>
    readonly usedHints: FieldRef<"StarEvent", 'Boolean'>
    readonly wasCorrect: FieldRef<"StarEvent", 'Boolean'>
    readonly createdAt: FieldRef<"StarEvent", 'DateTime'>
    readonly updatedAt: FieldRef<"StarEvent", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StarEvent findUnique
   */
  export type StarEventFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * Filter, which StarEvent to fetch.
     */
    where: StarEventWhereUniqueInput
  }

  /**
   * StarEvent findUniqueOrThrow
   */
  export type StarEventFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * Filter, which StarEvent to fetch.
     */
    where: StarEventWhereUniqueInput
  }

  /**
   * StarEvent findFirst
   */
  export type StarEventFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * Filter, which StarEvent to fetch.
     */
    where?: StarEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StarEvents to fetch.
     */
    orderBy?: StarEventOrderByWithRelationInput | StarEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StarEvents.
     */
    cursor?: StarEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StarEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StarEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StarEvents.
     */
    distinct?: StarEventScalarFieldEnum | StarEventScalarFieldEnum[]
  }

  /**
   * StarEvent findFirstOrThrow
   */
  export type StarEventFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * Filter, which StarEvent to fetch.
     */
    where?: StarEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StarEvents to fetch.
     */
    orderBy?: StarEventOrderByWithRelationInput | StarEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StarEvents.
     */
    cursor?: StarEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StarEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StarEvents.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StarEvents.
     */
    distinct?: StarEventScalarFieldEnum | StarEventScalarFieldEnum[]
  }

  /**
   * StarEvent findMany
   */
  export type StarEventFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * Filter, which StarEvents to fetch.
     */
    where?: StarEventWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StarEvents to fetch.
     */
    orderBy?: StarEventOrderByWithRelationInput | StarEventOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StarEvents.
     */
    cursor?: StarEventWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StarEvents from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StarEvents.
     */
    skip?: number
    distinct?: StarEventScalarFieldEnum | StarEventScalarFieldEnum[]
  }

  /**
   * StarEvent create
   */
  export type StarEventCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * The data needed to create a StarEvent.
     */
    data: XOR<StarEventCreateInput, StarEventUncheckedCreateInput>
  }

  /**
   * StarEvent createMany
   */
  export type StarEventCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StarEvents.
     */
    data: StarEventCreateManyInput | StarEventCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StarEvent createManyAndReturn
   */
  export type StarEventCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many StarEvents.
     */
    data: StarEventCreateManyInput | StarEventCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * StarEvent update
   */
  export type StarEventUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * The data needed to update a StarEvent.
     */
    data: XOR<StarEventUpdateInput, StarEventUncheckedUpdateInput>
    /**
     * Choose, which StarEvent to update.
     */
    where: StarEventWhereUniqueInput
  }

  /**
   * StarEvent updateMany
   */
  export type StarEventUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StarEvents.
     */
    data: XOR<StarEventUpdateManyMutationInput, StarEventUncheckedUpdateManyInput>
    /**
     * Filter which StarEvents to update
     */
    where?: StarEventWhereInput
  }

  /**
   * StarEvent upsert
   */
  export type StarEventUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * The filter to search for the StarEvent to update in case it exists.
     */
    where: StarEventWhereUniqueInput
    /**
     * In case the StarEvent found by the `where` argument doesn't exist, create a new StarEvent with this data.
     */
    create: XOR<StarEventCreateInput, StarEventUncheckedCreateInput>
    /**
     * In case the StarEvent was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StarEventUpdateInput, StarEventUncheckedUpdateInput>
  }

  /**
   * StarEvent delete
   */
  export type StarEventDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
    /**
     * Filter which StarEvent to delete.
     */
    where: StarEventWhereUniqueInput
  }

  /**
   * StarEvent deleteMany
   */
  export type StarEventDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StarEvents to delete
     */
    where?: StarEventWhereInput
  }

  /**
   * StarEvent without action
   */
  export type StarEventDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StarEvent
     */
    select?: StarEventSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: StarEventInclude<ExtArgs> | null
  }


  /**
   * Model ChildBadge
   */

  export type AggregateChildBadge = {
    _count: ChildBadgeCountAggregateOutputType | null
    _min: ChildBadgeMinAggregateOutputType | null
    _max: ChildBadgeMaxAggregateOutputType | null
  }

  export type ChildBadgeMinAggregateOutputType = {
    id: string | null
    childProfileId: string | null
    badgeId: string | null
    earnedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChildBadgeMaxAggregateOutputType = {
    id: string | null
    childProfileId: string | null
    badgeId: string | null
    earnedAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type ChildBadgeCountAggregateOutputType = {
    id: number
    childProfileId: number
    badgeId: number
    earnedAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type ChildBadgeMinAggregateInputType = {
    id?: true
    childProfileId?: true
    badgeId?: true
    earnedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChildBadgeMaxAggregateInputType = {
    id?: true
    childProfileId?: true
    badgeId?: true
    earnedAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type ChildBadgeCountAggregateInputType = {
    id?: true
    childProfileId?: true
    badgeId?: true
    earnedAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type ChildBadgeAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChildBadge to aggregate.
     */
    where?: ChildBadgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChildBadges to fetch.
     */
    orderBy?: ChildBadgeOrderByWithRelationInput | ChildBadgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: ChildBadgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChildBadges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChildBadges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned ChildBadges
    **/
    _count?: true | ChildBadgeCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: ChildBadgeMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: ChildBadgeMaxAggregateInputType
  }

  export type GetChildBadgeAggregateType<T extends ChildBadgeAggregateArgs> = {
        [P in keyof T & keyof AggregateChildBadge]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateChildBadge[P]>
      : GetScalarType<T[P], AggregateChildBadge[P]>
  }




  export type ChildBadgeGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: ChildBadgeWhereInput
    orderBy?: ChildBadgeOrderByWithAggregationInput | ChildBadgeOrderByWithAggregationInput[]
    by: ChildBadgeScalarFieldEnum[] | ChildBadgeScalarFieldEnum
    having?: ChildBadgeScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: ChildBadgeCountAggregateInputType | true
    _min?: ChildBadgeMinAggregateInputType
    _max?: ChildBadgeMaxAggregateInputType
  }

  export type ChildBadgeGroupByOutputType = {
    id: string
    childProfileId: string
    badgeId: string
    earnedAt: Date
    createdAt: Date
    updatedAt: Date
    _count: ChildBadgeCountAggregateOutputType | null
    _min: ChildBadgeMinAggregateOutputType | null
    _max: ChildBadgeMaxAggregateOutputType | null
  }

  type GetChildBadgeGroupByPayload<T extends ChildBadgeGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<ChildBadgeGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof ChildBadgeGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], ChildBadgeGroupByOutputType[P]>
            : GetScalarType<T[P], ChildBadgeGroupByOutputType[P]>
        }
      >
    >


  export type ChildBadgeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    childProfileId?: boolean
    badgeId?: boolean
    earnedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    childProfile?: boolean | ChildProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["childBadge"]>

  export type ChildBadgeSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    childProfileId?: boolean
    badgeId?: boolean
    earnedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
    childProfile?: boolean | ChildProfileDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["childBadge"]>

  export type ChildBadgeSelectScalar = {
    id?: boolean
    childProfileId?: boolean
    badgeId?: boolean
    earnedAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type ChildBadgeInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    childProfile?: boolean | ChildProfileDefaultArgs<ExtArgs>
  }
  export type ChildBadgeIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    childProfile?: boolean | ChildProfileDefaultArgs<ExtArgs>
  }

  export type $ChildBadgePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "ChildBadge"
    objects: {
      childProfile: Prisma.$ChildProfilePayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      childProfileId: string
      badgeId: string
      earnedAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["childBadge"]>
    composites: {}
  }

  type ChildBadgeGetPayload<S extends boolean | null | undefined | ChildBadgeDefaultArgs> = $Result.GetResult<Prisma.$ChildBadgePayload, S>

  type ChildBadgeCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = 
    Omit<ChildBadgeFindManyArgs, 'select' | 'include' | 'distinct'> & {
      select?: ChildBadgeCountAggregateInputType | true
    }

  export interface ChildBadgeDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['ChildBadge'], meta: { name: 'ChildBadge' } }
    /**
     * Find zero or one ChildBadge that matches the filter.
     * @param {ChildBadgeFindUniqueArgs} args - Arguments to find a ChildBadge
     * @example
     * // Get one ChildBadge
     * const childBadge = await prisma.childBadge.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends ChildBadgeFindUniqueArgs>(args: SelectSubset<T, ChildBadgeFindUniqueArgs<ExtArgs>>): Prisma__ChildBadgeClient<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "findUnique"> | null, null, ExtArgs>

    /**
     * Find one ChildBadge that matches the filter or throw an error with `error.code='P2025'` 
     * if no matches were found.
     * @param {ChildBadgeFindUniqueOrThrowArgs} args - Arguments to find a ChildBadge
     * @example
     * // Get one ChildBadge
     * const childBadge = await prisma.childBadge.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends ChildBadgeFindUniqueOrThrowArgs>(args: SelectSubset<T, ChildBadgeFindUniqueOrThrowArgs<ExtArgs>>): Prisma__ChildBadgeClient<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "findUniqueOrThrow">, never, ExtArgs>

    /**
     * Find the first ChildBadge that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildBadgeFindFirstArgs} args - Arguments to find a ChildBadge
     * @example
     * // Get one ChildBadge
     * const childBadge = await prisma.childBadge.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends ChildBadgeFindFirstArgs>(args?: SelectSubset<T, ChildBadgeFindFirstArgs<ExtArgs>>): Prisma__ChildBadgeClient<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "findFirst"> | null, null, ExtArgs>

    /**
     * Find the first ChildBadge that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildBadgeFindFirstOrThrowArgs} args - Arguments to find a ChildBadge
     * @example
     * // Get one ChildBadge
     * const childBadge = await prisma.childBadge.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends ChildBadgeFindFirstOrThrowArgs>(args?: SelectSubset<T, ChildBadgeFindFirstOrThrowArgs<ExtArgs>>): Prisma__ChildBadgeClient<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "findFirstOrThrow">, never, ExtArgs>

    /**
     * Find zero or more ChildBadges that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildBadgeFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all ChildBadges
     * const childBadges = await prisma.childBadge.findMany()
     * 
     * // Get first 10 ChildBadges
     * const childBadges = await prisma.childBadge.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const childBadgeWithIdOnly = await prisma.childBadge.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends ChildBadgeFindManyArgs>(args?: SelectSubset<T, ChildBadgeFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "findMany">>

    /**
     * Create a ChildBadge.
     * @param {ChildBadgeCreateArgs} args - Arguments to create a ChildBadge.
     * @example
     * // Create one ChildBadge
     * const ChildBadge = await prisma.childBadge.create({
     *   data: {
     *     // ... data to create a ChildBadge
     *   }
     * })
     * 
     */
    create<T extends ChildBadgeCreateArgs>(args: SelectSubset<T, ChildBadgeCreateArgs<ExtArgs>>): Prisma__ChildBadgeClient<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "create">, never, ExtArgs>

    /**
     * Create many ChildBadges.
     * @param {ChildBadgeCreateManyArgs} args - Arguments to create many ChildBadges.
     * @example
     * // Create many ChildBadges
     * const childBadge = await prisma.childBadge.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends ChildBadgeCreateManyArgs>(args?: SelectSubset<T, ChildBadgeCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many ChildBadges and returns the data saved in the database.
     * @param {ChildBadgeCreateManyAndReturnArgs} args - Arguments to create many ChildBadges.
     * @example
     * // Create many ChildBadges
     * const childBadge = await prisma.childBadge.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many ChildBadges and only return the `id`
     * const childBadgeWithIdOnly = await prisma.childBadge.createManyAndReturn({ 
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends ChildBadgeCreateManyAndReturnArgs>(args?: SelectSubset<T, ChildBadgeCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "createManyAndReturn">>

    /**
     * Delete a ChildBadge.
     * @param {ChildBadgeDeleteArgs} args - Arguments to delete one ChildBadge.
     * @example
     * // Delete one ChildBadge
     * const ChildBadge = await prisma.childBadge.delete({
     *   where: {
     *     // ... filter to delete one ChildBadge
     *   }
     * })
     * 
     */
    delete<T extends ChildBadgeDeleteArgs>(args: SelectSubset<T, ChildBadgeDeleteArgs<ExtArgs>>): Prisma__ChildBadgeClient<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "delete">, never, ExtArgs>

    /**
     * Update one ChildBadge.
     * @param {ChildBadgeUpdateArgs} args - Arguments to update one ChildBadge.
     * @example
     * // Update one ChildBadge
     * const childBadge = await prisma.childBadge.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends ChildBadgeUpdateArgs>(args: SelectSubset<T, ChildBadgeUpdateArgs<ExtArgs>>): Prisma__ChildBadgeClient<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "update">, never, ExtArgs>

    /**
     * Delete zero or more ChildBadges.
     * @param {ChildBadgeDeleteManyArgs} args - Arguments to filter ChildBadges to delete.
     * @example
     * // Delete a few ChildBadges
     * const { count } = await prisma.childBadge.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends ChildBadgeDeleteManyArgs>(args?: SelectSubset<T, ChildBadgeDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more ChildBadges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildBadgeUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many ChildBadges
     * const childBadge = await prisma.childBadge.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends ChildBadgeUpdateManyArgs>(args: SelectSubset<T, ChildBadgeUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create or update one ChildBadge.
     * @param {ChildBadgeUpsertArgs} args - Arguments to update or create a ChildBadge.
     * @example
     * // Update or create a ChildBadge
     * const childBadge = await prisma.childBadge.upsert({
     *   create: {
     *     // ... data to create a ChildBadge
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the ChildBadge we want to update
     *   }
     * })
     */
    upsert<T extends ChildBadgeUpsertArgs>(args: SelectSubset<T, ChildBadgeUpsertArgs<ExtArgs>>): Prisma__ChildBadgeClient<$Result.GetResult<Prisma.$ChildBadgePayload<ExtArgs>, T, "upsert">, never, ExtArgs>


    /**
     * Count the number of ChildBadges.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildBadgeCountArgs} args - Arguments to filter ChildBadges to count.
     * @example
     * // Count the number of ChildBadges
     * const count = await prisma.childBadge.count({
     *   where: {
     *     // ... the filter for the ChildBadges we want to count
     *   }
     * })
    **/
    count<T extends ChildBadgeCountArgs>(
      args?: Subset<T, ChildBadgeCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], ChildBadgeCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a ChildBadge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildBadgeAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends ChildBadgeAggregateArgs>(args: Subset<T, ChildBadgeAggregateArgs>): Prisma.PrismaPromise<GetChildBadgeAggregateType<T>>

    /**
     * Group by ChildBadge.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {ChildBadgeGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends ChildBadgeGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: ChildBadgeGroupByArgs['orderBy'] }
        : { orderBy?: ChildBadgeGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, ChildBadgeGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetChildBadgeGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the ChildBadge model
   */
  readonly fields: ChildBadgeFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for ChildBadge.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__ChildBadgeClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    childProfile<T extends ChildProfileDefaultArgs<ExtArgs> = {}>(args?: Subset<T, ChildProfileDefaultArgs<ExtArgs>>): Prisma__ChildProfileClient<$Result.GetResult<Prisma.$ChildProfilePayload<ExtArgs>, T, "findUniqueOrThrow"> | Null, Null, ExtArgs>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the ChildBadge model
   */ 
  interface ChildBadgeFieldRefs {
    readonly id: FieldRef<"ChildBadge", 'String'>
    readonly childProfileId: FieldRef<"ChildBadge", 'String'>
    readonly badgeId: FieldRef<"ChildBadge", 'String'>
    readonly earnedAt: FieldRef<"ChildBadge", 'DateTime'>
    readonly createdAt: FieldRef<"ChildBadge", 'DateTime'>
    readonly updatedAt: FieldRef<"ChildBadge", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * ChildBadge findUnique
   */
  export type ChildBadgeFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * Filter, which ChildBadge to fetch.
     */
    where: ChildBadgeWhereUniqueInput
  }

  /**
   * ChildBadge findUniqueOrThrow
   */
  export type ChildBadgeFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * Filter, which ChildBadge to fetch.
     */
    where: ChildBadgeWhereUniqueInput
  }

  /**
   * ChildBadge findFirst
   */
  export type ChildBadgeFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * Filter, which ChildBadge to fetch.
     */
    where?: ChildBadgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChildBadges to fetch.
     */
    orderBy?: ChildBadgeOrderByWithRelationInput | ChildBadgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChildBadges.
     */
    cursor?: ChildBadgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChildBadges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChildBadges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChildBadges.
     */
    distinct?: ChildBadgeScalarFieldEnum | ChildBadgeScalarFieldEnum[]
  }

  /**
   * ChildBadge findFirstOrThrow
   */
  export type ChildBadgeFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * Filter, which ChildBadge to fetch.
     */
    where?: ChildBadgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChildBadges to fetch.
     */
    orderBy?: ChildBadgeOrderByWithRelationInput | ChildBadgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for ChildBadges.
     */
    cursor?: ChildBadgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChildBadges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChildBadges.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of ChildBadges.
     */
    distinct?: ChildBadgeScalarFieldEnum | ChildBadgeScalarFieldEnum[]
  }

  /**
   * ChildBadge findMany
   */
  export type ChildBadgeFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * Filter, which ChildBadges to fetch.
     */
    where?: ChildBadgeWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of ChildBadges to fetch.
     */
    orderBy?: ChildBadgeOrderByWithRelationInput | ChildBadgeOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing ChildBadges.
     */
    cursor?: ChildBadgeWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` ChildBadges from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` ChildBadges.
     */
    skip?: number
    distinct?: ChildBadgeScalarFieldEnum | ChildBadgeScalarFieldEnum[]
  }

  /**
   * ChildBadge create
   */
  export type ChildBadgeCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * The data needed to create a ChildBadge.
     */
    data: XOR<ChildBadgeCreateInput, ChildBadgeUncheckedCreateInput>
  }

  /**
   * ChildBadge createMany
   */
  export type ChildBadgeCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many ChildBadges.
     */
    data: ChildBadgeCreateManyInput | ChildBadgeCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * ChildBadge createManyAndReturn
   */
  export type ChildBadgeCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * The data used to create many ChildBadges.
     */
    data: ChildBadgeCreateManyInput | ChildBadgeCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * ChildBadge update
   */
  export type ChildBadgeUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * The data needed to update a ChildBadge.
     */
    data: XOR<ChildBadgeUpdateInput, ChildBadgeUncheckedUpdateInput>
    /**
     * Choose, which ChildBadge to update.
     */
    where: ChildBadgeWhereUniqueInput
  }

  /**
   * ChildBadge updateMany
   */
  export type ChildBadgeUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update ChildBadges.
     */
    data: XOR<ChildBadgeUpdateManyMutationInput, ChildBadgeUncheckedUpdateManyInput>
    /**
     * Filter which ChildBadges to update
     */
    where?: ChildBadgeWhereInput
  }

  /**
   * ChildBadge upsert
   */
  export type ChildBadgeUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * The filter to search for the ChildBadge to update in case it exists.
     */
    where: ChildBadgeWhereUniqueInput
    /**
     * In case the ChildBadge found by the `where` argument doesn't exist, create a new ChildBadge with this data.
     */
    create: XOR<ChildBadgeCreateInput, ChildBadgeUncheckedCreateInput>
    /**
     * In case the ChildBadge was found with the provided `where` argument, update it with this data.
     */
    update: XOR<ChildBadgeUpdateInput, ChildBadgeUncheckedUpdateInput>
  }

  /**
   * ChildBadge delete
   */
  export type ChildBadgeDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
    /**
     * Filter which ChildBadge to delete.
     */
    where: ChildBadgeWhereUniqueInput
  }

  /**
   * ChildBadge deleteMany
   */
  export type ChildBadgeDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which ChildBadges to delete
     */
    where?: ChildBadgeWhereInput
  }

  /**
   * ChildBadge without action
   */
  export type ChildBadgeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the ChildBadge
     */
    select?: ChildBadgeSelect<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: ChildBadgeInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const ChildProfileScalarFieldEnum: {
    id: 'id',
    name: 'name',
    parentId: 'parentId',
    childId: 'childId',
    ageGroupId: 'ageGroupId',
    ageGroupName: 'ageGroupName',
    favoriteThemes: 'favoriteThemes',
    allocatedRoadmaps: 'allocatedRoadmaps',
    currentLevel: 'currentLevel',
    totalStars: 'totalStars',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChildProfileScalarFieldEnum = (typeof ChildProfileScalarFieldEnum)[keyof typeof ChildProfileScalarFieldEnum]


  export const ProgressScalarFieldEnum: {
    id: 'id',
    childProfileId: 'childProfileId',
    roadmapId: 'roadmapId',
    worldId: 'worldId',
    storyId: 'storyId',
    status: 'status',
    totalTimeSpent: 'totalTimeSpent',
    completedAt: 'completedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ProgressScalarFieldEnum = (typeof ProgressScalarFieldEnum)[keyof typeof ProgressScalarFieldEnum]


  export const GameSessionScalarFieldEnum: {
    id: 'id',
    progressId: 'progressId',
    storyId: 'storyId',
    chapterId: 'chapterId',
    startedAt: 'startedAt',
    checkpointAt: 'checkpointAt',
    endedAt: 'endedAt',
    totalTimeSpent: 'totalTimeSpent',
    sessionCount: 'sessionCount',
    totalIdleTime: 'totalIdleTime',
    starsEarned: 'starsEarned',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type GameSessionScalarFieldEnum = (typeof GameSessionScalarFieldEnum)[keyof typeof GameSessionScalarFieldEnum]


  export const SessionCheckpointScalarFieldEnum: {
    id: 'id',
    gameSessionId: 'gameSessionId',
    firstChapterId: 'firstChapterId',
    lastChapterId: 'lastChapterId',
    startedAt: 'startedAt',
    pausedAt: 'pausedAt',
    sessionDurationSeconds: 'sessionDurationSeconds',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SessionCheckpointScalarFieldEnum = (typeof SessionCheckpointScalarFieldEnum)[keyof typeof SessionCheckpointScalarFieldEnum]


  export const ChallengeAttemptScalarFieldEnum: {
    id: 'id',
    sessionId: 'sessionId',
    challengeId: 'challengeId',
    answerId: 'answerId',
    textAnswer: 'textAnswer',
    isCorrect: 'isCorrect',
    status: 'status',
    attemptNumber: 'attemptNumber',
    usedHints: 'usedHints',
    timeSpentSeconds: 'timeSpentSeconds',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChallengeAttemptScalarFieldEnum = (typeof ChallengeAttemptScalarFieldEnum)[keyof typeof ChallengeAttemptScalarFieldEnum]


  export const AttemptActionScalarFieldEnum: {
    id: 'id',
    attemptId: 'attemptId',
    selectedAnswerId: 'selectedAnswerId',
    selectedAnswerText: 'selectedAnswerText',
    answerText: 'answerText',
    isCorrect: 'isCorrect',
    attemptNumberAtAction: 'attemptNumberAtAction',
    createdAt: 'createdAt'
  };

  export type AttemptActionScalarFieldEnum = (typeof AttemptActionScalarFieldEnum)[keyof typeof AttemptActionScalarFieldEnum]


  export const StarEventScalarFieldEnum: {
    id: 'id',
    attemptId: 'attemptId',
    challengeId: 'challengeId',
    baseStars: 'baseStars',
    noHintBonus: 'noHintBonus',
    firstTryBonus: 'firstTryBonus',
    totalStars: 'totalStars',
    attemptNumber: 'attemptNumber',
    usedHints: 'usedHints',
    wasCorrect: 'wasCorrect',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StarEventScalarFieldEnum = (typeof StarEventScalarFieldEnum)[keyof typeof StarEventScalarFieldEnum]


  export const ChildBadgeScalarFieldEnum: {
    id: 'id',
    childProfileId: 'childProfileId',
    badgeId: 'badgeId',
    earnedAt: 'earnedAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type ChildBadgeScalarFieldEnum = (typeof ChildBadgeScalarFieldEnum)[keyof typeof ChildBadgeScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references 
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'ProgressStatus'
   */
  export type EnumProgressStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProgressStatus'>
    


  /**
   * Reference to a field of type 'ProgressStatus[]'
   */
  export type ListEnumProgressStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProgressStatus[]'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'ChallengeStatus'
   */
  export type EnumChallengeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ChallengeStatus'>
    


  /**
   * Reference to a field of type 'ChallengeStatus[]'
   */
  export type ListEnumChallengeStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ChallengeStatus[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type ChildProfileWhereInput = {
    AND?: ChildProfileWhereInput | ChildProfileWhereInput[]
    OR?: ChildProfileWhereInput[]
    NOT?: ChildProfileWhereInput | ChildProfileWhereInput[]
    id?: StringFilter<"ChildProfile"> | string
    name?: StringFilter<"ChildProfile"> | string
    parentId?: StringFilter<"ChildProfile"> | string
    childId?: StringFilter<"ChildProfile"> | string
    ageGroupId?: StringFilter<"ChildProfile"> | string
    ageGroupName?: StringNullableFilter<"ChildProfile"> | string | null
    favoriteThemes?: StringNullableListFilter<"ChildProfile">
    allocatedRoadmaps?: StringNullableListFilter<"ChildProfile">
    currentLevel?: IntFilter<"ChildProfile"> | number
    totalStars?: IntFilter<"ChildProfile"> | number
    createdAt?: DateTimeFilter<"ChildProfile"> | Date | string
    updatedAt?: DateTimeFilter<"ChildProfile"> | Date | string
    progress?: ProgressListRelationFilter
    badges?: ChildBadgeListRelationFilter
  }

  export type ChildProfileOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
    childId?: SortOrder
    ageGroupId?: SortOrder
    ageGroupName?: SortOrderInput | SortOrder
    favoriteThemes?: SortOrder
    allocatedRoadmaps?: SortOrder
    currentLevel?: SortOrder
    totalStars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    progress?: ProgressOrderByRelationAggregateInput
    badges?: ChildBadgeOrderByRelationAggregateInput
  }

  export type ChildProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    childId?: string
    AND?: ChildProfileWhereInput | ChildProfileWhereInput[]
    OR?: ChildProfileWhereInput[]
    NOT?: ChildProfileWhereInput | ChildProfileWhereInput[]
    name?: StringFilter<"ChildProfile"> | string
    parentId?: StringFilter<"ChildProfile"> | string
    ageGroupId?: StringFilter<"ChildProfile"> | string
    ageGroupName?: StringNullableFilter<"ChildProfile"> | string | null
    favoriteThemes?: StringNullableListFilter<"ChildProfile">
    allocatedRoadmaps?: StringNullableListFilter<"ChildProfile">
    currentLevel?: IntFilter<"ChildProfile"> | number
    totalStars?: IntFilter<"ChildProfile"> | number
    createdAt?: DateTimeFilter<"ChildProfile"> | Date | string
    updatedAt?: DateTimeFilter<"ChildProfile"> | Date | string
    progress?: ProgressListRelationFilter
    badges?: ChildBadgeListRelationFilter
  }, "id" | "childId">

  export type ChildProfileOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
    childId?: SortOrder
    ageGroupId?: SortOrder
    ageGroupName?: SortOrderInput | SortOrder
    favoriteThemes?: SortOrder
    allocatedRoadmaps?: SortOrder
    currentLevel?: SortOrder
    totalStars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChildProfileCountOrderByAggregateInput
    _avg?: ChildProfileAvgOrderByAggregateInput
    _max?: ChildProfileMaxOrderByAggregateInput
    _min?: ChildProfileMinOrderByAggregateInput
    _sum?: ChildProfileSumOrderByAggregateInput
  }

  export type ChildProfileScalarWhereWithAggregatesInput = {
    AND?: ChildProfileScalarWhereWithAggregatesInput | ChildProfileScalarWhereWithAggregatesInput[]
    OR?: ChildProfileScalarWhereWithAggregatesInput[]
    NOT?: ChildProfileScalarWhereWithAggregatesInput | ChildProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChildProfile"> | string
    name?: StringWithAggregatesFilter<"ChildProfile"> | string
    parentId?: StringWithAggregatesFilter<"ChildProfile"> | string
    childId?: StringWithAggregatesFilter<"ChildProfile"> | string
    ageGroupId?: StringWithAggregatesFilter<"ChildProfile"> | string
    ageGroupName?: StringNullableWithAggregatesFilter<"ChildProfile"> | string | null
    favoriteThemes?: StringNullableListFilter<"ChildProfile">
    allocatedRoadmaps?: StringNullableListFilter<"ChildProfile">
    currentLevel?: IntWithAggregatesFilter<"ChildProfile"> | number
    totalStars?: IntWithAggregatesFilter<"ChildProfile"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ChildProfile"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ChildProfile"> | Date | string
  }

  export type ProgressWhereInput = {
    AND?: ProgressWhereInput | ProgressWhereInput[]
    OR?: ProgressWhereInput[]
    NOT?: ProgressWhereInput | ProgressWhereInput[]
    id?: StringFilter<"Progress"> | string
    childProfileId?: StringFilter<"Progress"> | string
    roadmapId?: StringFilter<"Progress"> | string
    worldId?: StringFilter<"Progress"> | string
    storyId?: StringFilter<"Progress"> | string
    status?: EnumProgressStatusFilter<"Progress"> | $Enums.ProgressStatus
    totalTimeSpent?: IntFilter<"Progress"> | number
    completedAt?: DateTimeNullableFilter<"Progress"> | Date | string | null
    createdAt?: DateTimeFilter<"Progress"> | Date | string
    updatedAt?: DateTimeFilter<"Progress"> | Date | string
    childProfile?: XOR<ChildProfileRelationFilter, ChildProfileWhereInput>
    gameSession?: XOR<GameSessionNullableRelationFilter, GameSessionWhereInput> | null
  }

  export type ProgressOrderByWithRelationInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    roadmapId?: SortOrder
    worldId?: SortOrder
    storyId?: SortOrder
    status?: SortOrder
    totalTimeSpent?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    childProfile?: ChildProfileOrderByWithRelationInput
    gameSession?: GameSessionOrderByWithRelationInput
  }

  export type ProgressWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    childProfileId_storyId?: ProgressChildProfileIdStoryIdCompoundUniqueInput
    AND?: ProgressWhereInput | ProgressWhereInput[]
    OR?: ProgressWhereInput[]
    NOT?: ProgressWhereInput | ProgressWhereInput[]
    childProfileId?: StringFilter<"Progress"> | string
    roadmapId?: StringFilter<"Progress"> | string
    worldId?: StringFilter<"Progress"> | string
    storyId?: StringFilter<"Progress"> | string
    status?: EnumProgressStatusFilter<"Progress"> | $Enums.ProgressStatus
    totalTimeSpent?: IntFilter<"Progress"> | number
    completedAt?: DateTimeNullableFilter<"Progress"> | Date | string | null
    createdAt?: DateTimeFilter<"Progress"> | Date | string
    updatedAt?: DateTimeFilter<"Progress"> | Date | string
    childProfile?: XOR<ChildProfileRelationFilter, ChildProfileWhereInput>
    gameSession?: XOR<GameSessionNullableRelationFilter, GameSessionWhereInput> | null
  }, "id" | "childProfileId_storyId">

  export type ProgressOrderByWithAggregationInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    roadmapId?: SortOrder
    worldId?: SortOrder
    storyId?: SortOrder
    status?: SortOrder
    totalTimeSpent?: SortOrder
    completedAt?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ProgressCountOrderByAggregateInput
    _avg?: ProgressAvgOrderByAggregateInput
    _max?: ProgressMaxOrderByAggregateInput
    _min?: ProgressMinOrderByAggregateInput
    _sum?: ProgressSumOrderByAggregateInput
  }

  export type ProgressScalarWhereWithAggregatesInput = {
    AND?: ProgressScalarWhereWithAggregatesInput | ProgressScalarWhereWithAggregatesInput[]
    OR?: ProgressScalarWhereWithAggregatesInput[]
    NOT?: ProgressScalarWhereWithAggregatesInput | ProgressScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Progress"> | string
    childProfileId?: StringWithAggregatesFilter<"Progress"> | string
    roadmapId?: StringWithAggregatesFilter<"Progress"> | string
    worldId?: StringWithAggregatesFilter<"Progress"> | string
    storyId?: StringWithAggregatesFilter<"Progress"> | string
    status?: EnumProgressStatusWithAggregatesFilter<"Progress"> | $Enums.ProgressStatus
    totalTimeSpent?: IntWithAggregatesFilter<"Progress"> | number
    completedAt?: DateTimeNullableWithAggregatesFilter<"Progress"> | Date | string | null
    createdAt?: DateTimeWithAggregatesFilter<"Progress"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Progress"> | Date | string
  }

  export type GameSessionWhereInput = {
    AND?: GameSessionWhereInput | GameSessionWhereInput[]
    OR?: GameSessionWhereInput[]
    NOT?: GameSessionWhereInput | GameSessionWhereInput[]
    id?: StringFilter<"GameSession"> | string
    progressId?: StringFilter<"GameSession"> | string
    storyId?: StringFilter<"GameSession"> | string
    chapterId?: StringNullableFilter<"GameSession"> | string | null
    startedAt?: DateTimeFilter<"GameSession"> | Date | string
    checkpointAt?: DateTimeNullableFilter<"GameSession"> | Date | string | null
    endedAt?: DateTimeNullableFilter<"GameSession"> | Date | string | null
    totalTimeSpent?: IntFilter<"GameSession"> | number
    sessionCount?: IntFilter<"GameSession"> | number
    totalIdleTime?: IntFilter<"GameSession"> | number
    starsEarned?: IntFilter<"GameSession"> | number
    createdAt?: DateTimeFilter<"GameSession"> | Date | string
    updatedAt?: DateTimeFilter<"GameSession"> | Date | string
    progress?: XOR<ProgressRelationFilter, ProgressWhereInput>
    challengeAttempts?: ChallengeAttemptListRelationFilter
    checkpoints?: SessionCheckpointListRelationFilter
  }

  export type GameSessionOrderByWithRelationInput = {
    id?: SortOrder
    progressId?: SortOrder
    storyId?: SortOrder
    chapterId?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    checkpointAt?: SortOrderInput | SortOrder
    endedAt?: SortOrderInput | SortOrder
    totalTimeSpent?: SortOrder
    sessionCount?: SortOrder
    totalIdleTime?: SortOrder
    starsEarned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    progress?: ProgressOrderByWithRelationInput
    challengeAttempts?: ChallengeAttemptOrderByRelationAggregateInput
    checkpoints?: SessionCheckpointOrderByRelationAggregateInput
  }

  export type GameSessionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    progressId?: string
    AND?: GameSessionWhereInput | GameSessionWhereInput[]
    OR?: GameSessionWhereInput[]
    NOT?: GameSessionWhereInput | GameSessionWhereInput[]
    storyId?: StringFilter<"GameSession"> | string
    chapterId?: StringNullableFilter<"GameSession"> | string | null
    startedAt?: DateTimeFilter<"GameSession"> | Date | string
    checkpointAt?: DateTimeNullableFilter<"GameSession"> | Date | string | null
    endedAt?: DateTimeNullableFilter<"GameSession"> | Date | string | null
    totalTimeSpent?: IntFilter<"GameSession"> | number
    sessionCount?: IntFilter<"GameSession"> | number
    totalIdleTime?: IntFilter<"GameSession"> | number
    starsEarned?: IntFilter<"GameSession"> | number
    createdAt?: DateTimeFilter<"GameSession"> | Date | string
    updatedAt?: DateTimeFilter<"GameSession"> | Date | string
    progress?: XOR<ProgressRelationFilter, ProgressWhereInput>
    challengeAttempts?: ChallengeAttemptListRelationFilter
    checkpoints?: SessionCheckpointListRelationFilter
  }, "id" | "progressId">

  export type GameSessionOrderByWithAggregationInput = {
    id?: SortOrder
    progressId?: SortOrder
    storyId?: SortOrder
    chapterId?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    checkpointAt?: SortOrderInput | SortOrder
    endedAt?: SortOrderInput | SortOrder
    totalTimeSpent?: SortOrder
    sessionCount?: SortOrder
    totalIdleTime?: SortOrder
    starsEarned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: GameSessionCountOrderByAggregateInput
    _avg?: GameSessionAvgOrderByAggregateInput
    _max?: GameSessionMaxOrderByAggregateInput
    _min?: GameSessionMinOrderByAggregateInput
    _sum?: GameSessionSumOrderByAggregateInput
  }

  export type GameSessionScalarWhereWithAggregatesInput = {
    AND?: GameSessionScalarWhereWithAggregatesInput | GameSessionScalarWhereWithAggregatesInput[]
    OR?: GameSessionScalarWhereWithAggregatesInput[]
    NOT?: GameSessionScalarWhereWithAggregatesInput | GameSessionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"GameSession"> | string
    progressId?: StringWithAggregatesFilter<"GameSession"> | string
    storyId?: StringWithAggregatesFilter<"GameSession"> | string
    chapterId?: StringNullableWithAggregatesFilter<"GameSession"> | string | null
    startedAt?: DateTimeWithAggregatesFilter<"GameSession"> | Date | string
    checkpointAt?: DateTimeNullableWithAggregatesFilter<"GameSession"> | Date | string | null
    endedAt?: DateTimeNullableWithAggregatesFilter<"GameSession"> | Date | string | null
    totalTimeSpent?: IntWithAggregatesFilter<"GameSession"> | number
    sessionCount?: IntWithAggregatesFilter<"GameSession"> | number
    totalIdleTime?: IntWithAggregatesFilter<"GameSession"> | number
    starsEarned?: IntWithAggregatesFilter<"GameSession"> | number
    createdAt?: DateTimeWithAggregatesFilter<"GameSession"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"GameSession"> | Date | string
  }

  export type SessionCheckpointWhereInput = {
    AND?: SessionCheckpointWhereInput | SessionCheckpointWhereInput[]
    OR?: SessionCheckpointWhereInput[]
    NOT?: SessionCheckpointWhereInput | SessionCheckpointWhereInput[]
    id?: StringFilter<"SessionCheckpoint"> | string
    gameSessionId?: StringFilter<"SessionCheckpoint"> | string
    firstChapterId?: StringFilter<"SessionCheckpoint"> | string
    lastChapterId?: StringNullableFilter<"SessionCheckpoint"> | string | null
    startedAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
    pausedAt?: DateTimeNullableFilter<"SessionCheckpoint"> | Date | string | null
    sessionDurationSeconds?: IntNullableFilter<"SessionCheckpoint"> | number | null
    createdAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
    updatedAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
    gameSession?: XOR<GameSessionRelationFilter, GameSessionWhereInput>
  }

  export type SessionCheckpointOrderByWithRelationInput = {
    id?: SortOrder
    gameSessionId?: SortOrder
    firstChapterId?: SortOrder
    lastChapterId?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    pausedAt?: SortOrderInput | SortOrder
    sessionDurationSeconds?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    gameSession?: GameSessionOrderByWithRelationInput
  }

  export type SessionCheckpointWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SessionCheckpointWhereInput | SessionCheckpointWhereInput[]
    OR?: SessionCheckpointWhereInput[]
    NOT?: SessionCheckpointWhereInput | SessionCheckpointWhereInput[]
    gameSessionId?: StringFilter<"SessionCheckpoint"> | string
    firstChapterId?: StringFilter<"SessionCheckpoint"> | string
    lastChapterId?: StringNullableFilter<"SessionCheckpoint"> | string | null
    startedAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
    pausedAt?: DateTimeNullableFilter<"SessionCheckpoint"> | Date | string | null
    sessionDurationSeconds?: IntNullableFilter<"SessionCheckpoint"> | number | null
    createdAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
    updatedAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
    gameSession?: XOR<GameSessionRelationFilter, GameSessionWhereInput>
  }, "id">

  export type SessionCheckpointOrderByWithAggregationInput = {
    id?: SortOrder
    gameSessionId?: SortOrder
    firstChapterId?: SortOrder
    lastChapterId?: SortOrderInput | SortOrder
    startedAt?: SortOrder
    pausedAt?: SortOrderInput | SortOrder
    sessionDurationSeconds?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SessionCheckpointCountOrderByAggregateInput
    _avg?: SessionCheckpointAvgOrderByAggregateInput
    _max?: SessionCheckpointMaxOrderByAggregateInput
    _min?: SessionCheckpointMinOrderByAggregateInput
    _sum?: SessionCheckpointSumOrderByAggregateInput
  }

  export type SessionCheckpointScalarWhereWithAggregatesInput = {
    AND?: SessionCheckpointScalarWhereWithAggregatesInput | SessionCheckpointScalarWhereWithAggregatesInput[]
    OR?: SessionCheckpointScalarWhereWithAggregatesInput[]
    NOT?: SessionCheckpointScalarWhereWithAggregatesInput | SessionCheckpointScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SessionCheckpoint"> | string
    gameSessionId?: StringWithAggregatesFilter<"SessionCheckpoint"> | string
    firstChapterId?: StringWithAggregatesFilter<"SessionCheckpoint"> | string
    lastChapterId?: StringNullableWithAggregatesFilter<"SessionCheckpoint"> | string | null
    startedAt?: DateTimeWithAggregatesFilter<"SessionCheckpoint"> | Date | string
    pausedAt?: DateTimeNullableWithAggregatesFilter<"SessionCheckpoint"> | Date | string | null
    sessionDurationSeconds?: IntNullableWithAggregatesFilter<"SessionCheckpoint"> | number | null
    createdAt?: DateTimeWithAggregatesFilter<"SessionCheckpoint"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SessionCheckpoint"> | Date | string
  }

  export type ChallengeAttemptWhereInput = {
    AND?: ChallengeAttemptWhereInput | ChallengeAttemptWhereInput[]
    OR?: ChallengeAttemptWhereInput[]
    NOT?: ChallengeAttemptWhereInput | ChallengeAttemptWhereInput[]
    id?: StringFilter<"ChallengeAttempt"> | string
    sessionId?: StringFilter<"ChallengeAttempt"> | string
    challengeId?: StringFilter<"ChallengeAttempt"> | string
    answerId?: StringNullableFilter<"ChallengeAttempt"> | string | null
    textAnswer?: StringNullableFilter<"ChallengeAttempt"> | string | null
    isCorrect?: BoolNullableFilter<"ChallengeAttempt"> | boolean | null
    status?: EnumChallengeStatusFilter<"ChallengeAttempt"> | $Enums.ChallengeStatus
    attemptNumber?: IntFilter<"ChallengeAttempt"> | number
    usedHints?: IntFilter<"ChallengeAttempt"> | number
    timeSpentSeconds?: IntFilter<"ChallengeAttempt"> | number
    createdAt?: DateTimeFilter<"ChallengeAttempt"> | Date | string
    updatedAt?: DateTimeFilter<"ChallengeAttempt"> | Date | string
    session?: XOR<GameSessionRelationFilter, GameSessionWhereInput>
    actions?: AttemptActionListRelationFilter
    starEvent?: XOR<StarEventNullableRelationFilter, StarEventWhereInput> | null
  }

  export type ChallengeAttemptOrderByWithRelationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    challengeId?: SortOrder
    answerId?: SortOrderInput | SortOrder
    textAnswer?: SortOrderInput | SortOrder
    isCorrect?: SortOrderInput | SortOrder
    status?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    timeSpentSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    session?: GameSessionOrderByWithRelationInput
    actions?: AttemptActionOrderByRelationAggregateInput
    starEvent?: StarEventOrderByWithRelationInput
  }

  export type ChallengeAttemptWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: ChallengeAttemptWhereInput | ChallengeAttemptWhereInput[]
    OR?: ChallengeAttemptWhereInput[]
    NOT?: ChallengeAttemptWhereInput | ChallengeAttemptWhereInput[]
    sessionId?: StringFilter<"ChallengeAttempt"> | string
    challengeId?: StringFilter<"ChallengeAttempt"> | string
    answerId?: StringNullableFilter<"ChallengeAttempt"> | string | null
    textAnswer?: StringNullableFilter<"ChallengeAttempt"> | string | null
    isCorrect?: BoolNullableFilter<"ChallengeAttempt"> | boolean | null
    status?: EnumChallengeStatusFilter<"ChallengeAttempt"> | $Enums.ChallengeStatus
    attemptNumber?: IntFilter<"ChallengeAttempt"> | number
    usedHints?: IntFilter<"ChallengeAttempt"> | number
    timeSpentSeconds?: IntFilter<"ChallengeAttempt"> | number
    createdAt?: DateTimeFilter<"ChallengeAttempt"> | Date | string
    updatedAt?: DateTimeFilter<"ChallengeAttempt"> | Date | string
    session?: XOR<GameSessionRelationFilter, GameSessionWhereInput>
    actions?: AttemptActionListRelationFilter
    starEvent?: XOR<StarEventNullableRelationFilter, StarEventWhereInput> | null
  }, "id">

  export type ChallengeAttemptOrderByWithAggregationInput = {
    id?: SortOrder
    sessionId?: SortOrder
    challengeId?: SortOrder
    answerId?: SortOrderInput | SortOrder
    textAnswer?: SortOrderInput | SortOrder
    isCorrect?: SortOrderInput | SortOrder
    status?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    timeSpentSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChallengeAttemptCountOrderByAggregateInput
    _avg?: ChallengeAttemptAvgOrderByAggregateInput
    _max?: ChallengeAttemptMaxOrderByAggregateInput
    _min?: ChallengeAttemptMinOrderByAggregateInput
    _sum?: ChallengeAttemptSumOrderByAggregateInput
  }

  export type ChallengeAttemptScalarWhereWithAggregatesInput = {
    AND?: ChallengeAttemptScalarWhereWithAggregatesInput | ChallengeAttemptScalarWhereWithAggregatesInput[]
    OR?: ChallengeAttemptScalarWhereWithAggregatesInput[]
    NOT?: ChallengeAttemptScalarWhereWithAggregatesInput | ChallengeAttemptScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChallengeAttempt"> | string
    sessionId?: StringWithAggregatesFilter<"ChallengeAttempt"> | string
    challengeId?: StringWithAggregatesFilter<"ChallengeAttempt"> | string
    answerId?: StringNullableWithAggregatesFilter<"ChallengeAttempt"> | string | null
    textAnswer?: StringNullableWithAggregatesFilter<"ChallengeAttempt"> | string | null
    isCorrect?: BoolNullableWithAggregatesFilter<"ChallengeAttempt"> | boolean | null
    status?: EnumChallengeStatusWithAggregatesFilter<"ChallengeAttempt"> | $Enums.ChallengeStatus
    attemptNumber?: IntWithAggregatesFilter<"ChallengeAttempt"> | number
    usedHints?: IntWithAggregatesFilter<"ChallengeAttempt"> | number
    timeSpentSeconds?: IntWithAggregatesFilter<"ChallengeAttempt"> | number
    createdAt?: DateTimeWithAggregatesFilter<"ChallengeAttempt"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ChallengeAttempt"> | Date | string
  }

  export type AttemptActionWhereInput = {
    AND?: AttemptActionWhereInput | AttemptActionWhereInput[]
    OR?: AttemptActionWhereInput[]
    NOT?: AttemptActionWhereInput | AttemptActionWhereInput[]
    id?: StringFilter<"AttemptAction"> | string
    attemptId?: StringFilter<"AttemptAction"> | string
    selectedAnswerId?: StringNullableFilter<"AttemptAction"> | string | null
    selectedAnswerText?: StringNullableFilter<"AttemptAction"> | string | null
    answerText?: StringNullableFilter<"AttemptAction"> | string | null
    isCorrect?: BoolNullableFilter<"AttemptAction"> | boolean | null
    attemptNumberAtAction?: IntFilter<"AttemptAction"> | number
    createdAt?: DateTimeFilter<"AttemptAction"> | Date | string
    attempt?: XOR<ChallengeAttemptRelationFilter, ChallengeAttemptWhereInput>
  }

  export type AttemptActionOrderByWithRelationInput = {
    id?: SortOrder
    attemptId?: SortOrder
    selectedAnswerId?: SortOrderInput | SortOrder
    selectedAnswerText?: SortOrderInput | SortOrder
    answerText?: SortOrderInput | SortOrder
    isCorrect?: SortOrderInput | SortOrder
    attemptNumberAtAction?: SortOrder
    createdAt?: SortOrder
    attempt?: ChallengeAttemptOrderByWithRelationInput
  }

  export type AttemptActionWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: AttemptActionWhereInput | AttemptActionWhereInput[]
    OR?: AttemptActionWhereInput[]
    NOT?: AttemptActionWhereInput | AttemptActionWhereInput[]
    attemptId?: StringFilter<"AttemptAction"> | string
    selectedAnswerId?: StringNullableFilter<"AttemptAction"> | string | null
    selectedAnswerText?: StringNullableFilter<"AttemptAction"> | string | null
    answerText?: StringNullableFilter<"AttemptAction"> | string | null
    isCorrect?: BoolNullableFilter<"AttemptAction"> | boolean | null
    attemptNumberAtAction?: IntFilter<"AttemptAction"> | number
    createdAt?: DateTimeFilter<"AttemptAction"> | Date | string
    attempt?: XOR<ChallengeAttemptRelationFilter, ChallengeAttemptWhereInput>
  }, "id">

  export type AttemptActionOrderByWithAggregationInput = {
    id?: SortOrder
    attemptId?: SortOrder
    selectedAnswerId?: SortOrderInput | SortOrder
    selectedAnswerText?: SortOrderInput | SortOrder
    answerText?: SortOrderInput | SortOrder
    isCorrect?: SortOrderInput | SortOrder
    attemptNumberAtAction?: SortOrder
    createdAt?: SortOrder
    _count?: AttemptActionCountOrderByAggregateInput
    _avg?: AttemptActionAvgOrderByAggregateInput
    _max?: AttemptActionMaxOrderByAggregateInput
    _min?: AttemptActionMinOrderByAggregateInput
    _sum?: AttemptActionSumOrderByAggregateInput
  }

  export type AttemptActionScalarWhereWithAggregatesInput = {
    AND?: AttemptActionScalarWhereWithAggregatesInput | AttemptActionScalarWhereWithAggregatesInput[]
    OR?: AttemptActionScalarWhereWithAggregatesInput[]
    NOT?: AttemptActionScalarWhereWithAggregatesInput | AttemptActionScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"AttemptAction"> | string
    attemptId?: StringWithAggregatesFilter<"AttemptAction"> | string
    selectedAnswerId?: StringNullableWithAggregatesFilter<"AttemptAction"> | string | null
    selectedAnswerText?: StringNullableWithAggregatesFilter<"AttemptAction"> | string | null
    answerText?: StringNullableWithAggregatesFilter<"AttemptAction"> | string | null
    isCorrect?: BoolNullableWithAggregatesFilter<"AttemptAction"> | boolean | null
    attemptNumberAtAction?: IntWithAggregatesFilter<"AttemptAction"> | number
    createdAt?: DateTimeWithAggregatesFilter<"AttemptAction"> | Date | string
  }

  export type StarEventWhereInput = {
    AND?: StarEventWhereInput | StarEventWhereInput[]
    OR?: StarEventWhereInput[]
    NOT?: StarEventWhereInput | StarEventWhereInput[]
    id?: StringFilter<"StarEvent"> | string
    attemptId?: StringFilter<"StarEvent"> | string
    challengeId?: StringFilter<"StarEvent"> | string
    baseStars?: IntFilter<"StarEvent"> | number
    noHintBonus?: IntFilter<"StarEvent"> | number
    firstTryBonus?: IntFilter<"StarEvent"> | number
    totalStars?: IntFilter<"StarEvent"> | number
    attemptNumber?: IntFilter<"StarEvent"> | number
    usedHints?: BoolFilter<"StarEvent"> | boolean
    wasCorrect?: BoolNullableFilter<"StarEvent"> | boolean | null
    createdAt?: DateTimeFilter<"StarEvent"> | Date | string
    updatedAt?: DateTimeFilter<"StarEvent"> | Date | string
    attempt?: XOR<ChallengeAttemptRelationFilter, ChallengeAttemptWhereInput>
  }

  export type StarEventOrderByWithRelationInput = {
    id?: SortOrder
    attemptId?: SortOrder
    challengeId?: SortOrder
    baseStars?: SortOrder
    noHintBonus?: SortOrder
    firstTryBonus?: SortOrder
    totalStars?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    wasCorrect?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    attempt?: ChallengeAttemptOrderByWithRelationInput
  }

  export type StarEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    attemptId?: string
    AND?: StarEventWhereInput | StarEventWhereInput[]
    OR?: StarEventWhereInput[]
    NOT?: StarEventWhereInput | StarEventWhereInput[]
    challengeId?: StringFilter<"StarEvent"> | string
    baseStars?: IntFilter<"StarEvent"> | number
    noHintBonus?: IntFilter<"StarEvent"> | number
    firstTryBonus?: IntFilter<"StarEvent"> | number
    totalStars?: IntFilter<"StarEvent"> | number
    attemptNumber?: IntFilter<"StarEvent"> | number
    usedHints?: BoolFilter<"StarEvent"> | boolean
    wasCorrect?: BoolNullableFilter<"StarEvent"> | boolean | null
    createdAt?: DateTimeFilter<"StarEvent"> | Date | string
    updatedAt?: DateTimeFilter<"StarEvent"> | Date | string
    attempt?: XOR<ChallengeAttemptRelationFilter, ChallengeAttemptWhereInput>
  }, "id" | "attemptId">

  export type StarEventOrderByWithAggregationInput = {
    id?: SortOrder
    attemptId?: SortOrder
    challengeId?: SortOrder
    baseStars?: SortOrder
    noHintBonus?: SortOrder
    firstTryBonus?: SortOrder
    totalStars?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    wasCorrect?: SortOrderInput | SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StarEventCountOrderByAggregateInput
    _avg?: StarEventAvgOrderByAggregateInput
    _max?: StarEventMaxOrderByAggregateInput
    _min?: StarEventMinOrderByAggregateInput
    _sum?: StarEventSumOrderByAggregateInput
  }

  export type StarEventScalarWhereWithAggregatesInput = {
    AND?: StarEventScalarWhereWithAggregatesInput | StarEventScalarWhereWithAggregatesInput[]
    OR?: StarEventScalarWhereWithAggregatesInput[]
    NOT?: StarEventScalarWhereWithAggregatesInput | StarEventScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StarEvent"> | string
    attemptId?: StringWithAggregatesFilter<"StarEvent"> | string
    challengeId?: StringWithAggregatesFilter<"StarEvent"> | string
    baseStars?: IntWithAggregatesFilter<"StarEvent"> | number
    noHintBonus?: IntWithAggregatesFilter<"StarEvent"> | number
    firstTryBonus?: IntWithAggregatesFilter<"StarEvent"> | number
    totalStars?: IntWithAggregatesFilter<"StarEvent"> | number
    attemptNumber?: IntWithAggregatesFilter<"StarEvent"> | number
    usedHints?: BoolWithAggregatesFilter<"StarEvent"> | boolean
    wasCorrect?: BoolNullableWithAggregatesFilter<"StarEvent"> | boolean | null
    createdAt?: DateTimeWithAggregatesFilter<"StarEvent"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"StarEvent"> | Date | string
  }

  export type ChildBadgeWhereInput = {
    AND?: ChildBadgeWhereInput | ChildBadgeWhereInput[]
    OR?: ChildBadgeWhereInput[]
    NOT?: ChildBadgeWhereInput | ChildBadgeWhereInput[]
    id?: StringFilter<"ChildBadge"> | string
    childProfileId?: StringFilter<"ChildBadge"> | string
    badgeId?: StringFilter<"ChildBadge"> | string
    earnedAt?: DateTimeFilter<"ChildBadge"> | Date | string
    createdAt?: DateTimeFilter<"ChildBadge"> | Date | string
    updatedAt?: DateTimeFilter<"ChildBadge"> | Date | string
    childProfile?: XOR<ChildProfileRelationFilter, ChildProfileWhereInput>
  }

  export type ChildBadgeOrderByWithRelationInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    badgeId?: SortOrder
    earnedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    childProfile?: ChildProfileOrderByWithRelationInput
  }

  export type ChildBadgeWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    childProfileId_badgeId?: ChildBadgeChildProfileIdBadgeIdCompoundUniqueInput
    AND?: ChildBadgeWhereInput | ChildBadgeWhereInput[]
    OR?: ChildBadgeWhereInput[]
    NOT?: ChildBadgeWhereInput | ChildBadgeWhereInput[]
    childProfileId?: StringFilter<"ChildBadge"> | string
    badgeId?: StringFilter<"ChildBadge"> | string
    earnedAt?: DateTimeFilter<"ChildBadge"> | Date | string
    createdAt?: DateTimeFilter<"ChildBadge"> | Date | string
    updatedAt?: DateTimeFilter<"ChildBadge"> | Date | string
    childProfile?: XOR<ChildProfileRelationFilter, ChildProfileWhereInput>
  }, "id" | "childProfileId_badgeId">

  export type ChildBadgeOrderByWithAggregationInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    badgeId?: SortOrder
    earnedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: ChildBadgeCountOrderByAggregateInput
    _max?: ChildBadgeMaxOrderByAggregateInput
    _min?: ChildBadgeMinOrderByAggregateInput
  }

  export type ChildBadgeScalarWhereWithAggregatesInput = {
    AND?: ChildBadgeScalarWhereWithAggregatesInput | ChildBadgeScalarWhereWithAggregatesInput[]
    OR?: ChildBadgeScalarWhereWithAggregatesInput[]
    NOT?: ChildBadgeScalarWhereWithAggregatesInput | ChildBadgeScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"ChildBadge"> | string
    childProfileId?: StringWithAggregatesFilter<"ChildBadge"> | string
    badgeId?: StringWithAggregatesFilter<"ChildBadge"> | string
    earnedAt?: DateTimeWithAggregatesFilter<"ChildBadge"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"ChildBadge"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"ChildBadge"> | Date | string
  }

  export type ChildProfileCreateInput = {
    id?: string
    name: string
    parentId: string
    childId: string
    ageGroupId: string
    ageGroupName?: string | null
    favoriteThemes?: ChildProfileCreatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileCreateallocatedRoadmapsInput | string[]
    currentLevel?: number
    totalStars?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    progress?: ProgressCreateNestedManyWithoutChildProfileInput
    badges?: ChildBadgeCreateNestedManyWithoutChildProfileInput
  }

  export type ChildProfileUncheckedCreateInput = {
    id?: string
    name: string
    parentId: string
    childId: string
    ageGroupId: string
    ageGroupName?: string | null
    favoriteThemes?: ChildProfileCreatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileCreateallocatedRoadmapsInput | string[]
    currentLevel?: number
    totalStars?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    progress?: ProgressUncheckedCreateNestedManyWithoutChildProfileInput
    badges?: ChildBadgeUncheckedCreateNestedManyWithoutChildProfileInput
  }

  export type ChildProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: StringFieldUpdateOperationsInput | string
    childId?: StringFieldUpdateOperationsInput | string
    ageGroupId?: StringFieldUpdateOperationsInput | string
    ageGroupName?: NullableStringFieldUpdateOperationsInput | string | null
    favoriteThemes?: ChildProfileUpdatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileUpdateallocatedRoadmapsInput | string[]
    currentLevel?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: ProgressUpdateManyWithoutChildProfileNestedInput
    badges?: ChildBadgeUpdateManyWithoutChildProfileNestedInput
  }

  export type ChildProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: StringFieldUpdateOperationsInput | string
    childId?: StringFieldUpdateOperationsInput | string
    ageGroupId?: StringFieldUpdateOperationsInput | string
    ageGroupName?: NullableStringFieldUpdateOperationsInput | string | null
    favoriteThemes?: ChildProfileUpdatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileUpdateallocatedRoadmapsInput | string[]
    currentLevel?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: ProgressUncheckedUpdateManyWithoutChildProfileNestedInput
    badges?: ChildBadgeUncheckedUpdateManyWithoutChildProfileNestedInput
  }

  export type ChildProfileCreateManyInput = {
    id?: string
    name: string
    parentId: string
    childId: string
    ageGroupId: string
    ageGroupName?: string | null
    favoriteThemes?: ChildProfileCreatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileCreateallocatedRoadmapsInput | string[]
    currentLevel?: number
    totalStars?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChildProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: StringFieldUpdateOperationsInput | string
    childId?: StringFieldUpdateOperationsInput | string
    ageGroupId?: StringFieldUpdateOperationsInput | string
    ageGroupName?: NullableStringFieldUpdateOperationsInput | string | null
    favoriteThemes?: ChildProfileUpdatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileUpdateallocatedRoadmapsInput | string[]
    currentLevel?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChildProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: StringFieldUpdateOperationsInput | string
    childId?: StringFieldUpdateOperationsInput | string
    ageGroupId?: StringFieldUpdateOperationsInput | string
    ageGroupName?: NullableStringFieldUpdateOperationsInput | string | null
    favoriteThemes?: ChildProfileUpdatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileUpdateallocatedRoadmapsInput | string[]
    currentLevel?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgressCreateInput = {
    id?: string
    roadmapId: string
    worldId: string
    storyId: string
    status?: $Enums.ProgressStatus
    totalTimeSpent?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    childProfile: ChildProfileCreateNestedOneWithoutProgressInput
    gameSession?: GameSessionCreateNestedOneWithoutProgressInput
  }

  export type ProgressUncheckedCreateInput = {
    id?: string
    childProfileId: string
    roadmapId: string
    worldId: string
    storyId: string
    status?: $Enums.ProgressStatus
    totalTimeSpent?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    gameSession?: GameSessionUncheckedCreateNestedOneWithoutProgressInput
  }

  export type ProgressUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    childProfile?: ChildProfileUpdateOneRequiredWithoutProgressNestedInput
    gameSession?: GameSessionUpdateOneWithoutProgressNestedInput
  }

  export type ProgressUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    childProfileId?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gameSession?: GameSessionUncheckedUpdateOneWithoutProgressNestedInput
  }

  export type ProgressCreateManyInput = {
    id?: string
    childProfileId: string
    roadmapId: string
    worldId: string
    storyId: string
    status?: $Enums.ProgressStatus
    totalTimeSpent?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProgressUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ProgressUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    childProfileId?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionCreateInput = {
    id?: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    progress: ProgressCreateNestedOneWithoutGameSessionInput
    challengeAttempts?: ChallengeAttemptCreateNestedManyWithoutSessionInput
    checkpoints?: SessionCheckpointCreateNestedManyWithoutGameSessionInput
  }

  export type GameSessionUncheckedCreateInput = {
    id?: string
    progressId: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    challengeAttempts?: ChallengeAttemptUncheckedCreateNestedManyWithoutSessionInput
    checkpoints?: SessionCheckpointUncheckedCreateNestedManyWithoutGameSessionInput
  }

  export type GameSessionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: ProgressUpdateOneRequiredWithoutGameSessionNestedInput
    challengeAttempts?: ChallengeAttemptUpdateManyWithoutSessionNestedInput
    checkpoints?: SessionCheckpointUpdateManyWithoutGameSessionNestedInput
  }

  export type GameSessionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    progressId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    challengeAttempts?: ChallengeAttemptUncheckedUpdateManyWithoutSessionNestedInput
    checkpoints?: SessionCheckpointUncheckedUpdateManyWithoutGameSessionNestedInput
  }

  export type GameSessionCreateManyInput = {
    id?: string
    progressId: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type GameSessionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type GameSessionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    progressId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCheckpointCreateInput = {
    id?: string
    firstChapterId: string
    lastChapterId?: string | null
    startedAt?: Date | string
    pausedAt?: Date | string | null
    sessionDurationSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
    gameSession: GameSessionCreateNestedOneWithoutCheckpointsInput
  }

  export type SessionCheckpointUncheckedCreateInput = {
    id?: string
    gameSessionId: string
    firstChapterId: string
    lastChapterId?: string | null
    startedAt?: Date | string
    pausedAt?: Date | string | null
    sessionDurationSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionCheckpointUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstChapterId?: StringFieldUpdateOperationsInput | string
    lastChapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessionDurationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gameSession?: GameSessionUpdateOneRequiredWithoutCheckpointsNestedInput
  }

  export type SessionCheckpointUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    gameSessionId?: StringFieldUpdateOperationsInput | string
    firstChapterId?: StringFieldUpdateOperationsInput | string
    lastChapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessionDurationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCheckpointCreateManyInput = {
    id?: string
    gameSessionId: string
    firstChapterId: string
    lastChapterId?: string | null
    startedAt?: Date | string
    pausedAt?: Date | string | null
    sessionDurationSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionCheckpointUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstChapterId?: StringFieldUpdateOperationsInput | string
    lastChapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessionDurationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCheckpointUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    gameSessionId?: StringFieldUpdateOperationsInput | string
    firstChapterId?: StringFieldUpdateOperationsInput | string
    lastChapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessionDurationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChallengeAttemptCreateInput = {
    id?: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    session: GameSessionCreateNestedOneWithoutChallengeAttemptsInput
    actions?: AttemptActionCreateNestedManyWithoutAttemptInput
    starEvent?: StarEventCreateNestedOneWithoutAttemptInput
  }

  export type ChallengeAttemptUncheckedCreateInput = {
    id?: string
    sessionId: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    actions?: AttemptActionUncheckedCreateNestedManyWithoutAttemptInput
    starEvent?: StarEventUncheckedCreateNestedOneWithoutAttemptInput
  }

  export type ChallengeAttemptUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: GameSessionUpdateOneRequiredWithoutChallengeAttemptsNestedInput
    actions?: AttemptActionUpdateManyWithoutAttemptNestedInput
    starEvent?: StarEventUpdateOneWithoutAttemptNestedInput
  }

  export type ChallengeAttemptUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actions?: AttemptActionUncheckedUpdateManyWithoutAttemptNestedInput
    starEvent?: StarEventUncheckedUpdateOneWithoutAttemptNestedInput
  }

  export type ChallengeAttemptCreateManyInput = {
    id?: string
    sessionId: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChallengeAttemptUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChallengeAttemptUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptActionCreateInput = {
    id?: string
    selectedAnswerId?: string | null
    selectedAnswerText?: string | null
    answerText?: string | null
    isCorrect?: boolean | null
    attemptNumberAtAction: number
    createdAt?: Date | string
    attempt: ChallengeAttemptCreateNestedOneWithoutActionsInput
  }

  export type AttemptActionUncheckedCreateInput = {
    id?: string
    attemptId: string
    selectedAnswerId?: string | null
    selectedAnswerText?: string | null
    answerText?: string | null
    isCorrect?: boolean | null
    attemptNumberAtAction: number
    createdAt?: Date | string
  }

  export type AttemptActionUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedAnswerId?: NullableStringFieldUpdateOperationsInput | string | null
    selectedAnswerText?: NullableStringFieldUpdateOperationsInput | string | null
    answerText?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    attemptNumberAtAction?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempt?: ChallengeAttemptUpdateOneRequiredWithoutActionsNestedInput
  }

  export type AttemptActionUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    selectedAnswerId?: NullableStringFieldUpdateOperationsInput | string | null
    selectedAnswerText?: NullableStringFieldUpdateOperationsInput | string | null
    answerText?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    attemptNumberAtAction?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptActionCreateManyInput = {
    id?: string
    attemptId: string
    selectedAnswerId?: string | null
    selectedAnswerText?: string | null
    answerText?: string | null
    isCorrect?: boolean | null
    attemptNumberAtAction: number
    createdAt?: Date | string
  }

  export type AttemptActionUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedAnswerId?: NullableStringFieldUpdateOperationsInput | string | null
    selectedAnswerText?: NullableStringFieldUpdateOperationsInput | string | null
    answerText?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    attemptNumberAtAction?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptActionUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    selectedAnswerId?: NullableStringFieldUpdateOperationsInput | string | null
    selectedAnswerText?: NullableStringFieldUpdateOperationsInput | string | null
    answerText?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    attemptNumberAtAction?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StarEventCreateInput = {
    id?: string
    challengeId: string
    baseStars?: number
    noHintBonus?: number
    firstTryBonus?: number
    totalStars: number
    attemptNumber: number
    usedHints?: boolean
    wasCorrect?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
    attempt: ChallengeAttemptCreateNestedOneWithoutStarEventInput
  }

  export type StarEventUncheckedCreateInput = {
    id?: string
    attemptId: string
    challengeId: string
    baseStars?: number
    noHintBonus?: number
    firstTryBonus?: number
    totalStars: number
    attemptNumber: number
    usedHints?: boolean
    wasCorrect?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StarEventUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    baseStars?: IntFieldUpdateOperationsInput | number
    noHintBonus?: IntFieldUpdateOperationsInput | number
    firstTryBonus?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: BoolFieldUpdateOperationsInput | boolean
    wasCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    attempt?: ChallengeAttemptUpdateOneRequiredWithoutStarEventNestedInput
  }

  export type StarEventUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    baseStars?: IntFieldUpdateOperationsInput | number
    noHintBonus?: IntFieldUpdateOperationsInput | number
    firstTryBonus?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: BoolFieldUpdateOperationsInput | boolean
    wasCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StarEventCreateManyInput = {
    id?: string
    attemptId: string
    challengeId: string
    baseStars?: number
    noHintBonus?: number
    firstTryBonus?: number
    totalStars: number
    attemptNumber: number
    usedHints?: boolean
    wasCorrect?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StarEventUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    baseStars?: IntFieldUpdateOperationsInput | number
    noHintBonus?: IntFieldUpdateOperationsInput | number
    firstTryBonus?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: BoolFieldUpdateOperationsInput | boolean
    wasCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StarEventUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    attemptId?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    baseStars?: IntFieldUpdateOperationsInput | number
    noHintBonus?: IntFieldUpdateOperationsInput | number
    firstTryBonus?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: BoolFieldUpdateOperationsInput | boolean
    wasCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChildBadgeCreateInput = {
    id?: string
    badgeId: string
    earnedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
    childProfile: ChildProfileCreateNestedOneWithoutBadgesInput
  }

  export type ChildBadgeUncheckedCreateInput = {
    id?: string
    childProfileId: string
    badgeId: string
    earnedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChildBadgeUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    badgeId?: StringFieldUpdateOperationsInput | string
    earnedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    childProfile?: ChildProfileUpdateOneRequiredWithoutBadgesNestedInput
  }

  export type ChildBadgeUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    childProfileId?: StringFieldUpdateOperationsInput | string
    badgeId?: StringFieldUpdateOperationsInput | string
    earnedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChildBadgeCreateManyInput = {
    id?: string
    childProfileId: string
    badgeId: string
    earnedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChildBadgeUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    badgeId?: StringFieldUpdateOperationsInput | string
    earnedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChildBadgeUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    childProfileId?: StringFieldUpdateOperationsInput | string
    badgeId?: StringFieldUpdateOperationsInput | string
    earnedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    has?: string | StringFieldRefInput<$PrismaModel> | null
    hasEvery?: string[] | ListStringFieldRefInput<$PrismaModel>
    hasSome?: string[] | ListStringFieldRefInput<$PrismaModel>
    isEmpty?: boolean
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type ProgressListRelationFilter = {
    every?: ProgressWhereInput
    some?: ProgressWhereInput
    none?: ProgressWhereInput
  }

  export type ChildBadgeListRelationFilter = {
    every?: ChildBadgeWhereInput
    some?: ChildBadgeWhereInput
    none?: ChildBadgeWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type ProgressOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChildBadgeOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChildProfileCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
    childId?: SortOrder
    ageGroupId?: SortOrder
    ageGroupName?: SortOrder
    favoriteThemes?: SortOrder
    allocatedRoadmaps?: SortOrder
    currentLevel?: SortOrder
    totalStars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChildProfileAvgOrderByAggregateInput = {
    currentLevel?: SortOrder
    totalStars?: SortOrder
  }

  export type ChildProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
    childId?: SortOrder
    ageGroupId?: SortOrder
    ageGroupName?: SortOrder
    currentLevel?: SortOrder
    totalStars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChildProfileMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    parentId?: SortOrder
    childId?: SortOrder
    ageGroupId?: SortOrder
    ageGroupName?: SortOrder
    currentLevel?: SortOrder
    totalStars?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChildProfileSumOrderByAggregateInput = {
    currentLevel?: SortOrder
    totalStars?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type EnumProgressStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProgressStatus | EnumProgressStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProgressStatus[] | ListEnumProgressStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProgressStatus[] | ListEnumProgressStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProgressStatusFilter<$PrismaModel> | $Enums.ProgressStatus
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type ChildProfileRelationFilter = {
    is?: ChildProfileWhereInput
    isNot?: ChildProfileWhereInput
  }

  export type GameSessionNullableRelationFilter = {
    is?: GameSessionWhereInput | null
    isNot?: GameSessionWhereInput | null
  }

  export type ProgressChildProfileIdStoryIdCompoundUniqueInput = {
    childProfileId: string
    storyId: string
  }

  export type ProgressCountOrderByAggregateInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    roadmapId?: SortOrder
    worldId?: SortOrder
    storyId?: SortOrder
    status?: SortOrder
    totalTimeSpent?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProgressAvgOrderByAggregateInput = {
    totalTimeSpent?: SortOrder
  }

  export type ProgressMaxOrderByAggregateInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    roadmapId?: SortOrder
    worldId?: SortOrder
    storyId?: SortOrder
    status?: SortOrder
    totalTimeSpent?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProgressMinOrderByAggregateInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    roadmapId?: SortOrder
    worldId?: SortOrder
    storyId?: SortOrder
    status?: SortOrder
    totalTimeSpent?: SortOrder
    completedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ProgressSumOrderByAggregateInput = {
    totalTimeSpent?: SortOrder
  }

  export type EnumProgressStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProgressStatus | EnumProgressStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProgressStatus[] | ListEnumProgressStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProgressStatus[] | ListEnumProgressStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProgressStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProgressStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProgressStatusFilter<$PrismaModel>
    _max?: NestedEnumProgressStatusFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type ProgressRelationFilter = {
    is?: ProgressWhereInput
    isNot?: ProgressWhereInput
  }

  export type ChallengeAttemptListRelationFilter = {
    every?: ChallengeAttemptWhereInput
    some?: ChallengeAttemptWhereInput
    none?: ChallengeAttemptWhereInput
  }

  export type SessionCheckpointListRelationFilter = {
    every?: SessionCheckpointWhereInput
    some?: SessionCheckpointWhereInput
    none?: SessionCheckpointWhereInput
  }

  export type ChallengeAttemptOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type SessionCheckpointOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type GameSessionCountOrderByAggregateInput = {
    id?: SortOrder
    progressId?: SortOrder
    storyId?: SortOrder
    chapterId?: SortOrder
    startedAt?: SortOrder
    checkpointAt?: SortOrder
    endedAt?: SortOrder
    totalTimeSpent?: SortOrder
    sessionCount?: SortOrder
    totalIdleTime?: SortOrder
    starsEarned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameSessionAvgOrderByAggregateInput = {
    totalTimeSpent?: SortOrder
    sessionCount?: SortOrder
    totalIdleTime?: SortOrder
    starsEarned?: SortOrder
  }

  export type GameSessionMaxOrderByAggregateInput = {
    id?: SortOrder
    progressId?: SortOrder
    storyId?: SortOrder
    chapterId?: SortOrder
    startedAt?: SortOrder
    checkpointAt?: SortOrder
    endedAt?: SortOrder
    totalTimeSpent?: SortOrder
    sessionCount?: SortOrder
    totalIdleTime?: SortOrder
    starsEarned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameSessionMinOrderByAggregateInput = {
    id?: SortOrder
    progressId?: SortOrder
    storyId?: SortOrder
    chapterId?: SortOrder
    startedAt?: SortOrder
    checkpointAt?: SortOrder
    endedAt?: SortOrder
    totalTimeSpent?: SortOrder
    sessionCount?: SortOrder
    totalIdleTime?: SortOrder
    starsEarned?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type GameSessionSumOrderByAggregateInput = {
    totalTimeSpent?: SortOrder
    sessionCount?: SortOrder
    totalIdleTime?: SortOrder
    starsEarned?: SortOrder
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type GameSessionRelationFilter = {
    is?: GameSessionWhereInput
    isNot?: GameSessionWhereInput
  }

  export type SessionCheckpointCountOrderByAggregateInput = {
    id?: SortOrder
    gameSessionId?: SortOrder
    firstChapterId?: SortOrder
    lastChapterId?: SortOrder
    startedAt?: SortOrder
    pausedAt?: SortOrder
    sessionDurationSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SessionCheckpointAvgOrderByAggregateInput = {
    sessionDurationSeconds?: SortOrder
  }

  export type SessionCheckpointMaxOrderByAggregateInput = {
    id?: SortOrder
    gameSessionId?: SortOrder
    firstChapterId?: SortOrder
    lastChapterId?: SortOrder
    startedAt?: SortOrder
    pausedAt?: SortOrder
    sessionDurationSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SessionCheckpointMinOrderByAggregateInput = {
    id?: SortOrder
    gameSessionId?: SortOrder
    firstChapterId?: SortOrder
    lastChapterId?: SortOrder
    startedAt?: SortOrder
    pausedAt?: SortOrder
    sessionDurationSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SessionCheckpointSumOrderByAggregateInput = {
    sessionDurationSeconds?: SortOrder
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type EnumChallengeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ChallengeStatus | EnumChallengeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ChallengeStatus[] | ListEnumChallengeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ChallengeStatus[] | ListEnumChallengeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumChallengeStatusFilter<$PrismaModel> | $Enums.ChallengeStatus
  }

  export type AttemptActionListRelationFilter = {
    every?: AttemptActionWhereInput
    some?: AttemptActionWhereInput
    none?: AttemptActionWhereInput
  }

  export type StarEventNullableRelationFilter = {
    is?: StarEventWhereInput | null
    isNot?: StarEventWhereInput | null
  }

  export type AttemptActionOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type ChallengeAttemptCountOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    challengeId?: SortOrder
    answerId?: SortOrder
    textAnswer?: SortOrder
    isCorrect?: SortOrder
    status?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    timeSpentSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChallengeAttemptAvgOrderByAggregateInput = {
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    timeSpentSeconds?: SortOrder
  }

  export type ChallengeAttemptMaxOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    challengeId?: SortOrder
    answerId?: SortOrder
    textAnswer?: SortOrder
    isCorrect?: SortOrder
    status?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    timeSpentSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChallengeAttemptMinOrderByAggregateInput = {
    id?: SortOrder
    sessionId?: SortOrder
    challengeId?: SortOrder
    answerId?: SortOrder
    textAnswer?: SortOrder
    isCorrect?: SortOrder
    status?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    timeSpentSeconds?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChallengeAttemptSumOrderByAggregateInput = {
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    timeSpentSeconds?: SortOrder
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type EnumChallengeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ChallengeStatus | EnumChallengeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ChallengeStatus[] | ListEnumChallengeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ChallengeStatus[] | ListEnumChallengeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumChallengeStatusWithAggregatesFilter<$PrismaModel> | $Enums.ChallengeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumChallengeStatusFilter<$PrismaModel>
    _max?: NestedEnumChallengeStatusFilter<$PrismaModel>
  }

  export type ChallengeAttemptRelationFilter = {
    is?: ChallengeAttemptWhereInput
    isNot?: ChallengeAttemptWhereInput
  }

  export type AttemptActionCountOrderByAggregateInput = {
    id?: SortOrder
    attemptId?: SortOrder
    selectedAnswerId?: SortOrder
    selectedAnswerText?: SortOrder
    answerText?: SortOrder
    isCorrect?: SortOrder
    attemptNumberAtAction?: SortOrder
    createdAt?: SortOrder
  }

  export type AttemptActionAvgOrderByAggregateInput = {
    attemptNumberAtAction?: SortOrder
  }

  export type AttemptActionMaxOrderByAggregateInput = {
    id?: SortOrder
    attemptId?: SortOrder
    selectedAnswerId?: SortOrder
    selectedAnswerText?: SortOrder
    answerText?: SortOrder
    isCorrect?: SortOrder
    attemptNumberAtAction?: SortOrder
    createdAt?: SortOrder
  }

  export type AttemptActionMinOrderByAggregateInput = {
    id?: SortOrder
    attemptId?: SortOrder
    selectedAnswerId?: SortOrder
    selectedAnswerText?: SortOrder
    answerText?: SortOrder
    isCorrect?: SortOrder
    attemptNumberAtAction?: SortOrder
    createdAt?: SortOrder
  }

  export type AttemptActionSumOrderByAggregateInput = {
    attemptNumberAtAction?: SortOrder
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StarEventCountOrderByAggregateInput = {
    id?: SortOrder
    attemptId?: SortOrder
    challengeId?: SortOrder
    baseStars?: SortOrder
    noHintBonus?: SortOrder
    firstTryBonus?: SortOrder
    totalStars?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    wasCorrect?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StarEventAvgOrderByAggregateInput = {
    baseStars?: SortOrder
    noHintBonus?: SortOrder
    firstTryBonus?: SortOrder
    totalStars?: SortOrder
    attemptNumber?: SortOrder
  }

  export type StarEventMaxOrderByAggregateInput = {
    id?: SortOrder
    attemptId?: SortOrder
    challengeId?: SortOrder
    baseStars?: SortOrder
    noHintBonus?: SortOrder
    firstTryBonus?: SortOrder
    totalStars?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    wasCorrect?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StarEventMinOrderByAggregateInput = {
    id?: SortOrder
    attemptId?: SortOrder
    challengeId?: SortOrder
    baseStars?: SortOrder
    noHintBonus?: SortOrder
    firstTryBonus?: SortOrder
    totalStars?: SortOrder
    attemptNumber?: SortOrder
    usedHints?: SortOrder
    wasCorrect?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StarEventSumOrderByAggregateInput = {
    baseStars?: SortOrder
    noHintBonus?: SortOrder
    firstTryBonus?: SortOrder
    totalStars?: SortOrder
    attemptNumber?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ChildBadgeChildProfileIdBadgeIdCompoundUniqueInput = {
    childProfileId: string
    badgeId: string
  }

  export type ChildBadgeCountOrderByAggregateInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    badgeId?: SortOrder
    earnedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChildBadgeMaxOrderByAggregateInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    badgeId?: SortOrder
    earnedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChildBadgeMinOrderByAggregateInput = {
    id?: SortOrder
    childProfileId?: SortOrder
    badgeId?: SortOrder
    earnedAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type ChildProfileCreatefavoriteThemesInput = {
    set: string[]
  }

  export type ChildProfileCreateallocatedRoadmapsInput = {
    set: string[]
  }

  export type ProgressCreateNestedManyWithoutChildProfileInput = {
    create?: XOR<ProgressCreateWithoutChildProfileInput, ProgressUncheckedCreateWithoutChildProfileInput> | ProgressCreateWithoutChildProfileInput[] | ProgressUncheckedCreateWithoutChildProfileInput[]
    connectOrCreate?: ProgressCreateOrConnectWithoutChildProfileInput | ProgressCreateOrConnectWithoutChildProfileInput[]
    createMany?: ProgressCreateManyChildProfileInputEnvelope
    connect?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
  }

  export type ChildBadgeCreateNestedManyWithoutChildProfileInput = {
    create?: XOR<ChildBadgeCreateWithoutChildProfileInput, ChildBadgeUncheckedCreateWithoutChildProfileInput> | ChildBadgeCreateWithoutChildProfileInput[] | ChildBadgeUncheckedCreateWithoutChildProfileInput[]
    connectOrCreate?: ChildBadgeCreateOrConnectWithoutChildProfileInput | ChildBadgeCreateOrConnectWithoutChildProfileInput[]
    createMany?: ChildBadgeCreateManyChildProfileInputEnvelope
    connect?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
  }

  export type ProgressUncheckedCreateNestedManyWithoutChildProfileInput = {
    create?: XOR<ProgressCreateWithoutChildProfileInput, ProgressUncheckedCreateWithoutChildProfileInput> | ProgressCreateWithoutChildProfileInput[] | ProgressUncheckedCreateWithoutChildProfileInput[]
    connectOrCreate?: ProgressCreateOrConnectWithoutChildProfileInput | ProgressCreateOrConnectWithoutChildProfileInput[]
    createMany?: ProgressCreateManyChildProfileInputEnvelope
    connect?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
  }

  export type ChildBadgeUncheckedCreateNestedManyWithoutChildProfileInput = {
    create?: XOR<ChildBadgeCreateWithoutChildProfileInput, ChildBadgeUncheckedCreateWithoutChildProfileInput> | ChildBadgeCreateWithoutChildProfileInput[] | ChildBadgeUncheckedCreateWithoutChildProfileInput[]
    connectOrCreate?: ChildBadgeCreateOrConnectWithoutChildProfileInput | ChildBadgeCreateOrConnectWithoutChildProfileInput[]
    createMany?: ChildBadgeCreateManyChildProfileInputEnvelope
    connect?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type ChildProfileUpdatefavoriteThemesInput = {
    set?: string[]
    push?: string | string[]
  }

  export type ChildProfileUpdateallocatedRoadmapsInput = {
    set?: string[]
    push?: string | string[]
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type ProgressUpdateManyWithoutChildProfileNestedInput = {
    create?: XOR<ProgressCreateWithoutChildProfileInput, ProgressUncheckedCreateWithoutChildProfileInput> | ProgressCreateWithoutChildProfileInput[] | ProgressUncheckedCreateWithoutChildProfileInput[]
    connectOrCreate?: ProgressCreateOrConnectWithoutChildProfileInput | ProgressCreateOrConnectWithoutChildProfileInput[]
    upsert?: ProgressUpsertWithWhereUniqueWithoutChildProfileInput | ProgressUpsertWithWhereUniqueWithoutChildProfileInput[]
    createMany?: ProgressCreateManyChildProfileInputEnvelope
    set?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
    disconnect?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
    delete?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
    connect?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
    update?: ProgressUpdateWithWhereUniqueWithoutChildProfileInput | ProgressUpdateWithWhereUniqueWithoutChildProfileInput[]
    updateMany?: ProgressUpdateManyWithWhereWithoutChildProfileInput | ProgressUpdateManyWithWhereWithoutChildProfileInput[]
    deleteMany?: ProgressScalarWhereInput | ProgressScalarWhereInput[]
  }

  export type ChildBadgeUpdateManyWithoutChildProfileNestedInput = {
    create?: XOR<ChildBadgeCreateWithoutChildProfileInput, ChildBadgeUncheckedCreateWithoutChildProfileInput> | ChildBadgeCreateWithoutChildProfileInput[] | ChildBadgeUncheckedCreateWithoutChildProfileInput[]
    connectOrCreate?: ChildBadgeCreateOrConnectWithoutChildProfileInput | ChildBadgeCreateOrConnectWithoutChildProfileInput[]
    upsert?: ChildBadgeUpsertWithWhereUniqueWithoutChildProfileInput | ChildBadgeUpsertWithWhereUniqueWithoutChildProfileInput[]
    createMany?: ChildBadgeCreateManyChildProfileInputEnvelope
    set?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
    disconnect?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
    delete?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
    connect?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
    update?: ChildBadgeUpdateWithWhereUniqueWithoutChildProfileInput | ChildBadgeUpdateWithWhereUniqueWithoutChildProfileInput[]
    updateMany?: ChildBadgeUpdateManyWithWhereWithoutChildProfileInput | ChildBadgeUpdateManyWithWhereWithoutChildProfileInput[]
    deleteMany?: ChildBadgeScalarWhereInput | ChildBadgeScalarWhereInput[]
  }

  export type ProgressUncheckedUpdateManyWithoutChildProfileNestedInput = {
    create?: XOR<ProgressCreateWithoutChildProfileInput, ProgressUncheckedCreateWithoutChildProfileInput> | ProgressCreateWithoutChildProfileInput[] | ProgressUncheckedCreateWithoutChildProfileInput[]
    connectOrCreate?: ProgressCreateOrConnectWithoutChildProfileInput | ProgressCreateOrConnectWithoutChildProfileInput[]
    upsert?: ProgressUpsertWithWhereUniqueWithoutChildProfileInput | ProgressUpsertWithWhereUniqueWithoutChildProfileInput[]
    createMany?: ProgressCreateManyChildProfileInputEnvelope
    set?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
    disconnect?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
    delete?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
    connect?: ProgressWhereUniqueInput | ProgressWhereUniqueInput[]
    update?: ProgressUpdateWithWhereUniqueWithoutChildProfileInput | ProgressUpdateWithWhereUniqueWithoutChildProfileInput[]
    updateMany?: ProgressUpdateManyWithWhereWithoutChildProfileInput | ProgressUpdateManyWithWhereWithoutChildProfileInput[]
    deleteMany?: ProgressScalarWhereInput | ProgressScalarWhereInput[]
  }

  export type ChildBadgeUncheckedUpdateManyWithoutChildProfileNestedInput = {
    create?: XOR<ChildBadgeCreateWithoutChildProfileInput, ChildBadgeUncheckedCreateWithoutChildProfileInput> | ChildBadgeCreateWithoutChildProfileInput[] | ChildBadgeUncheckedCreateWithoutChildProfileInput[]
    connectOrCreate?: ChildBadgeCreateOrConnectWithoutChildProfileInput | ChildBadgeCreateOrConnectWithoutChildProfileInput[]
    upsert?: ChildBadgeUpsertWithWhereUniqueWithoutChildProfileInput | ChildBadgeUpsertWithWhereUniqueWithoutChildProfileInput[]
    createMany?: ChildBadgeCreateManyChildProfileInputEnvelope
    set?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
    disconnect?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
    delete?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
    connect?: ChildBadgeWhereUniqueInput | ChildBadgeWhereUniqueInput[]
    update?: ChildBadgeUpdateWithWhereUniqueWithoutChildProfileInput | ChildBadgeUpdateWithWhereUniqueWithoutChildProfileInput[]
    updateMany?: ChildBadgeUpdateManyWithWhereWithoutChildProfileInput | ChildBadgeUpdateManyWithWhereWithoutChildProfileInput[]
    deleteMany?: ChildBadgeScalarWhereInput | ChildBadgeScalarWhereInput[]
  }

  export type ChildProfileCreateNestedOneWithoutProgressInput = {
    create?: XOR<ChildProfileCreateWithoutProgressInput, ChildProfileUncheckedCreateWithoutProgressInput>
    connectOrCreate?: ChildProfileCreateOrConnectWithoutProgressInput
    connect?: ChildProfileWhereUniqueInput
  }

  export type GameSessionCreateNestedOneWithoutProgressInput = {
    create?: XOR<GameSessionCreateWithoutProgressInput, GameSessionUncheckedCreateWithoutProgressInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutProgressInput
    connect?: GameSessionWhereUniqueInput
  }

  export type GameSessionUncheckedCreateNestedOneWithoutProgressInput = {
    create?: XOR<GameSessionCreateWithoutProgressInput, GameSessionUncheckedCreateWithoutProgressInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutProgressInput
    connect?: GameSessionWhereUniqueInput
  }

  export type EnumProgressStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProgressStatus
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type ChildProfileUpdateOneRequiredWithoutProgressNestedInput = {
    create?: XOR<ChildProfileCreateWithoutProgressInput, ChildProfileUncheckedCreateWithoutProgressInput>
    connectOrCreate?: ChildProfileCreateOrConnectWithoutProgressInput
    upsert?: ChildProfileUpsertWithoutProgressInput
    connect?: ChildProfileWhereUniqueInput
    update?: XOR<XOR<ChildProfileUpdateToOneWithWhereWithoutProgressInput, ChildProfileUpdateWithoutProgressInput>, ChildProfileUncheckedUpdateWithoutProgressInput>
  }

  export type GameSessionUpdateOneWithoutProgressNestedInput = {
    create?: XOR<GameSessionCreateWithoutProgressInput, GameSessionUncheckedCreateWithoutProgressInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutProgressInput
    upsert?: GameSessionUpsertWithoutProgressInput
    disconnect?: GameSessionWhereInput | boolean
    delete?: GameSessionWhereInput | boolean
    connect?: GameSessionWhereUniqueInput
    update?: XOR<XOR<GameSessionUpdateToOneWithWhereWithoutProgressInput, GameSessionUpdateWithoutProgressInput>, GameSessionUncheckedUpdateWithoutProgressInput>
  }

  export type GameSessionUncheckedUpdateOneWithoutProgressNestedInput = {
    create?: XOR<GameSessionCreateWithoutProgressInput, GameSessionUncheckedCreateWithoutProgressInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutProgressInput
    upsert?: GameSessionUpsertWithoutProgressInput
    disconnect?: GameSessionWhereInput | boolean
    delete?: GameSessionWhereInput | boolean
    connect?: GameSessionWhereUniqueInput
    update?: XOR<XOR<GameSessionUpdateToOneWithWhereWithoutProgressInput, GameSessionUpdateWithoutProgressInput>, GameSessionUncheckedUpdateWithoutProgressInput>
  }

  export type ProgressCreateNestedOneWithoutGameSessionInput = {
    create?: XOR<ProgressCreateWithoutGameSessionInput, ProgressUncheckedCreateWithoutGameSessionInput>
    connectOrCreate?: ProgressCreateOrConnectWithoutGameSessionInput
    connect?: ProgressWhereUniqueInput
  }

  export type ChallengeAttemptCreateNestedManyWithoutSessionInput = {
    create?: XOR<ChallengeAttemptCreateWithoutSessionInput, ChallengeAttemptUncheckedCreateWithoutSessionInput> | ChallengeAttemptCreateWithoutSessionInput[] | ChallengeAttemptUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: ChallengeAttemptCreateOrConnectWithoutSessionInput | ChallengeAttemptCreateOrConnectWithoutSessionInput[]
    createMany?: ChallengeAttemptCreateManySessionInputEnvelope
    connect?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
  }

  export type SessionCheckpointCreateNestedManyWithoutGameSessionInput = {
    create?: XOR<SessionCheckpointCreateWithoutGameSessionInput, SessionCheckpointUncheckedCreateWithoutGameSessionInput> | SessionCheckpointCreateWithoutGameSessionInput[] | SessionCheckpointUncheckedCreateWithoutGameSessionInput[]
    connectOrCreate?: SessionCheckpointCreateOrConnectWithoutGameSessionInput | SessionCheckpointCreateOrConnectWithoutGameSessionInput[]
    createMany?: SessionCheckpointCreateManyGameSessionInputEnvelope
    connect?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
  }

  export type ChallengeAttemptUncheckedCreateNestedManyWithoutSessionInput = {
    create?: XOR<ChallengeAttemptCreateWithoutSessionInput, ChallengeAttemptUncheckedCreateWithoutSessionInput> | ChallengeAttemptCreateWithoutSessionInput[] | ChallengeAttemptUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: ChallengeAttemptCreateOrConnectWithoutSessionInput | ChallengeAttemptCreateOrConnectWithoutSessionInput[]
    createMany?: ChallengeAttemptCreateManySessionInputEnvelope
    connect?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
  }

  export type SessionCheckpointUncheckedCreateNestedManyWithoutGameSessionInput = {
    create?: XOR<SessionCheckpointCreateWithoutGameSessionInput, SessionCheckpointUncheckedCreateWithoutGameSessionInput> | SessionCheckpointCreateWithoutGameSessionInput[] | SessionCheckpointUncheckedCreateWithoutGameSessionInput[]
    connectOrCreate?: SessionCheckpointCreateOrConnectWithoutGameSessionInput | SessionCheckpointCreateOrConnectWithoutGameSessionInput[]
    createMany?: SessionCheckpointCreateManyGameSessionInputEnvelope
    connect?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
  }

  export type ProgressUpdateOneRequiredWithoutGameSessionNestedInput = {
    create?: XOR<ProgressCreateWithoutGameSessionInput, ProgressUncheckedCreateWithoutGameSessionInput>
    connectOrCreate?: ProgressCreateOrConnectWithoutGameSessionInput
    upsert?: ProgressUpsertWithoutGameSessionInput
    connect?: ProgressWhereUniqueInput
    update?: XOR<XOR<ProgressUpdateToOneWithWhereWithoutGameSessionInput, ProgressUpdateWithoutGameSessionInput>, ProgressUncheckedUpdateWithoutGameSessionInput>
  }

  export type ChallengeAttemptUpdateManyWithoutSessionNestedInput = {
    create?: XOR<ChallengeAttemptCreateWithoutSessionInput, ChallengeAttemptUncheckedCreateWithoutSessionInput> | ChallengeAttemptCreateWithoutSessionInput[] | ChallengeAttemptUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: ChallengeAttemptCreateOrConnectWithoutSessionInput | ChallengeAttemptCreateOrConnectWithoutSessionInput[]
    upsert?: ChallengeAttemptUpsertWithWhereUniqueWithoutSessionInput | ChallengeAttemptUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: ChallengeAttemptCreateManySessionInputEnvelope
    set?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
    disconnect?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
    delete?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
    connect?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
    update?: ChallengeAttemptUpdateWithWhereUniqueWithoutSessionInput | ChallengeAttemptUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: ChallengeAttemptUpdateManyWithWhereWithoutSessionInput | ChallengeAttemptUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: ChallengeAttemptScalarWhereInput | ChallengeAttemptScalarWhereInput[]
  }

  export type SessionCheckpointUpdateManyWithoutGameSessionNestedInput = {
    create?: XOR<SessionCheckpointCreateWithoutGameSessionInput, SessionCheckpointUncheckedCreateWithoutGameSessionInput> | SessionCheckpointCreateWithoutGameSessionInput[] | SessionCheckpointUncheckedCreateWithoutGameSessionInput[]
    connectOrCreate?: SessionCheckpointCreateOrConnectWithoutGameSessionInput | SessionCheckpointCreateOrConnectWithoutGameSessionInput[]
    upsert?: SessionCheckpointUpsertWithWhereUniqueWithoutGameSessionInput | SessionCheckpointUpsertWithWhereUniqueWithoutGameSessionInput[]
    createMany?: SessionCheckpointCreateManyGameSessionInputEnvelope
    set?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
    disconnect?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
    delete?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
    connect?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
    update?: SessionCheckpointUpdateWithWhereUniqueWithoutGameSessionInput | SessionCheckpointUpdateWithWhereUniqueWithoutGameSessionInput[]
    updateMany?: SessionCheckpointUpdateManyWithWhereWithoutGameSessionInput | SessionCheckpointUpdateManyWithWhereWithoutGameSessionInput[]
    deleteMany?: SessionCheckpointScalarWhereInput | SessionCheckpointScalarWhereInput[]
  }

  export type ChallengeAttemptUncheckedUpdateManyWithoutSessionNestedInput = {
    create?: XOR<ChallengeAttemptCreateWithoutSessionInput, ChallengeAttemptUncheckedCreateWithoutSessionInput> | ChallengeAttemptCreateWithoutSessionInput[] | ChallengeAttemptUncheckedCreateWithoutSessionInput[]
    connectOrCreate?: ChallengeAttemptCreateOrConnectWithoutSessionInput | ChallengeAttemptCreateOrConnectWithoutSessionInput[]
    upsert?: ChallengeAttemptUpsertWithWhereUniqueWithoutSessionInput | ChallengeAttemptUpsertWithWhereUniqueWithoutSessionInput[]
    createMany?: ChallengeAttemptCreateManySessionInputEnvelope
    set?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
    disconnect?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
    delete?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
    connect?: ChallengeAttemptWhereUniqueInput | ChallengeAttemptWhereUniqueInput[]
    update?: ChallengeAttemptUpdateWithWhereUniqueWithoutSessionInput | ChallengeAttemptUpdateWithWhereUniqueWithoutSessionInput[]
    updateMany?: ChallengeAttemptUpdateManyWithWhereWithoutSessionInput | ChallengeAttemptUpdateManyWithWhereWithoutSessionInput[]
    deleteMany?: ChallengeAttemptScalarWhereInput | ChallengeAttemptScalarWhereInput[]
  }

  export type SessionCheckpointUncheckedUpdateManyWithoutGameSessionNestedInput = {
    create?: XOR<SessionCheckpointCreateWithoutGameSessionInput, SessionCheckpointUncheckedCreateWithoutGameSessionInput> | SessionCheckpointCreateWithoutGameSessionInput[] | SessionCheckpointUncheckedCreateWithoutGameSessionInput[]
    connectOrCreate?: SessionCheckpointCreateOrConnectWithoutGameSessionInput | SessionCheckpointCreateOrConnectWithoutGameSessionInput[]
    upsert?: SessionCheckpointUpsertWithWhereUniqueWithoutGameSessionInput | SessionCheckpointUpsertWithWhereUniqueWithoutGameSessionInput[]
    createMany?: SessionCheckpointCreateManyGameSessionInputEnvelope
    set?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
    disconnect?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
    delete?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
    connect?: SessionCheckpointWhereUniqueInput | SessionCheckpointWhereUniqueInput[]
    update?: SessionCheckpointUpdateWithWhereUniqueWithoutGameSessionInput | SessionCheckpointUpdateWithWhereUniqueWithoutGameSessionInput[]
    updateMany?: SessionCheckpointUpdateManyWithWhereWithoutGameSessionInput | SessionCheckpointUpdateManyWithWhereWithoutGameSessionInput[]
    deleteMany?: SessionCheckpointScalarWhereInput | SessionCheckpointScalarWhereInput[]
  }

  export type GameSessionCreateNestedOneWithoutCheckpointsInput = {
    create?: XOR<GameSessionCreateWithoutCheckpointsInput, GameSessionUncheckedCreateWithoutCheckpointsInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutCheckpointsInput
    connect?: GameSessionWhereUniqueInput
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type GameSessionUpdateOneRequiredWithoutCheckpointsNestedInput = {
    create?: XOR<GameSessionCreateWithoutCheckpointsInput, GameSessionUncheckedCreateWithoutCheckpointsInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutCheckpointsInput
    upsert?: GameSessionUpsertWithoutCheckpointsInput
    connect?: GameSessionWhereUniqueInput
    update?: XOR<XOR<GameSessionUpdateToOneWithWhereWithoutCheckpointsInput, GameSessionUpdateWithoutCheckpointsInput>, GameSessionUncheckedUpdateWithoutCheckpointsInput>
  }

  export type GameSessionCreateNestedOneWithoutChallengeAttemptsInput = {
    create?: XOR<GameSessionCreateWithoutChallengeAttemptsInput, GameSessionUncheckedCreateWithoutChallengeAttemptsInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutChallengeAttemptsInput
    connect?: GameSessionWhereUniqueInput
  }

  export type AttemptActionCreateNestedManyWithoutAttemptInput = {
    create?: XOR<AttemptActionCreateWithoutAttemptInput, AttemptActionUncheckedCreateWithoutAttemptInput> | AttemptActionCreateWithoutAttemptInput[] | AttemptActionUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: AttemptActionCreateOrConnectWithoutAttemptInput | AttemptActionCreateOrConnectWithoutAttemptInput[]
    createMany?: AttemptActionCreateManyAttemptInputEnvelope
    connect?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
  }

  export type StarEventCreateNestedOneWithoutAttemptInput = {
    create?: XOR<StarEventCreateWithoutAttemptInput, StarEventUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: StarEventCreateOrConnectWithoutAttemptInput
    connect?: StarEventWhereUniqueInput
  }

  export type AttemptActionUncheckedCreateNestedManyWithoutAttemptInput = {
    create?: XOR<AttemptActionCreateWithoutAttemptInput, AttemptActionUncheckedCreateWithoutAttemptInput> | AttemptActionCreateWithoutAttemptInput[] | AttemptActionUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: AttemptActionCreateOrConnectWithoutAttemptInput | AttemptActionCreateOrConnectWithoutAttemptInput[]
    createMany?: AttemptActionCreateManyAttemptInputEnvelope
    connect?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
  }

  export type StarEventUncheckedCreateNestedOneWithoutAttemptInput = {
    create?: XOR<StarEventCreateWithoutAttemptInput, StarEventUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: StarEventCreateOrConnectWithoutAttemptInput
    connect?: StarEventWhereUniqueInput
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type EnumChallengeStatusFieldUpdateOperationsInput = {
    set?: $Enums.ChallengeStatus
  }

  export type GameSessionUpdateOneRequiredWithoutChallengeAttemptsNestedInput = {
    create?: XOR<GameSessionCreateWithoutChallengeAttemptsInput, GameSessionUncheckedCreateWithoutChallengeAttemptsInput>
    connectOrCreate?: GameSessionCreateOrConnectWithoutChallengeAttemptsInput
    upsert?: GameSessionUpsertWithoutChallengeAttemptsInput
    connect?: GameSessionWhereUniqueInput
    update?: XOR<XOR<GameSessionUpdateToOneWithWhereWithoutChallengeAttemptsInput, GameSessionUpdateWithoutChallengeAttemptsInput>, GameSessionUncheckedUpdateWithoutChallengeAttemptsInput>
  }

  export type AttemptActionUpdateManyWithoutAttemptNestedInput = {
    create?: XOR<AttemptActionCreateWithoutAttemptInput, AttemptActionUncheckedCreateWithoutAttemptInput> | AttemptActionCreateWithoutAttemptInput[] | AttemptActionUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: AttemptActionCreateOrConnectWithoutAttemptInput | AttemptActionCreateOrConnectWithoutAttemptInput[]
    upsert?: AttemptActionUpsertWithWhereUniqueWithoutAttemptInput | AttemptActionUpsertWithWhereUniqueWithoutAttemptInput[]
    createMany?: AttemptActionCreateManyAttemptInputEnvelope
    set?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
    disconnect?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
    delete?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
    connect?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
    update?: AttemptActionUpdateWithWhereUniqueWithoutAttemptInput | AttemptActionUpdateWithWhereUniqueWithoutAttemptInput[]
    updateMany?: AttemptActionUpdateManyWithWhereWithoutAttemptInput | AttemptActionUpdateManyWithWhereWithoutAttemptInput[]
    deleteMany?: AttemptActionScalarWhereInput | AttemptActionScalarWhereInput[]
  }

  export type StarEventUpdateOneWithoutAttemptNestedInput = {
    create?: XOR<StarEventCreateWithoutAttemptInput, StarEventUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: StarEventCreateOrConnectWithoutAttemptInput
    upsert?: StarEventUpsertWithoutAttemptInput
    disconnect?: StarEventWhereInput | boolean
    delete?: StarEventWhereInput | boolean
    connect?: StarEventWhereUniqueInput
    update?: XOR<XOR<StarEventUpdateToOneWithWhereWithoutAttemptInput, StarEventUpdateWithoutAttemptInput>, StarEventUncheckedUpdateWithoutAttemptInput>
  }

  export type AttemptActionUncheckedUpdateManyWithoutAttemptNestedInput = {
    create?: XOR<AttemptActionCreateWithoutAttemptInput, AttemptActionUncheckedCreateWithoutAttemptInput> | AttemptActionCreateWithoutAttemptInput[] | AttemptActionUncheckedCreateWithoutAttemptInput[]
    connectOrCreate?: AttemptActionCreateOrConnectWithoutAttemptInput | AttemptActionCreateOrConnectWithoutAttemptInput[]
    upsert?: AttemptActionUpsertWithWhereUniqueWithoutAttemptInput | AttemptActionUpsertWithWhereUniqueWithoutAttemptInput[]
    createMany?: AttemptActionCreateManyAttemptInputEnvelope
    set?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
    disconnect?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
    delete?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
    connect?: AttemptActionWhereUniqueInput | AttemptActionWhereUniqueInput[]
    update?: AttemptActionUpdateWithWhereUniqueWithoutAttemptInput | AttemptActionUpdateWithWhereUniqueWithoutAttemptInput[]
    updateMany?: AttemptActionUpdateManyWithWhereWithoutAttemptInput | AttemptActionUpdateManyWithWhereWithoutAttemptInput[]
    deleteMany?: AttemptActionScalarWhereInput | AttemptActionScalarWhereInput[]
  }

  export type StarEventUncheckedUpdateOneWithoutAttemptNestedInput = {
    create?: XOR<StarEventCreateWithoutAttemptInput, StarEventUncheckedCreateWithoutAttemptInput>
    connectOrCreate?: StarEventCreateOrConnectWithoutAttemptInput
    upsert?: StarEventUpsertWithoutAttemptInput
    disconnect?: StarEventWhereInput | boolean
    delete?: StarEventWhereInput | boolean
    connect?: StarEventWhereUniqueInput
    update?: XOR<XOR<StarEventUpdateToOneWithWhereWithoutAttemptInput, StarEventUpdateWithoutAttemptInput>, StarEventUncheckedUpdateWithoutAttemptInput>
  }

  export type ChallengeAttemptCreateNestedOneWithoutActionsInput = {
    create?: XOR<ChallengeAttemptCreateWithoutActionsInput, ChallengeAttemptUncheckedCreateWithoutActionsInput>
    connectOrCreate?: ChallengeAttemptCreateOrConnectWithoutActionsInput
    connect?: ChallengeAttemptWhereUniqueInput
  }

  export type ChallengeAttemptUpdateOneRequiredWithoutActionsNestedInput = {
    create?: XOR<ChallengeAttemptCreateWithoutActionsInput, ChallengeAttemptUncheckedCreateWithoutActionsInput>
    connectOrCreate?: ChallengeAttemptCreateOrConnectWithoutActionsInput
    upsert?: ChallengeAttemptUpsertWithoutActionsInput
    connect?: ChallengeAttemptWhereUniqueInput
    update?: XOR<XOR<ChallengeAttemptUpdateToOneWithWhereWithoutActionsInput, ChallengeAttemptUpdateWithoutActionsInput>, ChallengeAttemptUncheckedUpdateWithoutActionsInput>
  }

  export type ChallengeAttemptCreateNestedOneWithoutStarEventInput = {
    create?: XOR<ChallengeAttemptCreateWithoutStarEventInput, ChallengeAttemptUncheckedCreateWithoutStarEventInput>
    connectOrCreate?: ChallengeAttemptCreateOrConnectWithoutStarEventInput
    connect?: ChallengeAttemptWhereUniqueInput
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type ChallengeAttemptUpdateOneRequiredWithoutStarEventNestedInput = {
    create?: XOR<ChallengeAttemptCreateWithoutStarEventInput, ChallengeAttemptUncheckedCreateWithoutStarEventInput>
    connectOrCreate?: ChallengeAttemptCreateOrConnectWithoutStarEventInput
    upsert?: ChallengeAttemptUpsertWithoutStarEventInput
    connect?: ChallengeAttemptWhereUniqueInput
    update?: XOR<XOR<ChallengeAttemptUpdateToOneWithWhereWithoutStarEventInput, ChallengeAttemptUpdateWithoutStarEventInput>, ChallengeAttemptUncheckedUpdateWithoutStarEventInput>
  }

  export type ChildProfileCreateNestedOneWithoutBadgesInput = {
    create?: XOR<ChildProfileCreateWithoutBadgesInput, ChildProfileUncheckedCreateWithoutBadgesInput>
    connectOrCreate?: ChildProfileCreateOrConnectWithoutBadgesInput
    connect?: ChildProfileWhereUniqueInput
  }

  export type ChildProfileUpdateOneRequiredWithoutBadgesNestedInput = {
    create?: XOR<ChildProfileCreateWithoutBadgesInput, ChildProfileUncheckedCreateWithoutBadgesInput>
    connectOrCreate?: ChildProfileCreateOrConnectWithoutBadgesInput
    upsert?: ChildProfileUpsertWithoutBadgesInput
    connect?: ChildProfileWhereUniqueInput
    update?: XOR<XOR<ChildProfileUpdateToOneWithWhereWithoutBadgesInput, ChildProfileUpdateWithoutBadgesInput>, ChildProfileUncheckedUpdateWithoutBadgesInput>
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumProgressStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ProgressStatus | EnumProgressStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProgressStatus[] | ListEnumProgressStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProgressStatus[] | ListEnumProgressStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProgressStatusFilter<$PrismaModel> | $Enums.ProgressStatus
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumProgressStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ProgressStatus | EnumProgressStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ProgressStatus[] | ListEnumProgressStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ProgressStatus[] | ListEnumProgressStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumProgressStatusWithAggregatesFilter<$PrismaModel> | $Enums.ProgressStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumProgressStatusFilter<$PrismaModel>
    _max?: NestedEnumProgressStatusFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type NestedEnumChallengeStatusFilter<$PrismaModel = never> = {
    equals?: $Enums.ChallengeStatus | EnumChallengeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ChallengeStatus[] | ListEnumChallengeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ChallengeStatus[] | ListEnumChallengeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumChallengeStatusFilter<$PrismaModel> | $Enums.ChallengeStatus
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedEnumChallengeStatusWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.ChallengeStatus | EnumChallengeStatusFieldRefInput<$PrismaModel>
    in?: $Enums.ChallengeStatus[] | ListEnumChallengeStatusFieldRefInput<$PrismaModel>
    notIn?: $Enums.ChallengeStatus[] | ListEnumChallengeStatusFieldRefInput<$PrismaModel>
    not?: NestedEnumChallengeStatusWithAggregatesFilter<$PrismaModel> | $Enums.ChallengeStatus
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumChallengeStatusFilter<$PrismaModel>
    _max?: NestedEnumChallengeStatusFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type ProgressCreateWithoutChildProfileInput = {
    id?: string
    roadmapId: string
    worldId: string
    storyId: string
    status?: $Enums.ProgressStatus
    totalTimeSpent?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    gameSession?: GameSessionCreateNestedOneWithoutProgressInput
  }

  export type ProgressUncheckedCreateWithoutChildProfileInput = {
    id?: string
    roadmapId: string
    worldId: string
    storyId: string
    status?: $Enums.ProgressStatus
    totalTimeSpent?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    gameSession?: GameSessionUncheckedCreateNestedOneWithoutProgressInput
  }

  export type ProgressCreateOrConnectWithoutChildProfileInput = {
    where: ProgressWhereUniqueInput
    create: XOR<ProgressCreateWithoutChildProfileInput, ProgressUncheckedCreateWithoutChildProfileInput>
  }

  export type ProgressCreateManyChildProfileInputEnvelope = {
    data: ProgressCreateManyChildProfileInput | ProgressCreateManyChildProfileInput[]
    skipDuplicates?: boolean
  }

  export type ChildBadgeCreateWithoutChildProfileInput = {
    id?: string
    badgeId: string
    earnedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChildBadgeUncheckedCreateWithoutChildProfileInput = {
    id?: string
    badgeId: string
    earnedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChildBadgeCreateOrConnectWithoutChildProfileInput = {
    where: ChildBadgeWhereUniqueInput
    create: XOR<ChildBadgeCreateWithoutChildProfileInput, ChildBadgeUncheckedCreateWithoutChildProfileInput>
  }

  export type ChildBadgeCreateManyChildProfileInputEnvelope = {
    data: ChildBadgeCreateManyChildProfileInput | ChildBadgeCreateManyChildProfileInput[]
    skipDuplicates?: boolean
  }

  export type ProgressUpsertWithWhereUniqueWithoutChildProfileInput = {
    where: ProgressWhereUniqueInput
    update: XOR<ProgressUpdateWithoutChildProfileInput, ProgressUncheckedUpdateWithoutChildProfileInput>
    create: XOR<ProgressCreateWithoutChildProfileInput, ProgressUncheckedCreateWithoutChildProfileInput>
  }

  export type ProgressUpdateWithWhereUniqueWithoutChildProfileInput = {
    where: ProgressWhereUniqueInput
    data: XOR<ProgressUpdateWithoutChildProfileInput, ProgressUncheckedUpdateWithoutChildProfileInput>
  }

  export type ProgressUpdateManyWithWhereWithoutChildProfileInput = {
    where: ProgressScalarWhereInput
    data: XOR<ProgressUpdateManyMutationInput, ProgressUncheckedUpdateManyWithoutChildProfileInput>
  }

  export type ProgressScalarWhereInput = {
    AND?: ProgressScalarWhereInput | ProgressScalarWhereInput[]
    OR?: ProgressScalarWhereInput[]
    NOT?: ProgressScalarWhereInput | ProgressScalarWhereInput[]
    id?: StringFilter<"Progress"> | string
    childProfileId?: StringFilter<"Progress"> | string
    roadmapId?: StringFilter<"Progress"> | string
    worldId?: StringFilter<"Progress"> | string
    storyId?: StringFilter<"Progress"> | string
    status?: EnumProgressStatusFilter<"Progress"> | $Enums.ProgressStatus
    totalTimeSpent?: IntFilter<"Progress"> | number
    completedAt?: DateTimeNullableFilter<"Progress"> | Date | string | null
    createdAt?: DateTimeFilter<"Progress"> | Date | string
    updatedAt?: DateTimeFilter<"Progress"> | Date | string
  }

  export type ChildBadgeUpsertWithWhereUniqueWithoutChildProfileInput = {
    where: ChildBadgeWhereUniqueInput
    update: XOR<ChildBadgeUpdateWithoutChildProfileInput, ChildBadgeUncheckedUpdateWithoutChildProfileInput>
    create: XOR<ChildBadgeCreateWithoutChildProfileInput, ChildBadgeUncheckedCreateWithoutChildProfileInput>
  }

  export type ChildBadgeUpdateWithWhereUniqueWithoutChildProfileInput = {
    where: ChildBadgeWhereUniqueInput
    data: XOR<ChildBadgeUpdateWithoutChildProfileInput, ChildBadgeUncheckedUpdateWithoutChildProfileInput>
  }

  export type ChildBadgeUpdateManyWithWhereWithoutChildProfileInput = {
    where: ChildBadgeScalarWhereInput
    data: XOR<ChildBadgeUpdateManyMutationInput, ChildBadgeUncheckedUpdateManyWithoutChildProfileInput>
  }

  export type ChildBadgeScalarWhereInput = {
    AND?: ChildBadgeScalarWhereInput | ChildBadgeScalarWhereInput[]
    OR?: ChildBadgeScalarWhereInput[]
    NOT?: ChildBadgeScalarWhereInput | ChildBadgeScalarWhereInput[]
    id?: StringFilter<"ChildBadge"> | string
    childProfileId?: StringFilter<"ChildBadge"> | string
    badgeId?: StringFilter<"ChildBadge"> | string
    earnedAt?: DateTimeFilter<"ChildBadge"> | Date | string
    createdAt?: DateTimeFilter<"ChildBadge"> | Date | string
    updatedAt?: DateTimeFilter<"ChildBadge"> | Date | string
  }

  export type ChildProfileCreateWithoutProgressInput = {
    id?: string
    name: string
    parentId: string
    childId: string
    ageGroupId: string
    ageGroupName?: string | null
    favoriteThemes?: ChildProfileCreatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileCreateallocatedRoadmapsInput | string[]
    currentLevel?: number
    totalStars?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    badges?: ChildBadgeCreateNestedManyWithoutChildProfileInput
  }

  export type ChildProfileUncheckedCreateWithoutProgressInput = {
    id?: string
    name: string
    parentId: string
    childId: string
    ageGroupId: string
    ageGroupName?: string | null
    favoriteThemes?: ChildProfileCreatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileCreateallocatedRoadmapsInput | string[]
    currentLevel?: number
    totalStars?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    badges?: ChildBadgeUncheckedCreateNestedManyWithoutChildProfileInput
  }

  export type ChildProfileCreateOrConnectWithoutProgressInput = {
    where: ChildProfileWhereUniqueInput
    create: XOR<ChildProfileCreateWithoutProgressInput, ChildProfileUncheckedCreateWithoutProgressInput>
  }

  export type GameSessionCreateWithoutProgressInput = {
    id?: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    challengeAttempts?: ChallengeAttemptCreateNestedManyWithoutSessionInput
    checkpoints?: SessionCheckpointCreateNestedManyWithoutGameSessionInput
  }

  export type GameSessionUncheckedCreateWithoutProgressInput = {
    id?: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    challengeAttempts?: ChallengeAttemptUncheckedCreateNestedManyWithoutSessionInput
    checkpoints?: SessionCheckpointUncheckedCreateNestedManyWithoutGameSessionInput
  }

  export type GameSessionCreateOrConnectWithoutProgressInput = {
    where: GameSessionWhereUniqueInput
    create: XOR<GameSessionCreateWithoutProgressInput, GameSessionUncheckedCreateWithoutProgressInput>
  }

  export type ChildProfileUpsertWithoutProgressInput = {
    update: XOR<ChildProfileUpdateWithoutProgressInput, ChildProfileUncheckedUpdateWithoutProgressInput>
    create: XOR<ChildProfileCreateWithoutProgressInput, ChildProfileUncheckedCreateWithoutProgressInput>
    where?: ChildProfileWhereInput
  }

  export type ChildProfileUpdateToOneWithWhereWithoutProgressInput = {
    where?: ChildProfileWhereInput
    data: XOR<ChildProfileUpdateWithoutProgressInput, ChildProfileUncheckedUpdateWithoutProgressInput>
  }

  export type ChildProfileUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: StringFieldUpdateOperationsInput | string
    childId?: StringFieldUpdateOperationsInput | string
    ageGroupId?: StringFieldUpdateOperationsInput | string
    ageGroupName?: NullableStringFieldUpdateOperationsInput | string | null
    favoriteThemes?: ChildProfileUpdatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileUpdateallocatedRoadmapsInput | string[]
    currentLevel?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    badges?: ChildBadgeUpdateManyWithoutChildProfileNestedInput
  }

  export type ChildProfileUncheckedUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: StringFieldUpdateOperationsInput | string
    childId?: StringFieldUpdateOperationsInput | string
    ageGroupId?: StringFieldUpdateOperationsInput | string
    ageGroupName?: NullableStringFieldUpdateOperationsInput | string | null
    favoriteThemes?: ChildProfileUpdatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileUpdateallocatedRoadmapsInput | string[]
    currentLevel?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    badges?: ChildBadgeUncheckedUpdateManyWithoutChildProfileNestedInput
  }

  export type GameSessionUpsertWithoutProgressInput = {
    update: XOR<GameSessionUpdateWithoutProgressInput, GameSessionUncheckedUpdateWithoutProgressInput>
    create: XOR<GameSessionCreateWithoutProgressInput, GameSessionUncheckedCreateWithoutProgressInput>
    where?: GameSessionWhereInput
  }

  export type GameSessionUpdateToOneWithWhereWithoutProgressInput = {
    where?: GameSessionWhereInput
    data: XOR<GameSessionUpdateWithoutProgressInput, GameSessionUncheckedUpdateWithoutProgressInput>
  }

  export type GameSessionUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    challengeAttempts?: ChallengeAttemptUpdateManyWithoutSessionNestedInput
    checkpoints?: SessionCheckpointUpdateManyWithoutGameSessionNestedInput
  }

  export type GameSessionUncheckedUpdateWithoutProgressInput = {
    id?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    challengeAttempts?: ChallengeAttemptUncheckedUpdateManyWithoutSessionNestedInput
    checkpoints?: SessionCheckpointUncheckedUpdateManyWithoutGameSessionNestedInput
  }

  export type ProgressCreateWithoutGameSessionInput = {
    id?: string
    roadmapId: string
    worldId: string
    storyId: string
    status?: $Enums.ProgressStatus
    totalTimeSpent?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
    childProfile: ChildProfileCreateNestedOneWithoutProgressInput
  }

  export type ProgressUncheckedCreateWithoutGameSessionInput = {
    id?: string
    childProfileId: string
    roadmapId: string
    worldId: string
    storyId: string
    status?: $Enums.ProgressStatus
    totalTimeSpent?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProgressCreateOrConnectWithoutGameSessionInput = {
    where: ProgressWhereUniqueInput
    create: XOR<ProgressCreateWithoutGameSessionInput, ProgressUncheckedCreateWithoutGameSessionInput>
  }

  export type ChallengeAttemptCreateWithoutSessionInput = {
    id?: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    actions?: AttemptActionCreateNestedManyWithoutAttemptInput
    starEvent?: StarEventCreateNestedOneWithoutAttemptInput
  }

  export type ChallengeAttemptUncheckedCreateWithoutSessionInput = {
    id?: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    actions?: AttemptActionUncheckedCreateNestedManyWithoutAttemptInput
    starEvent?: StarEventUncheckedCreateNestedOneWithoutAttemptInput
  }

  export type ChallengeAttemptCreateOrConnectWithoutSessionInput = {
    where: ChallengeAttemptWhereUniqueInput
    create: XOR<ChallengeAttemptCreateWithoutSessionInput, ChallengeAttemptUncheckedCreateWithoutSessionInput>
  }

  export type ChallengeAttemptCreateManySessionInputEnvelope = {
    data: ChallengeAttemptCreateManySessionInput | ChallengeAttemptCreateManySessionInput[]
    skipDuplicates?: boolean
  }

  export type SessionCheckpointCreateWithoutGameSessionInput = {
    id?: string
    firstChapterId: string
    lastChapterId?: string | null
    startedAt?: Date | string
    pausedAt?: Date | string | null
    sessionDurationSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionCheckpointUncheckedCreateWithoutGameSessionInput = {
    id?: string
    firstChapterId: string
    lastChapterId?: string | null
    startedAt?: Date | string
    pausedAt?: Date | string | null
    sessionDurationSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionCheckpointCreateOrConnectWithoutGameSessionInput = {
    where: SessionCheckpointWhereUniqueInput
    create: XOR<SessionCheckpointCreateWithoutGameSessionInput, SessionCheckpointUncheckedCreateWithoutGameSessionInput>
  }

  export type SessionCheckpointCreateManyGameSessionInputEnvelope = {
    data: SessionCheckpointCreateManyGameSessionInput | SessionCheckpointCreateManyGameSessionInput[]
    skipDuplicates?: boolean
  }

  export type ProgressUpsertWithoutGameSessionInput = {
    update: XOR<ProgressUpdateWithoutGameSessionInput, ProgressUncheckedUpdateWithoutGameSessionInput>
    create: XOR<ProgressCreateWithoutGameSessionInput, ProgressUncheckedCreateWithoutGameSessionInput>
    where?: ProgressWhereInput
  }

  export type ProgressUpdateToOneWithWhereWithoutGameSessionInput = {
    where?: ProgressWhereInput
    data: XOR<ProgressUpdateWithoutGameSessionInput, ProgressUncheckedUpdateWithoutGameSessionInput>
  }

  export type ProgressUpdateWithoutGameSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    childProfile?: ChildProfileUpdateOneRequiredWithoutProgressNestedInput
  }

  export type ProgressUncheckedUpdateWithoutGameSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    childProfileId?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChallengeAttemptUpsertWithWhereUniqueWithoutSessionInput = {
    where: ChallengeAttemptWhereUniqueInput
    update: XOR<ChallengeAttemptUpdateWithoutSessionInput, ChallengeAttemptUncheckedUpdateWithoutSessionInput>
    create: XOR<ChallengeAttemptCreateWithoutSessionInput, ChallengeAttemptUncheckedCreateWithoutSessionInput>
  }

  export type ChallengeAttemptUpdateWithWhereUniqueWithoutSessionInput = {
    where: ChallengeAttemptWhereUniqueInput
    data: XOR<ChallengeAttemptUpdateWithoutSessionInput, ChallengeAttemptUncheckedUpdateWithoutSessionInput>
  }

  export type ChallengeAttemptUpdateManyWithWhereWithoutSessionInput = {
    where: ChallengeAttemptScalarWhereInput
    data: XOR<ChallengeAttemptUpdateManyMutationInput, ChallengeAttemptUncheckedUpdateManyWithoutSessionInput>
  }

  export type ChallengeAttemptScalarWhereInput = {
    AND?: ChallengeAttemptScalarWhereInput | ChallengeAttemptScalarWhereInput[]
    OR?: ChallengeAttemptScalarWhereInput[]
    NOT?: ChallengeAttemptScalarWhereInput | ChallengeAttemptScalarWhereInput[]
    id?: StringFilter<"ChallengeAttempt"> | string
    sessionId?: StringFilter<"ChallengeAttempt"> | string
    challengeId?: StringFilter<"ChallengeAttempt"> | string
    answerId?: StringNullableFilter<"ChallengeAttempt"> | string | null
    textAnswer?: StringNullableFilter<"ChallengeAttempt"> | string | null
    isCorrect?: BoolNullableFilter<"ChallengeAttempt"> | boolean | null
    status?: EnumChallengeStatusFilter<"ChallengeAttempt"> | $Enums.ChallengeStatus
    attemptNumber?: IntFilter<"ChallengeAttempt"> | number
    usedHints?: IntFilter<"ChallengeAttempt"> | number
    timeSpentSeconds?: IntFilter<"ChallengeAttempt"> | number
    createdAt?: DateTimeFilter<"ChallengeAttempt"> | Date | string
    updatedAt?: DateTimeFilter<"ChallengeAttempt"> | Date | string
  }

  export type SessionCheckpointUpsertWithWhereUniqueWithoutGameSessionInput = {
    where: SessionCheckpointWhereUniqueInput
    update: XOR<SessionCheckpointUpdateWithoutGameSessionInput, SessionCheckpointUncheckedUpdateWithoutGameSessionInput>
    create: XOR<SessionCheckpointCreateWithoutGameSessionInput, SessionCheckpointUncheckedCreateWithoutGameSessionInput>
  }

  export type SessionCheckpointUpdateWithWhereUniqueWithoutGameSessionInput = {
    where: SessionCheckpointWhereUniqueInput
    data: XOR<SessionCheckpointUpdateWithoutGameSessionInput, SessionCheckpointUncheckedUpdateWithoutGameSessionInput>
  }

  export type SessionCheckpointUpdateManyWithWhereWithoutGameSessionInput = {
    where: SessionCheckpointScalarWhereInput
    data: XOR<SessionCheckpointUpdateManyMutationInput, SessionCheckpointUncheckedUpdateManyWithoutGameSessionInput>
  }

  export type SessionCheckpointScalarWhereInput = {
    AND?: SessionCheckpointScalarWhereInput | SessionCheckpointScalarWhereInput[]
    OR?: SessionCheckpointScalarWhereInput[]
    NOT?: SessionCheckpointScalarWhereInput | SessionCheckpointScalarWhereInput[]
    id?: StringFilter<"SessionCheckpoint"> | string
    gameSessionId?: StringFilter<"SessionCheckpoint"> | string
    firstChapterId?: StringFilter<"SessionCheckpoint"> | string
    lastChapterId?: StringNullableFilter<"SessionCheckpoint"> | string | null
    startedAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
    pausedAt?: DateTimeNullableFilter<"SessionCheckpoint"> | Date | string | null
    sessionDurationSeconds?: IntNullableFilter<"SessionCheckpoint"> | number | null
    createdAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
    updatedAt?: DateTimeFilter<"SessionCheckpoint"> | Date | string
  }

  export type GameSessionCreateWithoutCheckpointsInput = {
    id?: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    progress: ProgressCreateNestedOneWithoutGameSessionInput
    challengeAttempts?: ChallengeAttemptCreateNestedManyWithoutSessionInput
  }

  export type GameSessionUncheckedCreateWithoutCheckpointsInput = {
    id?: string
    progressId: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    challengeAttempts?: ChallengeAttemptUncheckedCreateNestedManyWithoutSessionInput
  }

  export type GameSessionCreateOrConnectWithoutCheckpointsInput = {
    where: GameSessionWhereUniqueInput
    create: XOR<GameSessionCreateWithoutCheckpointsInput, GameSessionUncheckedCreateWithoutCheckpointsInput>
  }

  export type GameSessionUpsertWithoutCheckpointsInput = {
    update: XOR<GameSessionUpdateWithoutCheckpointsInput, GameSessionUncheckedUpdateWithoutCheckpointsInput>
    create: XOR<GameSessionCreateWithoutCheckpointsInput, GameSessionUncheckedCreateWithoutCheckpointsInput>
    where?: GameSessionWhereInput
  }

  export type GameSessionUpdateToOneWithWhereWithoutCheckpointsInput = {
    where?: GameSessionWhereInput
    data: XOR<GameSessionUpdateWithoutCheckpointsInput, GameSessionUncheckedUpdateWithoutCheckpointsInput>
  }

  export type GameSessionUpdateWithoutCheckpointsInput = {
    id?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: ProgressUpdateOneRequiredWithoutGameSessionNestedInput
    challengeAttempts?: ChallengeAttemptUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionUncheckedUpdateWithoutCheckpointsInput = {
    id?: StringFieldUpdateOperationsInput | string
    progressId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    challengeAttempts?: ChallengeAttemptUncheckedUpdateManyWithoutSessionNestedInput
  }

  export type GameSessionCreateWithoutChallengeAttemptsInput = {
    id?: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    progress: ProgressCreateNestedOneWithoutGameSessionInput
    checkpoints?: SessionCheckpointCreateNestedManyWithoutGameSessionInput
  }

  export type GameSessionUncheckedCreateWithoutChallengeAttemptsInput = {
    id?: string
    progressId: string
    storyId: string
    chapterId?: string | null
    startedAt?: Date | string
    checkpointAt?: Date | string | null
    endedAt?: Date | string | null
    totalTimeSpent?: number
    sessionCount?: number
    totalIdleTime?: number
    starsEarned?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    checkpoints?: SessionCheckpointUncheckedCreateNestedManyWithoutGameSessionInput
  }

  export type GameSessionCreateOrConnectWithoutChallengeAttemptsInput = {
    where: GameSessionWhereUniqueInput
    create: XOR<GameSessionCreateWithoutChallengeAttemptsInput, GameSessionUncheckedCreateWithoutChallengeAttemptsInput>
  }

  export type AttemptActionCreateWithoutAttemptInput = {
    id?: string
    selectedAnswerId?: string | null
    selectedAnswerText?: string | null
    answerText?: string | null
    isCorrect?: boolean | null
    attemptNumberAtAction: number
    createdAt?: Date | string
  }

  export type AttemptActionUncheckedCreateWithoutAttemptInput = {
    id?: string
    selectedAnswerId?: string | null
    selectedAnswerText?: string | null
    answerText?: string | null
    isCorrect?: boolean | null
    attemptNumberAtAction: number
    createdAt?: Date | string
  }

  export type AttemptActionCreateOrConnectWithoutAttemptInput = {
    where: AttemptActionWhereUniqueInput
    create: XOR<AttemptActionCreateWithoutAttemptInput, AttemptActionUncheckedCreateWithoutAttemptInput>
  }

  export type AttemptActionCreateManyAttemptInputEnvelope = {
    data: AttemptActionCreateManyAttemptInput | AttemptActionCreateManyAttemptInput[]
    skipDuplicates?: boolean
  }

  export type StarEventCreateWithoutAttemptInput = {
    id?: string
    challengeId: string
    baseStars?: number
    noHintBonus?: number
    firstTryBonus?: number
    totalStars: number
    attemptNumber: number
    usedHints?: boolean
    wasCorrect?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StarEventUncheckedCreateWithoutAttemptInput = {
    id?: string
    challengeId: string
    baseStars?: number
    noHintBonus?: number
    firstTryBonus?: number
    totalStars: number
    attemptNumber: number
    usedHints?: boolean
    wasCorrect?: boolean | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StarEventCreateOrConnectWithoutAttemptInput = {
    where: StarEventWhereUniqueInput
    create: XOR<StarEventCreateWithoutAttemptInput, StarEventUncheckedCreateWithoutAttemptInput>
  }

  export type GameSessionUpsertWithoutChallengeAttemptsInput = {
    update: XOR<GameSessionUpdateWithoutChallengeAttemptsInput, GameSessionUncheckedUpdateWithoutChallengeAttemptsInput>
    create: XOR<GameSessionCreateWithoutChallengeAttemptsInput, GameSessionUncheckedCreateWithoutChallengeAttemptsInput>
    where?: GameSessionWhereInput
  }

  export type GameSessionUpdateToOneWithWhereWithoutChallengeAttemptsInput = {
    where?: GameSessionWhereInput
    data: XOR<GameSessionUpdateWithoutChallengeAttemptsInput, GameSessionUncheckedUpdateWithoutChallengeAttemptsInput>
  }

  export type GameSessionUpdateWithoutChallengeAttemptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: ProgressUpdateOneRequiredWithoutGameSessionNestedInput
    checkpoints?: SessionCheckpointUpdateManyWithoutGameSessionNestedInput
  }

  export type GameSessionUncheckedUpdateWithoutChallengeAttemptsInput = {
    id?: StringFieldUpdateOperationsInput | string
    progressId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    chapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpointAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    endedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    sessionCount?: IntFieldUpdateOperationsInput | number
    totalIdleTime?: IntFieldUpdateOperationsInput | number
    starsEarned?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    checkpoints?: SessionCheckpointUncheckedUpdateManyWithoutGameSessionNestedInput
  }

  export type AttemptActionUpsertWithWhereUniqueWithoutAttemptInput = {
    where: AttemptActionWhereUniqueInput
    update: XOR<AttemptActionUpdateWithoutAttemptInput, AttemptActionUncheckedUpdateWithoutAttemptInput>
    create: XOR<AttemptActionCreateWithoutAttemptInput, AttemptActionUncheckedCreateWithoutAttemptInput>
  }

  export type AttemptActionUpdateWithWhereUniqueWithoutAttemptInput = {
    where: AttemptActionWhereUniqueInput
    data: XOR<AttemptActionUpdateWithoutAttemptInput, AttemptActionUncheckedUpdateWithoutAttemptInput>
  }

  export type AttemptActionUpdateManyWithWhereWithoutAttemptInput = {
    where: AttemptActionScalarWhereInput
    data: XOR<AttemptActionUpdateManyMutationInput, AttemptActionUncheckedUpdateManyWithoutAttemptInput>
  }

  export type AttemptActionScalarWhereInput = {
    AND?: AttemptActionScalarWhereInput | AttemptActionScalarWhereInput[]
    OR?: AttemptActionScalarWhereInput[]
    NOT?: AttemptActionScalarWhereInput | AttemptActionScalarWhereInput[]
    id?: StringFilter<"AttemptAction"> | string
    attemptId?: StringFilter<"AttemptAction"> | string
    selectedAnswerId?: StringNullableFilter<"AttemptAction"> | string | null
    selectedAnswerText?: StringNullableFilter<"AttemptAction"> | string | null
    answerText?: StringNullableFilter<"AttemptAction"> | string | null
    isCorrect?: BoolNullableFilter<"AttemptAction"> | boolean | null
    attemptNumberAtAction?: IntFilter<"AttemptAction"> | number
    createdAt?: DateTimeFilter<"AttemptAction"> | Date | string
  }

  export type StarEventUpsertWithoutAttemptInput = {
    update: XOR<StarEventUpdateWithoutAttemptInput, StarEventUncheckedUpdateWithoutAttemptInput>
    create: XOR<StarEventCreateWithoutAttemptInput, StarEventUncheckedCreateWithoutAttemptInput>
    where?: StarEventWhereInput
  }

  export type StarEventUpdateToOneWithWhereWithoutAttemptInput = {
    where?: StarEventWhereInput
    data: XOR<StarEventUpdateWithoutAttemptInput, StarEventUncheckedUpdateWithoutAttemptInput>
  }

  export type StarEventUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    baseStars?: IntFieldUpdateOperationsInput | number
    noHintBonus?: IntFieldUpdateOperationsInput | number
    firstTryBonus?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: BoolFieldUpdateOperationsInput | boolean
    wasCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StarEventUncheckedUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    baseStars?: IntFieldUpdateOperationsInput | number
    noHintBonus?: IntFieldUpdateOperationsInput | number
    firstTryBonus?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: BoolFieldUpdateOperationsInput | boolean
    wasCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChallengeAttemptCreateWithoutActionsInput = {
    id?: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    session: GameSessionCreateNestedOneWithoutChallengeAttemptsInput
    starEvent?: StarEventCreateNestedOneWithoutAttemptInput
  }

  export type ChallengeAttemptUncheckedCreateWithoutActionsInput = {
    id?: string
    sessionId: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    starEvent?: StarEventUncheckedCreateNestedOneWithoutAttemptInput
  }

  export type ChallengeAttemptCreateOrConnectWithoutActionsInput = {
    where: ChallengeAttemptWhereUniqueInput
    create: XOR<ChallengeAttemptCreateWithoutActionsInput, ChallengeAttemptUncheckedCreateWithoutActionsInput>
  }

  export type ChallengeAttemptUpsertWithoutActionsInput = {
    update: XOR<ChallengeAttemptUpdateWithoutActionsInput, ChallengeAttemptUncheckedUpdateWithoutActionsInput>
    create: XOR<ChallengeAttemptCreateWithoutActionsInput, ChallengeAttemptUncheckedCreateWithoutActionsInput>
    where?: ChallengeAttemptWhereInput
  }

  export type ChallengeAttemptUpdateToOneWithWhereWithoutActionsInput = {
    where?: ChallengeAttemptWhereInput
    data: XOR<ChallengeAttemptUpdateWithoutActionsInput, ChallengeAttemptUncheckedUpdateWithoutActionsInput>
  }

  export type ChallengeAttemptUpdateWithoutActionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: GameSessionUpdateOneRequiredWithoutChallengeAttemptsNestedInput
    starEvent?: StarEventUpdateOneWithoutAttemptNestedInput
  }

  export type ChallengeAttemptUncheckedUpdateWithoutActionsInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    starEvent?: StarEventUncheckedUpdateOneWithoutAttemptNestedInput
  }

  export type ChallengeAttemptCreateWithoutStarEventInput = {
    id?: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    session: GameSessionCreateNestedOneWithoutChallengeAttemptsInput
    actions?: AttemptActionCreateNestedManyWithoutAttemptInput
  }

  export type ChallengeAttemptUncheckedCreateWithoutStarEventInput = {
    id?: string
    sessionId: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    actions?: AttemptActionUncheckedCreateNestedManyWithoutAttemptInput
  }

  export type ChallengeAttemptCreateOrConnectWithoutStarEventInput = {
    where: ChallengeAttemptWhereUniqueInput
    create: XOR<ChallengeAttemptCreateWithoutStarEventInput, ChallengeAttemptUncheckedCreateWithoutStarEventInput>
  }

  export type ChallengeAttemptUpsertWithoutStarEventInput = {
    update: XOR<ChallengeAttemptUpdateWithoutStarEventInput, ChallengeAttemptUncheckedUpdateWithoutStarEventInput>
    create: XOR<ChallengeAttemptCreateWithoutStarEventInput, ChallengeAttemptUncheckedCreateWithoutStarEventInput>
    where?: ChallengeAttemptWhereInput
  }

  export type ChallengeAttemptUpdateToOneWithWhereWithoutStarEventInput = {
    where?: ChallengeAttemptWhereInput
    data: XOR<ChallengeAttemptUpdateWithoutStarEventInput, ChallengeAttemptUncheckedUpdateWithoutStarEventInput>
  }

  export type ChallengeAttemptUpdateWithoutStarEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    session?: GameSessionUpdateOneRequiredWithoutChallengeAttemptsNestedInput
    actions?: AttemptActionUpdateManyWithoutAttemptNestedInput
  }

  export type ChallengeAttemptUncheckedUpdateWithoutStarEventInput = {
    id?: StringFieldUpdateOperationsInput | string
    sessionId?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actions?: AttemptActionUncheckedUpdateManyWithoutAttemptNestedInput
  }

  export type ChildProfileCreateWithoutBadgesInput = {
    id?: string
    name: string
    parentId: string
    childId: string
    ageGroupId: string
    ageGroupName?: string | null
    favoriteThemes?: ChildProfileCreatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileCreateallocatedRoadmapsInput | string[]
    currentLevel?: number
    totalStars?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    progress?: ProgressCreateNestedManyWithoutChildProfileInput
  }

  export type ChildProfileUncheckedCreateWithoutBadgesInput = {
    id?: string
    name: string
    parentId: string
    childId: string
    ageGroupId: string
    ageGroupName?: string | null
    favoriteThemes?: ChildProfileCreatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileCreateallocatedRoadmapsInput | string[]
    currentLevel?: number
    totalStars?: number
    createdAt?: Date | string
    updatedAt?: Date | string
    progress?: ProgressUncheckedCreateNestedManyWithoutChildProfileInput
  }

  export type ChildProfileCreateOrConnectWithoutBadgesInput = {
    where: ChildProfileWhereUniqueInput
    create: XOR<ChildProfileCreateWithoutBadgesInput, ChildProfileUncheckedCreateWithoutBadgesInput>
  }

  export type ChildProfileUpsertWithoutBadgesInput = {
    update: XOR<ChildProfileUpdateWithoutBadgesInput, ChildProfileUncheckedUpdateWithoutBadgesInput>
    create: XOR<ChildProfileCreateWithoutBadgesInput, ChildProfileUncheckedCreateWithoutBadgesInput>
    where?: ChildProfileWhereInput
  }

  export type ChildProfileUpdateToOneWithWhereWithoutBadgesInput = {
    where?: ChildProfileWhereInput
    data: XOR<ChildProfileUpdateWithoutBadgesInput, ChildProfileUncheckedUpdateWithoutBadgesInput>
  }

  export type ChildProfileUpdateWithoutBadgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: StringFieldUpdateOperationsInput | string
    childId?: StringFieldUpdateOperationsInput | string
    ageGroupId?: StringFieldUpdateOperationsInput | string
    ageGroupName?: NullableStringFieldUpdateOperationsInput | string | null
    favoriteThemes?: ChildProfileUpdatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileUpdateallocatedRoadmapsInput | string[]
    currentLevel?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: ProgressUpdateManyWithoutChildProfileNestedInput
  }

  export type ChildProfileUncheckedUpdateWithoutBadgesInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    parentId?: StringFieldUpdateOperationsInput | string
    childId?: StringFieldUpdateOperationsInput | string
    ageGroupId?: StringFieldUpdateOperationsInput | string
    ageGroupName?: NullableStringFieldUpdateOperationsInput | string | null
    favoriteThemes?: ChildProfileUpdatefavoriteThemesInput | string[]
    allocatedRoadmaps?: ChildProfileUpdateallocatedRoadmapsInput | string[]
    currentLevel?: IntFieldUpdateOperationsInput | number
    totalStars?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    progress?: ProgressUncheckedUpdateManyWithoutChildProfileNestedInput
  }

  export type ProgressCreateManyChildProfileInput = {
    id?: string
    roadmapId: string
    worldId: string
    storyId: string
    status?: $Enums.ProgressStatus
    totalTimeSpent?: number
    completedAt?: Date | string | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChildBadgeCreateManyChildProfileInput = {
    id?: string
    badgeId: string
    earnedAt?: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ProgressUpdateWithoutChildProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gameSession?: GameSessionUpdateOneWithoutProgressNestedInput
  }

  export type ProgressUncheckedUpdateWithoutChildProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    gameSession?: GameSessionUncheckedUpdateOneWithoutProgressNestedInput
  }

  export type ProgressUncheckedUpdateManyWithoutChildProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    roadmapId?: StringFieldUpdateOperationsInput | string
    worldId?: StringFieldUpdateOperationsInput | string
    storyId?: StringFieldUpdateOperationsInput | string
    status?: EnumProgressStatusFieldUpdateOperationsInput | $Enums.ProgressStatus
    totalTimeSpent?: IntFieldUpdateOperationsInput | number
    completedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChildBadgeUpdateWithoutChildProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    badgeId?: StringFieldUpdateOperationsInput | string
    earnedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChildBadgeUncheckedUpdateWithoutChildProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    badgeId?: StringFieldUpdateOperationsInput | string
    earnedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChildBadgeUncheckedUpdateManyWithoutChildProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    badgeId?: StringFieldUpdateOperationsInput | string
    earnedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type ChallengeAttemptCreateManySessionInput = {
    id?: string
    challengeId: string
    answerId?: string | null
    textAnswer?: string | null
    isCorrect?: boolean | null
    status?: $Enums.ChallengeStatus
    attemptNumber: number
    usedHints: number
    timeSpentSeconds?: number
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SessionCheckpointCreateManyGameSessionInput = {
    id?: string
    firstChapterId: string
    lastChapterId?: string | null
    startedAt?: Date | string
    pausedAt?: Date | string | null
    sessionDurationSeconds?: number | null
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type ChallengeAttemptUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actions?: AttemptActionUpdateManyWithoutAttemptNestedInput
    starEvent?: StarEventUpdateOneWithoutAttemptNestedInput
  }

  export type ChallengeAttemptUncheckedUpdateWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    actions?: AttemptActionUncheckedUpdateManyWithoutAttemptNestedInput
    starEvent?: StarEventUncheckedUpdateOneWithoutAttemptNestedInput
  }

  export type ChallengeAttemptUncheckedUpdateManyWithoutSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    challengeId?: StringFieldUpdateOperationsInput | string
    answerId?: NullableStringFieldUpdateOperationsInput | string | null
    textAnswer?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    status?: EnumChallengeStatusFieldUpdateOperationsInput | $Enums.ChallengeStatus
    attemptNumber?: IntFieldUpdateOperationsInput | number
    usedHints?: IntFieldUpdateOperationsInput | number
    timeSpentSeconds?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCheckpointUpdateWithoutGameSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstChapterId?: StringFieldUpdateOperationsInput | string
    lastChapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessionDurationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCheckpointUncheckedUpdateWithoutGameSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstChapterId?: StringFieldUpdateOperationsInput | string
    lastChapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessionDurationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SessionCheckpointUncheckedUpdateManyWithoutGameSessionInput = {
    id?: StringFieldUpdateOperationsInput | string
    firstChapterId?: StringFieldUpdateOperationsInput | string
    lastChapterId?: NullableStringFieldUpdateOperationsInput | string | null
    startedAt?: DateTimeFieldUpdateOperationsInput | Date | string
    pausedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    sessionDurationSeconds?: NullableIntFieldUpdateOperationsInput | number | null
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptActionCreateManyAttemptInput = {
    id?: string
    selectedAnswerId?: string | null
    selectedAnswerText?: string | null
    answerText?: string | null
    isCorrect?: boolean | null
    attemptNumberAtAction: number
    createdAt?: Date | string
  }

  export type AttemptActionUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedAnswerId?: NullableStringFieldUpdateOperationsInput | string | null
    selectedAnswerText?: NullableStringFieldUpdateOperationsInput | string | null
    answerText?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    attemptNumberAtAction?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptActionUncheckedUpdateWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedAnswerId?: NullableStringFieldUpdateOperationsInput | string | null
    selectedAnswerText?: NullableStringFieldUpdateOperationsInput | string | null
    answerText?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    attemptNumberAtAction?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type AttemptActionUncheckedUpdateManyWithoutAttemptInput = {
    id?: StringFieldUpdateOperationsInput | string
    selectedAnswerId?: NullableStringFieldUpdateOperationsInput | string | null
    selectedAnswerText?: NullableStringFieldUpdateOperationsInput | string | null
    answerText?: NullableStringFieldUpdateOperationsInput | string | null
    isCorrect?: NullableBoolFieldUpdateOperationsInput | boolean | null
    attemptNumberAtAction?: IntFieldUpdateOperationsInput | number
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }



  /**
   * Aliases for legacy arg types
   */
    /**
     * @deprecated Use ChildProfileCountOutputTypeDefaultArgs instead
     */
    export type ChildProfileCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChildProfileCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameSessionCountOutputTypeDefaultArgs instead
     */
    export type GameSessionCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameSessionCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChallengeAttemptCountOutputTypeDefaultArgs instead
     */
    export type ChallengeAttemptCountOutputTypeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChallengeAttemptCountOutputTypeDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChildProfileDefaultArgs instead
     */
    export type ChildProfileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChildProfileDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ProgressDefaultArgs instead
     */
    export type ProgressArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ProgressDefaultArgs<ExtArgs>
    /**
     * @deprecated Use GameSessionDefaultArgs instead
     */
    export type GameSessionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = GameSessionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use SessionCheckpointDefaultArgs instead
     */
    export type SessionCheckpointArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = SessionCheckpointDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChallengeAttemptDefaultArgs instead
     */
    export type ChallengeAttemptArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChallengeAttemptDefaultArgs<ExtArgs>
    /**
     * @deprecated Use AttemptActionDefaultArgs instead
     */
    export type AttemptActionArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = AttemptActionDefaultArgs<ExtArgs>
    /**
     * @deprecated Use StarEventDefaultArgs instead
     */
    export type StarEventArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = StarEventDefaultArgs<ExtArgs>
    /**
     * @deprecated Use ChildBadgeDefaultArgs instead
     */
    export type ChildBadgeArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = ChildBadgeDefaultArgs<ExtArgs>

  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}