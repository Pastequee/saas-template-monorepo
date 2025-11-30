export const typedObjectKeys = <T extends object>(obj: T): (keyof T)[] =>
	Object.keys(obj) as (keyof T)[]

export const typedObjectValues = <T extends object>(obj: T): T[keyof T][] =>
	Object.values(obj) as T[keyof T][]

export const typedObjectEntries = <T extends object>(obj: T): [keyof T, T[keyof T]][] =>
	Object.entries(obj) as [keyof T, T[keyof T]][]
