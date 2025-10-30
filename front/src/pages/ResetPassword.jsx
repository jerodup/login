import { useForm } from "react-hook-form";
import client from "../api/axios";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Card } from "../components/ui/Card";
import Imput from "../components/Imput";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async ({ password, confirm }) => {
    if (password !== confirm) return;
    try {
      setLoading(true);
      setMessage("");
      await client.post("/auth/reset-password", { token, password });
      setMessage("Contraseña actualizada. Redirigiendo al login...");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setMessage("El enlace es inválido o expiró.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="h-[calc(100vh-68px)] flex items-center justify-center bg-zinc-950">
        <Card>
          <p className="text-red-500">Token faltante.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-68px)] flex items-center justify-center bg-zinc-950">
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-emerald-500">Restablecer contraseña</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="items-center flex flex-col gap-4">
          <Imput type="password" placeholder="Nueva contraseña" {...register("password", { required: true, minLength: 6 })} />
          {errors.password && <span className="text-red-600">Mínimo 6 caracteres</span>}
          <Imput type="password" placeholder="Confirmar contraseña" {...register("confirm", { required: true, validate: (v) => v === watch("password") })} />
          {errors.confirm && <span className="text-red-600">Las contraseñas no coinciden</span>}
          <button type="submit" disabled={loading} className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2 px-4 rounded mt-2">
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-zinc-300">{message}</p>}
      </Card>
    </div>
  );
};

export default ResetPassword;


