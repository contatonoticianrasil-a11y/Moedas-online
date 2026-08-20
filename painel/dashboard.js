const SUPABASE_URL =
  "https://skfodedzzdeptnksufuq.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_TDC6NwdHx1XuYhXcFzxkiQ_1N6lLkGE";

const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


let anuncios = [];
let editandoId = null;


/* LOGIN */

async function verificarLogin() {

  const { data, error } =
    await supabaseClient.auth.getSession();

  if (error || !data.session) {

    window.location.href = "index.html";

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


/* CARREGAR */

async function carregarAnuncios() {

  mostrarLoading(true);

  const { data, error } =
    await supabaseClient
      .from("anuncios")
      .select("*")
      .order("id", { ascending: false });

  if (error) {

    mostrarLoading(false);

    mostrarErro(
      "Não foi possível carregar as propagandas."
    );

    console.error(error);

    return;
  }

  anuncios = data || [];

  atualizarResumo();

  renderizarAnuncios(anuncios);

  mostrarLoading(false);
}


/* RESUMO */

function atualizarResumo() {

  const total =
    anuncios.length;

  const ativos =
    anuncios.filter(
      a => a.ativo === true
    ).length;

  document.getElementById("totalAds")
    .textContent = total;

  document.getElementById("activeAds")
    .textContent = ativos;

  document.getElementById("inactiveAds")
    .textContent = total - ativos;
}


/* RENDER */

function renderizarAnuncios(lista) {

  const grid =
    document.getElementById("adsGrid");

  const empty =
    document.getElementById("emptyState");

  if (!lista.length) {

    grid.innerHTML = "";

    empty.classList.remove("hidden");

    return;
  }

  empty.classList.add("hidden");

  grid.innerHTML =
    lista.map(criarCard).join("");
}


/* CARD */

function criarCard(anuncio) {

  const imagem =
    anuncio.imagem_url ||
    "https://via.placeholder.com/700x400?text=Goncalves+Cambio";

  const ativo =
    anuncio.ativo === true;

  return `

    <article class="ad-card">

      <div class="ad-image">

        <img
          src="${escapeAttr(imagem)}"
          alt="${escapeAttr(anuncio.titulo || "Propaganda")}"
          onerror="this.src='https://via.placeholder.com/700x400?text=Imagem+indisponivel'"
        >

        <span class="${ativo ? "active" : "inactive"}">
          ${ativo ? "ATIVO" : "INATIVO"}
        </span>

      </div>

      <div class="ad-body">

        <h3>
          ${escapeHTML(
            anuncio.titulo || "Sem título"
          )}
        </h3>

        <p>
          ${escapeHTML(
            anuncio.descricao || "Sem descrição"
          )}
        </p>

        <a
          href="${escapeAttr(anuncio.link_url || "#")}"
          target="_blank"
          rel="noopener noreferrer"
          class="ad-link"
        >
          🔗 Ver link
        </a>

        <div class="ad-actions">

          <button
            class="edit"
            onclick="editarAnuncio(${anuncio.id})"
          >
            ✏️ Editar
          </button>

          <button
            class="toggle"
            onclick="alternarAnuncio(
              ${anuncio.id},
              ${!ativo}
            )"
          >
            ${ativo ? "🔴 Desativar" : "🟢 Ativar"}
          </button>

          <button
            class="delete"
            onclick="excluirAnuncio(${anuncio.id})"
          >
            🗑️ Excluir
          </button>

        </div>

      </div>

    </article>

  `;
}


/* MODAL */

function abrirModal(anuncio = null) {

  editandoId =
    anuncio ? anuncio.id : null;

  document.getElementById("modalTitle")
    .textContent =
      anuncio
        ? "Editar propaganda"
        : "Nova propaganda";

  document.getElementById("adId")
    .value =
      anuncio?.id || "";

  document.getElementById("titulo")
    .value =
      anuncio?.titulo || "";

  document.getElementById("imagem_url")
    .value =
      anuncio?.imagem_url || "";

  document.getElementById("link_url")
    .value =
      anuncio?.link_url || "";

  document.getElementById("descricao")
    .value =
      anuncio?.descricao || "";

  document.getElementById("intervalo_minutos")
    .value =
      anuncio?.tempo_minutos ?? 0;

  document.getElementById("ativo")
    .value =
      anuncio
        ? String(anuncio.ativo)
        : "true";

  atualizarPreview();

  document
    .getElementById("modalOverlay")
    .classList.remove("hidden");
}


/* FECHAR */

function fecharModal() {

  document
    .getElementById("modalOverlay")
    .classList.add("hidden");

  document
    .getElementById("adForm")
    .reset();

  editandoId = null;

  document
    .getElementById("imagePreview")
    .classList.add("hidden");

  document
    .getElementById("formMessage")
    .textContent = "";
}


/* PREVIEW */

function atualizarPreview() {

  const url =
    document.getElementById("imagem_url")
      .value.trim();

  const preview =
    document.getElementById("imagePreview");

  const img =
    document.getElementById("previewImg");

  if (!url) {

    preview.classList.add("hidden");

    return;
  }

  img.src = url;

  preview.classList.remove("hidden");
}


/* SALVAR */

async function salvarAnuncio(event) {

  event.preventDefault();

  const titulo =
    document.getElementById("titulo")
      .value.trim();

  const imagem =
    document.getElementById("imagem_url")
      .value.trim();

  const link =
    document.getElementById("link_url")
      .value.trim();

  const descricao =
    document.getElementById("descricao")
      .value.trim();

  const intervalo =
    Number(
      document.getElementById("intervalo_minutos")
        .value || 0
    );

  const ativo =
    document.getElementById("ativo")
      .value === "true";

  const message =
    document.getElementById("formMessage");

  const button =
    document.getElementById("saveBtn");

  if (!titulo) {

    message.textContent =
      "Digite o título.";

    return;
  }

  if (!link) {

    message.textContent =
      "Digite o link da propaganda.";

    return;
  }

  button.disabled = true;
  button.textContent = "⏳ Salvando...";

  const dados = {

    titulo,

    imagem_url:
      imagem || null,

    link_url:
      link,

    descricao:
      descricao || null,

    ativo,

    tempo_minutos:
      Math.max(
        0,
        Number.isFinite(intervalo)
          ? intervalo
          : 0
      )

  };

  let resultado;

  if (editandoId) {

    resultado =
      await supabaseClient
        .from("anuncios")
        .update(dados)
        .eq("id", editandoId);

  } else {

    resultado =
      await supabaseClient
        .from("anuncios")
        .insert([dados]);

  }

  if (resultado.error) {

    console.error(resultado.error);

    message.textContent =
      "❌ Erro: " +
      resultado.error.message;

    button.disabled = false;
    button.textContent =
      "💾 Salvar propaganda";

    return;
  }

  fecharModal();

  mostrarToast(
    editandoId
      ? "Propaganda atualizada!"
      : "Propaganda criada!"
  );

  await carregarAnuncios();

  button.disabled = false;
  button.textContent =
    "💾 Salvar propaganda";
}


/* EDITAR */

async function editarAnuncio(id) {

  const anuncio =
    anuncios.find(
      a => Number(a.id) === Number(id)
    );

  if (!anuncio) return;

  abrirModal(anuncio);
}


/* STATUS */

async function alternarAnuncio(
  id,
  novoStatus
) {

  const { error } =
    await supabaseClient
      .from("anuncios")
      .update({
        ativo: novoStatus
      })
      .eq("id", id);

  if (error) {

    mostrarToast(
      "❌ Não foi possível alterar."
    );

    console.error(error);

    return;
  }

  mostrarToast(
    novoStatus
      ? "🟢 Propaganda ativada!"
      : "🔴 Propaganda desativada!"
  );

  await carregarAnuncios();
}


/* EXCLUIR */

async function excluirAnuncio(id) {

  if (
    !confirm(
      "Deseja realmente excluir esta propaganda?"
    )
  ) return;

  const { error } =
    await supabaseClient
      .from("anuncios")
      .delete()
      .eq("id", id);

  if (error) {

    mostrarToast(
      "❌ Não foi possível excluir."
    );

    console.error(error);

    return;
  }

  mostrarToast(
    "🗑️ Propaganda excluída."
  );

  await carregarAnuncios();
}


/* PESQUISA */

function pesquisar() {

  const termo =
    document.getElementById("searchInput")
      .value
      .toLowerCase()
      .trim();

  if (!termo) {

    renderizarAnuncios(anuncios);

    return;
  }

  const filtrados =
    anuncios.filter(a => {

      return (
        String(a.titulo || "")
          .toLowerCase()
          .includes(termo) ||

        String(a.descricao || "")
          .toLowerCase()
          .includes(termo) ||

        String(a.link_url || "")
          .toLowerCase()
          .includes(termo)
      );

    });

  renderizarAnuncios(filtrados);
}


/* LOGOUT */

async function sair() {

  await supabaseClient
    .auth
    .signOut({
      scope: "local"
    });

  window.location.href =
    "index.html";
}


/* LOADING */

function mostrarLoading(valor) {

  const loading =
    document.getElementById("loading");

  if (valor) {

    loading.classList.remove("hidden");

  } else {

    loading.classList.add("hidden");
  }
}


/* ERRO */

function mostrarErro(texto) {

  const grid =
    document.getElementById("adsGrid");

  const empty =
    document.getElementById("emptyState");

  empty.classList.add("hidden");

  grid.innerHTML = `
    <div class="error-box">
      ⚠️
      <strong>${escapeHTML(texto)}</strong>
      <small>
        Verifique a tabela anuncios e as permissões do Supabase.
      </small>
    </div>
  `;
}


/* TOAST */

function mostrarToast(texto) {

  const toast =
    document.getElementById("toast");

  toast.textContent = texto;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}


/* ESCAPAR */

function escapeHTML(valor) {

  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}


function escapeAttr(valor) {

  return escapeHTML(valor);
}


/* EVENTOS */

document.addEventListener(
  "DOMContentLoaded",
  async function() {

    document.getElementById("year")
      .textContent =
        new Date().getFullYear();

    const autenticado =
      await verificarLogin();

    if (!autenticado) return;

    document.getElementById("newAdBtn")
      .addEventListener(
        "click",
        () => abrirModal()
      );

    document.getElementById("emptyNewBtn")
      .addEventListener(
        "click",
        () => abrirModal()
      );

    document.getElementById("closeModalBtn")
      .addEventListener(
        "click",
        fecharModal
      );

    document.getElementById("cancelBtn")
      .addEventListener(
        "click",
        fecharModal
      );

    document.getElementById("adForm")
      .addEventListener(
        "submit",
        salvarAnuncio
      );

    document.getElementById("imagem_url")
      .addEventListener(
        "input",
        atualizarPreview
      );

    document.getElementById("searchInput")
      .addEventListener(
        "input",
        pesquisar
      );

    document.getElementById("refreshBtn")
      .addEventListener(
        "click",
        carregarAnuncios
      );

    document.getElementById("refreshBtnMenu")
      .addEventListener(
        "click",
        carregarAnuncios
      );

    document.getElementById("logoutBtn")
      .addEventListener(
        "click",
        sair
      );

    await carregarAnuncios();

  });


/* FUNÇÕES GLOBAIS */

window.editarAnuncio =
  editarAnuncio;

window.alternarAnuncio =
  alternarAnuncio;

window.excluirAnuncio =
  excluirAnuncio;
