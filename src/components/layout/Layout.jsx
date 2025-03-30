import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import "./Layout.css";

function Layout({ children }) {
  return (
    <>
      <Navbar className="navbar" />
      <div className="container mt-4">{children}</div>
      <Footer className="footer" />
    </>
  );
}

export default Layout;
