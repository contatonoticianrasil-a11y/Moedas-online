/* =========================================================
   GONÇALVES CÂMBIO
   PAINEL DE ANÚNCIOS
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

const formSection =
  document.getElementById("formSection");

const anuncioForm =
  document.getElementById("anuncioForm");

const listaAnuncios =
  document.getElementById("listaAnuncios");

const preview =
  document.getElementById("preview");

const formMessage =
  document.getElementById("formMessage");


/* =========================================================
   LOGIN
========================================================= */

async function verificarLogin() {

  const {
    data,
    error
  } = await supabaseClient.auth.getSession();

  if (
    error ||
    !data ||
    !data.session
  ) {

    window.location.href =
      "index.html";

    return false;

  }

  const usuario =
    document.getElementById("usuarioLogado");

  if (usuario) {

    usuario.textContent =
      data.session.user.email ||
      "Administrador";

  }

  return true;

}


/* =========================================================
   MENSAGEM
========================================================= */

function mensagem(texto, tipo = "") {

  if (!formMessage) return;

  formMessage.textContent =
    texto;

  formMessage.className =
    "message " + tipo;

}


/* =========================================================
   CARREGAR ANÚNCIOS
========================================================= */

async function carregarAnuncios() {

  if (!listaAnuncios) return;

  listaAnuncios.innerHTML = `
    <div class="loading">
      ⏳ Carregando anúncios...
    </div>
  `;

  const {
    data,
    error
  } = await supabaseClient
    .from("anuncios")
    .select("*")
    .order("created_at", {
      ascending: false
    });

  if (error) {

    console.error(error);

    listaAnuncios.innerHTML = `
      <div class="error">
        ❌ Erro ao carregar anúncios.<br><br>
        Verifique se a tabela "anuncios" foi criada no Supabase.
      </div>
    `;

    return;

  }

  if (!data || data.length === 0) {

    listaAnuncios.innerHTML = `
      <div class="empty">
        📢 Nenhum anúncio cadastrado ainda.
      </div>
    `;

    preview.innerHTML = `
      <div class="preview-empty">
        Nenhum anúncio selecionado.
      </div>
    `;

    return;

  }

  listaAnuncios.innerHTML = "";

  data.forEach(anuncio => {

    const item =
      document.createElement("div");

    item.className =
      "ad-item";

    item.innerHTML = `

      <div class="ad-image">

        ${
          anuncio.imagem
            ? `<img
                src="${anuncio.imagem}"
                alt="${anuncio.titulo || "Anúncio"}"
                onerror="this.style.display='none';"
              >`
            : `<div class="ad-no-image">
                Sem imagem
              </div>`
        }

      </div>


      <div class="ad-info">

        <h4>
          ${escapar(anuncio.titulo)}
        </h4>

        <p>
          🔗 ${escapar(anuncio.link)}
        </p>

        <span
          class="status ${
            anuncio.ativo
              ? "active"
              : "inactive"
          }"
        >
          ${
            anuncio.ativo
              ? "🟢 Ativo"
              : "🔴 Desativado"
          }
        </span>

      </div>


      <div class="ad-actions">

        <button
          class="edit-btn"
          onclick="editarAnuncio('${anuncio.id}')"
        >
          ✏️ Editar
        </button>

        <button
          class="delete-btn"
          onclick="excluirAnuncio('${anuncio.id}')"
        >
          🗑️ Excluir
        </button>

        <button
          class="edit-btn"
          onclick="mostrarPreview('${anuncio.id}')"
        >
          👁️ Ver
        </button>

      </div>

    `;

    listaAnuncios.appendChild(item);

  });

}


/* =========================================================
   NOVO ANÚNCIO
========================================================= */

