import React, { useState, useEffect, useCallback, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Pizza, 
  Menu as MenuIcon, 
  Phone, 
  MapPin, 
  Star, 
  Clock, 
  Instagram, 
  Facebook, 
  ChevronRight, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit2, 
  X,
  Camera,
  ArrowRight,
  MessageSquare,
  MessageCircle,
  Award,
  Users,
  UtensilsCrossed,
  ShoppingBag,
  Minus
} from 'lucide-react';
import { MenuItem, Review, CartItem } from './types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Contexts ---
const CartContext = React.createContext<{
  cart: CartItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}>({
  cart: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  totalItems: 0,
  totalPrice: 0,
});

const MenuContext = React.createContext<{
  menu: MenuItem[];
  loading: boolean;
  refreshMenu: () => Promise<void>;
}>({
  menu: [],
  loading: true,
  refreshMenu: async () => {},
});

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { totalItems, cart, updateQuantity, removeFromCart, totalPrice, clearCart } = React.useContext(CartContext);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
      isScrolled ? "bg-bg/90 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent py-6"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all duration-500 shadow-lg shadow-primary/20">
            <Pizza className="text-white" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-bold tracking-tight leading-none">
              Prince<span className="text-primary">.</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-bold">Pizzaria Gourmet</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-[0.2em]">
          <Link to="/" className="hover:text-primary transition-colors relative group">
            Início
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link to="/menu" className="hover:text-primary transition-colors relative group">
            Menu
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link to="/reviews" className="hover:text-primary transition-colors relative group">
            Avaliações
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          <Link to="/contact" className="hover:text-primary transition-colors relative group">
            Contacto
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all group-hover:w-full" />
          </Link>
          
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 hover:text-primary transition-colors group"
          >
            <ShoppingBag size={24} />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                {totalItems}
              </span>
            )}
          </button>

          {isAdmin ? (
            <button onClick={() => { localStorage.removeItem('adminToken'); window.location.href = '/'; }} className="flex items-center gap-2 text-red-400 hover:text-red-300 cursor-pointer bg-red-400/10 px-4 py-2 rounded-full transition-all">
              <LogOut size={16} /> Sair
            </button>
          ) : (
            <Link to="/admin" className="px-6 py-2.5 glass rounded-full hover:bg-white/10 transition-all border border-white/10 hover:border-primary/50">Admin</Link>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
           <button 
             onClick={() => setIsCartOpen(true)}
             className="relative p-2 hover:text-primary transition-colors"
           >
             <ShoppingBag size={24} />
             {totalItems > 0 && (
               <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[10px] flex items-center justify-center rounded-full font-bold">
                 {totalItems}
               </span>
             )}
           </button>
           <MenuIcon className="text-white" size={28} />
        </div>
      </div>

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-bg border-l border-white/10 h-full flex flex-col shadow-2xl"
            >
              <div className="p-8 border-b border-white/10 flex justify-between items-center">
                <h2 className="text-2xl font-serif font-bold">O Seu <span className="text-primary italic">Pedido</span></h2>
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:text-primary transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                    <ShoppingBag size={64} />
                    <p className="font-bold uppercase tracking-widest text-xs">O seu carrinho está vazio</p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                        <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between">
                          <h4 className="font-bold">{item.name}</h4>
                          <button onClick={() => removeFromCart(item.id)} className="text-white/20 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 glass px-3 py-1 rounded-lg">
                            <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-primary transition-colors">
                              <Minus size={14} />
                            </button>
                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-primary transition-colors">
                              <Plus size={14} />
                            </button>
                          </div>
                          <span className="font-bold text-primary">{(item.price * item.quantity).toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-8 border-t border-white/10 space-y-6 bg-card/50">
                  <div className="flex justify-between items-end">
                    <span className="text-white/40 uppercase tracking-widest text-xs font-bold">Total</span>
                    <span className="text-3xl font-serif font-bold text-primary">{totalPrice.toFixed(2)}€</span>
                  </div>
                  <button 
                    onClick={() => {
                      const message = cart.map(item => `${item.quantity}x ${item.name}`).join(', ');
                      window.open(`https://wa.me/244939668465?text=Olá! Gostaria de fazer o seguinte pedido: ${message}. Total: ${totalPrice.toFixed(2)}€`, '_blank');
                      clearCart();
                      setIsCartOpen(false);
                    }}
                    className="w-full py-5 bg-primary hover:bg-primary-dark rounded-2xl font-bold transition-all text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    Finalizar Pedido <ArrowRight size={22} />
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const WhatsAppButton = () => (
  <a 
    href="https://wa.me/244939668465" 
    target="_blank" 
    rel="noopener noreferrer"
    className="fixed bottom-8 right-8 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-[#25D366]/40 hover:scale-110 transition-transform group"
  >
    <MessageCircle className="text-white" size={32} />
    <span className="absolute right-full mr-4 px-4 py-2 bg-white text-black text-sm font-bold rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
      Peça pelo WhatsApp
    </span>
  </a>
);

const Footer = () => (
  <footer className="bg-card border-t border-white/5 pt-24 pb-12 px-6">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Pizza className="text-primary" size={32} />
          <span className="text-2xl font-serif font-bold">Pizzaria Prince</span>
        </div>
        <p className="text-white/50 text-sm leading-relaxed">
          A elevar o padrão da pizza em Luanda. Ingredientes selecionados, técnicas tradicionais e uma paixão inabalável pela gastronomia italiana.
        </p>
        <div className="flex gap-4">
          <a 
            href="https://www.facebook.com/p/Pizzaria-prince-100095641595733/" 
            target="_blank"
            rel="noopener noreferrer"
            className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-primary transition-all duration-300"
          >
            <Facebook size={20} />
          </a>
        </div>
      </div>
      
      <div>
        <h4 className="font-bold mb-8 uppercase tracking-[0.2em] text-xs text-primary">Navegação</h4>
        <ul className="space-y-4 text-sm text-white/50">
          <li><Link to="/" className="hover:text-white transition-colors">Início</Link></li>
          <li><Link to="/menu" className="hover:text-white transition-colors">Menu Digital</Link></li>
          <li><Link to="/reviews" className="hover:text-white transition-colors">O que dizem de nós</Link></li>
          <li><Link to="/contact" className="hover:text-white transition-colors">Fale Connosco</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold mb-8 uppercase tracking-[0.2em] text-xs text-primary">Informações</h4>
        <ul className="space-y-4 text-sm text-white/50">
          <li className="flex items-center gap-3"><Phone size={16} className="text-primary" /> +244 939 668 465</li>
          <li className="flex items-center gap-3"><MapPin size={16} className="text-primary" /> Centralidade de Cacuaco, Luanda</li>
          <li className="flex items-center gap-3"><Clock size={16} className="text-primary" /> Diariamente: 09:00 - 20:00</li>
        </ul>
      </div>
    </div>
    
    <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/30 text-[10px] uppercase tracking-[0.3em] font-bold">
      <span>© 2024 Pizzaria Prince. Todos os direitos reservados.</span>
      <div className="flex gap-8">
        <a href="#" className="hover:text-white transition-colors">Privacidade</a>
        <a href="#" className="hover:text-white transition-colors">Termos</a>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const Home = () => {
  const { menu } = useContext(MenuContext);
  const featuredItems = menu.slice(0, 3);
  const { addToCart } = useContext(CartContext);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center px-6">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=1920&q=80" 
            className="w-full h-full object-cover scale-105 animate-slow-zoom"
            alt="Hero Background"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="inline-flex items-center gap-3 px-5 py-2 glass rounded-full text-[10px] font-bold tracking-[0.4em] uppercase text-primary mb-8 border border-primary/20"
            >
              <Award size={14} /> A Melhor Experiência de Luanda
            </motion.div>
            
            <h1 className="text-7xl md:text-9xl font-serif font-bold leading-[0.9] mb-10 tracking-tighter">
              A Arte da <br />
              <span className="text-primary italic">Pizza</span> Perfeita
            </h1>
            
            <p className="text-xl text-white/60 mb-12 leading-relaxed max-w-xl font-medium">
              Descubra o equilíbrio perfeito entre a tradição italiana e os sabores contemporâneos. Cada fatia é uma obra-prima artesanal.
            </p>
            
            <div className="flex flex-wrap gap-6">
              <Link 
                to="/menu" 
                className="px-10 py-5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold transition-all flex items-center gap-3 group shadow-2xl shadow-primary/30 text-lg"
              >
                Explorar Menu <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link 
                to="/contact" 
                className="px-10 py-5 glass hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 hover:border-primary/40 text-lg"
              >
                Reservar Mesa
              </Link>
            </div>
          </motion.div>
        </div>
        
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 animate-bounce opacity-40">
          <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Descer</span>
          <div className="w-px h-12 bg-gradient-to-b from-primary to-transparent" />
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-32 px-6 bg-card/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="aspect-[4/5] rounded-[3rem] overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?auto=format&fit=crop&w=800&q=80" 
                className="w-full h-full object-cover"
                alt="Chef working"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -bottom-12 -right-12 glass p-10 rounded-[2.5rem] hidden md:block border border-white/10 shadow-2xl">
              <div className="flex items-center gap-6 mb-4">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white">
                  <Award size={32} />
                </div>
                <div>
                  <h4 className="text-3xl font-bold font-serif">7+</h4>
                  <p className="text-xs uppercase tracking-widest text-white font-bold">Anos de Comprometimento</p>
                </div>
              </div>
              <p className="text-sm text-white/60 max-w-[200px]">Comprometidos com a excelência em cada detalhe.</p>
            </div>
          </motion.div>

          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">Nossa História</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold leading-tight">Paixão pela <span className="italic text-primary">Autenticidade</span></h2>
            </div>
            <p className="text-lg text-white/60 leading-relaxed">
              Na Pizzaria Prince, acreditamos que a comida é uma linguagem universal de amor. Fundada com o sonho de trazer a verdadeira essência da pizza italiana para Luanda, selecionamos cada ingrediente com rigor — desde a farinha tipo 00 até aos tomates San Marzano.
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-primary">
                  <UtensilsCrossed size={24} />
                </div>
                <h4 className="font-bold">Massa Artesanal</h4>
                <p className="text-sm text-white/40">Fermentação lenta de 48h para máxima leveza.</p>
              </div>
              <div className="space-y-3">
                <div className="w-12 h-12 glass rounded-xl flex items-center justify-center text-primary">
                  <Users size={24} />
                </div>
                <h4 className="font-bold">Ambiente Único</h4>
                <p className="text-sm text-white/40">O lugar perfeito para momentos inesquecíveis.</p>
              </div>
            </div>
            <Link to="/contact" className="inline-flex items-center gap-3 text-primary font-bold group text-lg">
              Saiba mais sobre nós <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="space-y-4">
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">Seleção do Chef</span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold">As Nossas <span className="text-primary italic">Especialidades</span></h2>
          </div>
          <Link to="/menu" className="px-8 py-4 glass hover:bg-primary transition-all rounded-2xl font-bold flex items-center gap-3 border border-white/10 hover:border-primary">
            Ver Menu Completo <ChevronRight size={20} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {featuredItems.map((item, idx) => (
            <motion.div 
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="relative aspect-[3/4] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl">
                <img 
                  src={item.image_url} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={item.name}
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{item.category}</span>
                    <h3 className="text-2xl font-bold">{item.name}</h3>
                  </div>
                  <div className="text-2xl font-serif font-bold text-primary">{item.price}€</div>
                </div>
              </div>
              <p className="text-white/50 text-sm leading-relaxed mb-6 line-clamp-2">{item.description}</p>
              <button 
                onClick={() => addToCart(item)}
                className="w-full py-4 glass rounded-2xl hover:bg-primary transition-all font-bold flex items-center justify-center gap-3 border border-white/10 hover:border-primary"
              >
                <Plus size={20} /> Adicionar ao Pedido
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">Galeria</span>
            <h2 className="text-5xl md:text-6xl font-serif font-bold">Momentos <span className="text-primary italic">Prince</span></h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 h-[600px]">
            <div className="col-span-2 row-span-2 rounded-[2.5rem] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Gallery 1" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-[2rem] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1574126154517-d1e0d89ef734?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Gallery 2" referrerPolicy="no-referrer" />
            </div>
            <div className="rounded-[2rem] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1590947132387-155cc02f3212?auto=format&fit=crop&w=400&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Gallery 3" referrerPolicy="no-referrer" />
            </div>
            <div className="col-span-2 rounded-[2rem] overflow-hidden">
              <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" alt="Gallery 4" referrerPolicy="no-referrer" />
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-32 px-6 bg-card/20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10">
            <div className="space-y-4">
              <span className="text-primary font-bold uppercase tracking-[0.3em] text-xs">Localização</span>
              <h2 className="text-5xl md:text-6xl font-serif font-bold">Visite-nos em <span className="text-primary italic">Cacuaco</span></h2>
            </div>
            <p className="text-lg text-white/60">
              Estamos situados no coração da Centralidade de Cacuaco, oferecendo um refúgio gastronómico acolhedor e sofisticado.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-6 glass rounded-3xl border border-white/5">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                  <MapPin size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Endereço</h4>
                  <p className="text-white/40">4F8M+R7W, Centralidade de Cacuaco, Luanda</p>
                </div>
              </div>
              <div className="flex items-center gap-6 p-6 glass rounded-3xl border border-white/5">
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
                  <Phone size={28} />
                </div>
                <div>
                  <h4 className="font-bold text-lg">Telefone</h4>
                  <p className="text-white/40">+244 939 668 465</p>
                </div>
              </div>
            </div>
            <a 
              href="https://www.google.com/maps/place/Pizzaria+Prince/@-8.8828875,13.4832031,17z/data=!4m12!1m5!3m4!2s6F3M4F8M%2BR7W!8m2!3d-8.8828875!4d13.4832031!3m5!1s0x1a51feee5e3944d1:0xf010cad263058c5b!8m2!3d-8.882881!4d13.483216!16s%2Fg%2F11gd7_0w5v?entry=ttu&g_ep=EgoyMDI2MDMwMi4wIKXMDSoASAFQAw%3D%3D"
              target="_blank"
              rel="noopener noreferrer"
              className="px-10 py-5 bg-primary hover:bg-primary-dark rounded-2xl font-bold transition-all inline-flex items-center gap-3 shadow-xl shadow-primary/20 text-lg"
            >
              Obter Direções <ArrowRight size={22} />
            </a>
          </div>
          
          <a 
            href="https://www.google.com/maps/place/Pizzaria+Prince/@-8.8828875,13.4832031,17z/data=!4m12!1m5!3m4!2s6F3M4F8M%2BR7W!8m2!3d-8.8828875!4d13.4832031!3m5!1s0x1a51feee5e3944d1:0xf010cad263058c5b!8m2!3d-8.882881!4d13.483216!16s%2Fg%2F11gd7_0w5v?entry=ttu&g_ep=EgoyMDI2MDMwMi4wIKXMDSoASAFQAw%3D%3D"
            target="_blank"
            rel="noopener noreferrer"
            className="h-[500px] rounded-[3rem] overflow-hidden glass border border-white/10 relative group block"
          >
            <img 
              src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=800&q=80" 
              className="w-full h-full object-cover opacity-60 grayscale group-hover:grayscale-0 transition-all duration-1000"
              alt="Localização Pizzaria Prince"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center animate-pulse shadow-2xl shadow-primary/50 group-hover:scale-110 transition-transform">
                <MapPin className="text-white" size={32} />
              </div>
            </div>
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 glass rounded-2xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Ver no Google Maps
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};

const Menu = () => {
  const { menu, loading } = useContext(MenuContext);
  const [activeCategory, setActiveCategory] = useState('Todos');
  const { addToCart } = useContext(CartContext);

  const categories = ['Todos', ...Array.from(new Set(menu.map(item => item.category)))];
  const filteredMenu = activeCategory === 'Todos' 
    ? menu 
    : menu.filter(item => item.category === activeCategory);

  return (
    <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-24 space-y-6">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-primary font-bold uppercase tracking-[0.4em] text-xs"
        >
          Experiência Gastronómica
        </motion.span>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-serif font-bold"
        >
          O Nosso <span className="text-primary italic">Menu</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-white/50 max-w-2xl mx-auto text-lg leading-relaxed"
        >
          Uma viagem culinária através de ingredientes frescos e receitas tradicionais. Explore a nossa seleção de pizzas artesanais e acompanhamentos.
        </motion.p>
      </div>

      {!loading && (
        <div className="flex flex-wrap justify-center gap-4 mb-20">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "px-8 py-3 rounded-2xl font-bold transition-all border text-sm uppercase tracking-widest",
                activeCategory === cat 
                  ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                  : "glass border-white/10 hover:border-primary/40 text-white/60"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-6">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-white/40 uppercase tracking-widest text-xs font-bold">A carregar delícias...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <AnimatePresence mode="popLayout">
            {filteredMenu.map((item, idx) => (
              <motion.div 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: idx * 0.05 }}
                className="glass p-8 rounded-[2.5rem] hover:border-primary/40 transition-all duration-500 group relative overflow-hidden"
              >
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-8">
                  <img 
                    src={item.image_url} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    alt={item.name}
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 right-4 px-4 py-2 glass rounded-xl font-bold text-primary border border-white/10">
                    {item.price}€
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">{item.name}</h3>
                  </div>
                  <p className="text-white/50 text-sm leading-relaxed mb-8 line-clamp-3">{item.description}</p>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-full py-4 glass rounded-2xl hover:bg-primary transition-all font-bold flex items-center justify-center gap-3 border border-white/10 hover:border-primary text-sm uppercase tracking-widest"
                  >
                    <Plus size={18} /> Adicionar ao Pedido
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetch('/api/reviews')
      .then(res => res.json())
      .then(setReviews);
  }, []);

  return (
    <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
      <div className="text-center mb-24 space-y-6">
        <span className="text-primary font-bold uppercase tracking-[0.4em] text-xs">Testemunhos</span>
        <h1 className="text-6xl md:text-8xl font-serif font-bold">O Que <span className="text-primary italic">Dizem?</span></h1>
        <div className="flex items-center justify-center gap-4">
          <div className="flex text-primary gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} size={24} fill={i < 4 ? "currentColor" : "none"} />)}
          </div>
          <span className="text-2xl font-bold">3.6 / 5</span>
          <span className="text-white/30 font-medium">(212 críticas verificadas)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {reviews.map((review, idx) => (
          <motion.div 
            key={review.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            viewport={{ once: true }}
            className="glass p-12 rounded-[3rem] relative group hover:border-primary/30 transition-all duration-500"
          >
            <div className="absolute top-0 right-0 p-8 text-primary/5 group-hover:text-primary/10 transition-colors">
              <MessageSquare size={100} />
            </div>
            <div className="flex text-primary mb-8 gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} size={18} fill={i < review.rating ? "currentColor" : "none"} />)}
            </div>
            <p className="text-white/70 italic text-lg leading-relaxed mb-10 relative z-10">"{review.content}"</p>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center font-bold text-white text-xl shadow-lg shadow-primary/20">
                {review.author[0]}
              </div>
              <div>
                <h4 className="font-bold text-lg">{review.author}</h4>
                <p className="text-white/30 text-xs font-bold uppercase tracking-widest">{review.date}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-24 text-center">
        <a 
          href="https://www.google.com/maps/place/Pizzaria+Prince/@-8.8828757,13.4806411,17z/data=!4m8!3m7!1s0x1a51feee5e3944d1:0xf010cad263058c5b!8m2!3d-8.882881!4d13.483216!9m1!1b1!16s%2Fg%2F11gd7_0w5v?entry=ttu&g_ep=EgoyMDI2MDMwMi4wIKXMDSoASAFQAw%3D%3D"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-10 py-5 glass hover:bg-white/10 rounded-2xl font-bold transition-all border border-white/10 hover:border-primary/40 text-lg"
        >
          Deixar a sua Crítica
        </a>
      </div>
    </div>
  );
};

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-32">
        <div className="space-y-12">
          <div className="space-y-6">
            <span className="text-primary font-bold uppercase tracking-[0.4em] text-xs">Contacto</span>
            <h1 className="text-6xl md:text-8xl font-serif font-bold leading-tight">Vamos <br /><span className="text-primary italic">Conversar</span></h1>
            <p className="text-white/50 text-xl leading-relaxed max-w-lg">
              Tem alguma dúvida ou deseja fazer uma reserva especial? A nossa equipa está pronta para o atender.
            </p>
          </div>

          <div className="space-y-10">
            <div className="flex items-start gap-8 group">
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <MapPin size={32} />
              </div>
              <div>
                <h4 className="font-bold text-2xl mb-2">Onde Estamos</h4>
                <p className="text-white/50 text-lg">4F8M+R7W, Centralidade de Cacuaco, Luanda, Angola</p>
              </div>
            </div>
            <div className="flex items-start gap-8 group">
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Phone size={32} />
              </div>
              <div>
                <h4 className="font-bold text-2xl mb-2">Ligue-nos</h4>
                <p className="text-white/50 text-lg">+244 939 668 465</p>
              </div>
            </div>
            <div className="flex items-start gap-8 group">
              <div className="w-16 h-16 glass rounded-2xl flex items-center justify-center text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                <Clock size={32} />
              </div>
              <div>
                <h4 className="font-bold text-2xl mb-2">Horário de Funcionamento</h4>
                <p className="text-white/50 text-lg">Segunda a Domingo: 09:00 - 20:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-12 md:p-16 rounded-[4rem] border border-white/10 shadow-2xl relative">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-[80px] rounded-full" />
          <h3 className="text-3xl font-serif font-bold mb-10">Envie uma Mensagem</h3>
          
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-[400px] flex flex-col items-center justify-center text-center space-y-6"
              >
                <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                  <Award size={40} />
                </div>
                <h4 className="text-2xl font-bold">Obrigado pela sua solicitação</h4>
                <p className="text-white/40">Entraremos em contacto consigo o mais breve possível.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 glass rounded-xl hover:bg-white/10 transition-colors font-bold"
                >
                  Enviar outra mensagem
                </button>
              </motion.div>
            ) : (
              <motion.form 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit} 
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Nome Completo</label>
                    <input type="text" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg" placeholder="Seu nome" />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Email</label>
                    <input type="email" required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg" placeholder="seu@email.com" />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Assunto</label>
                  <select required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg appearance-none">
                    <option className="bg-bg">Reserva de Mesa</option>
                    <option className="bg-bg">Pedido de Entrega</option>
                    <option className="bg-bg">Evento Privado</option>
                    <option className="bg-bg">Outro</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Sua Mensagem</label>
                  <textarea rows={5} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg resize-none" placeholder="Como podemos ajudar?" />
                </div>
                <button className="w-full py-5 bg-primary hover:bg-primary-dark rounded-2xl font-bold transition-all text-lg shadow-xl shadow-primary/20 flex items-center justify-center gap-3 group">
                  Enviar Mensagem <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.setItem('adminToken', data.token);
      navigate('/admin/dashboard');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass p-16 rounded-[3rem] w-full max-w-lg border border-white/10 shadow-2xl">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-primary/20 rotate-3">
            <Pizza size={40} className="text-white" />
          </div>
          <h1 className="text-4xl font-serif font-bold">Gestão Prince</h1>
          <p className="text-white/30 mt-3 font-medium uppercase tracking-widest text-xs">Acesso Administrativo</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Email Profissional</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg" 
              required
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Senha de Acesso</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg" 
              required
            />
          </div>
          {error && <p className="text-red-400 text-sm text-center font-bold bg-red-400/10 py-3 rounded-xl">{error}</p>}
          <button className="w-full py-5 bg-primary hover:bg-primary-dark rounded-2xl font-bold transition-all text-lg shadow-xl shadow-primary/20">
            Entrar no Painel
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const { menu, refreshMenu } = useContext(MenuContext);
  const [editingItem, setEditingItem] = useState<Partial<MenuItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('adminToken')) {
      navigate('/admin');
      return;
    }
  }, [navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingItem?.id ? 'PUT' : 'POST';
    const url = editingItem?.id ? `/api/menu/${editingItem.id}` : '/api/menu';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editingItem)
    });
    
    setIsModalOpen(false);
    setEditingItem(null);
    refreshMenu();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja apagar este item?')) {
      await fetch(`/api/menu/${id}`, { method: 'DELETE' });
      refreshMenu();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setEditingItem(prev => ({ ...prev, image_url: data.url }));
  };

  return (
    <div className="pt-40 pb-32 px-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-8">
        <div>
          <h1 className="text-5xl font-serif font-bold">Gestão de <span className="text-primary italic">Menu</span></h1>
          <p className="text-white/40 mt-2 text-lg">Controle total sobre os pratos e preços da Pizzaria Prince.</p>
        </div>
        <button 
          onClick={() => { setEditingItem({ name: '', description: '', price: 0, image_url: '', category: 'Pizza' }); setIsModalOpen(true); }}
          className="px-8 py-4 bg-primary hover:bg-primary-dark rounded-2xl font-bold flex items-center gap-3 shadow-xl shadow-primary/20 text-lg"
        >
          <Plus size={24} /> Novo Prato
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {menu.map(item => (
          <div key={item.id} className="glass p-8 rounded-[2.5rem] flex flex-col gap-6 border border-white/5 hover:border-primary/20 transition-all">
            <div className="relative aspect-video rounded-2xl overflow-hidden">
              <img src={item.image_url} className="w-full h-full object-cover" alt={item.name} referrerPolicy="no-referrer" />
              <div className="absolute top-4 right-4 px-3 py-1 bg-primary rounded-lg font-bold text-xs">
                {item.price}€
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-2xl">{item.name}</h3>
              <p className="text-white/40 text-sm line-clamp-2">{item.description}</p>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => { setEditingItem(item); setIsModalOpen(true); }}
                  className="flex-1 py-3 glass rounded-xl hover:text-primary transition-all flex items-center justify-center gap-2 font-bold border border-white/10"
                >
                  <Edit2 size={18} /> Editar
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="flex-1 py-3 glass rounded-xl hover:text-red-400 transition-all flex items-center justify-center gap-2 font-bold border border-white/10"
                >
                  <Trash2 size={18} /> Apagar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              className="glass p-12 rounded-[3.5rem] w-full max-w-3xl relative z-10 overflow-y-auto max-h-[90vh] border border-white/10 shadow-2xl"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors">
                <X size={32} />
              </button>
              <h2 className="text-4xl font-serif font-bold mb-10">
                {editingItem?.id ? 'Editar Prato' : 'Criar Novo Prato'}
              </h2>

              <form onSubmit={handleSave} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Nome do Prato</label>
                    <input 
                      type="text" 
                      value={editingItem?.name}
                      onChange={e => setEditingItem(prev => ({ ...prev!, name: e.target.value }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg" 
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Preço (€)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={editingItem?.price}
                      onChange={e => setEditingItem(prev => ({ ...prev!, price: parseFloat(e.target.value) }))}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg" 
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Descrição Detalhada</label>
                  <textarea 
                    rows={4}
                    value={editingItem?.description}
                    onChange={e => setEditingItem(prev => ({ ...prev!, description: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg resize-none" 
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30 ml-2">Imagem do Prato</label>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="text" 
                      value={editingItem?.image_url}
                      onChange={e => setEditingItem(prev => ({ ...prev!, image_url: e.target.value }))}
                      placeholder="URL da imagem (ex: https://...)"
                      className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all text-lg" 
                    />
                    <label className="px-8 py-4 glass rounded-2xl cursor-pointer hover:bg-white/10 transition-all flex items-center justify-center gap-3 border border-white/10 font-bold">
                      <Camera size={24} />
                      <span>Upload</span>
                      <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" />
                    </label>
                  </div>
                </div>

                {editingItem?.image_url && (
                  <div className="aspect-video rounded-3xl overflow-hidden border border-white/10">
                    <img src={editingItem.image_url} className="w-full h-full object-cover" alt="Preview" referrerPolicy="no-referrer" />
                  </div>
                )}

                <button className="w-full py-5 bg-primary hover:bg-primary-dark rounded-2xl font-bold transition-all text-xl shadow-xl shadow-primary/20">
                  Guardar Prato no Menu
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  const refreshMenu = useCallback(async () => {
    try {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenu(data);
      setLoadingMenu(false);
    } catch (error) {
      console.error('Failed to fetch menu:', error);
      setLoadingMenu(false);
    }
  }, []);

  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <MenuContext.Provider value={{ menu, loading: loadingMenu, refreshMenu }}>
      <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
        <Router>
          <div className="min-h-screen flex flex-col selection:bg-primary selection:text-white">
            <Navbar />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </main>
            <WhatsAppButton />
            <Footer />
          </div>
        </Router>
      </CartContext.Provider>
    </MenuContext.Provider>
  );
}
