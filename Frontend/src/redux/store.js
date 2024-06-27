import {configureStore} from "@reduxjs/toolkit"
import {rootReducer} from "./reducer"

const store = configureStore({
    reducer: rootReducer
})
//we have to store the list of reducers

const {dispatch} = store

export {store , dispatch}