import { combineReducers } from "@reduxjs/toolkit";
import userSlice from "./userSlice"
import postSlice from "./postSlice"
import themeSlice from "./theme"

const rootReducer = combineReducers({
    user: userSlice,
    posts: postSlice,
    theme: themeSlice
})
//combine reducers to provide to store

export {rootReducer};