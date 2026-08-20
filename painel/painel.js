/* =========================================================
   GONÇALVES CÂMBIO
   PAINEL DE PROPAGANDAS
========================================================= */

const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================================
   ELEMENTOS
========================================================= */

const loginPage =
  document.getElementById("loginPage");

const adminPage =
  document.getElementById("adminPage");

const loginForm =
  document.getElementById("loginForm");

const loginMessage =
  document.getElementById("loginMessage");

const loginBtn =
  document.getElementById("loginBtn");

const formSection =
  document.getElementById("formSection");

const anuncioForm =
  document.getElementById("anuncioForm");

const anunciosLista =
  document.getElementById("anunciosLista");


/* =========================================================
   MENSAGEM
========================================================= */

function mensagem(elemento, texto, tipo = "") {

  if (!elemento) return;

  elemento.textContent = texto;

  elemento.className = tipo;

}


/* =========================================================
   MOSTRAR PAINEL
========================================================= */

async function mostrarPainel() {

  const {
    data,
    error
  } =
    await supabaseClient
      .auth
      .getSession();

  if (
    error ||
    !data ||
    !data.session
  ) {

    mostrarLogin();

    return;

  }

  loginPage.classList.add("hidden");

  adminPage.classList.remove("hidden");

  const email =
    document.getElementById("userEmail");

  if (email) {

    email.textContent =
      data.session.user.email;

  }

  const ano =
    document.getElementById("ano");

  if (ano) {

    ano.textContent =
      new Date().getFullYear();

  }

  carregarAnuncios();

}


/* =========================================================
   MOSTRAR LOGIN
========================================================= */

function mostrarLogin() {

  loginPage.classList.remove("hidden");

  adminPage.classList.add("hidden");

}


/* =========================================================
   LOGIN
========================================================= */

loginForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const email =
      document.getElementById("email")
        .value
        .trim();

    const password =
      document.getElementById("password")
        .value;

    if (!email || !password) {

      mensagem(
        loginMessage,
        "Digite seu e-mail e sua senha.",
        "error"
      );

      return;

    }

    loginBtn.disabled = true;

    loginBtn.textContent =
      "Entrando...";

    mensagem(
      loginMessage,
      ""
    );

    const {
      data,
      error
    } =
      await supabaseClient
        .auth
        .signInWithPassword({
          email,
          password
        });

    if (error) {

      console.error(error);

      mensagem(
        loginMessage,
        "E-mail ou senha incorretos.",
        "error"
      );

      loginBtn.disabled = false;

      loginBtn.textContent =
        "Entrar no painel";

      return;

    }

    mensagem(
      loginMessage,
      "Login realizado com sucesso!",
      "success"
    );

    setTimeout(
      mostrarPainel,
      400
    );

  }
);


/* =========================================================
   LOGOUT
========================================================= */

document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    async function() {

      await supabaseClient
        .auth
        .signOut({
          scope: "local"
        });

      window.location.href =
        "index.html";

    }
  );


/* =========================================================
   NOVO ANÚNCIO
========================================================= */

document
  .getElementById("novoAnuncioBtn")
  .addEventListener(
    "click",
    function() {

      abrirFormulario();

    }
  );


/* =========================================================
   ABRIR FORMULÁRIO
========================================================= */

function abrirFormulario(anuncio = null) {

  formSection.classList.remove("hidden");

  mensagem(
    document.getElementById("formMessage"),
    ""
  );

  if (!anuncio) {

    document.getElementById(
      "formTitle"
    ).textContent =
      "➕ Nova propaganda";

    anuncioForm.reset();

    document.getElementById(
      "anuncioId"
    ).value = "";

    document.getElementById(
      "ativo"
    ).value = "true";

    document.getElementById(
      "intervalo"
    ).value = "0";

    return;

  }

  document.getElementById(
    "formTitle"
  ).textContent =
    "✏️ Editar propaganda";

  document.getElementById(
    "anuncioId"
  ).value =
    anuncio.id;

  document.getElementById(
    "titulo"
  ).value =
    anuncio.titulo || "";

  document.getElementById(
    "imagem"
  ).value =
    anuncio.imagem || "";

  document.getElementById(
    "link"
  ).value =
    anuncio.link || "";

  document.getElementById(
    "descricao"
  ).value =
    anuncio.descricao || "";

  document.getElementById(
    "ativo"
  ).value =
    String(anuncio.ativo);

  document.getElementById(
    "intervalo"
  ).value =
    anuncio.intervalo || 0;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   CANCELAR
========================================================= */

document
  .getElementById("cancelarBtn")
  .addEventListener(
    "click",
    function() {

      formSection.classList.add(
        "hidden"
      );

      anuncioForm.reset();

    }
  );


/* =========================================================
   SALVAR
========================================================= */

anuncioForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const id =
      document.getElementById(
        "anuncioId"
      ).value;

    const titulo =
      document.getElementById(
        "titulo"
      ).value.trim();

    const imagem =
      document.getElementById(
        "imagem"
      ).value.trim();

    const link =
      document.getElementById(
        "link"
      ).value.trim();

    const descricao =
      document.getElementById(
        "descricao"
      ).value.trim();

    const ativo =
      document.getElementById(
        "ativo"
      ).value === "true";

    const intervalo =
      Number(
        document.getElementById(
          "intervalo"
        ).value
      ) || 0;

    const salvarBtn =
      document.getElementById(
        "salvarBtn"
      );

    salvarBtn.disabled = true;

    salvarBtn.textContent =
      "Salvando...";

    const dados = {

      titulo,
      imagem,
      link,
      descricao,
      ativo,
      intervalo

    };

    let resultado;

    if (id) {

      resultado =
        await supabaseClient
          .from("anuncios")
          .update(dados)
          .eq("id", id);

    } else {

      resultado =
        await supabaseClient
          .from("anuncios")
          .insert([dados]);

    }

    if (resultado.error) {

      console.error(
        resultado.error
      );

      mensagem(
        document.getElementById(
          "formMessage"
        ),
        "Erro ao salvar. Verifique se a tabela anuncios foi criada.",
        "error"
      );

      salvarBtn.disabled = false;

      salvarBtn.textContent =
        "💾 Salvar propaganda";

      return;

    }

    mensagem(
      document.getElementById(
        "formMessage"
      ),
      "Propaganda salva com sucesso!",
      "success"
    );

    salvarBtn.disabled = false;

    salvarBtn.textContent =
      "💾 Salvar propaganda";

    anuncioForm.reset();

    document.getElementById(
      "anuncioId"
    ).value = "";

    document.getElementById(
      "ativo"
    ).value = "true";

    document.getElementById(
      "intervalo"
    ).value = "0";

    setTimeout(
      function() {

        formSection.classList.add(
          "hidden"
        );

        carregarAnuncios();

      },
      600
    );

  }
);


