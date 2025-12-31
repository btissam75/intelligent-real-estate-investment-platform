// import React from "react";
// import ReactDOM from "react-dom/client";
// import { BrowserRouter, Routes, Route } from "react-router-dom";

// import PublicLayout from "./layouts/PublicLayout";
// import Home from "./pages/Home";
// import Properties from "./pages/Properties";
// // import PropertyPage from "./pages/PropertyPage";

// import AppShell from "./AppShell/AppShell"; // layout privé (sidebar/topbar)
// import Dashboard from "./dashboard/Dashboard";
// import SettingsCard from "./dashboard/SettingsCard";
// import Deposit from "./dashboard/Deposit";
// import Withdraw from "./dashboard/Withdraw";
// import Transfer from "./dashboard/Transfer";
// import Activity from "./dashboard/Activity";
// import Tokens from "./dashboard/Tokens";
// import Offers from "./dashboard/Offers";
// import Wallet from "./dashboard/Wallet";
// import Signup from "./pages/Signup";
// import ChatWidget from "./components/ChatWidget";
// import "./index.css";
// import PropertyPage from "./pages/PropertyPage";
// import PropertiesList from "./pages/PropertiesList" ;
// import SignIn from "./pages/SignIn";
// import RequireAuth from "./components/RequireAuth";
// import RequireAuth from "./auth/RequireAuth";
// import InvestCheckout from "./pages/InvestCheckout";
// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <Routes>
//         {/* ===== Domaine PUBLIC ===== */}
//         <Route element={<PublicLayout />}>
//           <Route path="/" element={<Home />} />
//           <Route path="/signin" element={<SignIn />} />
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/properties" element={<PropertiesList />} />
//           <Route path="/properties/:id" element={<PropertyPage />} />
//           {/* ajoute /signin /signup ici aussi si tu veux l’en-tête public */}
//         </Route>

//         <Route element={<RequireAuth />}>
//           <Route path="/wallet" element={<Wallet />} />
//           <Route path="/checkout" element={<Checkout />} />
//           // autres pages protégées...
//         </Route>
//       </Route>
//           <Route path="/properties/:id" element={<PropertyPage />} />
//           {/* ajoute /signin /signup ici aussi si tu veux l’en-tête public */}
//         </Route>
        
// <Route element={<RequireAuth />}>
//   {/* <Route path="/dashboard" element={<Dashboard />} />
//   …autres pages privées… */}
// </Route>
//         {/* ===== Domaine PRIVÉ (AppShell) ===== */}
//         <Route element={<AppShell />}>
//           <Route path="/invest/checkout" element={<InvestCheckout />} />
//           <Route path="/dashboard" element={<Dashboard />} />
          
//           <Route path="/wallet" element={<Wallet />} />
//           <Route path="/settings" element={<SettingsCard />} />
//           <Route path="/deposit" element={<Deposit />} />
//           <Route path="/withdraw" element={<Withdraw />} />
//           <Route path="/transfer" element={<Transfer />} />
//           <Route path="/activity" element={<Activity />} />
//           <Route path="/offers" element={<Offers />} />
//           <Route path="/tokens" element={<Tokens />} />
//         </Route>

//         {/* 404 */}
//         <Route path="*" element={<div style={{padding:24}}>Page introuvable</div>} />
//       </Routes>

//       {/* Widget chat visible partout */}
//       <ChatWidget />
//     </BrowserRouter>
//   </React.StrictMode>
// );
// immo-web/src/main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./index.css";

/* Layout public */
import PublicLayout from "./layouts/PublicLayout";

/* Pages publiques */
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import Signup from "./pages/Signup";
import PropertiesList from "./pages/PropertiesList";
import PropertyPage from "./pages/PropertyPage";

/* Garde d’auth */
import RequireAuth from "./auth/RequireAuth";

/* Layout privé + pages privées */
import AppShell from "./AppShell/AppShell";
import Dashboard from "./dashboard/Dashboard";
import Wallet from "./dashboard/Wallet";
import SettingsCard from "./dashboard/SettingsCard";
import Deposit from "./dashboard/Deposit";
import Withdraw from "./dashboard/Withdraw";
import Transfer from "./dashboard/Transfer";
import Activity from "./dashboard/Activity";
import Tokens from "./dashboard/Tokens";
import Offers from "./dashboard/Offers";
import InvestCheckout from "./pages/InvestCheckout";
import PayPage  from "./pages/PayPage";
import PaymentCryptoPage from "./pages/PaymentCryptoPage";
import CardReturnPage from "./pages/CardReturnPage";


/* Widget global */
import ChatWidget from "./components/ChatWidget";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* ===== Domaine PUBLIC ===== */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/properties" element={<PropertiesList />} />
          <Route path="/properties/:id" element={<PropertyPage />} />
        </Route>

        {/* ===== Domaine PRIVÉ (protégé) ===== */}
        {/* <Route element={<RequireAuth />}> */}
          {/* On place AppShell comme layout des pages privées */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/settings" element={<SettingsCard />} />
            <Route path="/deposit" element={<Deposit />} />
            <Route path="/withdraw" element={<Withdraw />} />
            <Route path="/transfer" element={<Transfer />} />
            <Route path="/activity" element={<Activity />} />
            <Route path="/offers" element={<Offers />} />
            <Route path="/tokens" element={<Tokens />} />
            {/* page de checkout d’investissement */}
            <Route path="/invest/checkout" element={<InvestCheckout />} />
            <Route path="/pay" element={<PayPage />} />
            <Route path="/payment/crypto/:investmentId" element={<PaymentCryptoPage />} />
            
            <Route path="/card-return" element={<CardReturnPage />} />
          </Route>
        {/* </Route> */}

        {/* 404 */}
        <Route path="*" element={<div style={{ padding: 24 }}>Page introuvable</div>} />
      </Routes>

      {/* Widget chat visible partout */}
      <ChatWidget />
    </BrowserRouter>
  </React.StrictMode>
);
