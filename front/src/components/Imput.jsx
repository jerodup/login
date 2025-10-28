export default function Imput({ type, name, placeholder, value, ...rest }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      className="bg-zinc-800 py-2 px-4 rounded border border-gray-600 text-white"
      {...rest}
    />
  );
}
