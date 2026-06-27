import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

// Route-based code splitting: each page ships in its own chunk so the initial
// load only contains the app shell + the page actually requested.
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Research = lazy(() => import("./pages/Research"));
const Academy = lazy(() => import("./pages/Academy"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const MyLearning = lazy(() => import("./pages/MyLearning"));
const Hospitals = lazy(() => import("./pages/Hospitals"));
const Doctors = lazy(() => import("./pages/Doctors"));
const Crm = lazy(() => import("./pages/Crm"));
const Marketing = lazy(() => import("./pages/Marketing"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Tot = lazy(() => import("./pages/Tot"));
const Coach = lazy(() => import("./pages/Coach"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const ProductForm = lazy(() => import("./pages/admin/ProductForm"));
const AdminHospitals = lazy(() => import("./pages/admin/AdminHospitals"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

function RouteFallback() {
  return (
    <div className="flex items-center justify-center py-24 text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <Layout>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/research" element={<Research />} />
        <Route path="/hospitals" element={<Hospitals />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/academy" element={<Academy />} />
        <Route path="/academy/:slug" element={<CourseDetail />} />
        <Route
          path="/my-learning"
          element={
            <ProtectedRoute>
              <MyLearning />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/crm"
          element={
            <ProtectedRoute>
              <Crm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/marketing"
          element={
            <ProtectedRoute>
              <Marketing />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coach"
          element={
            <ProtectedRoute>
              <Coach />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trainers"
          element={
            <ProtectedRoute roles={["PRODUCT_MANAGER", "MEDICAL_DIRECTOR", "TRAINER"]}>
              <Tot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute roles={["PRODUCT_MANAGER", "MEDICAL_DIRECTOR"]}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/new"
          element={
            <ProtectedRoute roles={["PRODUCT_MANAGER", "MEDICAL_DIRECTOR"]}>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products/:id/edit"
          element={
            <ProtectedRoute roles={["PRODUCT_MANAGER", "MEDICAL_DIRECTOR"]}>
              <ProductForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/hospitals"
          element={
            <ProtectedRoute roles={["PRODUCT_MANAGER", "MEDICAL_DIRECTOR"]}>
              <AdminHospitals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute roles={["ADMIN"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />
      </Routes>
      </Suspense>
    </Layout>
  );
}
