import { useState, useEffect, useRef } from "react"
import { Routes, Route, Link, useMatch, useNavigate } from "react-router-dom"
import { Navbar, Nav } from "react-bootstrap"

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
  commentBlog,
} from "./reducers/blogReducer"

const App = () => {
  const blogFormRef = useRef()

  const blogs = useSelector((state) => state.blogs)
  const user = useSelector((state) => state.user)
  const users = useSelector((state) => state.users)
  const comment = useSelector((state) => state.comment)

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

  const matchUser = useMatch("/users/:id")
  const singleUser = matchUser
    ? users.find((user) => user.id === matchUser.params.id)
    : null

  const matchBlog = useMatch("/blogs/:id")
  const singleBlog = matchBlog
    ? blogs.find((blog) => blog.id === matchBlog.params.id)
    : null

  const Menu = ({ user }) => {
    const padding = {
      paddingRight: 5,
    }
    return (
      <div>
        <Navbar collapseOnSelect expand="lg" bg="light" variant="light">
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#" as="span">
                <Link style={padding} to="/">
                  blogs
                </Link>
              </Nav.Link>
              <Nav.Link href="#" as="span">
                <Link style={padding} to="/users">
                  users
                </Link>
              </Nav.Link>
              <em>{user.name} logged in</em>{" "}
              <button onClick={logout}>logout</button>
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </div>
    )
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

  const SingularUser = ({ user }) => {
    if (!user) {
      return null
    }
    return (
      <div>
        <h2>{user.name}</h2>
        <strong>added blogs</strong>
        <ul>
          {user.blogs.map((blog) => (
            <li key={blog.id}>
              <Link to={`/blogs/${blog.id}`}>{blog.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  const handleCommentSubmit = (event) => {
    event.preventDefault()
    const commentToAdd = event.target.comment.value
    event.target.comment.value = ""
    dispatch(commentBlog(singleBlog, commentToAdd))
  }

  const SingleBlog = ({ blog }) => {
    if (!blog) {
      return null
    }
    return (
      <div>
        <h2>{blog.title}</h2>
        <a href={blog.url}>{blog.url}</a>
        <div>
          {blog.likes} likes{" "}
          <button onClick={() => likeBlog(blog.id)}>like</button>
        </div>
        added by {blog.author}
        <h3>comments</h3>
        <form onSubmit={handleCommentSubmit}>
          <div>
            <input value={comment} id="comment" type="text" />
            <button id="comment-button" type="submit">
              add comment
            </button>
          </div>
        </form>
        <ul>
          {blog.comments.map((comment, id_c) => (
            <li key={id_c}>{comment}</li>
          ))}
        </ul>
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
    <div className="container">
      <Menu user={user} />
      <h2>blog app</h2>

      <Notification />

      {/* <div>
        <p>{user.name} logged in</p>
        <button onClick={logout}>logout</button>
      </div> */}

      <Routes>
        <Route path="/" element={<BlogsList />} />
        <Route path="/users" element={<UsersList />} />
        <Route path="/users/:id" element={<SingularUser user={singleUser} />} />
        <Route path="/blogs/:id" element={<SingleBlog blog={singleBlog} />} />
      </Routes>
    </div>
  )
}

export default App
