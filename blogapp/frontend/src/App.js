import { useState, useEffect, useRef } from "react"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom"

import Blog from "./components/Blog"
import LoginForm from "./components/LoginForm"
import NewBlogForm from "./components/NewBlogForm"
import Notification from "./components/Notification"
import Togglable from "./components/Togglable"
import UsersList from "./components/UsersList"

import blogService from "./services/blogs"
import loginService from "./services/login"
import userService from "./services/user"

import { useDispatch, useSelector } from "react-redux"
import {
  createNotification,
  clearNotification,
} from "./reducers/notificationReducer"
import { setUser, initializeUser, clearUser } from "./reducers/userReducer"
import { initializeUsers } from "./reducers/usersReducer"
import blogReducer, {
  initializeBlogs,
  setBlogs,
  createBlog,
  changeBlog,
  deleteBlog,
} from "./reducers/blogReducer"

const App = () => {
  const blogFormRef = useRef()

  const blogs = useSelector((state) => state.blogs)
  const user = useSelector((state) => state.user)

  const byLikes = (b1, b2) => (b2.likes > b1.likes ? 1 : -1)

  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeBlogs())
    dispatch(initializeUser())
    dispatch(initializeUsers())
  }, [dispatch])

  const login = async (username, password) => {
    loginService
      .login({
        username,
        password,
      })
      .then((user) => {
        dispatch(setUser(user))
        notify(`${user.name} logged in!`)
      })
      .catch(() => {
        notify("wrong username/password", "alert")
      })
  }

  const logout = () => {
    dispatch(clearUser())
    notify("good bye!")
  }

  const addBlog = async (blog) => {
    blogFormRef.current.toggleVisibility()
    dispatch(createBlog(blog))
      .then((newBlog) => {
        notify(`a new blog '${newBlog.title}' by ${newBlog.author} added`)
      })
      .catch((error) => {
        notify("creating a blog failed: " + error.response.data.error, "alert")
      })
  }

  const removeBlog = (id) => {
    const toRemove = blogs.find((b) => b.id === id)

    const ok = window.confirm(
      `remove '${toRemove.title}' by ${toRemove.author}?`
    )

    if (!ok) {
      return
    }
    dispatch(deleteBlog(id))
  }

  const likeBlog = async (id) => {
    const currentLikes = blogs.find((b) => b.id === id).likes
    dispatch(changeBlog(id, { likes: currentLikes + 1 })).then(
      (changedBlog) => {
        notify(`you liked '${changedBlog.title}' by ${changedBlog.author}`)
      }
    )
  }

  const notify = (message, type = "info") => {
    dispatch(
      createNotification({
        message,
        type,
      })
    )
    setTimeout(() => {
      dispatch(clearNotification())
    }, 5000)
  }

  const BlogsList = () => {
    return (
      <div id="blogs">
        <Togglable buttonLabel="create new" ref={blogFormRef}>
          <NewBlogForm onCreate={addBlog} />
        </Togglable>
        {blogs.map((blog) => (
          <Blog
            key={blog.id}
            blog={blog}
            likeBlog={likeBlog}
            removeBlog={removeBlog}
            user={user}
          />
        ))}
      </div>
    )
  }

  if (user === null) {
    return (
      <>
        <Notification />
        <LoginForm onLogin={login} />
      </>
    )
  }

  return (
    <div>
      <h2>blogs</h2>

      <Notification />

      <div>
        <p>{user.name} logged in</p>
        <button onClick={logout}>logout</button>
      </div>

      {/* <UsersList /> */}
      <Router>
        {/* <div>
        <Link style={padding} to="/users">users</Link>
      </div> */}

        <Routes>
          <Route path="/" element={<BlogsList />} />
          <Route path="/users" element={<UsersList />} />
          {/* <Route path="/" element={<Home />} /> */}
        </Routes>
      </Router>
    </div>
  )
}

export default App
