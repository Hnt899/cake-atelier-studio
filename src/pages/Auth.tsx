import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const signupSchema = z.object({
  username: z.string().min(3, "Имя пользователя должно содержать минимум 3 символа").max(50),
  fullName: z.string().min(2, "Имя должно содержать минимум 2 символа").max(100),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Введите корректный номер телефона"),
  email: z.string().email("Введите корректный email").max(255),
  password: z.string().min(6, "Пароль должен содержать минимум 6 символов").max(100),
});

const loginSchema = z.object({
  identifier: z.string().min(1, "Введите username, email или телефон"),
  password: z.string().min(1, "Введите пароль"),
});

export const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [loading, setLoading] = useState(false);
  
  // Login form
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  
  // Signup form
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  
  // Verification
  const [verificationCode, setVerificationCode] = useState("");
  const [storedCode, setStoredCode] = useState("");
  const [tempEmail, setTempEmail] = useState("");

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      navigate("/");
    }
  };

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = signupSchema.parse({
        username,
        fullName,
        phone,
        email,
        password: signupPassword,
      });

      // Check if username exists
      const { data: existingUsername } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", validatedData.username)
        .maybeSingle();

      if (existingUsername) {
        toast.error("Это имя пользователя уже занято");
        setLoading(false);
        return;
      }

      // Generate and send verification code
      const code = generateCode();
      setStoredCode(code);
      setTempEmail(validatedData.email);

      const { data: existingCode } = await supabase
        .from("verification_codes")
        .select()
        .eq("email", validatedData.email)
        .maybeSingle();

      if (existingCode) {
        await supabase
          .from("verification_codes")
          .delete()
          .eq("email", validatedData.email);
      }

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await supabase.from("verification_codes").insert({
        email: validatedData.email,
        code,
        expires_at: expiresAt.toISOString(),
      });

      // Send email
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ email: validatedData.email, code }),
        }
      );

      if (!response.ok) {
        throw new Error("Не удалось отправить код подтверждения");
      }

      setMode("verify");
      toast.success("Код подтверждения отправлен на вашу почту");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Ошибка регистрации");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: codeData } = await supabase
        .from("verification_codes")
        .select()
        .eq("email", tempEmail)
        .eq("code", verificationCode)
        .maybeSingle();

      if (!codeData) {
        toast.error("Неверный код. Попробуйте еще раз.");
        setLoading(false);
        return;
      }

      if (new Date(codeData.expires_at) < new Date()) {
        toast.error("Код истек. Запросите новый.");
        setLoading(false);
        return;
      }

      // Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create profile
        const { error: profileError } = await supabase.from("profiles").insert({
          id: authData.user.id,
          username,
          full_name: fullName,
          phone,
          email: tempEmail,
        });

        if (profileError) throw profileError;

        // Delete verification code
        await supabase
          .from("verification_codes")
          .delete()
          .eq("email", tempEmail);

        toast.success("Регистрация завершена!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Ошибка подтверждения");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const code = generateCode();
      setStoredCode(code);

      await supabase
        .from("verification_codes")
        .delete()
        .eq("email", tempEmail);

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 10);

      await supabase.from("verification_codes").insert({
        email: tempEmail,
        code,
        expires_at: expiresAt.toISOString(),
      });

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-code`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ email: tempEmail, code }),
        }
      );

      if (!response.ok) throw new Error("Не удалось отправить код");

      toast.success("Новый код отправлен на вашу почту");
    } catch (error: any) {
      toast.error(error.message || "Ошибка отправки кода");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validatedData = loginSchema.parse({ identifier, password });

      // Check if identifier is email or username or phone
      const { data: profile } = await supabase
        .from("profiles")
        .select("email")
        .or(`username.eq.${validatedData.identifier},email.eq.${validatedData.identifier},phone.eq.${validatedData.identifier}`)
        .maybeSingle();

      if (!profile) {
        toast.error("Пользователь не найден");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: validatedData.password,
      });

      if (error) {
        if (error.message.includes("Invalid")) {
          toast.error("Неверный пароль");
        } else {
          toast.error(error.message);
        }
        setLoading(false);
        return;
      }

      toast.success("Добро пожаловать!");
      navigate("/");
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || "Ошибка входа");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">
              {mode === "login" && "Вход"}
              {mode === "signup" && "Регистрация"}
              {mode === "verify" && "Подтверждение"}
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            {mode === "login" && (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="identifier">Username, Email или Телефон</Label>
                  <Input
                    id="identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Введите username, email или телефон"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="password">Пароль</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Введите пароль"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Загрузка..." : "Войти"}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Нет аккаунта?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline"
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </form>
            )}
            
            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-4">
                <div>
                  <Label htmlFor="username">Имя пользователя (Username)*</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="username"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="fullName">Имя*</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ваше имя"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="phone">Номер телефона*</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+79991234567"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="signupPassword">Пароль*</Label>
                  <Input
                    id="signupPassword"
                    type="password"
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Минимум 6 символов"
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Загрузка..." : "Зарегистрироваться"}
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  Уже есть аккаунт?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-primary hover:underline"
                  >
                    Войти
                  </button>
                </p>
              </form>
            )}
            
            {mode === "verify" && (
              <form onSubmit={handleVerify} className="space-y-4">
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Мы отправили 6-значный код подтверждения на почту <strong>{tempEmail}</strong>
                </p>
                
                <div>
                  <Label htmlFor="code">Код подтверждения</Label>
                  <Input
                    id="code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Проверка..." : "Подтвердить"}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResendCode}
                  disabled={loading}
                >
                  Отправить код заново
                </Button>
                
                <p className="text-center text-sm text-muted-foreground">
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="text-primary hover:underline"
                  >
                    Вернуться к регистрации
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};
