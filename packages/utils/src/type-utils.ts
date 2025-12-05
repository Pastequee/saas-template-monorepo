export type TypedExclude<T, U extends T> = T extends U ? never : T

export type Prettify<T> = {
	[K in keyof T]: T[K]
} & {}

export type DistributiveOmit<T, K extends keyof T> = T extends unknown ? Omit<T, K> : never

export type DistributivePick<T, K extends keyof T> = T extends unknown ? Pick<T, K> : never
