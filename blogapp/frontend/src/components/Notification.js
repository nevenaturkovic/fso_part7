import { useSelector } from "react-redux"
import { Alert } from "react-bootstrap"

const Notification = () => {
  const notification = useSelector((state) => state.notifications)

  if (notification === null) {
    return null
  }

  // const style = {
  //   color: notification.type === "alert" ? "red" : "green",
  //   background: "lightgrey",
  //   fontSize: 20,
  //   borderStyle: "solid",
  //   borderRadius: 5,
  //   padding: 10,
  //   marginBottom: 10,
  // }

  return (
    <div className="container">
      {notification.message && (
        <Alert variant={notification.type === "alert" ? "danger" : "success"}>
          {" "}
          {notification.message}{" "}
        </Alert>
      )}
    </div>
  )
}

export default Notification
