import Promise from './ExtensiblePromise';
import { Thenable } from 'dojo-shim/interfaces';

/**
 * Used for delaying a Promise chain for a specific number of milliseconds.
 *
 * @param milliseconds the number of milliseconds to delay
 * @return {function (value: T | (() => T | Thenable<T>)): Promise<T>} a function producing a promise that eventually returns the value or executes the value function passed to it; usable with Thenable.then()
 */
export function delay<T>(milliseconds: number): Identity<T> {
	return function (value?: T | (() => T | Thenable<T>)): Promise<T> {
		return new Promise(function (resolve) {
			setTimeout(function () {
				resolve(typeof value === 'function' ? value() : value);
			}, milliseconds);
		});
	};
}

export interface Identity<T> {
	(value?: T | (() => T | Thenable<T>)): Promise<T>;
}

/**
 * Reject a promise chain if a result hasn't been found before the timeout
 *
 * @param milliseconds after this number of milliseconds a rejection will be returned
 * @param reason The reason for the rejection
 * @return {function(T): Promise<T>} a function that produces a promise that is rejected or resolved based on your timeout
 */
export function timeout<T>(milliseconds: number, reason: Error): Identity<T> {
	const start = Date.now();
	return function (value: T): Promise<T> {
		if (Date.now() - milliseconds > start) {
			return Promise.reject<T>(reason);
		}
		return Promise.resolve<T>(value);
	};
}

/**
 * A Promise that will reject itself automatically after a time.
 * Useful for combining with other promises in Promise.race.
 */
export class DelayedRejection extends Promise<any> {
	/**
	 * @param milliseconds the number of milliseconds to wait before triggering a rejection
	 * @param reason the reason for the rejection
	 */
	constructor(milliseconds: number, reason?: Error) {
		super(() => {
		});

		return new Promise(function (resolve, reject) {
			setTimeout(() => {
				reject(reason);
			}, milliseconds);
		});
	}
};
