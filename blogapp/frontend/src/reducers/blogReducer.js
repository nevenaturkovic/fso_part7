import blogService from "../services/blogs"
import { createSlice } from "@reduxjs/toolkit"

const byLikes = (b1, b2) => (b2.likes > b1.likes ? 1 : -1)

const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    increaseLikes(state, action) {
      const id = action.payload
      const blogToChange = state.find((n) => n.id === id)
      const changedBlog = {
        ...blogToChange,
        likes: blogToChange.likes + 1,
      }
      return state.map((blog) => (blog.id !== id ? blog : changedBlog))
    },
    appendBlog(state, action) {
      state.push(action.payload)
    },
    setBlogs(state, action) {
      return action.payload
    },
  },
})

export const { increaseLikes, appendBlog, setBlogs } = blogSlice.actions

export const initializeBlogs = () => {
  return async (dispatch) => {
    const blogs = await blogService.getAll()
    dispatch(setBlogs(blogs.sort(byLikes)))
  }
}

export const createBlog = (content) => {
  return async (dispatch) => {
    const newBlog = await blogService.create(content)
    dispatch(appendBlog(newBlog))
    return newBlog
  }
}

// const vote = (id) => {
//     dispatch(increaseVotes(id))
//     const anecdoteText = sortedAnecdotes.find(
//       (anecdote) => anecdote.id === id
//     ).content
//     dispatch(
//       createNotification({
//         message: `you voted '${anecdoteText}'`,
//         kind: "info",
//       })
//     )
//     setTimeout(() => {
//       dispatch(clearNotification())
//     }, 5000)
//   }

// export const likeBlog = (blog) => {
//   return async (dispatch) => {
//     const changedBlog = await blogService.update({
//       ...blogToChange,
//       likes: blogToChange.likes + 1,
//     })
//     dispa
//     dispatch(appendBlog(changedBlog))
//   }
// }

export default blogSlice.reducer
