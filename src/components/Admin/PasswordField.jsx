import { useState } from "react";
import { SvgEye, SvgEyeOff } from "../../icons.jsx";

const PasswordField = ({ inputClassName, ...inputProps }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="gnz-password-field">
      <input {...inputProps} className={inputClassName} type={visible ? "text" : "password"} />
      <button
        type="button"
        className="gnz-password-toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
        aria-pressed={visible}
      >
        {visible ? <SvgEyeOff /> : <SvgEye />}
      </button>
    </div>
  );
};

export default PasswordField;
