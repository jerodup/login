import { useAuth } from "../context/AuthContext";
import shop from "../assets/shop.svg";

export default function Home() {
  const data = useAuth();
  console.log(data);

  return (
    <div className="h-[calc(100vh-68px)] flex items-center justify-center bg-zinc-950">
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto items-center p-4">
        
        {/* Texto primero en móvil, segundo en escritorio */}
        <div className="order-1 md:order-2 text-center md:text-left">
          <h1 className="text-4xl font-bold text-emerald-500 mb-4">
            Welcome to the E-commerce Platform
          </h1>
          <p className="text-white text-lg">
            Explore our products and manage your account through the dashboard.
          </p>
        </div>

        {/* Imagen segundo en móvil, primero en escritorio */}
        <div className="order-2 md:order-1 flex justify-center">
          <img src={shop} alt="shop" className="max-w-sm w-full" />
        </div>
      </div>
    </div>
  );
}
