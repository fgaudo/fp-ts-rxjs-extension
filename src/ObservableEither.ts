import * as O from 'fp-ts-rxjs/lib/Observable'
import * as OE from 'fp-ts-rxjs/lib/ObservableEither'
import { Apply2 } from 'fp-ts/lib/Apply'
import * as E from 'fp-ts/lib/Either'
import { flow, pipe } from 'fp-ts/lib/function'
import * as Rx from 'rxjs'
import * as RxO from 'rxjs/operators'

//////////////

type SwitchMapW = <ERR1, IN, OUT>(
	f: (in_: IN, index: number) => OE.ObservableEither<ERR1, OUT>
) => <ERR2>(
	oe: OE.ObservableEither<ERR2, IN>
) => OE.ObservableEither<ERR1 | ERR2, OUT>

export const switchMapW: SwitchMapW =
	<ERR2, IN, OUT>(
		f: (in_: IN, index: number) => OE.ObservableEither<ERR2, OUT>
	): (<ERR1>(
		oe: OE.ObservableEither<ERR1, IN>
	) => OE.ObservableEither<ERR1 | ERR2, OUT>) =>
	oe =>
		pipe(
			oe,
			OE.chainW<IN, ERR2, OUT>(
				in_ =>
					pipe(O.of(in_), RxO.switchMap(f)) as OE.ObservableEither<ERR2, OUT>
			)
		)

//////////////

type SwitchMap = <ERR, IN, OUT>(
	f: (in_: IN, index: number) => OE.ObservableEither<ERR, OUT>
) => (oe: OE.ObservableEither<ERR, IN>) => OE.ObservableEither<ERR, OUT>

export const switchMap: SwitchMap = switchMapW

//////////////

type Ap = <E, A>(
	fa: OE.ObservableEither<E, A>
) => <B>(fab: OE.ObservableEither<E, (a: A) => B>) => OE.ObservableEither<E, B>

export const ap: Ap = <E, A>(
	fa: OE.ObservableEither<E, A>
): (<B>(
	fab: OE.ObservableEither<E, (a: A) => B>
) => OE.ObservableEither<E, B>) =>
	flow(
		OE.fold(Rx.throwError, OE.right),
		O.map(gab => (ga: E.Either<E, A>) => E.ap(ga)(gab)),
		O.ap(pipe(fa, OE.fold(Rx.throwError, OE.right))),
		RxO.catchError(OE.left)
	)

//////////////

export const Apply: Apply2<OE.URI> = {
	URI: OE.URI,
	ap: (fab, fa) => ap(fa)(fab),
	map: (fa, f) => pipe(fa, OE.map(f))
}
