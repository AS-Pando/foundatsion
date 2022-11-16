import {FoundatsionError} from "./error";
import {oo} from "./oo";
import {string} from "./string";
import {unsound} from "./unsound";

export type rtti<t = unknown> = {
   name: string;
   is: rtti.is<t>;
   assert: rtti.assert<t>;
};

export namespace rtti {
   export type is<t = unknown> = {(u: unknown): u is t};
   export type assert<t = unknown> = {(u: unknown): asserts u is t};

   export type t<r extends rtti> = r extends rtti<infer t> ? t : never;

   export function is_from_assert<t>(a: assert<t>): is<t> {
      function is(u: unknown): boolean {
         try {
            a(u);
            return true;
         } catch (e) {
            if (e instanceof Error) {
               return false;
            } else {
               throw e;
            }
         }
      }
      return unsound.shut_up(is);
   }

   export namespace meta {
      export const name = "rtti";
      export function is(u: unknown): u is rtti {
         return true
            && oo.is(u)
            && oo.field_is(u, "name", string)
            && oo.field_is(u, "is", unsound.any_fn)
            && oo.field_is(u, "assert", unsound.any_fn);
      }
      export function assert(u: unknown): asserts u is rtti {
         if (!is(u)) {
            throw new FoundatsionError(
               "Value was not an rtti!",
            );
         }
      }
   }
}
