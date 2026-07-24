"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FaHospital, FaUserMd, FaLock } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        setError(result.error || "Credenciais invalidas");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Erro ao conectar ao servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md">
      {/* Crosshair top-left */}
      <div className="absolute -top-8 -left-8 text-[#333333] font-mono text-xs select-none">
        +
      </div>
      {/* Crosshair top-right */}
      <div className="absolute -top-8 -right-8 text-[#333333] font-mono text-xs select-none">
        +
      </div>
      {/* Crosshair bottom-left */}
      <div className="absolute -bottom-8 -left-8 text-[#333333] font-mono text-xs select-none">
        +
      </div>
      {/* Crosshair bottom-right */}
      <div className="absolute -bottom-8 -right-8 text-[#333333] font-mono text-xs select-none">
        +
      </div>

      <div className="border border-[#333333] bg-[#111111] p-0">
        {/* Header */}
        <div className="border-b border-[#333333] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white">
              <FaHospital className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-black uppercase tracking-[-0.04em] text-[#EAEAEA] leading-none">
                HOSPITAL GREGUITO
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777] mt-1">
                PLATAFORMA INTEGRADA DE GESTAO HOSPITALAR
              </p>
            </div>
          </div>
        </div>

        {/* Terminal-style metadata bar */}
        <div className="border-b border-[#333333] bg-[#0D0D0D] px-6 py-2 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777]">
            [ AUTH MODULE v2.6 ]
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777]">
            {new Date().toLocaleDateString("pt-BR")}{" "}
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Form */}
        <div className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="border border-[#E61919]/40 bg-[#E61919]/10 px-4 py-3 font-mono text-xs uppercase tracking-wider text-[#E61919]">
                [ ERROR ] {error}
              </div>
            )}

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">
                &gt; USUARIO
              </Label>
              <div className="relative">
                <FaUserMd className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#777777]" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Nome de usuario"
                  className="h-10 border border-[#333333] bg-[#0D0D0D] pl-10 font-mono text-xs text-[#EAEAEA] placeholder:text-[#444444] focus:border-[#E61919] focus:ring-0 rounded-none"
                  {...register("username")}
                />
              </div>
              {errors.username && (
                <p className="font-mono text-[10px] uppercase text-[#E61919]">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">
                &gt; SENHA
              </Label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#777777]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  className="h-10 border border-[#333333] bg-[#0D0D0D] pl-10 font-mono text-xs text-[#EAEAEA] placeholder:text-[#444444] focus:border-[#E61919] focus:ring-0 rounded-none"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="font-mono text-[10px] uppercase text-[#E61919]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-10 w-full bg-[#E61919] text-white font-mono text-xs uppercase tracking-[0.1em] hover:bg-[#CC1515] rounded-none border-0"
              disabled={loading}
            >
              {loading ? "[ AUTENTICANDO... ]" : "[ ENTRAR NO SISTEMA ]"}
            </Button>

            <div className="pt-2 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#444444]">
                CONEXAO CRIPTOGRAFADA SSL END-TO-END
              </p>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="border-t border-[#333333] bg-[#0D0D0D] px-6 py-2">
          <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#333333] text-center">
            REV 2.6 &middot; UNIT / AUTH-01 &middot; HOSPITAL GREGUITO &copy;
            2026
          </p>
        </div>
      </div>
    </div>
  );
}
