import { useState, useEffect, useRef } from "react"

import Blog from "./components/Blog"
import LoginForm from "./components/LoginForm"
import NewBlogForm from "./components/NewBlogForm"
import Notification from "./components/Notification"
import Togglable from "./components/Togglable"

import blogService from "./services/blogs"
import loginService from "./services/login"
import userService from "./services/user"

import { useDispatch } from "react-redux"
import {
  createNotification,
  clearNotification,
} from "./reducers/notificationReducer"
import blogReducer, {
  initializeBlogs,
  setBlogs,
  createBlog,
} from "./reducers/blogReducer"

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState(null)
  // const [notification, setNotification] = useState(null)
  const blogFormRef = useRef()

  const byLikes = (b1, b2) => (b2.likes > b1.likes ? 1 : -1)

  const dispatch = useDispatch()

  useEffect(() => {
    blogService.getAll().then((blogs) => setBlogs(blogs.sort(byLikes)))
  }, [])

  // useEffect(() => {
  //   dispatch(initializeBlogs())
  // }, [dispatch])

  useEffect(() => {
    const userFromStorage = userService.getUser()
    if (userFromStorage) {
      setUser(userFromStorage)
    }
  }, [])

  const login = async (username, password) => {
    loginService
      .login({
        username,
        password,
      })
      .then((user) => {
        setUser(user)
        userService.setUser(user)
        notify(`${user.name} logged in!`)
      })
      .catch(() => {
        notify("wrong username/password", "alert")
      })
  }

  const logout = () => {
    setUser(null)
    userService.clearUser()
    notify("good bye!")
  }

  const addBlog = async (blog) => {
    blogFormRef.current.toggleVisibility()
    dispatch(createBlog(blog))
      .then((newBlog) => {
        notify(`a new blog '${newBlog.title}' by ${newBlog.author} added`)
      })
      .catch((error) => {
        console.log("error", error)
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

    blogService.remove(id).then(() => {
      const updatedBlogs = blogs.filter((b) => b.id !== id).sort(byLikes)
      setBlogs(updatedBlogs)
    })
  }

  const likeBlog = async (id) => {
    const toLike = blogs.find((b) => b.id === id)
    const liked = {
      ...toLike,
      likes: (toLike.likes || 0) + 1,
      user: toLike.user.id,
    }

    blogService.update(liked.id, liked).then((updatedBlog) => {
      notify(`you liked '${updatedBlog.title}' by ${updatedBlog.author}`)
      const updatedBlogs = blogs
        .map((b) => (b.id === id ? updatedBlog : b))
        .sort(byLikes)
      setBlogs(updatedBlogs)
    })
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
        {user.name} logged in
        <button onClick={logout}>logout</button>
      </div>

      <Togglable buttonLabel="new note" ref={blogFormRef}>
        <NewBlogForm onCreate={addBlog} />
      </Togglable>

      <div id="blogs">
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
    </div>
  )
}

export default App
