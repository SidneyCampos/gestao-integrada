import { useState } from "react";
import { Lock, User, ArrowRight } from "lucide-react";
import axios from "axios";

export default function Login({ onLogin }) {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleEntrar = async (e) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      // Bate no nosso backend oficial enviando o que o usuário digitou
      const resposta = await axios.post("/api/core/login", {
        login: login,
        senha: senha,
      });

      // Se o backend disser OK, passamos os dados do usuário para o App.jsx
      onLogin(resposta.data);
    } catch (error) {
      // Se for erro 401 (senha incorreta), mostramos a mensagem que o backend mandou
      if (error.response && error.response.status === 401) {
        setErro(error.response.data.erro);
      } else {
        setErro("Erro de conexão com o servidor da prefeitura.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[100%] h-[100%] rounded-full bg-blue-900/20 blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-[100%] h-[100%] rounded-full bg-emerald-900/10 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white p-4 rounded-2xl shadow-xl w-32 h-32 mx-auto flex items-center justify-center mb-8 border border-slate-100">
          <img
            src="/logo-circular.png"
            alt="Logo Prefeitura"
            className="w-full h-full object-contain"
          />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white tracking-tight">
          Gestão Integrada
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Acesso restrito a servidores autorizados
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-4 shadow-2xl sm:rounded-2xl sm:px-10 border border-slate-100">
          <form className="space-y-6" onSubmit={handleEntrar}>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Usuário do Sistema
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Seu login"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 outline-none border transition-colors bg-slate-50 focus:bg-white"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Senha de Acesso
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="Sua senha"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-slate-300 rounded-lg py-3 outline-none border transition-colors bg-slate-50 focus:bg-white"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                <p className="text-sm text-red-700 font-medium">{erro}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={carregando}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-all items-center group"
              >
                {carregando ? "Autenticando..." : "Acessar Sistema"}
                {!carregando && (
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