/* =========================================================
   CARREGAR ANÚNCIOS
========================================================= */

async function carregarAnuncios() {

  anunciosLista.innerHTML = `
    <div class="loading">
      ⏳ Carregando propagandas...
    </div>
  `;

  const {
    data,
    error
  } =
    await supabaseClient
      .from("anuncios")
      .select("*")
      .order(
        "created_at",
        {
          ascending: false
        }
      );

  if (error) {

    console.error(error);

    anunciosLista.innerHTML = `
      <div class="empty">
        ❌ Não foi possível carregar as propagandas.
        <br><br>
        Verifique se a tabela <strong>anuncios</strong>
        foi criada no Supabase.
      </div>
    `;

    return;

  }

  if (!data || data.length === 0) {

    anunciosLista.innerHTML = `
      <div class="empty">
        📢 Nenhuma propaganda cadastrada.
        <br><br>
        Clique em <strong>Nova propaganda</strong>
        para cadastrar a primeira.
      </div>
    `;

    return;

  }

  anunciosLista.innerHTML = "";

  data.forEach(
    function(anuncio) {

      const item =
        document.createElement("div");

      item.className =
        "anuncio-item";

      const imagem =
        anuncio.imagem
          ? `
            <img
              class="anuncio-image"
              src="${anuncio.imagem}"
              alt="${anuncio.titulo || "Anúncio"}"
              onerror="this.style.display='none'"
            >
          `
          : `
            <div class="anuncio-image placeholder">
              📢
            </div>
          `;

      item.innerHTML = `

        ${imagem}

        <div class="anuncio-info">

          <h3>
            ${escapar(anuncio.titulo)}
          </h3>

          <p>
            ${escapar(
              anuncio.descricao || ""
            )}
          </p>

          <div class="anuncio-link">
            ${escapar(anuncio.link)}
          </div>

          <span class="status ${
            anuncio.ativo
              ? "ativo"
              : "inativo"
          }">

            ${
              anuncio.ativo
                ? "🟢 Ativo"
                : "🔴 Inativo"
            }

          </span>

        </div>

        <div class="anuncio-actions">

          <button
            class="btn-edit"
            data-action="edit"
            data-id="${anuncio.id}"
          >
            ✏️
          </button>

          <button
            class="btn-toggle"
            data-action="toggle"
            data-id="${anuncio.id}"
          >
            ${
              anuncio.ativo
                ? "🔴"
                : "🟢"
            }
          </button>

          <button
            class="btn-delete"
            data-action="delete"
            data-id="${anuncio.id}"
          >
            🗑️
          </button>

        </div>

      `;

      anunciosLista.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   AÇÕES DOS ANÚNCIOS
========================================================= */

anunciosLista.addEventListener(
  "click",
  async function(event) {

    const botao =
      event.target.closest("button");

    if (!botao) return;

    const id =
      botao.dataset.id;

    const action =
      botao.dataset.action;

    if (!id) return;

    if (action === "edit") {

      const {
        data,
        error
      } =
        await supabaseClient
          .from("anuncios")
          .select("*")
          .eq("id", id)
          .single();

      if (error) {

        alert(
          "Não foi possível carregar o anúncio."
        );

        return;

      }

      abrirFormulario(data);

    }


    if (action === "toggle") {

      const {
        data,
        error
      } =
        await supabaseClient
          .from("anuncios")
          .select("ativo")
          .eq("id", id)
          .single();

      if (error) {

        alert(
          "Erro ao consultar anúncio."
        );

        return;

      }

      await supabaseClient
        .from("anuncios")
        .update({
          ativo: !data.ativo
        })
        .eq("id", id);

      carregarAnuncios();

    }


    if (action === "delete") {

      const confirmar =
        confirm(
          "Tem certeza que deseja excluir esta propaganda?"
        );

      if (!confirmar) return;

      const {
        error
      } =
        await supabaseClient
          .from("anuncios")
          .delete()
          .eq("id", id);

      if (error) {

        alert(
          "Não foi possível excluir."
        );

        return;

      }

      carregarAnuncios();

    }

  }
);


/* =========================================================
   ATUALIZAR
========================================================= */

document
  .getElementById("atualizarBtn")
  .addEventListener(
    "click",
    carregarAnuncios
  );


/* =========================================================
   SEGURANÇA — ESCAPAR HTML
========================================================= */

function escapar(valor) {

  return String(valor || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    mostrarPainel();

  }
);
