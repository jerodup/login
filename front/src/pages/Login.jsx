//import { useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext";
import {Card} from "../components/ui/Card";
import Imput from "../components/Imput";
import { Link } from "react-router-dom";

const Login = () => {

  const { register, handleSubmit, formState: { errors } } = useForm();

  const { signin, errs } = useAuth();
  const onSubmit = async (data) => {
    await signin(data);
  }
  //const { search } = useLocation();
  //const verified = new URLSearchParams(search).get("verified");

  return (
    <div className="h-[calc(100vh-68px)] flex items-center justify-center bg-zinc-950">
      {/* {verified && (
        <p className="text-green-600 font-semibold">
          ✅ Tu cuenta fue verificada correctamente.
        </p>
      )} */}
      {/* tu formulario de login */}
        
      <Card>
        <h2 className="text-2xl font-bold mb-4 text-emerald-500">Login</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="items-center flex flex-col gap-4  " >
          <Imput type="email" placeholder="Email" {...register("email", { required: true })} />
          {errors.email && <span className="text-red-600">El email es requerido</span>}
          
          <Imput type="password" placeholder="Password" {...register("password", { required: true })} />
          {errors.password && <span className="text-red-600">La contraseña es requerida</span>}
          <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded mt-2">Login</button>
          <Link to="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 mt-2">¿Olvidaste tu contraseña?</Link>
          </form>
      </Card>
    </div>
  );
};

export default Login;


//TODO: mirar cgpt el enfoque ondemand (está en utilidad accessToken) 