import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import Imput from "../components/Imput";

const SignUp = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { signup, errs } = useAuth();
  
  const password = watch("password");

  const onSubmit = async (data) => {
    await signup(data);
  };

  return (
    <div className="h-[calc(100vh-68px)] flex items-center justify-center bg-zinc-950">
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-emerald-500">Registro</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="items-center flex flex-col gap-4">
          <Imput 
            type="email" 
            placeholder="Email" 
            {...register("email", { 
              required: "El email es requerido",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Email inválido"
              }
            })} 
          />
          {errors.email && <span className="text-red-600">{errors.email.message}</span>}
          
          <Imput 
            type="password" 
            placeholder="Contraseña" 
            {...register("password", { 
              required: "La contraseña es requerida",
              minLength: {
                value: 6,
                message: "La contraseña debe tener al menos 6 caracteres"
              }
            })} 
          />
          {errors.password && <span className="text-red-600">{errors.password.message}</span>}
          
          <Imput 
            type="password" 
            placeholder="Confirmar contraseña" 
            {...register("confirmPassword", { 
              required: "Confirma tu contraseña",
              validate: value => value === password || "Las contraseñas no coinciden"
            })} 
          />
          {errors.confirmPassword && <span className="text-red-600">{errors.confirmPassword.message}</span>}
          
          {errs && (
            <div className="text-red-600 text-center">
              {Array.isArray(errs) ? errs.map((err, index) => (
                <div key={index}>{err}</div>
              )) : errs}
            </div>
          )}
          
          <button 
            type="submit" 
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded mt-2"
          >
            Registrarse
          </button>
        </form>
      </Card>
    </div>
  );
};

export default SignUp;
