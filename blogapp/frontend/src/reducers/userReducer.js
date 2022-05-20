import { createSlice } from "@reduxjs/toolkit"
import userService from "../services/user"

const userSlice = createSlice({
  name: "user",
  initialState: null,
  reducers: {
    setUserState(state, action) {
      return action.payload
    },
  },
})

const { setUserState } = userSlice.actions

export const initializeUser = () => {
  return async (dispatch) => {
    const userFromStorage = userService.getUser()
    if (userFromStorage) {
      dispatch(setUser(userFromStorage))
    }
    return userFromStorage
  }
}

export const setUser = (user) => {
  return async (dispatch) => {
    userService.setUser(user)
    dispatch(setUserState(user))
  }
}

export const clearUser = () => {
  return async (dispatch) => {
    userService.clearUser()
    dispatch(setUserState(null))
  }
}

export default userSlice.reducer
