import type { AnyAction, Reducer, ReducersMapObject } from "@reduxjs/toolkit"

export type ReducerManager = {
  getReducerMap: () => ReducersMapObject<any, AnyAction>
  reduce: Reducer<any, AnyAction>
  add: (key: string, reducer: Reducer) => void
  remove: (key: string) => void
}
