import { useForm } from "react-hook-form";
import client from "../api/axios";
import { useState } from "react";
import { Card } from "../components/ui/Card";
import Imput from "../components/Imput";

const ForgotPassword = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ email }) => {
    try {
      setLoading(true);
      setMessage("");
      await client.post("/auth/forgot-password", { email });
      setMessage("Si el correo existe, te enviamos instrucciones.");
      reset();
    } catch (err) {
      setMessage("Ocurrió un error. Intentá nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-68px)] flex items-center justify-center bg-zinc-950">
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-emerald-500">Recuperar contraseña</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="items-center flex flex-col gap-4">
          <Imput type="email" placeholder="Email" {...register("email", { required: true })} />
          {errors.email && <span className="text-red-600">El email es requerido</span>}
          <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded mt-2">
            {loading ? "Enviando..." : "Enviar instrucciones"}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
      </Card>
    </div>
  );
};

export default ForgotPassword;


