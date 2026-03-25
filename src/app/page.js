"use client";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const handleLogin = () => {
    // Aquí iría la lógica de LR Focus, por ahora solo saltamos
    router.push("/juegos");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#0f172a] p-4">
      <div className="bg-white text-gray-900 p-10 rounded-3xl shadow-2xl w-full max-w-md text-center border-t-8 border-blue-600">
        <h1 className="text-4xl font-black mb-2 text-blue-600 tracking-tighter">LR FOCUS</h1>
        <p className="text-gray-500 mb-8 font-medium">Plataforma de Beneficios Corporativos</p>
        <button 
          onClick={handleLogin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg active:scale-95 text-lg"
        >
          Loguear con LR Focus
        </button>
      </div>
    </main>
  );
}