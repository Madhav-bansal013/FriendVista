import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    theme: JSON.parse(window?.localStorage.getItem("theme")) ?? "dark",
  };


const themeSlice = createSlice({
    name: "theme" ,
    initialState,
    reducers: {
        setTheme(state , action){
            state.theme = action.payload;
            localStorage.setItem("theme" , JSON.stringify(action.payload))
        }
    }
})

export default themeSlice.reducer

export function SetTheme(value){
    return(dispatch) =>{
        dispatch(themeSlice.actions.setTheme(value))
    }
}

// Benefits of Thunks:
// Async Operations: Thunks allow you to perform asynchronous operations (like API calls) before dispatching actions.
// Side Effects: Thunks can encapsulate side effects (like local storage updates) along with state updates.
// The ?. operator (optional chaining) ensures that the code doesn't throw an error if window or window.localStorage is null or undefined.