import {obj} from "./obj";
import {any_fn} from "./any_fn";
import {rtti, unsound} from "./type_traits";
import {FoundatsionError} from "./err";

export type array<r extends rtti.some> =
   & rtti.has_name
   & (r extends rtti.has_is<infer t> ? rtti.has_is<t[]> : {})
   & (r extends rtti.has_assert<infer t> ? rtti.has_assert<t[]> : {});

export function array<r extends rtti.some>(r: r): array<r> {
   const name = {name: `${r.name} array`};

   let is = {};
   if (obj.field_is(r, "is", any_fn)) {
      is = {
         is(u: unknown): boolean {
            return true
               && Array.isArray(u)
               && u.every(elem => r.is(elem));
         }
      }
   }

   let assert = {};
   if (obj.field_is(r, "assert", any_fn)) {
      assert = {
         assert(u: unknown): void {
            if (Array.isArray(u)) {
               throw new FoundatsionError(
                  "Tried asserting that value was array but failed since",
                  "Array.isArray returned false.",
               );
            }
            unsound.is_now<unknown[]>(u);

            for (let i = 0; i < u.length; i++) {
               try {
                  const elem = u[i];
                  unsound.fuck_off(r.assert)(elem);
               } catch (e) {
                  if (e instanceof Error) {
                     throw new FoundatsionError(
                        "While asserting that array was homogeneous with type",
                        `${r.name}, an Error was thrown at index ${i}!`,
                        e,
                     );
                  } else {
                     throw e;
                  }
               }
            }
         }
      }
   }

   return unsound.shut_up({...name, ...is, ...assert});
}
