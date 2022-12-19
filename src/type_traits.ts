import {newtype} from "./newtype";

export function __unreachable(): never {
   throw __unreachable;
}
// pleas optimize uwu
export const ignore = (..._: any[]): void => {};
export const absurd = <t>(_: never): t => __unreachable();

const internal_t = class T<_> {};

// for explicit type parameters
export const T = internal_t as typeof internal_t & newtype<"T">;
export type T<t> = typeof T<t> & newtype<"T">;

/**
 * λx.x
 *
 * Also functions as upcast.
 */
export const id = <t>(t: t): t => t;
/**
 * Sometimes, setting a value to a type dependent on that value will create a
 * circular type dependency.
 *
 * Use launder to break the dependency.
 */
export const launder = <t = never>(v: t): t => v;

/** Check that a type is true. Useful with conditional types. */
export const ct_true: {<_ extends true>(): void} = ignore;

/** obscure type traits that most people won't be using */
export namespace tt {
   export type prim =
      | null
      | undefined
      | boolean
      | number
      | bigint
      | string
      | symbol;

   type _is_union<t1, t2> =
      t2 extends unknown
         ? t2 extends t1
            ? unknown // it's not a union
            : true
         : never;
   /** Returns `true` if t is a union */
   export type is_union<t> = _is_union<t, t>;

   /** Returns `true` on regular string and `false` on templated string */
   export type not_templated_string<s extends string> =
      s extends ""
         ? true
         : s extends `${infer head}${infer tail}`
            ? string extends head
               ? false
               : `${number}` extends head
                  ? false
                  : `${bigint}` extends head
                     ? false
                     : `${boolean}` extends head
                        ? false
                        : not_templated_string<tail>
            : false;

   /** Returns `true | false` */
   export type is_const_string<s extends string> =
      is_union<s> extends true
         ? false
         : not_templated_string<s>;

   declare const const_string: unique symbol;
   export type const_string = {[const_string]: void};

   // Internally, the typescript compiler has a flag called Unit.
   // That's basically what we're making here except on the typelevel.

   // Returns `true | false`
   export type is_const_prim<p extends prim> =
      is_union<p> extends true                                   // case: union
         ? false
      : p extends number                                         // case: number
         ? number extends p
            ? false
            : true
      : p extends bigint                                         // case: bigint
         ? bigint extends p
            ? false
            : true
      : p extends string                                         // case: string
         ? is_const_string<p>
      : p extends symbol                                         // case: symbol
         ? symbol extends p
            ? false
            : true
      : true;

   declare const const_prim: unique symbol;
   export type const_prim = {[const_prim]: void};

   export type require_const_prim<t extends prim> =
      is_const_prim<t> extends true ? t : const_prim;

   /**
    * If you're using this, you're probably doing something wrong.
    * Also sometimes it randomly doesn't work.
    */
   export type union_to_intersection<u> =
      (u extends any ? {(k: u): void} : never) extends {(k: infer t): void} ? t : never;

   export type is_sibling<a, b> =
      a extends b
         ? b extends a
            ? true
            : false
         : false;

   /**
    * @example
    * type a = {w: x} & {y: z};
    * type b = {w: x; y: z};
    *
    * // a has different behavior than b
    */
   export type merge<o extends {}> = {[k in keyof o]: o[k]};

   export type keyof_any<t> = t extends unknown ? keyof t : never;

   type assign_field_rec<o extends {}[], key extends keyof any> =
      o extends [infer head, ...infer tail extends {}[]]
         ? assign_field_rec<tail, key> extends never
            ? head extends {[k in key]: infer v}
               ? v
               : never
            : assign_field_rec<tail, key>
         : never;
   export type assign<o extends {}[]> =
      {[k in keyof_any<o[number]>]: assign_field_rec<o, k>};
}
