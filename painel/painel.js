/* =========================================================
   GONÇALVES CÂMBIO
   PAINEL ADMINISTRATIVO
   LOGIN SUPABASE
========================================================= */


/* =========================================================
   CONFIGURAÇÃO SUPABASE
========================================================= */

const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE ";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   ELEMENTOS
========================================================= */

const loginForm =
  document.getElementById(
    "loginForm"
  );

const emailInput =
  document.getElementById(
    "email"
  );

const passwordInput =
  document.getElementById(
    "password"
  );

const loginBtn =
  document.getElementById(
    "loginBtn"
  );

const loginMessage =
  document.getElementById(
    "loginMessage"
  );

const mostrarSenha =
  document.getElementById(
    "mostrarSenha"
  );


/* =========================================================
   MENSAGEM
========================================================= */

function mostrarMensagem(
  texto,
  tipo = "error"
) {

  loginMessage.textContent =
    texto;

  loginMessage.className =
    "login-message " + tipo;

}


/* =========================================================
   MOSTRAR / OCULTAR SENHA
========================================================= */

mostrarSenha.addEventListener(
  "click",
  function() {

    if (
      passwordInput.type ===
      "password"
    ) {

      passwordInput.type =
        "text";

      mostrarSenha.textContent =
        "🙈";

    } else {

      passwordInput.type =
        "password";

      mostrarSenha.textContent =
        "👁️";

    }

  }
);


/* =========================================================
   VERIFICAR SESSÃO
========================================================= */

async function verificarSessao() {

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
      "Usuário já autenticado."
    );

    abrirPainel();

  }

}


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();


    const email =
      emailInput.value
        .trim();

    const password =
      passwordInput.value;


    if (!email || !password) {

      mostrarMensagem(
        "Digite seu e-mail e sua senha."
      );

      return;

    }


    loginBtn.disabled =
      true;

    loginBtn.textContent =
      "Entrando...";

    mostrarMensagem(
      ""
    );


    try {

      const {
        data,
        error
      } =
        await supabaseClient
          .auth
          .signInWithPassword({

            email:
              email,

            password:
              password

          });


      if (error) {

        console.error(
          "Erro de login:",
          error
        );


        mostrarMensagem(
          "E-mail ou senha incorretos."
        );


        loginBtn.disabled =
          false;

        loginBtn.textContent =
          "Entrar no painel";

        return;

      }


      if (
        !data ||
        !data.session
      ) {

        mostrarMensagem(
          "Não foi possível criar a sessão."
        );


        loginBtn.disabled =
          false;

        loginBtn.textContent =
          "Entrar no painel";

        return;

      }


      mostrarMensagem(
        "Login realizado com sucesso!",
        "success"
      );


      setTimeout(
        function() {

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
        "Ocorreu um erro. Tente novamente."
      );


      loginBtn.disabled =
        false;

      loginBtn.textContent =
        "Entrar no painel";

    }

  }
);


/* =========================================================
   ABRIR PAINEL
========================================================= */

function abrirPainel() {

  /*
    Depois vamos criar o painel administrativo.

    Por enquanto, envia para:
    painel/dashboard.html
  */

  window.location.href =
    "dashboard.html";

}


/* =========================================================
   OBSERVAR ALTERAÇÕES DE LOGIN
========================================================= */

supabaseClient
  .auth
  .onAuthStateChange(
    function(event, session) {

      console.log(
        "Auth:",
        event
      );


      if (
        event ===
        "SIGNED_OUT"
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

verificarSessao();
