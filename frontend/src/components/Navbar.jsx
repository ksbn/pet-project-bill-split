import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <header className="navbar">
            <Link to="/" className="logo">
              Split-It
            </Link>

            <nav>
                <Link to="/">Home</Link>
            </nav>
        </header>
    );
}