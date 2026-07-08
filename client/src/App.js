import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminPanel from "./pages/admin/AdminPanel";
import Navbar from "./components/layout/Navbar";
import AdminPanel from "./pages/admin/AdminPanel";
import Footer from "./components/layout/Footer";
import AdminPanel from "./pages/admin/AdminPanel";
import InfoPage from "./components/common/InfoPage";
import AdminPanel from "./pages/admin/AdminPanel";
import { staticPages } from "./data/staticPageData";
import AdminPanel from "./pages/admin/AdminPanel";

import Home from "./pages/Home/Home";
import AdminPanel from "./pages/admin/AdminPanel";
import Products from "./pages/Products/Products";
import AdminPanel from "./pages/admin/AdminPanel";
import ProductDetails from "./pages/ProductDetails/ProductDetails";
import AdminPanel from "./pages/admin/AdminPanel";
import Cart from "./pages/Cart/Cart";
import AdminPanel from "./pages/admin/AdminPanel";
import Checkout from "./pages/Checkout/Checkout";
import AdminPanel from "./pages/admin/AdminPanel";
import Login from "./pages/Login/Login";
import AdminPanel from "./pages/admin/AdminPanel";
import Register from "./pages/Register/Register";
import AdminPanel from "./pages/admin/AdminPanel";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import AdminPanel from "./pages/admin/AdminPanel";
import Orders from "./pages/Orders/Orders";
import AdminPanel from "./pages/admin/AdminPanel";
import OrderDetails from "./pages/OrderDetails/OrderDetails";
import AdminPanel from "./pages/admin/AdminPanel";
import Wishlist from "./pages/Wishlist/Wishlist";
import AdminPanel from "./pages/admin/AdminPanel";
import CollectionPage from "./pages/CollectionPage/CollectionPage";
import AdminPanel from "./pages/admin/AdminPanel";
import SearchResults from "./pages/SearchResults/SearchResults";
import AdminPanel from "./pages/admin/AdminPanel";
import Contact from "./pages/Contact/Contact";
import AdminPanel from "./pages/admin/AdminPanel";
import Support from "./pages/Support/Support";
import AdminPanel from "./pages/admin/AdminPanel";
import TrackOrder from "./pages/TrackOrder/TrackOrder";
import AdminPanel from "./pages/admin/AdminPanel";
import OrderSuccess from "./pages/OrderSuccess/OrderSuccess";
import AdminPanel from "./pages/admin/AdminPanel";
import PaymentFailed from "./pages/PaymentFailed/PaymentFailed";
import AdminPanel from "./pages/admin/AdminPanel";
import NotFound from "./pages/NotFound/NotFound";
import AdminPanel from "./pages/admin/AdminPanel";

const StaticRoute = ({ pageKey }) => {
  const page = staticPages[pageKey];
  return <InfoPage {...page} />;
};

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="site-main">
          <Routes>
        <Route path="/admin/*" element={<AdminPanel />} />
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/search" element={<SearchResults />} />

            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/wishlist" element={<Wishlist />} />

            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/payment-failed" element={<PaymentFailed />} />
            <Route path="/track-order" element={<TrackOrder />} />

            <Route path="/offers" element={<CollectionPage type="offers" />} />
            <Route path="/new-arrivals" element={<CollectionPage type="new-arrivals" />} />
            <Route path="/best-sellers" element={<CollectionPage type="best-sellers" />} />

            <Route path="/contact" element={<Contact />} />
            <Route path="/support" element={<Support />} />
            <Route path="/about" element={<StaticRoute pageKey="about" />} />
            <Route path="/faq" element={<StaticRoute pageKey="faq" />} />
            <Route path="/shipping-policy" element={<StaticRoute pageKey="shipping" />} />
            <Route path="/return-refund-policy" element={<StaticRoute pageKey="returns" />} />
            <Route path="/privacy-policy" element={<StaticRoute pageKey="privacy" />} />
            <Route path="/terms-conditions" element={<StaticRoute pageKey="terms" />} />
            <Route path="/cancellation-policy" element={<StaticRoute pageKey="cancellation" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;