import { useState } from "react";
import { Eye, EyeClosed } from "lucide-react";

function PasswordInput({ dialog, password, setPassword, setError }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        type={showPassword ? "text" : "password"}
        placeholder={dialog === 0 ? "Password" : "Set a password"}
        className="px-4 py-2 bg-gray-100 rounded-md w-full border border-2 border-gray-200"
        onChange={(e) => {
          setPassword(e.target.value);
          setError('');
        }}
        value={password}
      />

      <span
        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
        onClick={() => setShowPassword(prev => !prev)}
      >
        {showPassword ? <EyeClosed/> : <Eye/>}
      </span>
    </div>
  );
}

export default PasswordInput;
