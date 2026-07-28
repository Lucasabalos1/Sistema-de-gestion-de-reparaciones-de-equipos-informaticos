import { useAuth } from "../context/AuthContext"
import { Layout } from "../Components/Global/Layout"

export const Dashboard = () => {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="max-w-4xl">
        <h1 className="text-primary text-3xl font-bold mb-2">
          {user?.nombre} {user?.apellido}
        </h1>
        <p className="text-text-muted text-lg">
          Bienvenido a ByteMend
        </p>
      </div>
    </Layout>
  )
}