function novoAnuncio() {

  anuncioForm.reset();

  document.getElementById("anuncioId").value =
    "";

  document.getElementById("formTitulo").textContent =
    "Novo anúncio";

  document.getElementById("status").value =
    "true";

  mensagem("");

  formSection.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   EDITAR
========================================================= */

async function editarAnuncio(id) {

  const {
    data,
    error
  } = await supabaseClient
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

  document.getElementById("anuncioId").value =
    data.id;

  document.getElementById("titulo").value =
    data.titulo || "";

  document.getElementById("imagem").value =
    data.imagem || "";

  document.getElementById("link").value =
    data.link || "";

  document.getElementById("status").value =
    data.ativo ? "true" : "false";

  document.getElementById("formTitulo").textContent =
    "Editar anúncio";

  mensagem("");

  formSection.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================================
   SALVAR
========================================================= */

anuncioForm.addEventListener(
  "submit",
  async function(event) {

    event.preventDefault();

    const id =
      document.getElementById("anuncioId").value;

    const titulo =
      document.getElementById("titulo").value.trim();

    const imagem =
      document.getElementById("imagem").value.trim();

    const link =
      document.getElementById("link").value.trim();

    const ativo =
      document.getElementById("status").value ===
      "true";

    if (!titulo || !link) {

      mensagem(
        "Preencha o título e o link.",
        "error"
      );

      return;

    }

    const salvarBtn =
      document.getElementById("salvarBtn");

    salvarBtn.disabled = true;

    salvarBtn.textContent =
      "⏳ Salvando...";

    const dados = {

      titulo,
      imagem,
      link,
      ativo

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
        "Erro ao salvar. Verifique o Supabase.",
        "error"
      );

      salvarBtn.disabled = false;

      salvarBtn.textContent =
        "💾 Salvar anúncio";

      return;

    }

    mensagem(
      "✅ Anúncio salvo com sucesso!",
      "success"
    );

    salvarBtn.disabled = false;

    salvarBtn.textContent =
      "💾 Salvar anúncio";

    anuncioForm.reset();

    document.getElementById("anuncioId").value =
      "";

    document.getElementById("status").value =
      "true";

    await carregarAnuncios();

  }
);


/* =========================================================
   EXCLUIR
========================================================= */

async function excluirAnuncio(id) {

  const confirmar =
    confirm(
      "Tem certeza que deseja excluir este anúncio?"
    );

  if (!confirmar) return;

  const {
    error
  } = await supabaseClient
    .from("anuncios")
    .delete()
    .eq("id", id);

  if (error) {

    console.error(error);

    alert(
      "Não foi possível excluir o anúncio."
    );

    return;

  }

  await carregarAnuncios();

}


/* =========================================================
   PREVIEW
========================================================= */

async function mostrarPreview(id) {

  const {
    data,
    error
  } = await supabaseClient
    .from("anuncios")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {

    return;

  }

  preview.innerHTML = `

    <a
      href="${escapar(data.link)}"
      target="_blank"
      rel="noopener noreferrer"
      class="preview-ad"
    >

      ${
        data.imagem
          ? `<img
              src="${escapar(data.imagem)}"
              alt="${escapar(data.titulo)}"
            >`
          : ""
      }

      <div class="preview-ad-content">

        <strong>
          ${escapar(data.titulo)}
        </strong>

        <p>
          Clique para acessar a propaganda
        </p>

      </div>

    </a>

  `;

  preview.scrollIntoView({
    behavior: "smooth"
  });

}


/* =========================================================
   FECHAR FORMULÁRIO
========================================================= */

document
  .getElementById("cancelarBtn")
  .addEventListener(
    "click",
    function() {

      formSection.classList.add(
        "hidden"
      );

    }
  );


/* =========================================================
   BOTÕES
========================================================= */

document
  .getElementById("novoAnuncioBtn")
  .addEventListener(
    "click",
    novoAnuncio
  );


document
  .getElementById("atualizarBtn")
  .addEventListener(
    "click",
    carregarAnuncios
  );


document
  .getElementById("logoutBtn")
  .addEventListener(
    "click",
    async function() {

      await supabaseClient
        .auth
        .signOut();

      window.location.href =
        "index.html";

    }
  );


/* =========================================================
   ESCAPAR TEXTO
========================================================= */

function escapar(texto) {

  return String(texto || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


/* =========================================================
   ANO
========================================================= */

document.getElementById("year").textContent =
  new Date().getFullYear();


/* =========================================================
   INICIAR
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    const autenticado =
      await verificarLogin();

    if (!autenticado) return;

    await carregarAnuncios();

  }
);
