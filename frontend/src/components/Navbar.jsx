import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <Link to="/" className="logo">
        Split-It
      </Link>
      <Link to="/donations">💚 Donations</Link>
      <nav>
        <Link to="/">Home</Link>
      </nav>
    </header>
  );
}
