import { createSlice } from "@reduxjs/toolkit"

const initialState = null
const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    createNotification(state, action) {
      const { message, type } = action.payload
      return { message, type }
    },
    clearNotification(state, action) {
      return null
    },
  },
})

export const { createNotification, clearNotification } =
  notificationSlice.actions
export default notificationSlice.reducer
