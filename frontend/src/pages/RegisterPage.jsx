import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { register } from "../services/api"
import { setToken } from "../services/token"

export default function RegisterPage() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleRegister(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { token } = await register(name, email, password)
      setToken(token)
      navigate("/")
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: "400px", margin: "4rem auto", padding: "2rem" }}>
      <h1>Register</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        <label>
          Name
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }} />
        </label>
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }} />
        </label>
        <label>
          Password
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="min 6 characters"
            style={{ display: "block", width: "100%", marginTop: "4px", padding: "6px 8px" }} />
        </label>
        <button type="submit" disabled={loading} style={{ padding: "8px 20px" }}>
          {loading ? "Registering…" : "Register"}
        </button>
      </form>
      <p style={{ marginTop: "1rem" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  )
}