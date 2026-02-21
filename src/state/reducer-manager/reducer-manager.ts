import { combineReducers, type AnyAction, type Reducer, type ReducersMapObject } from "@reduxjs/toolkit"
import type { ReducerManager } from "./reducer-manager.types"

export function createReducerManager(initialReducers: ReducersMapObject<any, AnyAction>): ReducerManager {
  let reducers = { ...initialReducers }
  let combinedReducer = combineReducers(reducers)
  let keysToRemove: string[] = []

  return {
    getReducerMap: () => reducers,
    reduce: (state: any, action: AnyAction) => {
      if (keysToRemove.length > 0 && state) {
        const nextState = { ...state } as Record<string, unknown>
        for (const key of keysToRemove) {
          delete nextState[key]
        }
        keysToRemove = []
        return combinedReducer(nextState as any, action)
      }

      return combinedReducer(state, action)
    },
    add: (key: string, reducer: Reducer) => {
      if (!key || reducers[key]) {
        return
      }

      reducers = { ...reducers, [key]: reducer }
      combinedReducer = combineReducers(reducers)
    },
    remove: (key: string) => {
      if (!key || !reducers[key]) {
        return
      }

      const clonedReducers = { ...reducers }
      delete clonedReducers[key]
      reducers = clonedReducers
      keysToRemove.push(key)
      combinedReducer = combineReducers(reducers)
    },
  }
}
