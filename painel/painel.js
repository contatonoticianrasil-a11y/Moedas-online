/* =========================================================
   GONÇALVES CÂMBIO
   PAINEL ADMINISTRATIVO
   LOGIN SUPABASE - V1
========================================================= */


/* =========================================================
   CONFIGURAÇÃO SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE";


/* =========================================================
   CONEXÃO SUPABASE
========================================================= */

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   ELEMENTOS
========================================================= */

const loginForm =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const loginBtn =
  document.getElementById("loginBtn");

const loginMessage =
  document.getElementById("loginMessage");

const mostrarSenha =
  document.getElementById("mostrarSenha");


/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagem(
  texto,
  tipo = "error"
) {

  if (!loginMessage) return;

  loginMessage.textContent = texto;

  loginMessage.className =
    "login-message " + tipo;
}


/* =========================================================
   MOSTRAR / OCULTAR SENHA
========================================================= */

if (mostrarSenha) {

  mostrarSenha.addEventListener(
    "click",
    function () {

      if (
        passwordInput.type === "password"
      ) {

        passwordInput.type = "text";

        mostrarSenha.textContent = "🙈";

      } else {

        passwordInput.type = "password";

        mostrarSenha.textContent = "👁️";

      }

    }
  );

}


/* =========================================================
   ABRIR DASHBOARD
========================================================= */

function abrirPainel() {

  window.location.href =
    "dashboard.html";

}


/* =========================================================
   VERIFICAR SESSÃO
========================================================= */

async function verificarSessao() {

  try {

    const {
      data,
      error
    } =
      await supabaseClient
        .auth
        .getSession();


    if (error) {

      console.error(
        "Erro ao verificar sessão:",
        error
      );

      return;

    }


    if (
      data &&
      data.session
    ) {

      console.log(
        "Usuário já está autenticado."
      );

      abrirPainel();

    }

  } catch (erro) {

    console.error(
      "Erro inesperado:",
      erro
    );

  }

}


/* =========================================================
   LOGIN
========================================================= */

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async function (event) {

      event.preventDefault();


      const email =
        emailInput.value.trim();

      const password =
        passwordInput.value;


      /* =========================
         VALIDAÇÃO
      ========================= */

      if (!email || !password) {

        mostrarMensagem(
          "Digite seu e-mail e sua senha."
        );

        return;

      }


      /* =========================
         BOTÃO
      ========================= */

      loginBtn.disabled = true;

      loginBtn.textContent =
        "Entrando...";

      mostrarMensagem("");


      try {

        /* =========================
           LOGIN SUPABASE
        ========================= */

        const {
          data,
          error
        } =
          await supabaseClient
            .auth
            .signInWithPassword({

              email: email,

              password: password

            });


        /* =========================
           ERRO
        ========================= */

        if (error) {

          console.error(
            "Erro Supabase:",
            error
          );


          mostrarMensagem(
            "E-mail ou senha incorretos."
          );


          loginBtn.disabled = false;

          loginBtn.textContent =
            "Entrar no painel";

          return;

        }


        /* =========================
           SESSÃO
        ========================= */

        if (
          !data ||
          !data.session
        ) {

          mostrarMensagem(
            "Não foi possível iniciar a sessão."
          );


          loginBtn.disabled = false;

          loginBtn.textContent =
            "Entrar no painel";

          return;

        }


        /* =========================
           SUCESSO
        ========================= */

        mostrarMensagem(
          "Login realizado com sucesso!",
          "success"
        );


        setTimeout(
          function () {

            abrirPainel();

          },
          500
        );

      } catch (erro) {

        console.error(
          "Erro inesperado:",
          erro
        );


        mostrarMensagem(
          "Erro de conexão. Tente novamente."
        );


        loginBtn.disabled = false;

        loginBtn.textContent =
          "Entrar no painel";

      }

    }
  );

}


/* =========================================================
   OBSERVAR AUTENTICAÇÃO
========================================================= */

supabaseClient
  .auth
  .onAuthStateChange(
    function (event, session) {

      console.log(
        "Supabase Auth:",
        event
      );


      if (
        event === "SIGNED_OUT"
      ) {

        console.log(
          "Usuário saiu."
        );

      }

    }
  );


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function () {

    console.log(
      "Gonçalves Câmbio - Login iniciado."
    );

    verificarSessao();

  }
);
