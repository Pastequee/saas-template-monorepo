/**
 * Represents a successful operation result
 * @template T - The type of the successful result data
 */
type Success<T> = [T, null]

/**
 * Represents a failed operation result
 * @template E - The type of the error that occurred
 */
type Failure<E> = [null, E]

/**
 * Represents the result of an operation which can either be a success or a failure
 * @template T - The type of the successful result data
 * @template E - The type of the error that occurred
 */
type Result<T, E = Error> = Failure<E> | Success<T>

/**
 * Safely executes an async operation and returns a Result type
 *
 * This function wraps any async operation in a try-catch block and returns a Result type
 * that can be either a Success with the operation's data or a Failure with the error.
 *
 * @example
 * const { data, error } = await tryCatch(fetch('https://api.example.com'))
 * // data is of type T | undefined
 * if (error) {
 *   // Handle error and error is of type E
 * } else {
 *   // data is now of type T
 * }
 *
 * @template T - Type of the successful result data
 * @template E - Type of the error (defaults to Error)
 * @param promise - The async operation to execute, can be a Promise or a value
 * @returns Promise<Result<T, E>> - A Result object containing either data or error
 */
export async function tryCatch<T, E = Error>(promise: Promise<T>): Promise<Result<T, E>> {
	try {
		const data = await promise
		return [data, null]
	} catch (error) {
		return [null, error as E]
	}
}
