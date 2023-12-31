import * as RO from 'fp-ts-rxjs/lib/ReaderObservable'
import { pipe } from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import * as RxO from 'rxjs/operators'
import { UnionToIntersection } from 'simplytyped'

//////////////

type SwitchMapW = <ENV1, IN, OUT>(
	project: (a: IN, index: number) => RO.ReaderObservable<ENV1, OUT>
) => <ENV2>(
	p: RO.ReaderObservable<ENV2, IN>
) => RO.ReaderObservable<ENV1 & ENV2, OUT>

export const switchMapW: SwitchMapW = project => ro => env =>
	pipe(
		ro(env),
		RxO.switchMap((in_, index) => project(in_, index)(env))
	)

//////////////

type SwitchMap = <ENV, IN, OUT>(
	project: (a: IN, index: number) => RO.ReaderObservable<ENV, OUT>
) => (p: RO.ReaderObservable<ENV, IN>) => RO.ReaderObservable<ENV, OUT>

export const switchMap: SwitchMap = switchMapW

//////////////

type DistinctUntilChanged = <A>(
	f: (prev: A, next: A) => boolean
) => <ENV>(p: RO.ReaderObservable<ENV, A>) => RO.ReaderObservable<ENV, A>

export const distinctUntilChanged: DistinctUntilChanged = f => ro => env =>
	pipe(ro(env), RxO.distinctUntilChanged(f))

//////////////

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ConcatW = <T extends readonly RO.ReaderObservable<any, any>[]>(
	...ros: T
) => RO.ReaderObservable<
	UnionToIntersection<
		{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			[K in keyof T]: T[K] extends RO.ReaderObservable<infer A, any> ? A : never
		}[number]
	>,
	{
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[K in keyof T]: T[K] extends RO.ReaderObservable<any, infer A> ? A : never
	}[number]
>

export const concatW: ConcatW =
	(...ros) =>
	env =>
		Rx.concat(...ros.map(ro => ro(env)))

//////////////

type Concat = <ENV, A>(
	...ros: readonly RO.ReaderObservable<ENV, A>[]
) => RO.ReaderObservable<ENV, A>

export const concat: Concat = concatW as any
