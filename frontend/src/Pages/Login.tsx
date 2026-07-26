import { useState } from "react"
import Logo from "../assets/Logo.webp"
import { About } from "../Components/Login/About"
import { useLogin } from "../Hooks/useLogin"

export const Login = () => {
  const [usuario, setUsuario] = useState<string>("")
  const [contrasena, setContrasena] = useState<string>("")
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const {handleLogin, isLoading, error} = useLogin()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    handleLogin(usuario, contrasena)
  }

  return (
    <>
      {/* Keyframes para la animación de las ondas */}
      <style>{`
        @keyframes wave-move-x {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes wave-move-y {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>

      <div className="min-h-screen bg-background flex flex-col md:items-center md:justify-center">

        {/* Card contenedor */}
        <div className="w-full md:w-200 md:h-125 md:bg-surface md:border md:border-muted md:rounded-2xl md:overflow-hidden md:flex md:flex-row md:shadow-2xl">

          {/* === ZONA IZQUIERDA / SUPERIOR (Logo) === */}
          <div className="relative z-10 flex flex-col items-center justify-center py-12 px-6 md:w-1/2 md:py-0 md:overflow-hidden bg-surface">

            {/* Logo */}
            <div className="mb-2 w-40 h-40 md:w-52 md:h-52">
              <img src={Logo} alt="ByteMend Logo" className="object-contain" />
            </div>

            {/* Link "Que es ByteMend?" */}
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="text-text-muted text-sm hover:text-accent transition-colors duration-200 cursor-pointer z-20"
            >
              ¿Qué es ByteMend?
            </button>

            {/* Onda inferior - MOBILE */}
            <div className="block md:hidden absolute bottom-0 left-0 w-full overflow-hidden leading-none">
              <svg
                viewBox="0 0 2880 200"
                xmlns="http://www.w3.org/2000/svg"
                className="block w-[200%] h-20"
                style={{ animation: "wave-move-x 8s linear infinite" }}
                preserveAspectRatio="none"
              >
                <path
                  d="M0,80 C180,200 360,0 540,100 C720,200 900,0 1080,80 C1260,160 1350,40 1440,80 C1620,200 1800,0 1980,100 C2160,200 2340,0 2520,80 C2700,160 2790,40 2880,80 L2880,200 L0,200 Z"
                  className="fill-background"
                />
              </svg>
            </div>

            {/* Onda vertical - PC (anclada al borde derecho del panel izquierdo) */}
            <div className="hidden md:block absolute right-0 inset-y-0 w-15 overflow-hidden">
              <svg
                viewBox="0 0 60 1000"
                xmlns="http://www.w3.org/2000/svg"
                className="block w-full h-[200%]"
                style={{ animation: "wave-move-y 10s linear infinite" }}
                preserveAspectRatio="none"
              >
                <path
                  d="M0,0 C30,50 0,100 30,150 C60,200 0,250 30,300 C60,350 0,400 30,450 C60,500 0,550 30,600 C60,650 0,700 30,750 C60,800 0,850 30,900 C60,950 0,1000 30,1000 L0,1000 Z"
                  className="fill-background"
                />
              </svg>
            </div>
          </div>

          {/* === ZONA DERECHA / INFERIOR (Formulario) === */}
          <div className="flex flex-col items-center justify-center py-10 px-6 bg-background md:w-1/2">

            {/* Título */}
            <h1 className="text-primary text-2xl font-bold mb-8 tracking-wide">
              Iniciar Sesión
            </h1>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="w-full max-w-xs flex flex-col gap-5">

              {/* Input Usuario */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="usuario" className="text-text-muted text-sm font-medium">
                  Usuario
                </label>
                <input
                  id="usuario"
                  type="text"
                  value={usuario}
                  onChange={(e) => setUsuario(e.target.value)}
                  placeholder="Ingrese su usuario"
                  className="w-full bg-surface border border-muted rounded-lg px-4 py-2.5 text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200"
                />
              </div>

              {/* Input Contraseña */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="contrasena" className="text-text-muted text-sm font-medium">
                  Contraseña
                </label>
                <input
                  id="contrasena"
                  type="password"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  placeholder="Ingrese su contraseña"
                  className="w-full bg-surface border border-muted rounded-lg px-4 py-2.5 text-text text-sm placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors duration-200"
                />
              </div>

              {/* Mensaje de error */}
              {error && <p className="text-danger text-xs">{error}</p>}

              {/* Botón Ingresar */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent hover:bg-accent/80 text-white font-semibold py-2.5 rounded-lg transition-colors duration-200 mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Ingresando..." : "Ingresar"}
              </button>

            </form>
          </div>
        </div>
      </div>

      {/* === MODAL ABOUT === */}
      <About isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
