import { Check, Circle } from "lucide-react";

export const passwordRules = [
  { id: "length", label: "De 8 a 72 caracteres", met: (value: string) => value.length >= 8 && value.length <= 72 },
  { id: "lower", label: "Uma letra minúscula", met: (value: string) => /[a-z]/.test(value) },
  { id: "upper", label: "Uma letra maiúscula", met: (value: string) => /[A-Z]/.test(value) },
  { id: "digit", label: "Um número", met: (value: string) => /\d/.test(value) },
];

export function PasswordRules({ id, value }: { id: string; value: string }) {
  return (
    <ul id={id} aria-label="Requisitos da senha" className="grid gap-1">
      {passwordRules.map((rule) => {
        const met = rule.met(value);
        return (
          <li key={rule.id} className={met ? "flex items-center gap-2 text-sm text-success-foreground" : "flex items-center gap-2 text-sm text-muted"}>
            {met ? <Check aria-hidden size={14} /> : <Circle aria-hidden size={14} />}
            <span>{rule.label}</span>
            <span className="sr-only">{met ? ", atendido" : ", pendente"}</span>
          </li>
        );
      })}
    </ul>
  );
}
