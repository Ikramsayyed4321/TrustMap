import { Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import { LoginPage } from "./features/auth/LoginPage";
import { BusinessDetailsPage } from "./features/public/BusinessDetailsPage";
import { HomePage } from "./features/public/HomePage";
import { PlaceDetailsPage } from "./features/public/PlaceDetailsPage";
import { SearchResultsPage } from "./features/public/SearchResultsPage";
import { AboutPage, BlogPage, CategoriesPage, ContactPage, ReviewerProfilesPage, TrendingPage } from "./features/public/SimplePages";
import { UserDashboard } from "./features/user/UserDashboard";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/place/:id" element={<PlaceDetailsPage />} />
        <Route path="/businesses/:id" element={<BusinessDetailsPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/reviewers" element={<ReviewerProfilesPage />} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/:section" element={<UserDashboard />} />
        </Route>
        <Route element={<ProtectedRoute roles={["admin"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>
      </Route>
    </Routes>
  );
}


