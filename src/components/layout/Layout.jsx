import Navbar from "../navbar/Navbar";
import Footer from "../footer/Footer";
import "./Layout.css";

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <div className="container mt-4">{children}</div>
      <Footer />
    </>
  );
}

export default Layout;
