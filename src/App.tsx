import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import HeroBanner from "./components/HeroBanner";
import StatsSection from "./components/StatsSection";
import OrderModal from "./components/OrderModal";
import TrackerTab from "./components/TrackerTab";
import AdminPanel from "./components/AdminPanel";
import ProfileTab from "./components/ProfileTab";
import Footer from "./components/Footer";
import Testimonials from "./components/Testimonials";
import FaqSection from "./components/FaqSection";
import CtaSection from "./components/CtaSection";
import { Game, Product, Voucher, Order, OrderStatus } from "./types";
import { Gamepad2, Layers, ShieldCheck, Heart, Trash2, ArrowRight, RotateCw, Sparkles, HelpCircle } from "lucide-react";
import { useAppStore } from "./store/useStore";

export default function App() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<"games" | "tracker" | "admin" | "profile">("games");
  const [selectedSearch, setSelectedSearch] = useState("");

  // Full stack reactive backend values
  const [games, setGames] = useState<Game[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  
  const [loading, setLoading] = useState(true);

  // Modal wizards trackers
  const [selectedGameForModal, setSelectedGameForModal] = useState<Game | null>(null);
  const [preSelectedProdId, setPreSelectedProdId] = useState<string | undefined>(undefined);
  const [activeTrackerInvoice, setActiveTrackerInvoice] = useState<string | undefined>(undefined);

  // Fetch all initial store coordinates from Express REST endpoints
  const fetchStoreCoordinates = async () => {
    try {
      const gResp = await fetch("/api/games");
      const gamesData = await gResp.json();
      setGames(gamesData.filter((g: Game) => g.status === "ACTIVE"));

      const pResp = await fetch("/api/products");
      const productsData = await pResp.json();
      setProducts(productsData);

      const vResp = await fetch("/api/vouchers");
      const vouchersData = await vResp.json();
      setVouchers(vouchersData);

      const oResp = await fetch("/api/orders");
      const ordersData = await oResp.json();
      setOrders(ordersData);
    } catch (e) {
      console.error("Gagal melakukan sinkronisasi data dengan backend Express server:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreCoordinates();
  }, []);

  useEffect(() => {
    if (activeTab === "admin" && currentUser?.role !== "ADMIN") {
      setActiveTab("games");
    }
  }, [currentUser, activeTab]);

  // Filter games dynamically by keyword typed in search
  const filteredGames = games.filter(g => 
    g.name.toLowerCase().includes(selectedSearch.toLowerCase()) ||
    g.publisher.toLowerCase().includes(selectedSearch.toLowerCase())
  );

  // Handle direct item triggers (e.g. from Flash sales cards)
  const handleSelectPromo = (gameId: string, productId: string) => {
    const foundGame = games.find(g => g.id === gameId);
    if (foundGame) {
      setPreSelectedProdId(productId);
      setSelectedGameForModal(foundGame);
    }
  };

  // Close ordering popup
  const handleCloseModal = () => {
    setSelectedGameForModal(null);
    setPreSelectedProdId(undefined);
  };

  // Switch to tracker and automatically load the newly generated invoice
  const handleOrderCreated = (newOrder: Order) => {
    setSelectedGameForModal(null);
    setPreSelectedProdId(undefined);
    setActiveTrackerInvoice(newOrder.id);
    setActiveTab("tracker");
    fetchStoreCoordinates(); // refresh data coordinates
  };

  // Demo state reset
  const handleResetDemoData = async () => {
    if (confirm("Apakah Anda yakin ingin mereset seluruh database simulator kembali ke posisi awal?")) {
      try {
        const r = await fetch("/api/demo/reset", { method: "POST" });
        if (r.ok) {
          alert("Database demo berhasil direset ke setelan awal!");
          fetchStoreCoordinates();
        }
      } catch (e) {
        alert("Gagal mereset data.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Prime Header navigation bar */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab !== "tracker") {
            setActiveTrackerInvoice(undefined); // clear search track trigger
          }
        }} 
        selectedSearch={selectedSearch}
        setSelectedSearch={setSelectedSearch}
      />

      {/* Main Container body */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <RotateCw className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-sm font-mono text-slate-400">Menghubungkan ke API Server Store...</p>
          </div>
        ) : (
          <>
            
            {/* TAB A: GAMES GRID BROWSER VIEW */}
            {activeTab === "games" && (
              <div className="space-y-12 animate-fade-in text-left">
                {/* Immersive promo banners & flash sales sliders */}
                <HeroBanner products={products} onSelectProduct={handleSelectPromo} />

                {/* Statistics counts bar */}
                <StatsSection ordersCount={orders.length} />

                {/* Main section heading */}
                <div className="flex items-center justify-between border-b border-slate-850 pb-5">
                  <div className="flex items-start gap-3">
                    <span className="w-1 h-10 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></span>
                    <div>
                      <h2 id="main-games-grid-title" className="text-xl md:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        <span>Daftar Game Digital Terpopuler</span>
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 font-medium">
                        Proses instan otomatis 24 jam nonstop terpercaya. Pilih game favorit Anda untuk memulai top up keping digital.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Grid items */}
                {filteredGames.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
                    {filteredGames.map((game) => (
                      <div 
                        id={`game-card-${game.id}`}
                        key={game.id}
                        onClick={() => setSelectedGameForModal(game)}
                        className="bg-slate-900 border border-slate-850 hover:border-slate-700/80 rounded-3xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col justify-between h-56"
                      >
                        {/* Upper colorful card wrapper representation */}
                        <div 
                          className="h-28 w-full p-4 flex items-end justify-between relative transition-all group-hover:opacity-90"
                          style={{ background: game.banner, backgroundSize: 'cover' }}
                        >
                          {/* Ambient darkened shade */}
                          <div className="absolute inset-0 bg-slate-950/40 pointer-events-none transition-all group-hover:bg-slate-950/20"></div>

                          {/* Float publisher tag */}
                          <span className="relative z-10 bg-black/50 text-[9px] uppercase tracking-wider font-extrabold text-white px-2 py-0.5 rounded font-mono border border-white/15">
                            {game.publisher}
                          </span>
                        </div>

                        {/* Lower text description area */}
                        <div className="p-3 sm:p-4 bg-slate-900 border-t border-slate-850 flex items-center gap-2 sm:gap-3">
                          <span className="text-xl sm:text-2xl bg-slate-950 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-xl border border-slate-800 transition-all font-sans group-hover:border-indigo-500/50 flex-shrink-0">
                            {game.logo}
                          </span>
                          <div className="text-left font-sans truncate flex-1">
                            <h4 className="font-extrabold text-xs sm:text-sm text-white group-hover:text-indigo-400 transition-colors truncate">
                              {game.name}
                            </h4>
                            <span className="text-[9px] sm:text-[10px] text-slate-500 block leading-tight font-medium">
                              Otomatis Kilat 1 Detik
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900 border border-slate-850 p-12 rounded-3xl text-center max-w-md mx-auto space-y-3">
                    <p className="text-slate-400 text-xs">Game "{selectedSearch}" tidak ditemukan.</p>
                    <button 
                      onClick={() => setSelectedSearch("")}
                      className="text-indigo-400 text-xs font-bold underline cursor-pointer"
                    >
                      Reset pencarian
                    </button>
                  </div>
                )}

                {/* Testimonials Grid section representing genuine customer feedback */}
                <Testimonials />

                {/* FAQ section with collapsible query accordions */}
                <FaqSection />

                {/* Conversion Call To Action box targeting regular member registrations */}
                <CtaSection 
                  onJoinMember={() => {
                    alert("Pendaftaran Member Baru Sukses! Saldo wallet simulasi Anda siap digunakan untuk potongan harga otomatis.");
                  }}
                  onTrackOrder={() => {
                    setActiveTab("tracker");
                  }}
                />
              </div>
            )}

            {/* TAB B: ORDER TRACKER VIEW PANEL */}
            {activeTab === "tracker" && (
              <TrackerTab 
                initialSearchId={activeTrackerInvoice} 
                onRefreshOrders={fetchStoreCoordinates}
              />
            )}

            {/* TAB C: ADMIN CONTROL PANEL WORKSPACE */}
            {activeTab === "admin" && (
              <AdminPanel 
                products={products} 
                vouchers={vouchers} 
                orders={orders} 
                games={games}
                onRefreshData={fetchStoreCoordinates}
              />
            )}

            {/* TAB D: CUSTOMER PROFILE & DEPOSIT WORKSPACE */}
            {activeTab === "profile" && (
              <ProfileTab 
                orders={orders}
                onRefreshOrders={fetchStoreCoordinates}
              />
            )}

          </>
        )}

      </main>

      {/* Floating Demo Reset Button (Convenient tool for sandbox reviewers) */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={handleResetDemoData}
          title="Reset database demo"
          className="bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 font-bold p-3 rounded-full cursor-pointer transition-all shadow-xl backdrop-blur-sm flex items-center justify-center"
        >
          <Trash2 className="h-5 w-5 text-red-400" />
        </button>
      </div>

      {/* Footer detail element */}
      <Footer />

      {/* STEP-BY-STEP ORDERING POPUP GLASS MODAL */}
      {selectedGameForModal && (
        <OrderModal 
          game={selectedGameForModal} 
          products={products}
          onClose={handleCloseModal}
          onOrderCreated={handleOrderCreated}
          preSelectedProductId={preSelectedProdId}
        />
      )}

    </div>
  );
}
