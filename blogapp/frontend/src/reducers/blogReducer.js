import blogService from "../services/blogs"
import { createSlice } from "@reduxjs/toolkit"

const byLikes = (b1, b2) => (b2.likes > b1.likes ? 1 : -1)

const blogSlice = createSlice({
  name: "blogs",
  initialState: [],
  reducers: {
    swapBlog(state, action) {
      const newBlog = action.payload
      return state
        .map((blog) => (blog.id !== newBlog.id ? blog : newBlog))
        .sort(byLikes)
    },
    appendBlog(state, action) {
      state.push(action.payload)
    },
    setBlogs(state, action) {
      return action.payload
    },
    delBlog(state, action) {
      const id = action.payload
      return state.filter((blog) => blog.id !== id)
    },
  },
})

export const { swapBlog, appendBlog, setBlogs, delBlog } = blogSlice.actions

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

export const changeBlog = (id, newBlogContents) => {
  return async (dispatch) => {
    const changedBlog = await blogService.update(id, newBlogContents)
    dispatch(swapBlog(changedBlog))
    return changedBlog
  }
}

export const deleteBlog = (id) => {
  return async (dispatch) => {
    await blogService.remove(id)
    dispatch(delBlog(id))
  }
}

export const commentBlog = (blog, comment) => {
  return async (dispatch) => {
    const updatedBlog = await blogService.createComment(blog.id, comment)
    dispatch(swapBlog(updatedBlog))
  }
}

export default blogSlice.reducer
